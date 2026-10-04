// Projectile Motion Scene – Full Implementation
import { Colors, Renderer } from '../engine/renderer.js';
import { Button, Slider } from '../engine/ui.js';
import { MenuScene } from './menuScene.js';

export class ProjectileScene {
  constructor() {
    this.buttons = [];
    this.sliders = [];
    this.lastWidth = 0;
    this.lastHeight = 0;

    // Simulation parameters
    this.angle = 45;          // degrees
    this.velocity = 30;       // m/s
    this.gravity = 9.8;       // m/s²

    // Runtime state
    this.isRunning = false;
    this.isPaused = false;
    this.time = 0;
    this.projectile = { x: 0, y: 0, active: false };
    this.trail = [];
    this.maxTrailLength = 120;

    // Calculated results (updated live)
    this.range = 0;
    this.maxHeight = 0;
    this.timeOfFlight = 0;

    // Visual scale (pixels per meter)
    this.scale = 8;
  }

  init() {
    this.rebuildUI();
    this.resetSimulation();
  }

  rebuildUI() {
    const { width, height } = this.canvasEngine.getBounds();
    this.buttons = [];
    this.sliders = [];

    // Back button
    this.buttons.push(new Button({
      x: 30,
      y: 25,
      width: 160,
      height: 42,
      text: '← MAIN MENU',
      accentColor: Colors.purple,
      callback: () => {
        this.sceneManager.changeScene(new MenuScene());
      }
    }));

    // Control buttons (Start / Reset / Pause)
    const btnY = height - 70;
    const btnW = 130;
    const gap = 14;
    const startX = 40;

    this.buttons.push(new Button({
      x: startX,
      y: btnY,
      width: btnW,
      height: 44,
      text: this.isRunning ? 'RESET' : 'START',
      accentColor: Colors.green,
      callback: () => this.toggleStartReset()
    }));

    this.buttons.push(new Button({
      x: startX + btnW + gap,
      y: btnY,
      width: btnW,
      height: 44,
      text: this.isPaused ? 'RESUME' : 'PAUSE',
      accentColor: Colors.yellow,
      disabled: !this.isRunning,
      callback: () => this.togglePause()
    }));

    // Right-side control panel
    const panelW = 300;
    const panelX = width - panelW - 30;
    const panelY = 90;

    // Angle
    this.sliders.push(new Slider({
      x: panelX + 20,
      y: panelY + 50,
      width: panelW - 40,
      min: 5,
      max: 85,
      value: this.angle,
      step: 1,
      label: 'Launch Angle',
      unit: '°',
      accentColor: Colors.cyan,
      callback: (v) => {
        this.angle = v;
        if (!this.isRunning) this.updatePredictedValues();
      }
    }));

    // Velocity
    this.sliders.push(new Slider({
      x: panelX + 20,
      y: panelY + 120,
      width: panelW - 40,
      min: 5,
      max: 60,
      value: this.velocity,
      step: 1,
      label: 'Initial Velocity',
      unit: ' m/s',
      accentColor: Colors.cyan,
      callback: (v) => {
        this.velocity = v;
        if (!this.isRunning) this.updatePredictedValues();
      }
    }));

    // Gravity
    this.sliders.push(new Slider({
      x: panelX + 20,
      y: panelY + 190,
      width: panelW - 40,
      min: 1.0,
      max: 20.0,
      value: this.gravity,
      step: 0.1,
      label: 'Gravity',
      unit: ' m/s²',
      accentColor: Colors.yellow,
      callback: (v) => {
        this.gravity = v;
        if (!this.isRunning) this.updatePredictedValues();
      }
    }));
  }

  // ---------- Physics Helpers ----------

  updatePredictedValues() {
    const θ = (this.angle * Math.PI) / 180;
    const u = this.velocity;
    const g = this.gravity;

    this.timeOfFlight = (2 * u * Math.sin(θ)) / g;
    this.range = (u * u * Math.sin(2 * θ)) / g;
    this.maxHeight = (u * u * Math.sin(θ) * Math.sin(θ)) / (2 * g);
  }

