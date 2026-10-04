// Refraction & Snell's Law Scene for PhysicsLab Advanced Optics Lab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Button, Slider } from '../../engine/ui.js';
import { OpticsMath } from '../../physics/optics/opticsMath.js';
import { RayTracer } from '../../physics/optics/rayTracer.js';
import { MaterialPresets } from '../../physics/optics/materialPresets.js';

export class RefractionScene {
  constructor() {
    this.incidentAngle = 30.0; // degrees
    this.mat1Key = 'AIR';
    this.mat2Key = 'GLASS';

    this.buttons = [];
    this.sliders = [];
    this.mat1Buttons = [];
    this.mat2Buttons = [];

    this.showLightParticles = true;
    this.particleProgress = 0;
    this.isPaused = false;

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
    this.mat1Buttons = [];
    this.mat2Buttons = [];

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

    const pauseBtn = new Button({
      x: 180,
      y: 12,
      width: 100,
      height: 38,
      text: this.isPaused ? 'PLAY' : 'PAUSE',
      accentColor: this.isPaused ? Colors.green : Colors.yellow,
      callback: () => {
        this.isPaused = !this.isPaused;
        this.rebuildUI();
      }
    });

    const particlesBtn = new Button({
      x: 290,
      y: 12,
      width: 140,
      height: 38,
      text: 'PHOTONS',
      badgeText: this.showLightParticles ? 'ON' : 'OFF',
      badgeColor: this.showLightParticles ? Colors.cyan : Colors.textDark,
      accentColor: Colors.cyan,
      callback: () => {
        this.showLightParticles = !this.showLightParticles;
        this.rebuildUI();
      }
    });

    const resetBtn = new Button({
      x: 440,
      y: 12,
      width: 90,
      height: 38,
      text: 'RESET',
      accentColor: Colors.cyan,
      callback: () => {
        this.incidentAngle = 30.0;
        this.mat1Key = 'AIR';
        this.mat2Key = 'GLASS';
        this.rebuildUI();
      }
    });

    this.buttons.push(backBtn, pauseBtn, particlesBtn, resetBtn);

    const sidebarWidth = Math.max(280, Math.min(340, width * 0.28));
    const sidebarX = width - sidebarWidth - 20;
    const sidebarY = headerHeight + 10;
    const sidebarHeight = height - sidebarY - 20;

    this.sidebarRect = { x: sidebarX, y: sidebarY, w: sidebarWidth, h: sidebarHeight };

    const sliderWidth = sidebarWidth - 40;
    const sliderStartX = sidebarX + 20;
    let sliderY = sidebarY + 60;

    // Incident Angle Slider
    const angleSlider = new Slider({
      x: sliderStartX,
      y: sliderY,
      width: sliderWidth,
      min: 0,
      max: 85,
      value: this.incidentAngle,
      step: 1,
      label: 'INCIDENT ANGLE (θ₁)',
      unit: '°',
      accentColor: Colors.cyan,
      callback: (val) => { this.incidentAngle = val; }
    });
    this.sliders.push(angleSlider);

    // Medium 1 Preset Buttons
    sliderY += 65;
    const matKeys = Object.keys(MaterialPresets);
    const mBtnWidth = Math.floor((sliderWidth - 12) / 4);
    let m1X = sliderStartX;

    for (const key of matKeys) {
      const mat = MaterialPresets[key];
      const isSelected = this.mat1Key === key;
      const btn = new Button({
        x: m1X,
        y: sliderY + 20,
        width: mBtnWidth,
        height: 30,
        text: mat.name,
        accentColor: isSelected ? Colors.cyan : Colors.panelBorder,
        callback: () => {
          this.mat1Key = key;
          this.rebuildUI();
        }
      });
      this.mat1Buttons.push(btn);
      m1X += mBtnWidth + 4;
    }

    // Medium 2 Preset Buttons
    sliderY += 75;
    let m2X = sliderStartX;

    for (const key of matKeys) {
      const mat = MaterialPresets[key];
      const isSelected = this.mat2Key === key;
      const btn = new Button({
        x: m2X,
        y: sliderY + 20,
        width: mBtnWidth,
        height: 30,
        text: mat.name,
        accentColor: isSelected ? Colors.purple : Colors.panelBorder,
        callback: () => {
          this.mat2Key = key;
          this.rebuildUI();
        }
      });
      this.mat2Buttons.push(btn);
      m2X += mBtnWidth + 4;
    }

    const mainWidth = sidebarX - 40;
    const diagramHeight = Math.floor((height - headerHeight - 40) * 0.68);
    const eduHeight = (height - headerHeight - 40) - diagramHeight - 15;

    this.diagramRect = { x: 20, y: headerHeight + 10, w: mainWidth, h: diagramHeight };
    this.eduRect = { x: 20, y: this.diagramRect.y + diagramHeight + 15, w: mainWidth, h: eduHeight };
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
    for (const slider of this.sliders) slider.update(dt, this.inputManager);
    for (const btn of this.mat1Buttons) btn.update(dt, this.inputManager);
    for (const btn of this.mat2Buttons) btn.update(dt, this.inputManager);
  }

