// Prism & Wavelength Dispersion Scene for PhysicsLab Advanced Optics Lab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Button, Slider } from '../../engine/ui.js';
import { OpticsMath } from '../../physics/optics/opticsMath.js';
import { RayTracer } from '../../physics/optics/rayTracer.js';
import { MaterialPresets, SpectrumWavelengths } from '../../physics/optics/materialPresets.js';

export class PrismScene {
  constructor() {
    this.incidentAngle = 45.0; // degrees
    this.apexAngle = 60.0;     // degrees
    this.baseN = 1.50;          // Crown Glass base n
    this.matKey = 'GLASS';

    this.buttons = [];
    this.sliders = [];

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
        this.incidentAngle = 45.0;
        this.apexAngle = 60.0;
        this.matKey = 'GLASS';
        this.baseN = 1.50;
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

    const angleSlider = new Slider({
      x: sliderStartX,
      y: sliderY,
      width: sliderWidth,
      min: 15,
      max: 75,
      value: this.incidentAngle,
      step: 1,
      label: 'INCIDENT ANGLE (i₁)',
      unit: '°',
      accentColor: Colors.cyan,
      callback: (val) => { this.incidentAngle = val; }
    });

    sliderY += 65;
    const apexSlider = new Slider({
      x: sliderStartX,
      y: sliderY,
      width: sliderWidth,
      min: 30,
      max: 75,
      value: this.apexAngle,
      step: 1,
      label: 'PRISM APEX ANGLE (A)',
      unit: '°',
      accentColor: Colors.purple,
      callback: (val) => { this.apexAngle = val; }
    });

    this.sliders.push(angleSlider, apexSlider);

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

    Renderer.drawText(ctx, 'PRISM & WAVELENGTH DISPERSION LABORATORY', 650, 31, {
      fill: Colors.cyan,
      font: 'bold 16px "Segoe UI", Roboto, sans-serif',
      glowColor: Colors.cyan,
      glowBlur: 8,
      baseline: 'middle'
    });

    for (const btn of this.buttons) btn.render(ctx);
    for (const slider of this.sliders) slider.render(ctx);
  }

  renderDiagram(ctx) {
    ctx.save();
    const diag = this.diagramRect;
    const originX = diag.x + diag.w * 0.45;
    const originY = diag.y + diag.h * 0.5;

    ctx.beginPath();
    ctx.rect(diag.x + 2, diag.y + 2, diag.w - 4, diag.h - 4);
    ctx.clip();

    // Draw Triangular Prism (Canvas Path)
    const prismH = 180;
    const halfBase = prismH * Math.tan(((this.apexAngle / 2) * Math.PI) / 180);

    const pTop = { x: originX, y: originY - prismH * 0.6 };
    const pLeft = { x: originX - halfBase, y: originY + prismH * 0.4 };
    const pRight = { x: originX + halfBase, y: originY + prismH * 0.4 };

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(pTop.x, pTop.y);
    ctx.lineTo(pLeft.x, pLeft.y);
    ctx.lineTo(pRight.x, pRight.y);
    ctx.closePath();

    const glassGrad = ctx.createLinearGradient(pLeft.x, pTop.y, pRight.x, pRight.y);
    glassGrad.addColorStop(0, 'rgba(139, 92, 246, 0.15)');
    glassGrad.addColorStop(0.5, 'rgba(94, 231, 255, 0.25)');
    glassGrad.addColorStop(1, 'rgba(139, 92, 246, 0.15)');
    ctx.fillStyle = glassGrad;
    ctx.fill();

    ctx.strokeStyle = Colors.cyan;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = Colors.cyan;
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.restore();

    // Incident White Light Ray on Left Face
    const faceAngle = Math.atan2(pLeft.y - pTop.y, pLeft.x - pTop.x);
    const normalAngle = faceAngle + Math.PI / 2;

    const hitPct = 0.5;
    const hitX = pTop.x + (pLeft.x - pTop.x) * hitPct;
    const hitY = pTop.y + (pLeft.y - pTop.y) * hitPct;

    const incLen = 160;
    const incAngleRad = normalAngle - (this.incidentAngle * Math.PI) / 180;
    const incStartX = hitX - incLen * Math.cos(incAngleRad);
    const incStartY = hitY - incLen * Math.sin(incAngleRad);

    // White Incident Beam
    RayTracer.drawRay(ctx, incStartX, incStartY, hitX, hitY, { color: '#FFFFFF', lineWidth: 3, glowBlur: 12 });

    Renderer.drawText(ctx, 'WHITE LIGHT BEAM', incStartX - 20, incStartY - 10, {
      fill: '#FFFFFF',
      font: 'bold 12px "Segoe UI", Roboto, sans-serif'
    });

    // Spectrum Dispersion Rays
    let redDev = 0, violetDev = 0;

    for (const wave of SpectrumWavelengths) {
      const nWave = OpticsMath.getWavelengthRefractiveIndex(this.baseN, wave.lambda);
      const res = OpticsMath.calculatePrismDeviation(this.apexAngle, this.incidentAngle, nWave);

      if (res.isValid && !res.isTIR) {
        if (wave.name === 'Red') redDev = res.deviationDeg;
        if (wave.name === 'Violet') violetDev = res.deviationDeg;

        // Inside prism ray to right face
        const r1Rad = (res.r1Deg * Math.PI) / 180;
        const inAngle = normalAngle + r1Rad;
        const inLen = 90;
        const outHitX = hitX + inLen * Math.cos(inAngle);
        const outHitY = hitY + inLen * Math.sin(inAngle);

        RayTracer.drawRay(ctx, hitX, hitY, outHitX, outHitY, { color: wave.color, lineWidth: 1.5 });

        // Emerging ray from right face
        const outAngle = incAngleRad + (res.deviationDeg * Math.PI) / 180;
        const outLen = 180;
        const endX = outHitX + outLen * Math.cos(outAngle);
        const endY = outHitY + outLen * Math.sin(outAngle);

        RayTracer.drawRay(ctx, outHitX, outHitY, endX, endY, { color: wave.color, lineWidth: 2, glowBlur: 6 });

        if (this.showLightParticles) {
          RayTracer.drawRayParticle(ctx, outHitX, outHitY, endX, endY, this.particleProgress, { color: wave.color });
        }
      }
    }

    this.redDev = redDev;
    this.violetDev = violetDev;

    ctx.restore();
  }

