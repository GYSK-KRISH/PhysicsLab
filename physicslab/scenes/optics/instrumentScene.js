// Optical Instruments Scene for PhysicsLab Advanced Optics Lab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Button, Slider } from '../../engine/ui.js';
import { OpticsMath } from '../../physics/optics/opticsMath.js';
import { RayTracer } from '../../physics/optics/rayTracer.js';

export class InstrumentScene {
  constructor() {
    this.instrumentMode = 'MICROSCOPE'; // 'MAGNIFIER' | 'MICROSCOPE' | 'TELESCOPE'

    this.fo = 15.0; // Objective focal length (cm)
    this.fe = 8.0;  // Eyepiece focal length (cm)
    this.L = 16.0;  // Tube length (cm)

    this.buttons = [];
    this.sliders = [];
    this.modeButtons = [];

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
    this.modeButtons = [];

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

    const modes = ['MAGNIFIER', 'MICROSCOPE', 'TELESCOPE'];
    let mX = 180;
    for (const m of modes) {
      const isSelected = this.instrumentMode === m;
      const btn = new Button({
        x: mX,
        y: 12,
        width: 120,
        height: 38,
        text: m,
        accentColor: isSelected ? Colors.cyan : Colors.panelBorder,
        callback: () => {
          this.instrumentMode = m;
          this.rebuildUI();
        }
      });
      this.modeButtons.push(btn);
      mX += 128;
    }

    this.buttons.push(backBtn);

    const sidebarWidth = Math.max(280, Math.min(340, width * 0.28));
    const sidebarX = width - sidebarWidth - 20;
    const sidebarY = headerHeight + 10;
    const sidebarHeight = height - sidebarY - 20;

    this.sidebarRect = { x: sidebarX, y: sidebarY, w: sidebarWidth, h: sidebarHeight };

    const sliderWidth = sidebarWidth - 40;
    const sliderStartX = sidebarX + 20;
    let sliderY = sidebarY + 60;

    const foSlider = new Slider({
      x: sliderStartX,
      y: sliderY,
      width: sliderWidth,
      min: 2,
      max: 40,
      value: this.fo,
      step: 1,
      label: 'OBJECTIVE FOCAL (fₒ)',
      unit: ' cm',
      accentColor: Colors.cyan,
      callback: (val) => { this.fo = val; }
    });

    sliderY += 65;
    const feSlider = new Slider({
      x: sliderStartX,
      y: sliderY,
      width: sliderWidth,
      min: 2,
      max: 30,
      value: this.fe,
      step: 1,
      label: 'EYEPIECE FOCAL (fₑ)',
      unit: ' cm',
      accentColor: Colors.purple,
      callback: (val) => { this.fe = val; }
    });

    this.sliders.push(foSlider, feSlider);

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
    for (const btn of this.modeButtons) btn.update(dt, this.inputManager);
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

    Renderer.drawText(ctx, `OPTICAL INSTRUMENTS — ${this.instrumentMode}`, 680, 31, {
      fill: Colors.cyan,
      font: 'bold 16px "Segoe UI", Roboto, sans-serif',
      glowColor: Colors.cyan,
      glowBlur: 8,
      baseline: 'middle'
    });

    for (const btn of this.buttons) btn.render(ctx);
    for (const slider of this.sliders) slider.render(ctx);
    for (const btn of this.modeButtons) btn.render(ctx);
  }