  resetSimulation() {
    this.isRunning = false;
    this.isPaused = false;
    this.time = 0;
    this.trail = [];
    this.projectile.active = false;
    this.updatePredictedValues();
    this.rebuildUI(); // refresh button labels
  }

  toggleStartReset() {
    if (this.isRunning) {
      this.resetSimulation();
    } else {
      this.isRunning = true;
      this.isPaused = false;
      this.time = 0;
      this.trail = [];
      this.projectile.active = true;
      this.rebuildUI();
    }
  }

  togglePause() {
    if (!this.isRunning) return;
    this.isPaused = !this.isPaused;
    this.rebuildUI();
  }

  // ---------- Lifecycle ----------

  handleInput() {
    const { width, height } = this.canvasEngine.getBounds();
    if (width !== this.lastWidth || height !== this.lastHeight) {
      this.lastWidth = width;
      this.lastHeight = height;
      this.rebuildUI();
    }
  }

  update(dt) {
    // Update UI
    for (const btn of this.buttons) btn.update(dt, this.inputManager);
    for (const slider of this.sliders) slider.update(dt, this.inputManager);

    if (!this.isRunning || this.isPaused) return;

    this.time += dt;

    const θ = (this.angle * Math.PI) / 180;
    const u = this.velocity;
    const g = this.gravity;

    // Physics
    const x = u * Math.cos(θ) * this.time;
    const y = u * Math.sin(θ) * this.time - 0.5 * g * this.time * this.time;

    this.projectile.x = x;
    this.projectile.y = y;

    // Trail
    this.trail.push({ x, y });
    if (this.trail.length > this.maxTrailLength) {
      this.trail.shift();
    }

    // Landed?
    if (y < 0 && this.time > 0.1) {
      this.projectile.y = 0;
      this.isRunning = false;
      this.projectile.active = false;
      this.rebuildUI();
    }
  }

  // ---------- Rendering ----------

