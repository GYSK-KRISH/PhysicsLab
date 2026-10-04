// Convex Mirror Scene for PhysicsLab Advanced Optics Lab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Button, Slider } from '../../engine/ui.js';
import { OpticsMath } from '../../physics/optics/opticsMath.js';
import { RayTracer, RayType } from '../../physics/optics/rayTracer.js';

export class ConvexMirrorScene {
  constructor() {
    this.focalLength = 20.0; // Positive focal length for convex mirror in standard convention
    this.objectDistance = 40.0;
    this.objectHeight = 15.0;

    this.buttons = [];
    this.sliders = [];

    this.showLightParticles = true;
    this.showRays = true;
    this.isPaused = false;
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
        this.focalLength = 20.0;
        this.objectDistance = 40.0;
        this.objectHeight = 15.0;
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

    const focalSlider = new Slider({
      x: sliderStartX,
      y: sliderY,
      width: sliderWidth,
      min: 5,
      max: 50,
      value: this.focalLength,
      step: 1,
      label: 'FOCAL LENGTH (|f|)',
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
      this.particleProgress = (this.particleProgress + dt * 0.8) % 1.0;
    }

    for (const btn of this.buttons) btn.update(dt, this.inputManager);
    for (const slider of this.sliders) slider.update(dt, this.inputManager);
  }

  worldToScreen(wx, wy) {
    const diag = this.diagramRect;
    const originX = diag.x + diag.w * 0.45;
    const originY = diag.y + diag.h * 0.5;

    const scale = Math.min((diag.w * 0.45) / 100, (diag.h * 0.38) / 30);
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

    Renderer.drawText(ctx, 'CONVEX MIRROR LABORATORY', 590, 31, {
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

    RayTracer.drawOpticalAxis(ctx, diag.x, originY, diag.x + diag.w, originY);

    const fMag = Math.abs(this.focalLength);
    const nodes = [
      { name: 'P (Pole)', x: 0 },
      { name: 'F (Focus)', x: fMag },
      { name: 'C (Center)', x: 2 * fMag }
    ];

    for (const n of nodes) {
      const { sx } = this.worldToScreen(n.x, 0);
      if (sx >= diag.x && sx <= diag.x + diag.w) {
        RayTracer.drawFocalPoint(ctx, sx, originY, n.name, n.x === 0 ? Colors.cyan : Colors.purple);
      }
    }

    // Convex Mirror Curve Surface (Outer convex curve facing left)
    const mirrorH = diag.h * 0.75;
    const depth = 28;

    ctx.save();
    ctx.beginPath();
    ctx.arc(originX - depth * 1.5, originY, mirrorH / 2 + 10, -0.7, 0.7);
    ctx.strokeStyle = Colors.cyan;
    ctx.lineWidth = 3.5;
    ctx.shadowColor = Colors.cyan;
    ctx.shadowBlur = 12;
    ctx.stroke();

    // Hatching behind mirror surface (right side)
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)';
    ctx.lineWidth = 1;
    ctx.shadowBlur = 0;
    for (let angle = -0.65; angle <= 0.65; angle += 0.1) {
      const mx = originX - depth * 1.5 + (mirrorH / 2 + 10) * Math.cos(angle);
      const my = originY + (mirrorH / 2 + 10) * Math.sin(angle);
      ctx.beginPath();
      ctx.moveTo(mx, my);
      ctx.lineTo(mx + 8, my + 6);
      ctx.stroke();
    }
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

    // Convex Mirror Calculation (Always Virtual, Upright, Diminished behind mirror)
    const calc = OpticsMath.calculateMirror(this.focalLength, u, ho);
    const { sx: imgSx, sy: imgSy } = this.worldToScreen(calc.v, calc.hi);
    const { sx: imgBaseSx } = this.worldToScreen(calc.v, 0);

    // Virtual Image Arrow
    Renderer.drawLine(ctx, imgBaseSx, originY, imgSx, imgSy, {
      stroke: Colors.yellow,
      lineWidth: 3,
      lineDash: [6, 4],
      glowColor: Colors.yellow,
      glowBlur: 10
    });

    Renderer.drawText(ctx, 'VIRTUAL IMAGE', imgSx, imgSy - 18, {
      fill: Colors.yellow,
      font: 'bold 11px "Segoe UI", Roboto, sans-serif',
      align: 'center'
    });

    // Rays
    if (this.showRays) {
      // Ray 1: Parallel to axis -> reflects as if coming from virtual focus F (+fMag)
      const ray1Mirror = this.worldToScreen(0, ho);
      const focusPt = this.worldToScreen(fMag, 0);
      const farDivergedPt = this.worldToScreen(-100, ho + (100 / fMag) * ho);

      RayTracer.drawRay(ctx, objSx, objSy, ray1Mirror.sx, ray1Mirror.sy, { color: Colors.cyan });
      RayTracer.drawRay(ctx, ray1Mirror.sx, ray1Mirror.sy, farDivergedPt.sx, farDivergedPt.sy, { color: Colors.cyan });
      RayTracer.drawRay(ctx, ray1Mirror.sx, ray1Mirror.sy, focusPt.sx, focusPt.sy, { color: Colors.cyan, type: RayType.VIRTUAL });

      // Ray 2: Pole P (0,0) Reflection
      RayTracer.drawRay(ctx, objSx, objSy, originX, originY, { color: Colors.yellow });
      const farReflectPt = this.worldToScreen(-100, -100 * (ho / u));
      RayTracer.drawRay(ctx, originX, originY, farReflectPt.sx, farReflectPt.sy, { color: Colors.yellow });
      RayTracer.drawRay(ctx, originX, originY, imgSx, imgSy, { color: Colors.yellow, type: RayType.VIRTUAL });

      // Photons
      if (this.showLightParticles) {
        RayTracer.drawRayParticle(ctx, objSx, objSy, ray1Mirror.sx, ray1Mirror.sy, this.particleProgress, { color: Colors.cyan });
        RayTracer.drawRayParticle(ctx, ray1Mirror.sx, ray1Mirror.sy, farDivergedPt.sx, farDivergedPt.sy, this.particleProgress, { color: Colors.cyan });
      }
    }

    ctx.restore();
  }

  renderSidebar(ctx) {
    const sb = this.sidebarRect;
    Renderer.drawPanel(ctx, sb.x, sb.y, sb.w, sb.h, { fill: Colors.panel, stroke: Colors.panelBorder, radius: 12 });

    Renderer.drawText(ctx, 'CONVEX MIRROR TELEMETRY', sb.x + 20, sb.y + 30, {
      fill: Colors.cyan,
      font: 'bold 13px "Segoe UI", Roboto, sans-serif',
      baseline: 'middle'
    });

    Renderer.drawLine(ctx, sb.x + 20, sb.y + 48, sb.x + sb.w - 20, sb.y + 48, { stroke: Colors.panelBorder, lineWidth: 1 });

    const calc = OpticsMath.calculateMirror(this.focalLength, this.objectDistance, this.objectHeight);

    const items = [
      { label: 'FOCAL LENGTH (|f|)', value: `${this.focalLength.toFixed(1)} cm`, color: Colors.purple },
      { label: 'OBJECT DISTANCE (u)', value: `${this.objectDistance.toFixed(1)} cm`, color: Colors.green },
      { label: 'IMAGE DISTANCE (v)', value: `${calc.v.toFixed(2)} cm`, color: Colors.yellow },
      { label: 'MAGNIFICATION (m)', value: `${calc.m.toFixed(2)}×`, color: Colors.yellow },
      { label: 'IMAGE TYPE', value: calc.imageType, color: Colors.yellow },
      { label: 'ORIENTATION', value: calc.orientation, color: Colors.yellow },
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
    Renderer.drawText(ctx, 'HOW IT WORKS — CONVEX DIVERGING MIRROR', edu.x + 20, edu.y + 22, { fill: Colors.cyan, font: 'bold 13px "Segoe UI", Roboto, sans-serif', baseline: 'middle' });
    Renderer.drawText(ctx, 'Convex mirrors diverge light rays outward and always produce Virtual, Upright, and Diminished images behind the mirror.', edu.x + 20, edu.y + 45, { fill: Colors.text, font: '12px "Segoe UI", Roboto, sans-serif' });
  }

  destroy() {
    this.buttons = [];
    this.sliders = [];
  }
}
