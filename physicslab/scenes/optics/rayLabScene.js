// Light Ray Laboratory (Virtual Optical Bench Sandbox) for PhysicsLab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Button } from '../../engine/ui.js';
import { RayTracer } from '../../physics/optics/rayTracer.js';

export class RayLabScene {
  constructor() {
    this.components = [];
    this.buttons = [];
    this.activeComponent = null;

    this.showLightParticles = true;
    this.particleProgress = 0;
    this.isPaused = false;

    this.lastWidth = 0;
    this.lastHeight = 0;
  }

  init() {
    this.setupDefaultBench();
    this.rebuildUI();
  }

  setupDefaultBench() {
    this.components = [
      { id: 'source', type: 'LIGHT_SOURCE', x: 120, y: 0, label: 'LASER SOURCE', color: '#FFFFFF', isDragging: false },
      { id: 'lens1', type: 'CONVEX_LENS', x: 380, y: 0, f: 20, label: 'CONVEX LENS (f=20cm)', color: Colors.cyan, isDragging: false },
      { id: 'screen', type: 'SCREEN', x: 680, y: 0, label: 'PROJECTOR SCREEN', color: Colors.green, isDragging: false }
    ];
  }

  rebuildUI() {
    const { width, height } = this.canvasEngine.getBounds();
    this.buttons = [];

    const headerHeight = 60;

    const backBtn = new Button({
      x: 20,
      y: 12,
      width: 150,
      height: 38,
      text: '← OPTICS MENU',
      accentColor: Colors.purple,
      callback: () => this.goToOpticsMenu()
    });

    const addLensBtn = new Button({
      x: 180,
      y: 12,
      width: 140,
      height: 38,
      text: '+ CONVEX LENS',
      accentColor: Colors.cyan,
      callback: () => {
        const id = 'lens_' + Date.now();
        this.components.push({
          id,
          type: 'CONVEX_LENS',
          x: 450,
          y: 0,
          f: 20,
          label: 'CONVEX LENS',
          color: Colors.cyan,
          isDragging: false
        });
        this.rebuildUI();
      }
    });

    const addMirrorBtn = new Button({
      x: 330,
      y: 12,
      width: 130,
      height: 38,
      text: '+ MIRROR',
      accentColor: Colors.purple,
      callback: () => {
        const id = 'mirror_' + Date.now();
        this.components.push({
          id,
          type: 'MIRROR',
          x: 580,
          y: 0,
          f: -20,
          label: 'MIRROR',
          color: Colors.purple,
          isDragging: false
        });
        this.rebuildUI();
      }
    });

    const resetBtn = new Button({
      x: 470,
      y: 12,
      width: 100,
      height: 38,
      text: 'RESET BENCH',
      accentColor: Colors.yellow,
      callback: () => {
        this.setupDefaultBench();
        this.rebuildUI();
      }
    });

    this.buttons.push(backBtn, addLensBtn, addMirrorBtn, resetBtn);

    this.benchRect = { x: 20, y: headerHeight + 10, w: width - 40, h: height - headerHeight - 30 };
  }

  goToOpticsMenu() {
    if (this.sceneManager) {
      import('./opticsMenuScene.js').then((module) => {
        this.sceneManager.changeScene(new module.OpticsMenuScene());
      });
    }
  }

  handleInput(inputManager) {
    if (!inputManager) return;
    const pointer = inputManager.pointer;
    const bench = this.benchRect;
    const originY = bench.y + bench.h * 0.5;

    // Component Dragging
    for (const comp of this.components) {
      const compSx = bench.x + comp.x;
      const compSy = originY + comp.y;
      const hitRadius = 35;

      if (pointer.justPressed && Math.hypot(pointer.x - compSx, pointer.y - compSy) <= hitRadius) {
        comp.isDragging = true;
        this.activeComponent = comp;
        break;
      }

      if (comp.isDragging) {
        if (!pointer.isDown) {
          comp.isDragging = false;
          this.activeComponent = null;
        } else {
          comp.x = Math.max(40, Math.min(bench.w - 40, pointer.x - bench.x));
        }
      }
    }

    if (inputManager.isKeyJustPressed('Escape')) {
      this.goToOpticsMenu();
    }

    const { width, height } = this.canvasEngine.getBounds();
    if (this.lastWidth !== width || this.lastHeight !== height) {
      this.lastWidth = width;
      this.lastHeight = height;
      this.rebuildUI();
    }
  }

  update(dt) {
    if (!this.isPaused) {
      this.particleProgress = (this.particleProgress + dt * 0.8) % 1.0;
    }
    for (const btn of this.buttons) btn.update(dt, this.inputManager);
  }

  render(ctx) {
    const { width, height } = this.canvasEngine.getBounds();

    Renderer.drawRect(ctx, 0, 0, width, height, { fill: Colors.background });
    Renderer.drawGrid(ctx, width, height, 40);

    Renderer.drawPanel(ctx, this.benchRect.x, this.benchRect.y, this.benchRect.w, this.benchRect.h, {
      fill: Colors.panel,
      stroke: Colors.panelBorder,
      radius: 12
    });

    this.renderOpticalBench(ctx);

    Renderer.drawText(ctx, 'VIRTUAL OPTICAL BENCH SANDBOX', 650, 31, {
      fill: Colors.cyan,
      font: 'bold 16px "Segoe UI", Roboto, sans-serif',
      glowColor: Colors.cyan,
      glowBlur: 8,
      baseline: 'middle'
    });

    for (const btn of this.buttons) btn.render(ctx);
  }

