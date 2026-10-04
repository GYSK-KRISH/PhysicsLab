// Convex Lens Scene for PhysicsLab Advanced Optics Lab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Button, Slider } from '../../engine/ui.js';
import { OpticsMath } from '../../physics/optics/opticsMath.js';
import { RayTracer, RayType } from '../../physics/optics/rayTracer.js';

export class ConvexLensScene {
  constructor() {
    this.focalLength = 20.0;
    this.objectDistance = 40.0;
    this.objectHeight = 15.0;

    this.buttons = [];
    this.sliders = [];

    // Toggles
    this.showLightParticles = true;
    this.showRays = true;
    this.showLabels = true;
    this.isPaused = false;
    this.speedScale = 1.0;
    this.particleProgress = 0;

    this.isDraggingObject = false;
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

    // Back to Optics Menu Button
    const backBtn = new Button({
      x: 20,
      y: 12,
      width: 150,
      height: 38,
      text: '← OPTICS MENU',
      accentColor: Colors.purple,
      callback: () => this.goToOpticsMenu()
    });

    // Control Toggles
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
        this.focalLength = 20.0;
        this.objectDistance = 40.0;
        this.objectHeight = 15.0;
        this.rebuildUI();
      }
    });

    this.buttons.push(backBtn, pauseBtn, particlesBtn, resetBtn);

    // Sidebar Sliders
    const sidebarWidth = Math.max(280, Math.min(340, width * 0.28));
    const sidebarX = width - sidebarWidth - 20;
    const sidebarY = headerHeight + 10;
    const sidebarHeight = height - sidebarY - 20;

    this.sidebarRect = { x: sidebarX, y: sidebarY, w: sidebarWidth, h: sidebarHeight };

    const sliderWidth = sidebarWidth - 40;
    const sliderStartX = sidebarX + 20;
    let sliderY = sidebarY + 60;

    const focalSlider = new Slider({
      x: sliderStartX,
      y: sliderY,
      width: sliderWidth,
      min: 5,
      max: 50,
      value: this.focalLength,
      step: 1,
      label: 'FOCAL LENGTH (f)',
      unit: ' cm',
      accentColor: Colors.purple,
      callback: (val) => { this.focalLength = val; }
    });

    sliderY += 65;
    const objectDistSlider = new Slider({
      x: sliderStartX,
      y: sliderY,
      width: sliderWidth,
      min: 5,
      max: 100,
      value: this.objectDistance,
      step: 1,
      label: 'OBJECT DISTANCE (u)',
      unit: ' cm',
      accentColor: Colors.cyan,
      callback: (val) => { this.objectDistance = val; }
    });

    sliderY += 65;
    const objectHeightSlider = new Slider({
      x: sliderStartX,
      y: sliderY,
      width: sliderWidth,
      min: 5,
      max: 30,
      value: this.objectHeight,
      step: 1,
      label: 'OBJECT HEIGHT (hₒ)',
      unit: ' cm',
      accentColor: Colors.green,
      callback: (val) => { this.objectHeight = val; }
    });

    this.sliders.push(focalSlider, objectDistSlider, objectHeightSlider);

    // Main Diagram & Education Layout
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
    const pointer = inputManager.pointer;

    const { sx: objSx, sy: objSy } = this.worldToScreen(-this.objectDistance, this.objectHeight);
    const { originX, scale } = this.worldToScreen(0, 0);

    const isOverObject = Math.hypot(pointer.x - objSx, pointer.y - objSy) <= 25;

    if (pointer.justPressed && isOverObject) {
      this.isDraggingObject = true;
    }

    if (this.isDraggingObject) {
      if (!pointer.isDown) {
        this.isDraggingObject = false;
      } else {
        const rawWorldX = (pointer.x - originX) / scale;
        let newU = Math.max(5, Math.min(100, -rawWorldX));
        if (Math.abs(newU - this.objectDistance) > 0.2) {
          this.objectDistance = newU;
          this.rebuildUI();
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
      this.particleProgress = (this.particleProgress + dt * 0.8 * this.speedScale) % 1.0;
    }

    for (const btn of this.buttons) btn.update(dt, this.inputManager);
    for (const slider of this.sliders) slider.update(dt, this.inputManager);
  }

  worldToScreen(wx, wy) {
    const diag = this.diagramRect;
    const originX = diag.x + diag.w * 0.45;
    const originY = diag.y + diag.h * 0.5;

    const scale = Math.min((diag.w * 0.42) / 100, (diag.h * 0.38) / 30);
    const sx = originX + wx * scale;
    const sy = originY - wy * scale;

    return { sx, sy, scale, originX, originY };
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

    Renderer.drawText(ctx, 'CONVEX LENS LABORATORY', 570, 31, {
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
    const { originX, originY } = this.worldToScreen(0, 0);

    ctx.beginPath();
    ctx.rect(diag.x + 2, diag.y + 2, diag.w - 4, diag.h - 4);
    ctx.clip();

    // Optical Axis
    RayTracer.drawOpticalAxis(ctx, diag.x, originY, diag.x + diag.w, originY);

    // Focal Points
    const f = this.focalLength;
    const fPoints = [
      { name: '-2F', x: -2 * f },
      { name: '-F', x: -f },
      { name: 'O', x: 0 },
      { name: 'F', x: f },
      { name: '2F', x: 2 * f }
    ];

    for (const pt of fPoints) {
      const { sx } = this.worldToScreen(pt.x, 0);
      if (sx >= diag.x && sx <= diag.x + diag.w) {
        RayTracer.drawFocalPoint(ctx, sx, originY, pt.name, pt.x === 0 ? Colors.cyan : Colors.purple);
      }
    }

    // Convex Lens Body
    const lensH = diag.h * 0.75;
    const lensT = 22;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(originX, originY - lensH / 2);
    ctx.quadraticCurveTo(originX + lensT, originY, originX, originY + lensH / 2);
    ctx.quadraticCurveTo(originX - lensT, originY, originX, originY - lensH / 2);
    ctx.closePath();

    const glassGrad = ctx.createLinearGradient(originX - lensT, 0, originX + lensT, 0);
    glassGrad.addColorStop(0, 'rgba(94, 231, 255, 0.15)');
    glassGrad.addColorStop(0.5, 'rgba(94, 231, 255, 0.35)');
    glassGrad.addColorStop(1, 'rgba(94, 231, 255, 0.15)');
    ctx.fillStyle = glassGrad;
    ctx.fill();
    ctx.strokeStyle = Colors.cyan;
    ctx.lineWidth = 2;
    ctx.shadowColor = Colors.cyan;
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.restore();

    // Object Arrow
    const u = this.objectDistance;
    const ho = this.objectHeight;
    const { sx: objSx, sy: objSy } = this.worldToScreen(-u, ho);
    const { sx: objBaseSx } = this.worldToScreen(-u, 0);

    Renderer.drawLine(ctx, objBaseSx, originY, objSx, objSy, {
      stroke: Colors.green,
      lineWidth: 3.5,
      glowColor: Colors.green,
      glowBlur: 10
    });

    Renderer.drawCircle(ctx, objSx, objSy, this.isDraggingObject ? 10 : 7, {
      fill: Colors.green,
      stroke: '#FFFFFF',
      lineWidth: 2,
      glowColor: Colors.green,
      glowBlur: 12
    });

    Renderer.drawText(ctx, 'OBJECT', objSx, objSy - 18, {
      fill: Colors.green,
      font: 'bold 11px "Segoe UI", Roboto, sans-serif',
      align: 'center'
    });

    // Image & Rays
    const calc = OpticsMath.calculateLens(f, u, ho);

    if (!calc.isAtFocus && this.showRays) {
      const { sx: imgSx, sy: imgSy } = this.worldToScreen(calc.v, calc.hi);
      const { sx: imgBaseSx } = this.worldToScreen(calc.v, 0);
      const imgColor = calc.isReal ? Colors.purple : Colors.yellow;

      // Image Arrow
      Renderer.drawLine(ctx, imgBaseSx, originY, imgSx, imgSy, {
        stroke: imgColor,
        lineWidth: 3,
        lineDash: calc.isReal ? [] : [6, 4],
        glowColor: imgColor,
        glowBlur: 10
      });

      Renderer.drawText(ctx, `IMAGE (${calc.imageType})`, imgSx, imgSy + (calc.hi >= 0 ? -18 : 22), {
        fill: imgColor,
        font: 'bold 11px "Segoe UI", Roboto, sans-serif',
        align: 'center'
      });

      // Ray 1: Parallel -> Lens -> Focus F
      const ray1Lens = this.worldToScreen(0, ho);
      RayTracer.drawRay(ctx, objSx, objSy, ray1Lens.sx, ray1Lens.sy, { color: Colors.cyan });
      if (calc.isReal) {
        RayTracer.drawRay(ctx, ray1Lens.sx, ray1Lens.sy, imgSx, imgSy, { color: Colors.cyan });
      } else {
        const far1 = this.worldToScreen(100, (100 - f) * (-ho / f));
        RayTracer.drawRay(ctx, ray1Lens.sx, ray1Lens.sy, far1.sx, far1.sy, { color: Colors.cyan });
        RayTracer.drawRay(ctx, ray1Lens.sx, ray1Lens.sy, imgSx, imgSy, { color: Colors.cyan, type: RayType.VIRTUAL });
      }

      // Ray 2: Optical Center
      RayTracer.drawRay(ctx, objSx, objSy, originX, originY, { color: Colors.yellow });
      if (calc.isReal) {
        RayTracer.drawRay(ctx, originX, originY, imgSx, imgSy, { color: Colors.yellow });
      } else {
        const far2 = this.worldToScreen(100, -100 * (ho / u));
        RayTracer.drawRay(ctx, originX, originY, far2.sx, far2.sy, { color: Colors.yellow });
        RayTracer.drawRay(ctx, originX, originY, imgSx, imgSy, { color: Colors.yellow, type: RayType.VIRTUAL });
      }

      // Photons Animation
      if (this.showLightParticles) {
        RayTracer.drawRayParticle(ctx, objSx, objSy, ray1Lens.sx, ray1Lens.sy, this.particleProgress, { color: Colors.cyan });
        RayTracer.drawRayParticle(ctx, ray1Lens.sx, ray1Lens.sy, imgSx, imgSy, this.particleProgress, { color: Colors.cyan });
        RayTracer.drawRayParticle(ctx, objSx, objSy, imgSx, imgSy, this.particleProgress, { color: Colors.yellow });
      }
    } else if (calc.isAtFocus) {
      Renderer.drawText(ctx, 'PARALLEL EMERGING RAYS — IMAGE AT INFINITY', originX + 20, originY - 40, {
        fill: Colors.yellow,
        font: 'bold 13px "Segoe UI", Roboto, sans-serif'
      });
    }

    ctx.restore();
  }

  renderSidebar(ctx) {
    const sb = this.sidebarRect;
    Renderer.drawPanel(ctx, sb.x, sb.y, sb.w, sb.h, { fill: Colors.panel, stroke: Colors.panelBorder, radius: 12 });

    Renderer.drawText(ctx, 'CONVEX LENS TELEMETRY', sb.x + 20, sb.y + 30, {
      fill: Colors.cyan,
      font: 'bold 13px "Segoe UI", Roboto, sans-serif',
      baseline: 'middle'
    });

    Renderer.drawLine(ctx, sb.x + 20, sb.y + 48, sb.x + sb.w - 20, sb.y + 48, { stroke: Colors.panelBorder, lineWidth: 1 });

    const calc = OpticsMath.calculateLens(this.focalLength, this.objectDistance, this.objectHeight);
    const vStr = calc.isAtFocus ? '∞' : `${calc.v.toFixed(2)} cm`;
    const mStr = calc.isAtFocus ? '∞' : `${calc.m.toFixed(2)}×`;

    const items = [
      { label: 'FOCAL LENGTH (f)', value: `${this.focalLength.toFixed(1)} cm`, color: Colors.purple },
      { label: 'OBJECT DISTANCE (u)', value: `${this.objectDistance.toFixed(1)} cm`, color: Colors.green },
      { label: 'IMAGE DISTANCE (v)', value: vStr, color: Colors.cyan },
      { label: 'MAGNIFICATION (m)', value: mStr, color: Colors.cyan },
      { label: 'IMAGE TYPE', value: calc.imageType, color: Colors.purple },
      { label: 'ORIENTATION', value: calc.orientation, color: Colors.purple },
      { label: 'SIZE CLASS', value: calc.sizeClass, color: Colors.text }
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
    Renderer.drawText(ctx, 'HOW IT WORKS — THIN LENS FORMULA: 1/f = 1/u + 1/v', edu.x + 20, edu.y + 22, { fill: Colors.cyan, font: 'bold 13px "Segoe UI", Roboto, sans-serif', baseline: 'middle' });
    Renderer.drawText(ctx, 'f = Focal length (+ for convex), u = Object distance from optical center, v = Image distance (+ for real, - for virtual)', edu.x + 20, edu.y + 45, { fill: Colors.text, font: '12px "Segoe UI", Roboto, sans-serif' });
  }

  destroy() {
    this.buttons = [];
    this.sliders = [];
  }
}