  render(ctx) {
    const { width, height } = this.canvasEngine.getBounds();

    Renderer.drawRect(ctx, 0, 0, width, height, { fill: Colors.background });
    Renderer.drawGrid(ctx, width, height, 40);

    Renderer.drawPanel(ctx, this.diagramRect.x, this.diagramRect.y, this.diagramRect.w, this.diagramRect.h, {
      fill: Colors.panel,
      stroke: Colors.panelBorder,
      radius: 12
    });

    this.renderDiagram(ctx);
    this.renderSidebar(ctx);
    this.renderEduPanel(ctx);

    Renderer.drawText(ctx, 'REFRACTION & SNELL\'S LAW LABORATORY', 620, 31, {
      fill: Colors.cyan,
      font: 'bold 16px "Segoe UI", Roboto, sans-serif',
      glowColor: Colors.cyan,
      glowBlur: 8,
      baseline: 'middle'
    });

    for (const btn of this.buttons) btn.render(ctx);
    for (const slider of this.sliders) slider.render(ctx);
    for (const btn of this.mat1Buttons) btn.render(ctx);
    for (const btn of this.mat2Buttons) btn.render(ctx);
  }

  renderDiagram(ctx) {
    ctx.save();
    const diag = this.diagramRect;
    const originX = diag.x + diag.w * 0.5;
    const originY = diag.y + diag.h * 0.5;

    ctx.beginPath();
    ctx.rect(diag.x + 2, diag.y + 2, diag.w - 4, diag.h - 4);
    ctx.clip();

    const m1 = MaterialPresets[this.mat1Key];
    const m2 = MaterialPresets[this.mat2Key];

    // Medium 1 (Top half) & Medium 2 (Bottom half) Visual Backgrounds
    Renderer.drawRect(ctx, diag.x, diag.y, diag.w, diag.h / 2, { fill: 'rgba(15, 23, 42, 0.6)' });
    Renderer.drawRect(ctx, diag.x, originY, diag.w, diag.h / 2, { fill: 'rgba(17, 30, 49, 0.85)' });

    // Boundary Line
    Renderer.drawLine(ctx, diag.x, originY, diag.x + diag.w, originY, {
      stroke: Colors.cyan,
      lineWidth: 2,
      glowColor: Colors.cyan,
      glowBlur: 6
    });

    // Medium Labels
    Renderer.drawText(ctx, `MEDIUM 1: ${m1.name.toUpperCase()} (n₁ = ${m1.n.toFixed(2)})`, diag.x + 15, originY - 15, {
      fill: Colors.cyan,
      font: 'bold 12px "Segoe UI", Roboto, sans-serif'
    });

    Renderer.drawText(ctx, `MEDIUM 2: ${m2.name.toUpperCase()} (n₂ = ${m2.n.toFixed(2)})`, diag.x + 15, originY + 20, {
      fill: Colors.purple,
      font: 'bold 12px "Segoe UI", Roboto, sans-serif'
    });

    // Normal Line (Vertical)
    RayTracer.drawNormal(ctx, originX, originY, diag.h - 40, { color: 'rgba(226, 232, 240, 0.5)' });

    // Incident Ray Calculation
    const theta1Rad = (this.incidentAngle * Math.PI) / 180;
    const rayLength = Math.min(diag.w, diag.h) * 0.42;

    const incStartX = originX - rayLength * Math.sin(theta1Rad);
    const incStartY = originY - rayLength * Math.cos(theta1Rad);

    RayTracer.drawRay(ctx, incStartX, incStartY, originX, originY, { color: Colors.cyan });
    RayTracer.drawAngleArc(ctx, originX, originY, 35, -Math.PI / 2, -Math.PI / 2 + theta1Rad, `θ₁=${Math.round(this.incidentAngle)}°`, { color: Colors.cyan });

    // Snell's Law Calculation
    const calc = OpticsMath.calculateRefraction(m1.n, m2.n, this.incidentAngle);

    if (calc.isTIR) {
      // Total Internal Reflection
      const refEndX = originX + rayLength * Math.sin(theta1Rad);
      const refEndY = originY - rayLength * Math.cos(theta1Rad);

      RayTracer.drawRay(ctx, originX, originY, refEndX, refEndY, { color: Colors.yellow });
      RayTracer.drawAngleArc(ctx, originX, originY, 35, -Math.PI / 2 - theta1Rad, -Math.PI / 2, `θ_r=${Math.round(this.incidentAngle)}°`, { color: Colors.yellow });

      Renderer.drawText(ctx, 'TOTAL INTERNAL REFLECTION', originX + 20, originY - 40, {
        fill: Colors.yellow,
        font: 'bold 14px "Segoe UI", Roboto, sans-serif'
      });

      if (this.showLightParticles) {
        RayTracer.drawRayParticle(ctx, incStartX, incStartY, originX, originY, this.particleProgress, { color: Colors.cyan });
        RayTracer.drawRayParticle(ctx, originX, originY, refEndX, refEndY, this.particleProgress, { color: Colors.yellow });
      }
    } else {
      // Refraction into Medium 2
      const theta2Rad = calc.theta2Rad;
      const refEndX = originX + rayLength * Math.sin(theta2Rad);
      const refEndY = originY + rayLength * Math.cos(theta2Rad);

      RayTracer.drawRay(ctx, originX, originY, refEndX, refEndY, { color: Colors.purple });
      RayTracer.drawAngleArc(ctx, originX, originY, 35, Math.PI / 2 - theta2Rad, Math.PI / 2, `θ₂=${calc.theta2Deg.toFixed(1)}°`, { color: Colors.purple });

      if (this.showLightParticles) {
        RayTracer.drawRayParticle(ctx, incStartX, incStartY, originX, originY, this.particleProgress, { color: Colors.cyan });
        RayTracer.drawRayParticle(ctx, originX, originY, refEndX, refEndY, this.particleProgress, { color: Colors.purple });
      }
    }

    ctx.restore();
  }

