// Universal Responsive Canvas Graph Engine for PhysicsLab Mechanics
// Pure Canvas plotting & strict viewport clipping — ZERO DOM / HTML created

import { Colors, Renderer } from './renderer.js';
import { TextEngine } from './textEngine.js';

export class GraphRenderer {
  constructor(options = {}) {
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.width = options.width || 400;
    this.height = options.height || 200;

    this.title = options.title || 'Graph';
    this.xLabel = options.xLabel || 'Time';
    this.xUnit = options.xUnit || 's';
    this.yLabel = options.yLabel || 'Value';
    this.yUnit = options.yUnit || '';

    this.minX = options.minX !== undefined ? options.minX : 0;
    this.maxX = options.maxX !== undefined ? options.maxX : 10;
    this.minY = options.minY !== undefined ? options.minY : -10;
    this.maxY = options.maxY !== undefined ? options.maxY : 10;
    this.autoScale = options.autoScale !== undefined ? options.autoScale : true;

    this.datasets = []; // Array of { label, color, points: [{x, y}], fillArea: boolean, lineWidth: number }
  }

  setRect(x, y, width, height) {
    this.x = Math.round(x);
    this.y = Math.round(y);
    this.width = Math.max(120, Math.round(width));
    this.height = Math.max(80, Math.round(height));
    return this;
  }

  clearDatasets() {
    this.datasets = [];
  }

  setDatasets(datasets) {
    this.datasets = datasets || [];
  }

  setLimits(minX, maxX, minY, maxY) {
    if (minX !== undefined) this.minX = minX;
    if (maxX !== undefined) this.maxX = maxX;
    if (minY !== undefined) this.minY = minY;
    if (maxY !== undefined) this.maxY = maxY;
  }

  setMarker(x, y) {}

  addDataset(dataset) {
    this.datasets.push({
      label: dataset.label || 'Data',
      color: dataset.color || Colors.cyan,
      points: dataset.points || [],
      fillArea: !!dataset.fillArea,
      lineWidth: dataset.lineWidth || 2
    });
  }

  updateDataset(index, points) {
    if (this.datasets[index]) {
      this.datasets[index].points = points;
    }
  }

