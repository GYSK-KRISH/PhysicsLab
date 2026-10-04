// Pendulum Scene for PhysicsLab (Phase 3)
import { Colors, Renderer } from '../engine/renderer.js';
import { Button, Slider } from '../engine/ui.js';
import { PendulumPhysics, PlanetGravity } from '../physics/mechanics/pendulum.js';

export class PendulumScene {
  constructor() {
    this.physics = new PendulumPhysics({
      length: 1.0,
      initialAngle: 30.0,
      gravity: PlanetGravity.EARTH.g,
      planetName: 'Earth'
    });

    this.buttons = [];
    this.sliders = [];
    this.planetButtons = [];
    this.graphButtons = [];

    this.graphMode = 'POSITION';
    this.lastWidth = 0;
    this.lastHeight = 0;
  }

  init() {
    this.rebuildUI();
  }

  rebuildUI() {
    const { width, height } = this.canvasEngine.getBounds();
    this.buttons = [];
    this.sliders = [];
    this.planetButtons = [];
    this.graphButtons = [];

    const headerHeight = 60;

    // 1. Navigation Button
    const backBtn = new Button({
      x: 20,
      y: 12,
      width: 140,
      height: 38,
      text: '← MAIN MENU',
      accentColor: Colors.purple,
      callback: () => this.goToMenu()
    });
    this.buttons.push(backBtn);

    // 2. Playback Controls
    const playBtnText = this.physics.isOscillating ? 'PAUSE' : 'START';
    const playBtn = new Button({
      x: 180,
      y: 12,
      width: 110,
      height: 38,
      text: playBtnText,
      accentColor: this.physics.isOscillating ? Colors.yellow : Colors.green,
      badgeText: this.physics.isOscillating ? 'ACTIVE' : 'PAUSED',
      badgeColor: this.physics.isOscillating ? Colors.yellow : Colors.textDark,
      callback: () => {
        if (this.physics.isOscillating) {
          this.physics.pause();
        } else {
          this.physics.start();
        }
        this.rebuildUI();
      }
    });

    const resetBtn = new Button({
      x: 300,
      y: 12,
      width: 100,
      height: 38,
      text: 'RESET',
      accentColor: Colors.cyan,
      callback: () => {
        this.physics.reset();
        this.rebuildUI();
      }
    });

    const isSlow = this.physics.speedScale < 1.0;
    const slowBtn = new Button({
      x: 410,
      y: 12,
      width: 140,
      height: 38,
      text: 'SLOW MOTION',
      badgeText: isSlow ? '0.25x' : '1.0x',
      badgeColor: isSlow ? Colors.cyan : Colors.textDark,
      accentColor: Colors.cyan,
      callback: () => {
        this.physics.speedScale = isSlow ? 1.0 : 0.25;
        this.rebuildUI();
      }
    });

    this.buttons.push(playBtn, resetBtn, slowBtn);

    // 3. Sidebar Layout (Sliders & Presets)
    const sidebarWidth = Math.max(280, Math.min(340, width * 0.28));
    const sidebarX = width - sidebarWidth - 20;
    const sidebarY = headerHeight + 10;
    const sidebarHeight = height - sidebarY - 20;

    this.sidebarRect = { x: sidebarX, y: sidebarY, w: sidebarWidth, h: sidebarHeight };

    const sliderWidth = sidebarWidth - 40;
    const sliderStartX = sidebarX + 20;
    let sliderY = sidebarY + 60;

    // Length Slider
    const lengthSlider = new Slider({
      x: sliderStartX,
      y: sliderY,
      width: sliderWidth,
      min: 0.1,
      max: 10.0,
      value: this.physics.length,
      step: 0.1,
      label: 'STRING LENGTH (L)',
      unit: ' m',
      accentColor: Colors.cyan,
      callback: (val) => {
        this.physics.setParameters(val, this.physics.initialAngle, this.physics.gravity);
      }
    });
    this.sliders.push(lengthSlider);

    // Initial Angle Slider
    sliderY += 65;
    const angleSlider = new Slider({
      x: sliderStartX,
      y: sliderY,
      width: sliderWidth,
      min: 1,
      max: 60,
      value: this.physics.initialAngle,
      step: 1,
      label: 'INITIAL ANGLE (θ₀)',
      unit: '°',
      accentColor: Colors.cyan,
      callback: (val) => {
        this.physics.setParameters(this.physics.length, val, this.physics.gravity);
      }
    });
    this.sliders.push(angleSlider);

    // Planet Presets Buttons
    sliderY += 65;
    const planetKeys = ['EARTH', 'MOON', 'MARS'];
    const pBtnWidth = Math.floor((sliderWidth - 12) / 3);
    let pBtnX = sliderStartX;

    for (const key of planetKeys) {
      const p = PlanetGravity[key];
      const isSelected = this.physics.planetName === p.name;
      const btn = new Button({
        x: pBtnX,
        y: sliderY + 22,
        width: pBtnWidth,
        height: 32,
        text: p.name.toUpperCase(),
        accentColor: isSelected ? Colors.cyan : Colors.panelBorder,
        badgeText: `${p.g}m/s²`,
        badgeColor: isSelected ? Colors.cyan : Colors.textDark,
        callback: () => {
          this.physics.setPlanet(key);
          this.rebuildUI();
        }
      });
      this.planetButtons.push(btn);
      pBtnX += pBtnWidth + 6;
    }

    // Custom Gravity Slider
    sliderY += 70;
    const gravitySlider = new Slider({
      x: sliderStartX,
      y: sliderY,
      width: sliderWidth,
      min: 0.1,
      max: 25,
      value: this.physics.gravity,
      step: 0.1,
      label: 'CUSTOM GRAVITY (g)',
      unit: ' m/s²',
      accentColor: Colors.yellow,
      callback: (val) => {
        this.physics.setParameters(this.physics.length, this.physics.initialAngle, val, 'Custom');
      }
    });
    this.sliders.push(gravitySlider);

    // 4. Main Viewport & Graph Panel Layout
    const mainWidth = sidebarX - 40;
    const simHeight = Math.floor((height - headerHeight - 40) * 0.62);
    const graphHeight = (height - headerHeight - 40) - simHeight - 15;

    this.simRect = { x: 20, y: headerHeight + 10, w: mainWidth, h: simHeight };
    this.graphRect = { x: 20, y: this.simRect.y + simHeight + 15, w: mainWidth, h: graphHeight };

    // Graph Mode Selectors
    const graphModes = ['POSITION', 'VELOCITY', 'ACCELERATION'];
    const modeBtnWidth = 110;
    const modeBtnHeight = 28;
    let modeBtnX = this.graphRect.x + this.graphRect.w - (modeBtnWidth * 3 + 20);

    for (const mode of graphModes) {
      const isSelected = this.graphMode === mode;
      const btn = new Button({
        x: modeBtnX,
        y: this.graphRect.y + 10,
        width: modeBtnWidth,
        height: modeBtnHeight,
        text: mode,
        accentColor: isSelected ? Colors.cyan : Colors.panelBorder,
        callback: () => {
          this.graphMode = mode;
          this.rebuildUI();
        }
      });
      this.graphButtons.push(btn);
      modeBtnX += modeBtnWidth + 8;
    }
  }

