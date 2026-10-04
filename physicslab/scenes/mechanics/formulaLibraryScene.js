// Mechanics Formula Library Scene for PhysicsLab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Button } from '../../engine/ui.js';
import { TextEngine } from '../../engine/textEngine.js';
import { FORMULA_CATEGORIES, FORMULA_LIBRARY } from '../../physics/mechanics/formulaLibraryData.js';

export class FormulaLibraryScene {
  constructor() {
    this.buttons = [];
    this.categoryButtons = [];
    this.selectedCategory = 'ALL';
    this.scrollOffset = 0;
    this.maxScroll = 0;
    this.lastWidth = 0;
    this.lastHeight = 0;
  }

  init() {
    this.rebuildUI();
  }

  rebuildUI() {
    const { width, height } = this.canvasEngine.getBounds();
    this.buttons = [];
    this.categoryButtons = [];

    const isSmall = width < 720;
    const navW = isSmall ? 130 : 160;
    const navH = 36;

    // Back button
    this.buttons.push(new Button({
      x: 16,
      y: 12,
      width: navW,
      height: navH,
      text: '← LAB MENU',
      accentColor: Colors.purple,
      callback: () => {
        import('./mechanicsMenuScene.js').then(m => this.sceneManager.changeScene(new m.MechanicsMenuScene()));
      }
    }));

    // Scroll buttons
    const scrollW = isSmall ? 65 : 75;
    this.buttons.push(new Button({
      x: width - (scrollW * 2 + 24),
      y: 12,
      width: scrollW,
      height: navH,
      text: '▲ UP',
      accentColor: Colors.cyan,
      callback: () => {
        this.scrollOffset = Math.max(0, this.scrollOffset - 160);
      }
    }));

    this.buttons.push(new Button({
      x: width - (scrollW + 16),
      y: 12,
      width: scrollW,
      height: navH,
      text: '▼ DOWN',
      accentColor: Colors.cyan,
      callback: () => {
        this.scrollOffset = Math.min(this.maxScroll, this.scrollOffset + 160);
      }
    }));

    // Category Filter Buttons (responsive wrapping)
    const visibleCats = [
      'ALL', 'KINEMATICS', 'VECTORS', 'NEWTONS_LAWS', 'FRICTION',
      'CIRCULAR_MOTION', 'WORK_ENERGY_POWER', 'ROTATION', 'GRAVITATION', 'OSCILLATIONS_SHM', 'WAVES'
    ];

    const catH = 28;
    const catGap = 6;
    let catX = 16;
    let catY = 56;
    const maxRowW = width - 32;

    for (const cat of visibleCats) {
      const isSel = this.selectedCategory === cat;
      const formattedName = cat.replace(/_/g, ' ');
      const btnW = Math.min(130, Math.max(70, formattedName.length * 8 + 18));

      if (catX + btnW > maxRowW && catX > 16) {
        catX = 16;
        catY += catH + catGap;
      }

      const catBtn = new Button({
        x: catX,
        y: catY,
        width: btnW,
        height: catH,
        text: formattedName,
        accentColor: isSel ? Colors.cyan : Colors.panelBorder,
        callback: () => {
          this.selectedCategory = cat;
          this.scrollOffset = 0;
          this.rebuildUI();
        }
      });
      this.categoryButtons.push(catBtn);
      catX += btnW + catGap;
    }

    this.categoriesBottomY = catY + catH + 12;
  }

  handleInput(inputManager) {
    const { width, height } = this.canvasEngine.getBounds();
    if (this.lastWidth !== width || this.lastHeight !== height) {
      this.lastWidth = width;
      this.lastHeight = height;
      this.rebuildUI();
    }

    if (inputManager && inputManager.getWheelDelta) {
      const wheel = inputManager.getWheelDelta();
      if (wheel !== 0) {
        this.scrollOffset = Math.max(0, Math.min(this.maxScroll, this.scrollOffset + wheel * 0.7));
      }
    }
  }

