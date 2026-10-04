// Mechanics Formula Library Scene for PhysicsLab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Button } from '../../engine/ui.js';
import { FORMULA_CATEGORIES, FORMULA_LIBRARY } from '../../physics/mechanics/formulaLibraryData.js';

export class FormulaLibraryScene {
  constructor() {
    this.buttons = [];
    this.categoryButtons = [];
    this.selectedCategory = 'ALL';
    this.scrollOffset = 0;
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

    // Back button
    this.buttons.push(new Button({
      x: 20,
      y: 16,
      width: 150,
      height: 38,
      text: '← MECHANICS LAB',
      accentColor: Colors.purple,
      callback: () => {
        import('./mechanicsMenuScene.js').then(m => this.sceneManager.changeScene(new m.MechanicsMenuScene()));
      }
    }));

    // Category Filter Buttons
    const catY = 70;
    const catH = 32;
    const gap = 8;
    let catX = 20;

    const visibleCats = [
      'ALL', 'KINEMATICS', 'VECTORS', 'NEWTONS_LAWS', 'FRICTION',
      'CIRCULAR_MOTION', 'WORK_ENERGY_POWER', 'ROTATION', 'GRAVITATION', 'OSCILLATIONS_SHM', 'WAVES'
    ];

    for (const cat of visibleCats) {
      const isSel = this.selectedCategory === cat;
      const formattedName = cat.replace(/_/g, ' ');
      const catBtn = new Button({
        x: catX,
        y: catY,
        width: 110,
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
      catX += 110 + gap;
    }

    // Scroll buttons
    this.buttons.push(new Button({
      x: width - 180,
      y: 16,
      width: 70,
      height: 38,
      text: '▲ UP',
      accentColor: Colors.cyan,
      callback: () => {
        this.scrollOffset = Math.max(0, this.scrollOffset - 180);
      }
    }));

    this.buttons.push(new Button({
      x: width - 100,
      y: 16,
      width: 80,
      height: 38,
      text: '▼ DOWN',
      accentColor: Colors.cyan,
      callback: () => {
        this.scrollOffset += 180;
      }
    }));
  }

  handleInput(inputManager) {
    const { width, height } = this.canvasEngine.getBounds();
    if (this.lastWidth !== width || this.lastHeight !== height) {
      this.lastWidth = width;
      this.lastHeight = height;
      this.rebuildUI();
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

    // Title
    Renderer.drawText(ctx, 'MECHANICS FORMULA LIBRARY', width / 2, 28, {
      fill: Colors.cyan,
      font: '900 22px "Segoe UI", Roboto, sans-serif',
      align: 'center',
      baseline: 'middle',
      glowColor: Colors.cyan,
      glowBlur: 10
    });

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

    const listY = 120;
    const listH = height - listY - 20;
    const itemH = 110;
    const listW = width - 40;

    ctx.save();
    ctx.beginPath();
    ctx.rect(20, listY, listW, listH);
    ctx.clip();

    let curY = listY - this.scrollOffset;

    for (const item of formulas) {
      if (curY + itemH >= listY && curY <= listY + listH) {
        // Formula Card
        Renderer.drawPanel(ctx, 20, curY, listW, itemH - 12, {
          fill: '#0E1522',
          stroke: Colors.panelBorder,
          radius: 8
        });

        // Category Tag
        Renderer.drawRoundedRect(ctx, 36, curY + 12, 130, 20, 4, {
          fill: 'rgba(94, 231, 255, 0.12)',
          stroke: 'rgba(94, 231, 255, 0.3)'
        });
        Renderer.drawText(ctx, item.category.replace(/_/g, ' '), 101, curY + 22, {
          fill: Colors.cyan,
          font: 'bold 10px "Segoe UI", Roboto, sans-serif',
          align: 'center',
          baseline: 'middle'
        });

        // Name
        Renderer.drawText(ctx, item.name, 180, curY + 22, {
          fill: Colors.text,
          font: 'bold 14px "Segoe UI", Roboto, sans-serif',
          baseline: 'middle'
        });

        // Formula Equation Box
        Renderer.drawRoundedRect(ctx, 36, curY + 38, listW - 72, 34, 6, {
          fill: '#070B14',
          stroke: 'rgba(250, 204, 21, 0.3)'
        });
        Renderer.drawText(ctx, item.formula, 48, curY + 55, {
          fill: Colors.yellow,
          font: 'bold 15px "Courier New", monospace',
          baseline: 'middle'
        });

        // Variables & Description
        Renderer.drawText(ctx, `${item.description}  |  ${item.variables}`, 36, curY + 84, {
          fill: Colors.textMuted,
          font: '11px "Segoe UI", Roboto, sans-serif'
        });
      }

      curY += itemH;
    }

    ctx.restore();
  }
}