  render(ctx) {
    const { width, height } = this.canvasEngine.getBounds();

    // Background
    Renderer.drawRect(ctx, 0, 0, width, height, { fill: Colors.background });
    Renderer.drawGrid(ctx, width, height, 50);

    // Layout constants
    const panelW = 300;
    const panelX = width - panelW - 30;
    const simX = 40;
    const simY = 90;
    const simW = panelX - 70;
    const simH = height - 180;

    // ===== Simulation Area =====
    if (simW > 250 && simH > 200) {
      // Panel
      Renderer.drawPanel(ctx, simX, simY, simW, simH, {
        fill: '#0A0F18',
        stroke: Colors.panelBorder,
        radius: 14
      });

      // Ground
      const groundY = simY + simH - 50;
      Renderer.drawLine(ctx, simX + 25, groundY, simX + simW - 25, groundY, {
        stroke: Colors.green,
        lineWidth: 3,
        glowColor: Colors.green,
        glowBlur: 8
      });

      // Origin marker
      const originX = simX + 60;
      const originY = groundY;

      // Launch point
      Renderer.drawCircle(ctx, originX, originY, 9, {
        fill: Colors.purple,
        stroke: Colors.cyan,
        lineWidth: 2,
        glowColor: Colors.purple,
        glowBlur: 10
      });

      // Predicted trajectory (when not running)
      if (!this.isRunning) {
        this.drawPredictedTrajectory(ctx, originX, originY, groundY, simX + simW - 30);
      }

      // Actual trail
      if (this.trail.length > 1) {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = Colors.cyan;
        ctx.lineWidth = 2.5;
        ctx.globalAlpha = 0.85;

        for (let i = 0; i < this.trail.length; i++) {
          const p = this.trail[i];
          const px = originX + p.x * this.scale;
          const py = originY - p.y * this.scale;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.restore();
      }

      // Projectile
      if (this.projectile.active || this.trail.length > 0) {
        const px = originX + this.projectile.x * this.scale;
        const py = originY - this.projectile.y * this.scale;

        // Glow
        Renderer.drawCircle(ctx, px, py, 14, {
          fill: 'rgba(94, 231, 255, 0.15)',
          glowColor: Colors.cyan,
          glowBlur: 18
        });

        // Ball
        Renderer.drawCircle(ctx, px, py, 8, {
          fill: Colors.cyan,
          stroke: '#FFFFFF',
          lineWidth: 2,
          glowColor: Colors.cyan,
          glowBlur: 12
        });
      }

      // Title inside sim area
      Renderer.drawText(ctx, 'TRAJECTORY VIEW', simX + 25, simY + 28, {
        fill: Colors.textMuted,
        font: '600 13px "Segoe UI", Roboto, sans-serif'
      });
    }

    // ===== Right Control Panel =====
    const panelY = 90;
    const panelH = 340;

    Renderer.drawPanel(ctx, panelX, panelY, panelW, panelH, {
      fill: Colors.panel,
      stroke: Colors.panelBorder,
      radius: 14,
      glowColor: Colors.cyan,
      glowBlur: 6
    });

    Renderer.drawText(ctx, 'CONTROLS', panelX + 22, panelY + 28, {
      fill: Colors.cyan,
      font: 'bold 13px "Segoe UI", Roboto, sans-serif'
    });

    // ===== Live Stats Panel =====
    const statsY = panelY + panelH + 20;
    const statsH = 160;

    Renderer.drawPanel(ctx, panelX, statsY, panelW, statsH, {
      fill: Colors.panel,
      stroke: Colors.panelBorder,
      radius: 14
    });

    Renderer.drawText(ctx, 'LIVE RESULTS', panelX + 22, statsY + 28, {
      fill: Colors.green,
      font: 'bold 13px "Segoe UI", Roboto, sans-serif'
    });

    const stats = [
      { label: 'Range', value: `${this.range.toFixed(1)} m`, color: Colors.cyan },
      { label: 'Max Height', value: `${this.maxHeight.toFixed(1)} m`, color: Colors.purple },
      { label: 'Time of Flight', value: `${this.timeOfFlight.toFixed(2)} s`, color: Colors.yellow }
    ];

    stats.forEach((s, i) => {
      const y = statsY + 60 + i * 32;
      Renderer.drawText(ctx, s.label, panelX + 22, y, {
        fill: Colors.textMuted,
        font: '13px "Segoe UI", Roboto, sans-serif'
      });
      Renderer.drawText(ctx, s.value, panelX + panelW - 22, y, {
        fill: s.color,
        font: 'bold 15px "Segoe UI", Roboto, sans-serif',
        align: 'right'
      });
    });

    // ===== Header =====
    Renderer.drawText(ctx, 'PROJECTILE MOTION', 210, 48, {
      fill: Colors.text,
      font: 'bold 26px "Segoe UI", Roboto, sans-serif',
      glowColor: Colors.cyan,
      glowBlur: 12,
      baseline: 'middle'
    });

    // ===== UI Elements =====
    for (const btn of this.buttons) btn.render(ctx);
    for (const slider of this.sliders) slider.render(ctx);
  }

  drawPredictedTrajectory(ctx, originX, originY, groundY, maxX) {
    const θ = (this.angle * Math.PI) / 180;
    const u = this.velocity;
    const g = this.gravity;

    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(94, 231, 255, 0.45)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 5]);
    ctx.moveTo(originX, originY);

    for (let t = 0; t < 20; t += 0.05) {
      const x = u * Math.cos(θ) * t;
      const y = u * Math.sin(θ) * t - 0.5 * g * t * t;

      const px = originX + x * this.scale;
      const py = originY - y * this.scale;

      if (py > groundY + 2 || px > maxX) break;
      ctx.lineTo(px, py);
    }

    ctx.stroke();
    ctx.restore();
  }

  destroy() {
    this.buttons = [];
    this.sliders = [];
    this.trail = [];
  }
}