  goToMenu() {
    if (this.sceneManager) {
      import('./menuScene.js').then((module) => {
        this.sceneManager.changeScene(new module.MenuScene());
      });
    }
  }

  handleInput(inputManager) {
    if (!inputManager) return;

    if (inputManager.isKeyJustPressed('Space')) {
      if (this.physics.isOscillating) {
        this.physics.pause();
      } else {
        this.physics.start();
      }
      this.rebuildUI();
    }

    if (inputManager.isKeyJustPressed('KeyR')) {
      this.physics.reset();
      this.rebuildUI();
    }

    if (inputManager.isKeyJustPressed('Escape')) {
      this.goToMenu();
    }

    const { width, height } = this.canvasEngine.getBounds();
    if (this.lastWidth !== width || this.lastHeight !== height) {
      this.lastWidth = width;
      this.lastHeight = height;
      this.rebuildUI();
    }
  }

  update(dt) {
    this.physics.update(dt);

    for (const btn of this.buttons) btn.update(dt, this.inputManager);
    for (const slider of this.sliders) slider.update(dt, this.inputManager);
    for (const btn of this.planetButtons) btn.update(dt, this.inputManager);
    for (const btn of this.graphButtons) btn.update(dt, this.inputManager);
  }

  worldToScreen(bobX, bobY) {
    const sim = this.simRect;
    const pivotX = sim.x + sim.w / 2;
    const pivotY = sim.y + 50;

    const availableH = sim.h - 90;
    const maxLen = Math.max(1.0, this.physics.length * 1.25);
    const scale = availableH / maxLen;

    const sx = pivotX + bobX * scale;
    const sy = pivotY + bobY * scale;

    return { sx, sy, pivotX, pivotY, scale };
  }