  update(dt) {
    for (const btn of this.buttons) {
      btn.update(dt, this.inputManager);
    }
    for (const btn of this.categoryButtons) {
      btn.update(dt, this.inputManager);
    }
  }

  render(ctx) {
    const { width, height } = this.canvasEngine.getBounds();

    Renderer.drawRect(ctx, 0, 0, width, height, { fill: Colors.background });
    Renderer.drawGrid(ctx, width, height, 40);

    // Title (hidden on small screens to avoid header crowding)
    if (width >= 720) {
      Renderer.drawText(ctx, 'MECHANICS FORMULA DIRECTORY', width / 2, 28, {
        fill: Colors.cyan,
        font: '900 18px "Segoe UI", Roboto, sans-serif',
        align: 'center',
        baseline: 'middle',
        glowColor: Colors.cyan,
        glowBlur: 8
      });
    }

    for (const btn of this.buttons) {
      btn.render(ctx);
    }
    for (const btn of this.categoryButtons) {
      btn.render(ctx);
    }

    // Filter formulas based on selected category
    const formulas = this.selectedCategory === 'ALL'
      ? FORMULA_LIBRARY
      : FORMULA_LIBRARY.filter(f => f.category === this.selectedCategory);

    const listY = (this.categoriesBottomY || 100);
    const listH = Math.max(80, height - listY - 16);
    const listW = width - 32;
    const itemH = 118;
    const totalContentH = formulas.length * itemH;
    this.maxScroll = Math.max(0, totalContentH - listH + 40);

    ctx.save();
    ctx.beginPath();
    ctx.rect(16, listY, listW, listH);
    ctx.clip();

    let curY = listY - this.scrollOffset;

    for (const item of formulas) {
      if (curY + itemH >= listY && curY <= listY + listH) {
        // Formula Card
        Renderer.drawPanel(ctx, 16, curY, listW, itemH - 10, {
          fill: '#0E1522',
          stroke: Colors.panelBorder,
          radius: 8
        });

        // Category Tag
        const catTagW = Math.min(130, item.category.length * 7 + 16);
        Renderer.drawRoundedRect(ctx, 28, curY + 10, catTagW, 18, 4, {
          fill: 'rgba(94, 231, 255, 0.12)',
          stroke: 'rgba(94, 231, 255, 0.3)'
        });
        Renderer.drawText(ctx, item.category.replace(/_/g, ' '), 28 + catTagW / 2, curY + 19, {
          fill: Colors.cyan,
          font: 'bold 9px "Segoe UI", Roboto, sans-serif',
          align: 'center',
          baseline: 'middle'
        });

        // Name
        Renderer.drawText(ctx, item.name, 36 + catTagW, curY + 19, {
          fill: Colors.text,
          font: 'bold 13px "Segoe UI", Roboto, sans-serif',
          baseline: 'middle'
        });

        // Formula Equation Box
        const eqBoxW = Math.max(100, listW - 24);
        Renderer.drawRoundedRect(ctx, 28, curY + 34, eqBoxW, 34, 6, {
          fill: '#070B14',
          stroke: 'rgba(250, 204, 21, 0.3)'
        });

        // Equation text with fitting
        const eqFontSize = TextEngine.fitFontSize(ctx, item.formula, eqBoxW - 24, 15, 11, 'monospace', 'bold');
        Renderer.drawText(ctx, item.formula, 40, curY + 51, {
          fill: Colors.yellow,
          font: `bold ${eqFontSize}px "Courier New", monospace`,
          baseline: 'middle'
        });

        // Variables & Description with wrapping
        const descText = `${item.description}  •  ${item.variables}`;
        TextEngine.drawWrappedText(ctx, descText, 28, curY + 76, listW - 32, {
          fill: Colors.textMuted,
          fontSize: 11,
          fontFamily: '"Segoe UI", Roboto, sans-serif',
          lineHeight: 14,
          maxLines: 2
        });
      }

      curY += itemH;
    }

    ctx.restore();
  }
}
