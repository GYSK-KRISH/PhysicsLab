// Canvas Responsive Layout Engine for PhysicsLab
// Pure Canvas layout primitives & container math — ZERO DOM / HTML created

export class LayoutRect {
  constructor(x = 0, y = 0, width = 0, height = 0) {
    this.x = Math.round(x);
    this.y = Math.round(y);
    this.width = Math.max(0, Math.round(width));
    this.height = Math.max(0, Math.round(height));
  }

  static fromBounds(width, height, margin = 0) {
    return new LayoutRect(margin, margin, width - margin * 2, height - margin * 2);
  }

  clone() {
    return new LayoutRect(this.x, this.y, this.width, this.height);
  }

  set(x, y, width, height) {
    this.x = Math.round(x);
    this.y = Math.round(y);
    this.width = Math.max(0, Math.round(width));
    this.height = Math.max(0, Math.round(height));
    return this;
  }

  inset(top = 0, right = top, bottom = top, left = right) {
    return new LayoutRect(
      this.x + left,
      this.y + top,
      Math.max(0, this.width - left - right),
      Math.max(0, this.height - top - bottom)
    );
  }

  contains(px, py) {
    return (
      px >= this.x &&
      px <= this.x + this.width &&
      py >= this.y &&
      py <= this.y + this.height
    );
  }

  splitHorizontal(ratios, gap = 0) {
    const count = ratios.length;
    if (count === 0) return [];
    if (count === 1) return [this.clone()];

    const totalGap = (count - 1) * gap;
    const availableWidth = Math.max(0, this.width - totalGap);
    const sumRatios = ratios.reduce((a, b) => a + b, 0) || 1;

    const rects = [];
    let currentX = this.x;

    for (let i = 0; i < count; i++) {
      const isLast = i === count - 1;
      const w = isLast
        ? Math.max(0, this.x + this.width - currentX)
        : Math.max(0, Math.round((ratios[i] / sumRatios) * availableWidth));

      rects.push(new LayoutRect(currentX, this.y, w, this.height));
      currentX += w + gap;
    }

    return rects;
  }

  splitVertical(ratios, gap = 0) {
    const count = ratios.length;
    if (count === 0) return [];
    if (count === 1) return [this.clone()];

    const totalGap = (count - 1) * gap;
    const availableHeight = Math.max(0, this.height - totalGap);
    const sumRatios = ratios.reduce((a, b) => a + b, 0) || 1;

    const rects = [];
    let currentY = this.y;

    for (let i = 0; i < count; i++) {
      const isLast = i === count - 1;
      const h = isLast
        ? Math.max(0, this.y + this.height - currentY)
        : Math.max(0, Math.round((ratios[i] / sumRatios) * availableHeight));

      rects.push(new LayoutRect(this.x, currentY, this.width, h));
      currentY += h + gap;
    }

    return rects;
  }

  grid(columns, count, itemHeight, gapX = 12, gapY = 12) {
    const rects = [];
    const cols = Math.max(1, columns);
    const itemWidth = Math.max(0, Math.floor((this.width - (cols - 1) * gapX) / cols));

    for (let i = 0; i < count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const ix = this.x + col * (itemWidth + gapX);
      const iy = this.y + row * (itemHeight + gapY);
      rects.push(new LayoutRect(ix, iy, itemWidth, itemHeight));
    }

    return {
      rects,
      itemWidth,
      columns: cols,
      totalHeight: Math.ceil(count / cols) * (itemHeight + gapY) - gapY
    };
  }

  row(count, gap = 8) {
    if (count <= 0) return [];
    const ratios = new Array(count).fill(1);
    return this.splitHorizontal(ratios, gap);
  }

  column(count, gap = 8) {
    if (count <= 0) return [];
    const ratios = new Array(count).fill(1);
    return this.splitVertical(ratios, gap);
  }
}