  renderSidebar(ctx) {
    const sb = this.sidebarRect;
    Renderer.drawPanel(ctx, sb.x, sb.y, sb.w, sb.h, { fill: Colors.panel, stroke: Colors.panelBorder, radius: 12 });

    Renderer.drawText(ctx, 'DISPERSION TELEMETRY', sb.x + 20, sb.y + 30, {
      fill: Colors.cyan,
      font: 'bold 13px "Segoe UI", Roboto, sans-serif',
      baseline: 'middle'
    });

    Renderer.drawLine(ctx, sb.x + 20, sb.y + 48, sb.x + sb.w - 20, sb.y + 48, { stroke: Colors.panelBorder, lineWidth: 1 });

    const items = [
      { label: 'PRISM APEX ANGLE (A)', value: `${this.apexAngle.toFixed(1)}°`, color: Colors.purple },
      { label: 'INCIDENT ANGLE (i₁)', value: `${this.incidentAngle.toFixed(1)}°`, color: Colors.cyan },
      { label: 'CROWN GLASS BASE (n)', value: this.baseN.toFixed(2), color: Colors.cyan },
      { label: 'RED DEVIATION (650nm)', value: `${(this.redDev || 0).toFixed(2)}°`, color: '#EF4444' },
      { label: 'VIOLET DEVIATION (400nm)', value: `${(this.violetDev || 0).toFixed(2)}°`, color: '#A855F7' },
      { label: 'ANGULAR DISPERSION (ΔD)', value: `${((this.violetDev || 0) - (this.redDev || 0)).toFixed(2)}°`, color: Colors.yellow }
    ];

    let itemY = sb.y + 250;
    for (const item of items) {
      Renderer.drawText(ctx, item.label, sb.x + 20, itemY, { fill: Colors.textMuted, font: '11px "Segoe UI", Roboto, sans-serif', baseline: 'middle' });
      Renderer.drawText(ctx, item.value, sb.x + sb.w - 20, itemY, { fill: item.color, font: 'bold 11px "Segoe UI", Roboto, sans-serif', align: 'right', baseline: 'middle' });
      itemY += 24;
    }
  }

  renderEduPanel(ctx) {
    const edu = this.eduRect;
    Renderer.drawPanel(ctx, edu.x, edu.y, edu.w, edu.h, { fill: Colors.panel, stroke: Colors.panelBorder, radius: 12 });
    Renderer.drawText(ctx, 'HOW IT WORKS — CHROMATIC DISPERSION IN A PRISM', edu.x + 20, edu.y + 22, { fill: Colors.cyan, font: 'bold 13px "Segoe UI", Roboto, sans-serif', baseline: 'middle' });
    Renderer.drawText(ctx, 'Different wavelengths travel at different speeds in glass n(λ). Shorter wavelengths (Violet) refract and deviate more than longer wavelengths (Red).', edu.x + 20, edu.y + 45, { fill: Colors.text, font: '12px "Segoe UI", Roboto, sans-serif' });
  }

  destroy() {
    this.buttons = [];
    this.sliders = [];
  }
}