  renderSidebar(ctx) {
    const sb = this.sidebarRect;
    Renderer.drawPanel(ctx, sb.x, sb.y, sb.w, sb.h, { fill: Colors.panel, stroke: Colors.panelBorder, radius: 12 });

    Renderer.drawText(ctx, 'REFRACTION TELEMETRY', sb.x + 20, sb.y + 30, {
      fill: Colors.cyan,
      font: 'bold 13px "Segoe UI", Roboto, sans-serif',
      baseline: 'middle'
    });

    Renderer.drawLine(ctx, sb.x + 20, sb.y + 48, sb.x + sb.w - 20, sb.y + 48, { stroke: Colors.panelBorder, lineWidth: 1 });

    Renderer.drawText(ctx, 'MEDIUM 1 PRESET', sb.x + 20, sb.y + 115, { fill: Colors.textMuted, font: 'bold 11px "Segoe UI", Roboto, sans-serif' });
    Renderer.drawText(ctx, 'MEDIUM 2 PRESET', sb.x + 20, sb.y + 190, { fill: Colors.textMuted, font: 'bold 11px "Segoe UI", Roboto, sans-serif' });

    const m1 = MaterialPresets[this.mat1Key];
    const m2 = MaterialPresets[this.mat2Key];
    const calc = OpticsMath.calculateRefraction(m1.n, m2.n, this.incidentAngle);

    const refrAngleStr = calc.isTIR ? 'TIR (Reflected)' : `${calc.theta2Deg.toFixed(2)}°`;
    const critStr = calc.criticalAngleDeg ? `${calc.criticalAngleDeg.toFixed(2)}°` : 'None (n₁ ≤ n₂)';

    const items = [
      { label: 'MEDIUM 1 (n₁)', value: `${m1.name} (${m1.n.toFixed(2)})`, color: Colors.cyan },
      { label: 'MEDIUM 2 (n₂)', value: `${m2.name} (${m2.n.toFixed(2)})`, color: Colors.purple },
      { label: 'INCIDENT ANGLE (θ₁)', value: `${this.incidentAngle.toFixed(1)}°`, color: Colors.cyan },
      { label: 'REFRACTED ANGLE (θ₂)', value: refrAngleStr, color: calc.isTIR ? Colors.yellow : Colors.purple },
      { label: 'CRITICAL ANGLE (θ_c)', value: critStr, color: Colors.yellow },
      { label: 'OPTICAL STATE', value: calc.isTIR ? 'TOTAL REFLECTION' : 'REFRACTION', color: calc.isTIR ? Colors.yellow : Colors.green }
    ];

    let itemY = sb.y + 270;
    for (const item of items) {
      Renderer.drawText(ctx, item.label, sb.x + 20, itemY, { fill: Colors.textMuted, font: '11px "Segoe UI", Roboto, sans-serif', baseline: 'middle' });
      Renderer.drawText(ctx, item.value, sb.x + sb.w - 20, itemY, { fill: item.color, font: 'bold 11px "Segoe UI", Roboto, sans-serif', align: 'right', baseline: 'middle' });
      itemY += 24;
    }
  }

  renderEduPanel(ctx) {
    const edu = this.eduRect;
    Renderer.drawPanel(ctx, edu.x, edu.y, edu.w, edu.h, { fill: Colors.panel, stroke: Colors.panelBorder, radius: 12 });
    Renderer.drawText(ctx, 'HOW IT WORKS — SNELL\'S LAW: n₁ sin(θ₁) = n₂ sin(θ₂)', edu.x + 20, edu.y + 22, { fill: Colors.cyan, font: 'bold 13px "Segoe UI", Roboto, sans-serif', baseline: 'middle' });
    Renderer.drawText(ctx, 'Light changes speed and bends when passing between materials of different refractive index n. When n₁ > n₂ and θ₁ > θ_c, Total Internal Reflection occurs.', edu.x + 20, edu.y + 45, { fill: Colors.text, font: '12px "Segoe UI", Roboto, sans-serif' });
  }

  destroy() {
    this.buttons = [];
    this.sliders = [];
    this.mat1Buttons = [];
    this.mat2Buttons = [];
  }
}