  render(ctx) {
    const { width, height } = this.canvasEngine.getBounds();

    Renderer.drawRect(ctx, 0, 0, width, height, { fill: Colors.background });
    Renderer.drawGrid(ctx, width, height, 40);

    Renderer.drawPanel(ctx, this.simRect.x, this.simRect.y, this.simRect.w, this.simRect.h, {
      fill: Colors.panel,
      stroke: Colors.panelBorder,
      radius: 12
    });

    this.renderPendulumViewport(ctx);
    this.renderSidebar(ctx);
    this.renderGraphPanel(ctx);

    Renderer.drawText(ctx, 'PENDULUM HARMONIC OSCILLATOR', 570, 31, {
      fill: Colors.cyan,
      font: 'bold 16px "Segoe UI", Roboto, sans-serif',
      glowColor: Colors.cyan,
      glowBlur: 8,
      baseline: 'middle'
    });

    for (const btn of this.buttons) btn.render(ctx);
    for (const slider of this.sliders) slider.render(ctx);
    for (const btn of this.planetButtons) btn.render(ctx);
    for (const btn of this.graphButtons) btn.render(ctx);
  }

  renderPendulumViewport(ctx) {
    ctx.save();
    const sim = this.simRect;

    ctx.beginPath();
    ctx.rect(sim.x + 2, sim.y + 2, sim.w - 4, sim.h - 4);
    ctx.clip();

    const state = this.physics.getCurrentState();
    const { sx, sy, pivotX, pivotY } = this.worldToScreen(state.bobX, state.bobY);

    // Ceiling / Mount Bar
    Renderer.drawLine(ctx, pivotX - 80, pivotY, pivotX + 80, pivotY, {
      stroke: Colors.panelBorder,
      lineWidth: 4
    });

    // Vertical Equilibrium Line (Dashed)
    const { sy: equilibriumEndY } = this.worldToScreen(0, this.physics.length);
    Renderer.drawLine(ctx, pivotX, pivotY, pivotX, equilibriumEndY + 20, {
      stroke: 'rgba(30, 41, 59, 0.6)',
      lineWidth: 1.5,
      lineDash: [4, 4]
    });

    // Angle Indicator Arc
    ctx.save();
    ctx.beginPath();
    ctx.arc(pivotX, pivotY, 40, Math.PI / 2, Math.PI / 2 - state.thetaRad, state.thetaRad > 0);
    ctx.strokeStyle = Colors.yellow;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    Renderer.drawText(ctx, `${state.thetaDeg.toFixed(1)}°`, pivotX + (state.thetaRad >= 0 ? 48 : -65), pivotY + 45, {
      fill: Colors.yellow,
      font: 'bold 11px "Segoe UI", Roboto, sans-serif'
    });
    ctx.restore();

    // Motion Trail Arc
    if (this.physics.trajectory.length > 1) {
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(94, 231, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.shadowColor = Colors.cyan;
      ctx.shadowBlur = 8;

      const p0 = this.worldToScreen(this.physics.trajectory[0].bobX, this.physics.trajectory[0].bobY);
      ctx.moveTo(p0.sx, p0.sy);

      for (let i = 1; i < this.physics.trajectory.length; i++) {
        const pt = this.worldToScreen(this.physics.trajectory[i].bobX, this.physics.trajectory[i].bobY);
        ctx.lineTo(pt.sx, pt.sy);
      }
      ctx.stroke();
      ctx.restore();
    }

    // String Line
    Renderer.drawLine(ctx, pivotX, pivotY, sx, sy, {
      stroke: Colors.text,
      lineWidth: 2.5
    });

    // Pivot Pin
    Renderer.drawCircle(ctx, pivotX, pivotY, 6, {
      fill: Colors.cyan,
      stroke: '#FFFFFF',
      lineWidth: 2,
      glowColor: Colors.cyan,
      glowBlur: 6
    });

    // Glowing Bob Sphere
    Renderer.drawCircle(ctx, sx, sy, 14, {
      fill: Colors.cyan,
      stroke: '#FFFFFF',
      lineWidth: 2.5,
      glowColor: Colors.cyan,
      glowBlur: 16
    });

    // Gravity Arrow (\vec{g}) at Bob
    const gLength = Math.min(45, this.physics.gravity * 3);
    Renderer.drawLine(ctx, sx, sy + 14, sx, sy + 14 + gLength, {
      stroke: Colors.yellow,
      lineWidth: 2,
      glowColor: Colors.yellow,
      glowBlur: 6
    });

    ctx.save();
    ctx.translate(sx, sy + 14 + gLength);
    ctx.fillStyle = Colors.yellow;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-4, -6);
    ctx.lineTo(4, -6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    Renderer.drawText(ctx, 'g', sx + 8, sy + 20 + gLength, {
      fill: Colors.yellow,
      font: 'bold 11px "Segoe UI", Roboto, sans-serif'
    });

    ctx.restore();
  }

  renderSidebar(ctx) {
    const sb = this.sidebarRect;

    Renderer.drawPanel(ctx, sb.x, sb.y, sb.w, sb.h, {
      fill: Colors.panel,
      stroke: Colors.panelBorder,
      radius: 12
    });

    Renderer.drawText(ctx, 'PARAMETERS & ENVIRONMENT', sb.x + 20, sb.y + 30, {
      fill: Colors.cyan,
      font: 'bold 13px "Segoe UI", Roboto, sans-serif',
      baseline: 'middle'
    });

    Renderer.drawLine(ctx, sb.x + 20, sb.y + 48, sb.x + sb.w - 20, sb.y + 48, {
      stroke: Colors.panelBorder,
      lineWidth: 1
    });

    Renderer.drawText(ctx, 'PLANET PRESETS', sb.x + 20, sb.y + 185, {
      fill: Colors.textMuted,
      font: 'bold 11px "Segoe UI", Roboto, sans-serif',
      baseline: 'middle'
    });

    const statsY = sb.y + 315;
    Renderer.drawText(ctx, 'LIVE TELEMETRY', sb.x + 20, statsY, {
      fill: Colors.purple,
      font: 'bold 13px "Segoe UI", Roboto, sans-serif',
      baseline: 'middle'
    });

    Renderer.drawLine(ctx, sb.x + 20, statsY + 15, sb.x + sb.w - 20, statsY + 15, {
      stroke: Colors.panelBorder,
      lineWidth: 1
    });

    const state = this.physics.getCurrentState();

    const telemetryItems = [
      { label: 'PLANET', value: this.physics.planetName, color: Colors.yellow },
      { label: 'CURRENT ANGLE (θ)', value: `${state.thetaDeg.toFixed(2)}°`, color: Colors.cyan },
      { label: 'ANGULAR VELOCITY (ω)', value: `${state.angularVelocity.toFixed(2)} rad/s`, color: Colors.green },
      { label: 'STRING LENGTH (L)', value: `${this.physics.length.toFixed(2)} m`, color: Colors.text },
      { label: 'GRAVITY (g)', value: `${this.physics.gravity.toFixed(2)} m/s²`, color: Colors.yellow },
      { label: 'OSCILLATION PERIOD (T)', value: `${this.physics.period.toFixed(2)} s`, color: Colors.purple }
    ];

    let itemY = statsY + 35;
    for (const item of telemetryItems) {
      Renderer.drawText(ctx, item.label, sb.x + 20, itemY, {
        fill: Colors.textMuted,
        font: '12px "Segoe UI", Roboto, sans-serif',
        baseline: 'middle'
      });

      Renderer.drawText(ctx, item.value, sb.x + sb.w - 20, itemY, {
        fill: item.color,
        font: 'bold 12px "Segoe UI", Roboto, sans-serif',
        align: 'right',
        baseline: 'middle'
      });

      itemY += 24;
    }
  }

  renderGraphPanel(ctx) {
    const gr = this.graphRect;

    Renderer.drawPanel(ctx, gr.x, gr.y, gr.w, gr.h, {
      fill: Colors.panel,
      stroke: Colors.panelBorder,
      radius: 12
    });

    Renderer.drawText(ctx, `GRAPH: ${this.graphMode} vs TIME`, gr.x + 20, gr.y + 24, {
      fill: Colors.text,
      font: 'bold 13px "Segoe UI", Roboto, sans-serif',
      baseline: 'middle'
    });

    const plotX = gr.x + 50;
    const plotY = gr.y + 45;
    const plotW = gr.w - 70;
    const plotH = gr.h - 65;

    Renderer.drawRect(ctx, plotX, plotY, plotW, plotH, {
      fill: '#0A0F1A',
      stroke: Colors.panelBorder,
      lineWidth: 1
    });

    const maxT = Math.max(2.0, this.physics.period * 2);
    let maxValY = 30;
    let minValY = -30;

    if (this.graphMode === 'POSITION') {
      maxValY = Math.max(10, this.physics.initialAngle * 1.2);
      minValY = -maxValY;
    } else if (this.graphMode === 'VELOCITY') {
      maxValY = Math.max(2, this.physics.theta0Rad * this.physics.omega0 * 1.2);
      minValY = -maxValY;
    } else if (this.graphMode === 'ACCELERATION') {
      maxValY = Math.max(2, this.physics.theta0Rad * this.physics.omega0 * this.physics.omega0 * 1.2);
      minValY = -maxValY;
    }

    ctx.save();
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.5)';
    ctx.lineWidth = 1;

    const yTicks = 4;
    for (let i = 0; i <= yTicks; i++) {
      const val = minValY + (i / yTicks) * (maxValY - minValY);
      const sy = plotY + plotH - (i / yTicks) * plotH;
      ctx.beginPath();
      ctx.moveTo(plotX, sy);
      ctx.lineTo(plotX + plotW, sy);
      ctx.stroke();

      Renderer.drawText(ctx, val.toFixed(1), plotX - 6, sy, {
        fill: Colors.textDark,
        font: '10px "Segoe UI", Roboto, sans-serif',
        align: 'right',
        baseline: 'middle'
      });
    }

    const xTicks = 5;
    for (let i = 0; i <= xTicks; i++) {
      const tVal = (i / xTicks) * maxT;
      const sx = plotX + (i / xTicks) * plotW;
      ctx.beginPath();
      ctx.moveTo(sx, plotY);
      ctx.lineTo(sx, plotY + plotH);
      ctx.stroke();

      Renderer.drawText(ctx, `${tVal.toFixed(1)}s`, sx, plotY + plotH + 12, {
        fill: Colors.textDark,
        font: '10px "Segoe UI", Roboto, sans-serif',
        align: 'center',
        baseline: 'top'
      });
    }
    ctx.restore();

    if (this.physics.trajectory.length > 0) {
      const mapPoint = (t, val) => {
        const sx = plotX + (t / maxT) * plotW;
        const normY = (val - minValY) / (maxValY - minValY);
        const sy = plotY + plotH - Math.max(0, Math.min(1, normY)) * plotH;
        return { sx, sy };
      };

      const drawCurve = (getValueFn, color) => {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;

        const first = this.physics.trajectory[0];
        const p0 = mapPoint(first.t, getValueFn(first));
        ctx.moveTo(p0.sx, p0.sy);

        for (let i = 1; i < this.physics.trajectory.length; i++) {
          const pt = this.physics.trajectory[i];
          const p = mapPoint(pt.t, getValueFn(pt));
          ctx.lineTo(p.sx, p.sy);
        }
        ctx.stroke();
        ctx.restore();
      };

      if (this.graphMode === 'POSITION') {
        drawCurve(p => p.thetaDeg, Colors.cyan);
      } else if (this.graphMode === 'VELOCITY') {
        drawCurve(p => p.angularVelocity, Colors.purple);
      } else if (this.graphMode === 'ACCELERATION') {
        const w0sq = this.physics.omega0 * this.physics.omega0;
        drawCurve(p => -w0sq * p.thetaRad, Colors.yellow);
      }

      const curT = this.physics.time % maxT;
      const curSx = plotX + (curT / maxT) * plotW;
      if (curSx >= plotX && curSx <= plotX + plotW) {
        Renderer.drawLine(ctx, curSx, plotY, curSx, plotY + plotH, {
          stroke: '#FFFFFF',
          lineWidth: 1.5,
          lineDash: [3, 3]
        });
      }
    }
  }

  destroy() {
    this.buttons = [];
    this.sliders = [];
    this.planetButtons = [];
    this.graphButtons = [];
  }
}
