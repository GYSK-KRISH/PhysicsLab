// Placeholder Scene for Projectile Motion (Phase 1)
import { Colors, Renderer } from '../engine/renderer.js';
import { Button, Slider } from '../engine/ui.js';
import { MenuScene } from './menuScene.js';

export class PlaceholderScene {
  constructor() {
    this.buttons = [];
    this.sliders = [];
    this.lastWidth = 0;
    this.lastHeight = 0;

    this.launchAngle = 45;
    this.launchVelocity = 25;
    this.gravity = 9.8;
  }

  init() {
    this.rebuildUI();
  }

  rebuildUI() {
    const { width } = this.canvasEngine.getBounds();

    this.buttons = [];
    this.sliders = [];

    // Back button
    this.buttons.push(new Button({
      x: 40,
      y: 40,
      width: 170,
      height: 44,
      text: '← MAIN MENU',
      accentColor: Colors.purple,
      callback: () => {
        this.sceneManager.changeScene(new MenuScene());
      }
    }));

    // Control panel
    const panelX = Math.min(width - 340, width * 0.65);
    const panelY = 120;
    const panelW = Math.min(300, width - 80);

    this.sliders.push(new Slider({
      x: panelX + 20,
      y: panelY + 60,
      width: panelW - 40,
      min: 5,
      max: 85,
      value: this.launchAngle,
      step: 1,
      label: 'Launch Angle',
      unit: '°',
      accentColor: Colors.cyan,
      callback: (v) => { this.launchAngle = v; }
    }));

    this.sliders.push(new Slider({
      x: panelX + 20,
      y: panelY + 130,
      width: panelW - 40,
      min: 5,
      max: 80,
      value: this.launchVelocity,
      step: 1,
      label: 'Initial Velocity',
      unit: ' m/s',
      accentColor: Colors.cyan,
      callback: (v) => { this.launchVelocity = v; }
    }));

    this.sliders.push(new Slider({
      x: panelX + 20,
      y: panelY + 200,
      width: panelW - 40,
      min: 1,
      max: 20,
      value: this.gravity,
      step: 0.1,
      label: 'Gravity (g)',
      unit: ' m/s²',
      accentColor: Colors.yellow,
      callback: (v) => { this.gravity = v; }
    }));
  }

  handleInput() {
    const { width, height } = this.canvasEngine.getBounds();
    if (width !== this.lastWidth || height !== this.lastHeight) {
      this.lastWidth = width;
      this.lastHeight = height;
      this.rebuildUI();
    }
  }

  update(dt) {
    for (const btn of this.buttons) btn.update(dt, this.inputManager);
    for (const slider of this.sliders) slider.update(dt, this.inputManager);
  }

  render(ctx) {
    const { width, height } = this.canvasEngine.getBounds();

    Renderer.drawRect(ctx, 0, 0, width, height, { fill: Colors.background });
    Renderer.drawGrid(ctx, width, height, 40);

    // Header
    Renderer.drawText(ctx, 'PROJECTILE MOTION', 230, 52, {
      fill: Colors.text,
      font: 'bold 24px "Segoe UI", Roboto, sans-serif',
      glowColor: Colors.cyan,
      glowBlur: 12,
      baseline: 'middle'
    });

    Renderer.drawText(ctx, 'Phase 1 — Interactive Controls Preview', 230, 80, {
      fill: Colors.textMuted,
      font: '14px "Segoe UI", Roboto, sans-serif',
      baseline: 'middle'
    });

    // Control panel
    const panelX = Math.min(width - 340, width * 0.65);
    const panelY = 120;
    const panelW = Math.min(300, width - 80);
    const panelH = 290;

    Renderer.drawPanel(ctx, panelX, panelY, panelW, panelH, {
      fill: Colors.panel,
      stroke: Colors.panelBorder,
      radius: 12,
      glowColor: Colors.cyan,
      glowBlur: 6
    });

    Renderer.drawText(ctx, 'SIMULATION PARAMETERS', panelX + 20, panelY + 28, {
      fill: Colors.cyan,
      font: 'bold 12px "Segoe UI", Roboto, sans-serif',
      baseline: 'middle'
    });

    // Simulation area
    const simX = 40;
    const simY = 120;
    const simW = panelX - 80;
    const simH = height - 180;

    if (simW > 220 && simH > 220) {
      Renderer.drawPanel(ctx, simX, simY, simW, simH, {
        fill: '#0C111C',
        stroke: Colors.panelBorder,
        radius: 12
      });

      const groundY = simY + simH - 40;

      // Ground
      Renderer.drawLine(ctx, simX + 20, groundY, simX + simW - 20, groundY, {
        stroke: Colors.green,
        lineWidth: 2,
        glowColor: Colors.green,
        glowBlur: 6
      });

      // Trajectory preview
      const startX = simX + 50;
      const startY = groundY;
      const angleRad = (this.launchAngle * Math.PI) / 180;
      const scale = 3.2; // visual scale

      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = Colors.cyan;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([7, 5]);
      ctx.moveTo(startX, startY);

      for (let t = 0; t < 12; t += 0.05) {
        const x = startX + this.launchVelocity * Math.cos(angleRad) * t * scale;
        const y = startY - (this.launchVelocity * Math.sin(angleRad) * t * scale - 0.5 * this.gravity * t * t * scale);
        if (y > groundY + 5 || x > simX + simW - 30) break;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();

      // Launch point
      Renderer.drawCircle(ctx, startX, startY, 11, {
        fill: Colors.purple,
        stroke: Colors.cyan,
        lineWidth: 2,
        glowColor: Colors.purple,
        glowBlur: 10
      });

      Renderer.drawText(ctx, 'LIVE PREVIEW', simX + simW / 2, simY + 30, {
        fill: Colors.textMuted,
        font: '600 13px "Segoe UI", Roboto, sans-serif',
        align: 'center'
      });
    }

    // UI
    for (const btn of this.buttons) btn.render(ctx);
    for (const slider of this.sliders) slider.render(ctx);
  }

  destroy() {
    this.buttons = [];
    this.sliders = [];
  }
}