export class LayoutRow {
  static layout(containerRect, items, gap = 8) {
    // items: array of { width, flex, minWidth }
    const totalItems = items.length;
    if (totalItems === 0) return [];

    let fixedWidth = 0;
    let totalFlex = 0;

    for (const it of items) {
      if (it.width !== undefined) {
        fixedWidth += it.width;
      } else {
        totalFlex += (it.flex || 1);
      }
    }

    const totalGap = (totalItems - 1) * gap;
    const remainingWidth = Math.max(0, containerRect.width - fixedWidth - totalGap);

    const rects = [];
    let curX = containerRect.x;

    for (let i = 0; i < totalItems; i++) {
      const it = items[i];
      let itemW = 0;
      if (it.width !== undefined) {
        itemW = it.width;
      } else {
        itemW = totalFlex > 0 ? Math.round(((it.flex || 1) / totalFlex) * remainingWidth) : 0;
        if (it.minWidth) itemW = Math.max(it.minWidth, itemW);
      }

      rects.push(new LayoutRect(curX, containerRect.y, itemW, containerRect.height));
      curX += itemW + gap;
    }

    return rects;
  }
}

export class LayoutEngine {
  static getBreakpoint(width) {
    if (width >= 1080) return 'WIDE';
    if (width >= 720) return 'MEDIUM';
    return 'SMALL';
  }

  static calculateExperimentLayout(width, height) {
    const mode = this.getBreakpoint(width);
    const margin = mode === 'SMALL' ? 6 : (mode === 'MEDIUM' ? 10 : 14);
    const root = LayoutRect.fromBounds(width, height, margin);

    // Calculate Toolbar Height based on mode
    let toolbarH = 40;
    if (mode === 'MEDIUM') toolbarH = 76; // 2 rows
    if (mode === 'SMALL') toolbarH = 112; // 3 rows

    const gap = mode === 'SMALL' ? 6 : (mode === 'MEDIUM' ? 8 : 10);
    const contentH = Math.max(80, root.height - toolbarH - gap);

    const [toolbarRect, contentArea] = root.splitVertical([toolbarH, contentH], gap);

    let simRect, controlRect, dataRect, graphRect;

    if (mode === 'WIDE') {
      // WIDE: Left side (Simulation top 58%, Graph bottom 42%), Right side (Controls top 56%, Data readout bottom 44%)
      const sidebarW = Math.max(280, Math.min(360, Math.round(contentArea.width * 0.28)));
      const mainW = Math.max(300, contentArea.width - sidebarW - gap);

      const [leftCol, rightCol] = contentArea.splitHorizontal([mainW, sidebarW], gap);

      // Left column: Sim 58%, Graph 42%
      const [simArea, graphArea] = leftCol.splitVertical([0.58, 0.42], gap);
      simRect = simArea;
      graphRect = graphArea;

      // Right column: Control Panel 56%, Data Readout 44%
      const [controlArea, dataArea] = rightCol.splitVertical([0.56, 0.44], gap);
      controlRect = controlArea;
      dataRect = dataArea;
    } else if (mode === 'MEDIUM') {
      // MEDIUM: Simulation top 46%, Controls + Data side-by-side middle 28%, Graph bottom 26%
      const [topPart, midPart, bottomPart] = contentArea.splitVertical([0.46, 0.28, 0.26], gap);
      simRect = topPart;

      const [ctlArea, dtArea] = midPart.splitHorizontal([0.54, 0.46], gap);
      controlRect = ctlArea;
      dataRect = dtArea;

      graphRect = bottomPart;
    } else {
      // SMALL: Vertical stacked layout with strict bounds
      const [simArea, ctlArea, dtArea, grpArea] = contentArea.splitVertical([0.34, 0.26, 0.20, 0.20], gap);
      simRect = simArea;
      controlRect = ctlArea;
      dataRect = dtArea;
      graphRect = grpArea;
    }

    return {
      mode,
      margin,
      gap,
      root,
      toolbarRect,
      contentArea,
      simRect,
      controlRect,
      dataRect,
      graphRect
    };
  }
}