  renderOpticalBench(ctx) {
    ctx.save();
    const bench = this.benchRect;
    const originY = bench.y + bench.h * 0.5;

    ctx.beginPath();
    ctx.rect(bench.x + 2, bench.y + 2, bench.w - 4, bench.h - 4);
    ctx.clip();

    // Optical Bench Rail Line
    Renderer.drawLine(ctx, bench.x, originY, bench.x + bench.w, originY, {
      stroke: Colors.cyan,
      lineWidth: 2,
      glowColor: Colors.cyan,
      glowBlur: 6
    });

    Renderer.drawText(ctx, 'OPTICAL BENCH RAIL (Drag components along rail)', bench.x + 15, originY - 12, {
      fill: 'rgba(94, 231, 255, 0.6)',
      font: '10px "Segoe UI", Roboto, sans-serif'
    });

    // Sort components left to right along bench
    const sorted = [...this.components].sort((a, b) => a.x - b.x);

    // Dynamic Ray Propagation across placed components
    const source = sorted.find(c => c.type === 'LIGHT_SOURCE');
    let currentX = source ? bench.x + source.x : bench.x + 100;
    let currentY = originY - 25;

    if (source) {
      // Draw Laser Source Graphic
      const srcSx = bench.x + source.x;
      Renderer.drawPanel(ctx, srcSx - 25, originY - 35, 50, 70, { fill: '#1E293B', stroke: Colors.cyan, radius: 8 });
      Renderer.drawCircle(ctx, srcSx + 25, originY - 25, 6, { fill: '#FFFFFF', stroke: Colors.cyan, lineWidth: 2, glowColor: Colors.cyan, glowBlur: 10 });
      Renderer.drawText(ctx, 'SOURCE', srcSx, originY + 45, { fill: Colors.text, font: 'bold 11px "Segoe UI", Roboto, sans-serif', align: 'center' });
    }

    // Propagate rays through placed optical elements
    for (const comp of sorted) {
      if (comp.type === 'LIGHT_SOURCE') continue;

      const compSx = bench.x + comp.x;
      const compSy = originY + comp.y;

      if (comp.type === 'CONVEX_LENS') {
        // Draw Laser Ray from previous element to this lens
        RayTracer.drawRay(ctx, currentX, currentY, compSx, currentY, { color: Colors.cyan, lineWidth: 2.5 });
        RayTracer.drawRayParticle(ctx, currentX, currentY, compSx, currentY, this.particleProgress, { color: Colors.cyan });

        // Draw Lens Graphic
        Renderer.drawPanel(ctx, compSx - 8, originY - 70, 16, 140, { fill: 'rgba(94, 231, 255, 0.3)', stroke: Colors.cyan, radius: 8 });
        Renderer.drawText(ctx, comp.label, compSx, originY + 80, { fill: Colors.cyan, font: 'bold 11px "Segoe UI", Roboto, sans-serif', align: 'center' });

        // Ray bends through lens towards focal point
        const nextX = compSx + 180;
        const nextY = originY + 25;
        RayTracer.drawRay(ctx, compSx, currentY, nextX, nextY, { color: Colors.purple, lineWidth: 2.5 });
        RayTracer.drawRayParticle(ctx, compSx, currentY, nextX, nextY, this.particleProgress, { color: Colors.purple });

        currentX = nextX;
        currentY = nextY;
      } else if (comp.type === 'SCREEN') {
        RayTracer.drawRay(ctx, currentX, currentY, compSx, currentY, { color: Colors.yellow, lineWidth: 2.5 });

        // Draw Screen Graphic
        Renderer.drawPanel(ctx, compSx - 5, originY - 80, 10, 160, { fill: Colors.green, stroke: '#FFFFFF', radius: 4 });
        Renderer.drawCircle(ctx, compSx, currentY, 8, { fill: '#FFFFFF', stroke: Colors.yellow, lineWidth: 2, glowColor: Colors.yellow, glowBlur: 14 });
        Renderer.drawText(ctx, 'FOCUSED SPOT', compSx, originY - 95, { fill: Colors.green, font: 'bold 11px "Segoe UI", Roboto, sans-serif', align: 'center' });
      } else if (comp.type === 'MIRROR') {
        RayTracer.drawRay(ctx, currentX, currentY, compSx, currentY, { color: Colors.cyan, lineWidth: 2.5 });

        // Draw Mirror Graphic
        Renderer.drawPanel(ctx, compSx - 6, originY - 70, 12, 140, { fill: 'rgba(139, 92, 246, 0.4)', stroke: Colors.purple, radius: 4 });
        Renderer.drawText(ctx, 'MIRROR', compSx, originY + 80, { fill: Colors.purple, font: 'bold 11px "Segoe UI", Roboto, sans-serif', align: 'center' });

        // Reflected Ray going backwards left
        RayTracer.drawRay(ctx, compSx, currentY, compSx - 200, currentY - 30, { color: Colors.yellow, lineWidth: 2.5 });
      }
    }

    ctx.restore();
  }

  destroy() {
    this.components = [];
    this.buttons = [];
  }
}