  renderDiagram(ctx) {
    ctx.save();
    const diag = this.diagramRect;
    const originY = diag.y + diag.h * 0.5;

    ctx.beginPath();
    ctx.rect(diag.x + 2, diag.y + 2, diag.w - 4, diag.h - 4);
    ctx.clip();

    RayTracer.drawOpticalAxis(ctx, diag.x, originY, diag.x + diag.w, originY);

    if (this.instrumentMode === 'MICROSCOPE' || this.instrumentMode === 'TELESCOPE') {
      // Dual-Lens System (Objective Lens on left, Eyepiece Lens on right)
      const objX = diag.x + diag.w * 0.35;
      const eyeX = diag.x + diag.w * 0.75;
      const lensH = diag.h * 0.65;

      // Objective Lens
      Renderer.drawPanel(ctx, objX - 8, originY - lensH / 2, 16, lensH, {
        fill: 'rgba(94, 231, 255, 0.25)',
        stroke: Colors.cyan,
        radius: 8
      });
      Renderer.drawText(ctx, 'OBJECTIVE LENS (fₒ)', objX, originY - lensH / 2 - 15, { fill: Colors.cyan, font: 'bold 11px "Segoe UI", Roboto, sans-serif', align: 'center' });

      // Eyepiece Lens
      Renderer.drawPanel(ctx, eyeX - 8, originY - lensH / 2, 16, lensH, {
        fill: 'rgba(139, 92, 246, 0.25)',
        stroke: Colors.purple,
        radius: 8
      });
      Renderer.drawText(ctx, 'EYEPIECE LENS (fₑ)', eyeX, originY - lensH / 2 - 15, { fill: Colors.purple, font: 'bold 11px "Segoe UI", Roboto, sans-serif', align: 'center' });

      // Incoming & Inter-lens Light Rays
      if (this.instrumentMode === 'MICROSCOPE') {
        const objItemX = objX - 60;
        Renderer.drawLine(ctx, objItemX, originY, objItemX, originY - 25, { stroke: Colors.green, lineWidth: 3 });
        Renderer.drawText(ctx, 'OBJECT', objItemX, originY - 35, { fill: Colors.green, font: 'bold 11px "Segoe UI", Roboto, sans-serif', align: 'center' });

        RayTracer.drawRay(ctx, objItemX, originY - 25, objX, originY - 25, { color: Colors.cyan });
        RayTracer.drawRay(ctx, objX, originY - 25, eyeX - 40, originY + 40, { color: Colors.cyan });
        RayTracer.drawRay(ctx, eyeX - 40, originY + 40, eyeX, originY - 20, { color: Colors.purple });
        RayTracer.drawRay(ctx, eyeX, originY - 20, eyeX + 100, originY + 60, { color: Colors.yellow });
      } else {
        // Telescope
        RayTracer.drawRay(ctx, diag.x + 20, originY - 40, objX, originY - 40, { color: Colors.cyan });
        RayTracer.drawRay(ctx, diag.x + 20, originY + 40, objX, originY + 40, { color: Colors.cyan });
        RayTracer.drawRay(ctx, objX, originY - 40, eyeX, originY + 20, { color: Colors.cyan });
        RayTracer.drawRay(ctx, objX, originY + 40, eyeX, originY - 20, { color: Colors.cyan });
        RayTracer.drawRay(ctx, eyeX, originY + 20, eyeX + 120, originY + 20, { color: Colors.yellow });
        RayTracer.drawRay(ctx, eyeX, originY - 20, eyeX + 120, originY - 20, { color: Colors.yellow });
      }
    } else {
      // Simple Magnifying Glass Mode
      const lensX = diag.x + diag.w * 0.5;
      const lensH = diag.h * 0.7;

      Renderer.drawPanel(ctx, lensX - 10, originY - lensH / 2, 20, lensH, {
        fill: 'rgba(94, 231, 255, 0.25)',
        stroke: Colors.cyan,
        radius: 10
      });

      const objX = lensX - 50;
      Renderer.drawLine(ctx, objX, originY, objX, originY - 30, { stroke: Colors.green, lineWidth: 3 });
      Renderer.drawText(ctx, 'OBJECT (u < f)', objX, originY - 42, { fill: Colors.green, font: 'bold 11px "Segoe UI", Roboto, sans-serif', align: 'center' });

      const imgX = lensX - 130;
      Renderer.drawLine(ctx, imgX, originY, imgX, originY - 75, { stroke: Colors.yellow, lineWidth: 3, lineDash: [5, 4] });
      Renderer.drawText(ctx, 'MAGNIFIED VIRTUAL IMAGE', imgX, originY - 88, { fill: Colors.yellow, font: 'bold 11px "Segoe UI", Roboto, sans-serif', align: 'center' });
    }

    ctx.restore();
  }