  render(ctx) {
    ctx.save();

    // 1. Draw Graph Panel Background & Border
    Renderer.drawPanel(ctx, this.x, this.y, this.width, this.height, {
      fill: '#0A0F1A',
      stroke: Colors.panelBorder,
      radius: 8
    });

    // 2. Determine Plot Ranges (with auto-scaling & edge-case protection)
    let minX = this.minX;
    let maxX = this.maxX;
    let minY = this.minY;
    let maxY = this.maxY;

    if (this.autoScale && this.datasets.length > 0) {
      let found = false;
      let dMinX = Infinity, dMaxX = -Infinity, dMinY = Infinity, dMaxY = -Infinity;

      for (const ds of this.datasets) {
        if (!ds.points) continue;
        for (const p of ds.points) {
          if (p && Number.isFinite(p.x) && Number.isFinite(p.y)) {
            found = true;
            if (p.x < dMinX) dMinX = p.x;
            if (p.x > dMaxX) dMaxX = p.x;
            if (p.y < dMinY) dMinY = p.y;
            if (p.y > dMaxY) dMaxY = p.y;
          }
        }
      }

      if (found) {
        minX = Math.min(0, dMinX);
        maxX = dMaxX <= minX ? minX + 1.0 : dMaxX * 1.05;
        minY = Math.min(0, dMinY < 0 ? dMinY * 1.08 : 0);
        maxY = dMaxY <= minY ? minY + 1.0 : (dMaxY > 0 ? dMaxY * 1.08 : 1.0);
      }
    }

    // Protect against division by zero
    if (Math.abs(maxX - minX) < 1e-6) maxX = minX + 1.0;
    if (Math.abs(maxY - minY) < 1e-6) maxY = minY + 1.0;

    // 3. Internal Margins Calculation
    const maxYStr = Math.abs(maxY) >= 100 ? maxY.toFixed(0) : maxY.toFixed(1);
    const minYStr = Math.abs(minY) >= 100 ? minY.toFixed(0) : minY.toFixed(1);
    ctx.font = '9px "Segoe UI", Roboto, sans-serif';
    const maxYWidth = ctx.measureText(maxYStr).width;
    const minYWidth = ctx.measureText(minYStr).width;

    const paddingLeft = Math.max(34, Math.min(60, Math.max(maxYWidth, minYWidth) + 14));
    const paddingRight = 12;
    const paddingTop = 26;
    const paddingBottom = 22;

    const plotX = this.x + paddingLeft;
    const plotY = this.y + paddingTop;
    const plotW = Math.max(20, this.width - paddingLeft - paddingRight);
    const plotH = Math.max(20, this.height - paddingTop - paddingBottom);

    // 4. Graph Header: Title & Legends
    const titleMaxW = Math.max(40, this.width * 0.48);
    Renderer.drawText(ctx, this.title, this.x + 10, this.y + 13, {
      fill: Colors.text,
      font: 'bold 11px "Segoe UI", Roboto, sans-serif',
      baseline: 'middle',
      maxWidth: titleMaxW
    });

    // Legends on top right
    let legendRightX = this.x + this.width - 10;
    for (let i = this.datasets.length - 1; i >= 0; i--) {
      const ds = this.datasets[i];
      ctx.font = 'bold 9px "Segoe UI", Roboto, sans-serif';
      const labelW = ctx.measureText(ds.label).width;

      if (legendRightX - labelW - 14 > this.x + titleMaxW + 10) {
        Renderer.drawCircle(ctx, legendRightX - labelW - 6, this.y + 13, 2.5, { fill: ds.color });
        Renderer.drawText(ctx, ds.label, legendRightX, this.y + 13, {
          fill: Colors.textMuted,
          font: 'bold 9px "Segoe UI", Roboto, sans-serif',
          align: 'right',
          baseline: 'middle',
          maxWidth: labelW + 2
        });
        legendRightX -= (labelW + 16);
      }
    }

    const mapX = (val) => plotX + ((val - minX) / (maxX - minX)) * plotW;
    const mapY = (val) => plotY + plotH - ((val - minY) / (maxY - minY)) * plotH;

    // 5. Grid Lines & Axis Ticks
    const gridDivsX = Math.max(2, Math.min(5, Math.floor(plotW / 65)));
    const gridDivsY = Math.max(2, Math.min(4, Math.floor(plotH / 30)));

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;

    // Horizontal Grid & Y labels
    for (let i = 0; i <= gridDivsY; i++) {
      const gy = plotY + (i / gridDivsY) * plotH;
      ctx.beginPath();
      ctx.moveTo(plotX, gy);
      ctx.lineTo(plotX + plotW, gy);
      ctx.stroke();

      const yVal = maxY - (i / gridDivsY) * (maxY - minY);
      const yStr = Math.abs(yVal) >= 100 ? yVal.toFixed(0) : yVal.toFixed(1);
      Renderer.drawText(ctx, yStr, plotX - 4, gy, {
        fill: Colors.textMuted,
        font: '9px "Segoe UI", Roboto, sans-serif',
        align: 'right',
        baseline: 'middle',
        maxWidth: paddingLeft - 6
      });
    }

    // Vertical Grid & X labels
    for (let i = 0; i <= gridDivsX; i++) {
      const gx = plotX + (i / gridDivsX) * plotW;
      ctx.beginPath();
      ctx.moveTo(gx, plotY);
      ctx.lineTo(gx, plotY + plotH);
      ctx.stroke();

      const xVal = minX + (i / gridDivsX) * (maxX - minX);
      const xStr = Math.abs(xVal) >= 100 ? xVal.toFixed(0) : xVal.toFixed(1);
      Renderer.drawText(ctx, xStr, gx, plotY + plotH + 9, {
        fill: Colors.textMuted,
        font: '9px "Segoe UI", Roboto, sans-serif',
        align: 'center',
        baseline: 'middle',
        maxWidth: Math.floor(plotW / gridDivsX)
      });
    }

    // Zero-axis references
    if (minY <= 0 && maxY >= 0) {
      const zeroY = mapY(0);
      Renderer.drawLine(ctx, plotX, zeroY, plotX + plotW, zeroY, {
        stroke: 'rgba(255, 255, 255, 0.15)',
        lineWidth: 1
      });
    }
    if (minX <= 0 && maxX >= 0) {
      const zeroX = mapX(0);
      Renderer.drawLine(ctx, zeroX, plotY, zeroX, plotY + plotH, {
        stroke: 'rgba(255, 255, 255, 0.15)',
        lineWidth: 1
      });
    }

    // 6. Strict Canvas Clipping for Curves & Markers
    ctx.save();
    ctx.beginPath();
    ctx.rect(plotX, plotY, plotW, plotH);
    ctx.clip();

    for (const ds of this.datasets) {
      if (!ds.points || ds.points.length === 0) continue;

      // Area fill
      if (ds.fillArea && ds.points.length >= 2) {
        ctx.fillStyle = ds.color.includes('rgba') ? ds.color : `${ds.color}1E`;
        ctx.beginPath();
        const baseZeroY = Math.max(plotY, Math.min(plotY + plotH, mapY(0)));
        const firstPt = ds.points[0];
        ctx.moveTo(mapX(firstPt.x), baseZeroY);

        for (const p of ds.points) {
          if (Number.isFinite(p.x) && Number.isFinite(p.y)) {
            ctx.lineTo(mapX(p.x), mapY(p.y));
          }
        }
        const lastPt = ds.points[ds.points.length - 1];
        ctx.lineTo(mapX(lastPt.x), baseZeroY);
        ctx.closePath();
        ctx.fill();
      }

      // Curve line
      ctx.strokeStyle = ds.color;
      ctx.lineWidth = ds.lineWidth || 2;
      ctx.beginPath();
      let started = false;

      for (const p of ds.points) {
        if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.y)) continue;
        const px = mapX(p.x);
        const py = mapY(p.y);
        if (!started) {
          ctx.moveTo(px, py);
          started = true;
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.stroke();

      // Current operating point marker
      if (ds.points.length > 0) {
        const lastPt = ds.points[ds.points.length - 1];
        if (lastPt && Number.isFinite(lastPt.x) && Number.isFinite(lastPt.y)) {
          const mX = mapX(lastPt.x);
          const mY = mapY(lastPt.y);
          Renderer.drawCircle(ctx, mX, mY, 3, {
            fill: '#FFFFFF',
            stroke: ds.color,
            lineWidth: 1.5,
            glowColor: ds.color,
            glowBlur: 4
          });
        }
      }
    }

    ctx.restore(); // Restore clip

    // 7. Axis label units
    Renderer.drawText(ctx, `${this.yLabel}${this.yUnit ? ' (' + this.yUnit + ')' : ''}`, plotX + 4, plotY + 4, {
      fill: 'rgba(255, 255, 255, 0.35)',
      font: '9px "Segoe UI", Roboto, sans-serif',
      baseline: 'top',
      maxWidth: plotW * 0.45
    });

    Renderer.drawText(ctx, `${this.xLabel}${this.xUnit ? ' (' + this.xUnit + ')' : ''}`, plotX + plotW - 4, plotY + plotH - 10, {
      fill: 'rgba(255, 255, 255, 0.35)',
      font: '9px "Segoe UI", Roboto, sans-serif',
      align: 'right',
      baseline: 'bottom',
      maxWidth: plotW * 0.45
    });

    ctx.restore();
  }
}
