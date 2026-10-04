// Free Fall Scene for PhysicsLab (Phase 3)
import { Colors, Renderer } from '../engine/renderer.js';
import { Button, Slider } from '../engine/ui.js';
import { FreeFallPhysics, PlanetGravity } from '../physics/mechanics/freefall.js';

export class FreeFallScene {
  constructor() {
    this.physics = new FreeFallPhysics({
      height: 50.0,
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

    // 2. Playback Control Buttons
    const playBtnText = this.physics.isFalling ? 'PAUSE' : (this.physics.hasLanded ? 'RESTART' : 'START');
    const playBtn = new Button({
      x: 180,
      y: 12,
      width: 110,
      height: 38,
      text: playBtnText,
      accentColor: this.physics.isFalling ? Colors.yellow : Colors.green,
      badgeText: this.physics.isFalling ? 'FALLING' : 'STOPPED',
      badgeColor: this.physics.isFalling ? Colors.yellow : Colors.textDark,
      callback: () => {
        if (this.physics.isFalling) {
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

    // 3. Sidebar Layout
    const sidebarWidth = Math.max(280, Math.min(340, width * 0.28));
    const sidebarX = width - sidebarWidth - 20;
    const sidebarY = headerHeight + 10;
    const sidebarHeight = height - sidebarY - 20;

    this.sidebarRect = { x: sidebarX, y: sidebarY, w: sidebarWidth, h: sidebarHeight };

    // Height Slider
    const sliderWidth = sidebarWidth - 40;
    const sliderStartX = sidebarX + 20;
    let sliderY = sidebarY + 60;

    const heightSlider = new Slider({
      x: sliderStartX,
      y: sliderY,
      width: sliderWidth,
      min: 5,
      max: 200,
      value: this.physics.height,
      step: 1,
      label: 'DROP HEIGHT (h)',
      unit: ' m',
      accentColor: Colors.cyan,
      callback: (val) => {
        this.physics.setParameters(val, this.physics.gravity);
      }
    });
    this.sliders.push(heightSlider);

    // Planet Presets Buttons
    sliderY += 70;
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

    // Custom Gravity Slider beneath presets
    sliderY += 75;
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
        this.physics.setParameters(this.physics.height, val, 'Custom');
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
      if (this.physics.isFalling) {
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

  worldToScreen(wy) {
    const sim = this.simRect;
    const paddingBottom = 40;
    const paddingTop = 40;

    const availableH = sim.h - paddingBottom - paddingTop;
    const maxWorldY = Math.max(10, this.physics.height * 1.15);

    const scale = availableH / maxWorldY;
    const originX = sim.x + sim.w * 0.45; // center column
    const originY = sim.y + sim.h - paddingBottom;

    const sy = originY - wy * scale;

    return { sx: originX, sy, scale, originX, originY, maxWorldY };
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

    this.renderFreeFallViewport(ctx);
    this.renderSidebar(ctx);
    this.renderGraphPanel(ctx);

    Renderer.drawText(ctx, 'FREE FALL MECHANICS SIMULATOR', 570, 31, {
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

  renderFreeFallViewport(ctx) {
    ctx.save();
    const sim = this.simRect;
    const { originX, originY, scale } = this.worldToScreen(0);

    ctx.beginPath();
    ctx.rect(sim.x + 2, sim.y + 2, sim.w - 4, sim.h - 4);
    ctx.clip();

    // Sky gradient box above ground
    const topScreenY = sim.y + 10;
    const skyGradient = ctx.createLinearGradient(0, topScreenY, 0, originY);
    skyGradient.addColorStop(0, 'rgba(15, 23, 42, 0.9)');
    skyGradient.addColorStop(1, 'rgba(17, 23, 34, 0.2)');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(sim.x, sim.y, sim.w, originY - sim.y);

    // Ground plane line
    Renderer.drawLine(ctx, sim.x, originY, sim.x + sim.w, originY, {
      stroke: Colors.green,
      lineWidth: 2,
      glowColor: Colors.green,
      glowBlur: 6
    });

    // Drop Height Marker & Tower Structure
    const topPt = this.worldToScreen(this.physics.height);

    // Tower Structure Line
    Renderer.drawLine(ctx, originX - 60, originY, originX - 60, topPt.sy, {
      stroke: Colors.panelBorder,
      lineWidth: 2
    });
    Renderer.drawLine(ctx, originX - 60, topPt.sy, originX - 20, topPt.sy, {
      stroke: Colors.cyan,
      lineWidth: 2
    });

    // Vertical Height Dimension Bar
    const dimX = originX - 90;
    Renderer.drawLine(ctx, dimX, originY, dimX, topPt.sy, {
      stroke: Colors.purple,
      lineWidth: 1.5,
      lineDash: [4, 4]
    });
    Renderer.drawLine(ctx, dimX - 6, originY, dimX + 6, originY, { stroke: Colors.purple, lineWidth: 1.5 });
    Renderer.drawLine(ctx, dimX - 6, topPt.sy, dimX + 6, topPt.sy, { stroke: Colors.purple, lineWidth: 1.5 });

    Renderer.drawText(ctx, `h = ${this.physics.height.toFixed(1)}m`, dimX - 10, (topPt.sy + originY) / 2, {
      fill: Colors.purple,
      font: 'bold 12px "Segoe UI", Roboto, sans-serif',
      align: 'right',
      baseline: 'middle'
    });

    // Flown Trajectory Drop Line
    if (this.physics.trajectory.length > 1) {
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = Colors.cyan;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = Colors.cyan;
      ctx.shadowBlur = 10;

      const p0 = this.worldToScreen(this.physics.trajectory[0].height);
      ctx.moveTo(p0.sx, p0.sy);

      for (let i = 1; i < this.physics.trajectory.length; i++) {
        const pt = this.worldToScreen(this.physics.trajectory[i].height);
        ctx.lineTo(pt.sx, pt.sy);
      }
      ctx.stroke();
      ctx.restore();
    }

    // Current Falling Object
    const state = this.physics.getCurrentState();
    const objPt = this.worldToScreen(state.height);

    // Glowing Probe Circle
    Renderer.drawCircle(ctx, objPt.sx, objPt.sy, 10, {
      fill: Colors.cyan,
      stroke: '#FFFFFF',
      lineWidth: 2,
      glowColor: Colors.cyan,
      glowBlur: 16
    });

    // Gravity Arrow (Downward)
    const gLength = Math.min(50, this.physics.gravity * 3);
    const gEndY = objPt.sy + gLength;

    Renderer.drawLine(ctx, objPt.sx + 20, objPt.sy, objPt.sx + 20, gEndY, {
      stroke: Colors.yellow,
      lineWidth: 2,
      glowColor: Colors.yellow,
      glowBlur: 6
    });

    ctx.save();
    ctx.translate(objPt.sx + 20, gEndY);
    ctx.fillStyle = Colors.yellow;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-4, -6);
    ctx.lineTo(4, -6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    Renderer.drawText(ctx, `g = ${this.physics.gravity.toFixed(2)}m/s²`, objPt.sx + 30, gEndY - 10, {
      fill: Colors.yellow,
      font: 'bold 11px "Segoe UI", Roboto, sans-serif',
      baseline: 'middle'
    });

    // Velocity Indicator Label next to probe
    if (state.velocity > 0) {
      Renderer.drawText(ctx, `v = ${state.velocity.toFixed(2)} m/s`, objPt.sx + 25, objPt.sy, {
        fill: Colors.cyan,
        font: 'bold 12px "Segoe UI", Roboto, sans-serif',
        baseline: 'middle'
      });
    }

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

    Renderer.drawText(ctx, 'PLANET PRESETS', sb.x + 20, sb.y + 120, {
      fill: Colors.textMuted,
      font: 'bold 11px "Segoe UI", Roboto, sans-serif',
      baseline: 'middle'
    });

    const statsY = sb.y + 265;
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
      { label: 'CURRENT HEIGHT (y)', value: `${state.height.toFixed(2)} m`, color: Colors.cyan },
      { label: 'DISTANCE FALLEN', value: `${state.distanceFallen.toFixed(2)} m`, color: Colors.text },
      { label: 'FALL TIME (t)', value: `${state.t.toFixed(2)} s`, color: Colors.text },
      { label: 'CURRENT VELOCITY (v)', value: `${state.velocity.toFixed(2)} m/s`, color: Colors.green },
      { label: 'ACCELERATION (g)', value: `${state.acceleration.toFixed(2)} m/s²`, color: Colors.yellow },
      { label: 'EXPECTED IMPACT TIME', value: `${this.physics.impactTime.toFixed(2)} s`, color: Colors.purple },
      { label: 'FINAL IMPACT VELOCITY', value: `${this.physics.finalVelocity.toFixed(2)} m/s`, color: Colors.purple }
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

    const maxT = Math.max(1.0, this.physics.impactTime);
    let maxValY = 10;
    let minValY = 0;

    if (this.graphMode === 'POSITION') {
      maxValY = Math.max(10, this.physics.height);
      minValY = 0;
    } else if (this.graphMode === 'VELOCITY') {
      maxValY = Math.max(10, this.physics.finalVelocity);
      minValY = 0;
    } else if (this.graphMode === 'ACCELERATION') {
      maxValY = Math.max(10, this.physics.gravity * 1.5);
      minValY = 0;
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
        drawCurve(p => p.height, Colors.cyan);
      } else if (this.graphMode === 'VELOCITY') {
        drawCurve(p => p.velocity, Colors.purple);
      } else if (this.graphMode === 'ACCELERATION') {
        drawCurve(p => p.acceleration, Colors.yellow);
      }

      const curT = this.physics.time;
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