  renderSidebar(ctx) {
    const sb = this.sidebarRect;
    Renderer.drawPanel(ctx, sb.x, sb.y, sb.w, sb.h, { fill: Colors.panel, stroke: Colors.panelBorder, radius: 12 });

    Renderer.drawText(ctx, `${this.instrumentMode} TELEMETRY`, sb.x + 20, sb.y + 30, {
      fill: Colors.cyan,
      font: 'bold 13px "Segoe UI", Roboto, sans-serif',
      baseline: 'middle'
    });

    Renderer.drawLine(ctx, sb.x + 20, sb.y + 48, sb.x + sb.w - 20, sb.y + 48, { stroke: Colors.panelBorder, lineWidth: 1 });

    let items = [];
    if (this.instrumentMode === 'MAGNIFIER') {
      const calc = OpticsMath.calculateMagnifyingGlass(this.fo, 12);
      items = [
        { label: 'FOCAL LENGTH (f)', value: `${this.fo.toFixed(1)} cm`, color: Colors.purple },
        { label: 'NEAR POINT DISTANCE (D)', value: '25 cm', color: Colors.text },
        { label: 'ANGULAR MAGNIFICATION', value: `${calc.angularMagnification.toFixed(2)}×`, color: Colors.cyan }
      ];
    } else if (this.instrumentMode === 'MICROSCOPE') {
      const calc = OpticsMath.calculateMicroscope(this.fo, this.fe, this.L);
      items = [
        { label: 'OBJECTIVE FOCAL (fₒ)', value: `${this.fo.toFixed(1)} cm`, color: Colors.cyan },
        { label: 'EYEPIECE FOCAL (fₑ)', value: `${this.fe.toFixed(1)} cm`, color: Colors.purple },
        { label: 'OBJECTIVE MAGNIFICATION', value: `${calc.M_objective.toFixed(2)}×`, color: Colors.cyan },
        { label: 'EYEPIECE MAGNIFICATION', value: `${calc.M_eyepiece.toFixed(2)}×`, color: Colors.purple },
        { label: 'TOTAL MAGNIFICATION', value: `${calc.totalMagnification.toFixed(1)}×`, color: Colors.yellow }
      ];
    } else { // Telescope
      const calc = OpticsMath.calculateTelescope(this.fo, this.fe);
      items = [
        { label: 'OBJECTIVE FOCAL (fₒ)', value: `${this.fo.toFixed(1)} cm`, color: Colors.cyan },
        { label: 'EYEPIECE FOCAL (fₑ)', value: `${this.fe.toFixed(1)} cm`, color: Colors.purple },
        { label: 'ANGULAR MAGNIFICATION (M)', value: `${calc.angularMagnification.toFixed(2)}×`, color: Colors.yellow },
        { label: 'TUBE LENGTH (L = fₒ + fₑ)', value: `${calc.tubeLength.toFixed(1)} cm`, color: Colors.text }
      ];
    }

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
    Renderer.drawText(ctx, `HOW IT WORKS — ${this.instrumentMode}`, edu.x + 20, edu.y + 22, { fill: Colors.cyan, font: 'bold 13px "Segoe UI", Roboto, sans-serif', baseline: 'middle' });

    let desc = '';
    if (this.instrumentMode === 'MAGNIFIER') {
      desc = 'A magnifying glass uses a single converging lens with the object inside its focal length (u < f) to form a magnified virtual image.';
    } else if (this.instrumentMode === 'MICROSCOPE') {
      desc = 'A compound microscope uses an objective lens (short fₒ) for high real magnification and an eyepiece lens (fₑ) for further virtual magnification.';
    } else {
      desc = 'A refracting telescope uses a large objective lens (long fₒ) to collect light and an eyepiece lens (short fₑ) to magnify distant angular details.';
    }
    Renderer.drawText(ctx, desc, edu.x + 20, edu.y + 45, { fill: Colors.text, font: '12px "Segoe UI", Roboto, sans-serif' });
  }

  destroy() {
    this.buttons = [];
    this.sliders = [];
    this.modeButtons = [];
  }
}
