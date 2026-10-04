// Convex Lens Optics Scene for PhysicsLab (Phase 4)
import { Colors, Renderer } from '../engine/renderer.js';
import { Button, Slider } from '../engine/ui.js';
import { LensPhysics } from '../physics/optics.js';

export class LensScene {
  constructor() {
    this.physics = new LensPhysics({
      focalLength: 20.0,
      objectDistance: 40.0,
      objectHeight: 15.0
    });

    this.buttons = [];
    this.sliders = [];

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

    // Preset Case Selection Buttons
    const presetBtn1 = new Button({
      x: 180,
      y: 12,
      width: 110,
      height: 38,
      text: 'u > 2F',
      accentColor: Colors.cyan,
      callback: () => {
        this.physics.setParameters(20, 50, 15);
        this.rebuildUI();
      }
    });

    const presetBtn2 = new Button({
      x: 300,
      y: 12,
      width: 100,
      height: 38,
      text: 'u = 2F',
      accentColor: Colors.cyan,
      callback: () => {
        this.physics.setParameters(20, 40, 15);
        this.rebuildUI();
      }
    });

    const presetBtn3 = new Button({
      x: 410,
      y: 12,
      width: 120,
      height: 38,
      text: 'F < u < 2F',
      accentColor: Colors.cyan,
      callback: () => {
        this.physics.setParameters(20, 30, 15);
        this.rebuildUI();
      }
    });

    const presetBtn4 = new Button({
      x: 540,
      y: 12,
      width: 90,
      height: 38,
      text: 'u = F',
      accentColor: Colors.yellow,
      callback: () => {
        this.physics.setParameters(20, 20, 15);
        this.rebuildUI();
      }
    });

    const presetBtn5 = new Button({
      x: 640,
      y: 12,
      width: 100,
      height: 38,
      text: 'u < F',
      accentColor: Colors.purple,
      callback: () => {
        this.physics.setParameters(20, 10, 15);
        this.rebuildUI();
      }
    });

    this.buttons.push(backBtn, presetBtn1, presetBtn2, presetBtn3, presetBtn4, presetBtn5);

    // 2. Sidebar Layout
    const sidebarWidth = Math.max(280, Math.min(340, width * 0.28));
    const sidebarX = width - sidebarWidth - 20;
    const sidebarY = headerHeight + 10;
    const sidebarHeight = height - sidebarY - 20;

    this.sidebarRect = { x: sidebarX, y: sidebarY, w: sidebarWidth, h: sidebarHeight };

    const sliderWidth = sidebarWidth - 40;
    const sliderStartX = sidebarX + 20;
    let sliderY = sidebarY + 60;

    // Focal Length Slider
    const focalSlider = new Slider({
      x: sliderStartX,
      y: sliderY,
      width: sliderWidth,
      min: 5,
      max: 50,
      value: this.physics.focalLength,
      step: 1,
      label: 'FOCAL LENGTH (f)',
      unit: ' cm',
      accentColor: Colors.purple,
      callback: (val) => {
        this.physics.setParameters(val, this.physics.objectDistance, this.physics.objectHeight);
      }
    });
    this.sliders.push(focalSlider);

    // Object Distance Slider
    sliderY += 65;
    const objectDistSlider = new Slider({
      x: sliderStartX,
      y: sliderY,
      width: sliderWidth,
      min: 5,
      max: 100,
      value: this.physics.objectDistance,
      step: 1,
      label: 'OBJECT DISTANCE (u)',
      unit: ' cm',
      accentColor: Colors.cyan,
      callback: (val) => {
        this.physics.setParameters(this.physics.focalLength, val, this.physics.objectHeight);
      }
    });
    this.sliders.push(objectDistSlider);

    // Object Height Slider
    sliderY += 65;
    const objectHeightSlider = new Slider({
      x: sliderStartX,
      y: sliderY,
      width: sliderWidth,
      min: 5,
      max: 30,
      value: this.physics.objectHeight,
      step: 1,
      label: 'OBJECT HEIGHT (hₒ)',
      unit: ' cm',
      accentColor: Colors.green,
      callback: (val) => {
        this.physics.setParameters(this.physics.focalLength, this.physics.objectDistance, val);
      }
    });
    this.sliders.push(objectHeightSlider);

    // 3. Main Diagram & Education Box Layout
    const mainWidth = sidebarX - 40;
    const diagramHeight = Math.floor((height - headerHeight - 40) * 0.68);
    const eduHeight = (height - headerHeight - 40) - diagramHeight - 15;

    this.diagramRect = { x: 20, y: headerHeight + 10, w: mainWidth, h: diagramHeight };
    this.eduRect = { x: 20, y: this.diagramRect.y + diagramHeight + 15, w: mainWidth, h: eduHeight };
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
    const pointer = inputManager.pointer;

    // Direct Object Dragging with Mouse or Touch
    const { sx: objSx, sy: objSy } = this.worldToScreen(-this.physics.objectDistance, this.physics.objectHeight);
    const { originX, originY, scale } = this.worldToScreen(0, 0);

    const hitRadius = 25;
    const isOverObject = Math.hypot(pointer.x - objSx, pointer.y - objSy) <= hitRadius;

    if (pointer.justPressed && isOverObject) {
      this.isDraggingObject = true;
    }

    if (this.isDraggingObject) {
      if (!pointer.isDown) {
        this.isDraggingObject = false;
      } else {
        // Compute new object distance u from pointer.x
        const rawWorldX = (pointer.x - originX) / scale;
        // Object is on left side, so u = -rawWorldX
        let newU = -rawWorldX;
        newU = Math.max(5, Math.min(100, newU));

        if (Math.abs(newU - this.physics.objectDistance) > 0.2) {
          this.physics.setParameters(this.physics.focalLength, newU, this.physics.objectHeight);
          this.rebuildUI();
        }
      }
    }

    // Keyboard controls
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
    for (const btn of this.buttons) btn.update(dt, this.inputManager);
    for (const slider of this.sliders) slider.update(dt, this.inputManager);
  }

  worldToScreen(wx, wy) {
    const diag = this.diagramRect;
    const originX = diag.x + diag.w * 0.45; // optical center X
    const originY = diag.y + diag.h * 0.5;  // principal axis Y

    const scale = Math.min((diag.w * 0.42) / 100, (diag.h * 0.38) / 30);

    const sx = originX + wx * scale;
    const sy = originY - wy * scale;

    return { sx, sy, scale, originX, originY };
  }

  render(ctx) {
    const { width, height } = this.canvasEngine.getBounds();

    Renderer.drawRect(ctx, 0, 0, width, height, { fill: Colors.background });
    Renderer.drawGrid(ctx, width, height, 40);

    // Main Diagram Box
    Renderer.drawPanel(ctx, this.diagramRect.x, this.diagramRect.y, this.diagramRect.w, this.diagramRect.h, {
      fill: Colors.panel,
      stroke: Colors.panelBorder,
      radius: 12
    });

    this.renderOpticsDiagram(ctx);
    this.renderSidebar(ctx);
    this.renderEducationPanel(ctx);

    // Header Title
    Renderer.drawText(ctx, 'CONVEX LENS OPTICS SIMULATOR', 760, 31, {
      fill: Colors.cyan,
      font: 'bold 16px "Segoe UI", Roboto, sans-serif',
      glowColor: Colors.cyan,
      glowBlur: 8,
      baseline: 'middle'
    });

    for (const btn of this.buttons) btn.render(ctx);
    for (const slider of this.sliders) slider.render(ctx);
  }

  renderOpticsDiagram(ctx) {
    ctx.save();
    const diag = this.diagramRect;
    const { originX, originY, scale } = this.worldToScreen(0, 0);

    // Clip rendering inside diagram box
    ctx.beginPath();
    ctx.rect(diag.x + 2, diag.y + 2, diag.w - 4, diag.h - 4);
    ctx.clip();

    // 1. Principal Axis Line (Cyan glow)
    Renderer.drawLine(ctx, diag.x, originY, diag.x + diag.w, originY, {
      stroke: Colors.cyan,
      lineWidth: 1.5,
      glowColor: Colors.cyan,
      glowBlur: 6
    });

    Renderer.drawText(ctx, 'PRINCIPAL AXIS', diag.x + 15, originY - 10, {
      fill: 'rgba(94, 231, 255, 0.6)',
      font: '10px "Segoe UI", Roboto, sans-serif'
    });

    // 2. Render Focal Point Nodes (F1, 2F1, F2, 2F2)
    const f = this.physics.focalLength;
    const points = [
      { name: '2F₁', x: -2 * f, color: Colors.purple },
      { name: 'F₁', x: -f, color: Colors.purple },
      { name: 'O', x: 0, color: Colors.cyan },
      { name: 'F₂', x: f, color: Colors.purple },
      { name: '2F₂', x: 2 * f, color: Colors.purple }
    ];

    for (const pt of points) {
      const { sx } = this.worldToScreen(pt.x, 0);
      if (sx >= diag.x && sx <= diag.x + diag.w) {
        Renderer.drawCircle(ctx, sx, originY, 4, {
          fill: pt.color,
          stroke: '#FFFFFF',
          lineWidth: 1.5,
          glowColor: pt.color,
          glowBlur: 6
        });

        Renderer.drawText(ctx, pt.name, sx, originY + 18, {
          fill: pt.color,
          font: 'bold 11px "Segoe UI", Roboto, sans-serif',
          align: 'center',
          baseline: 'top'
        });
      }
    }

    // 3. Convex Lens Graphic (Double Convex Curved Glass Shape at X=0)
    const lensHeight = diag.h * 0.75;
    const lensThickness = 24;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(originX, originY - lensHeight / 2);
    ctx.quadraticCurveTo(originX + lensThickness, originY, originX, originY + lensHeight / 2);
    ctx.quadraticCurveTo(originX - lensThickness, originY, originX, originY - lensHeight / 2);
    ctx.closePath();

    // Glass fill & cyan border glow
    const glassGrad = ctx.createLinearGradient(originX - lensThickness, 0, originX + lensThickness, 0);
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

    // Vertical Center Line of Lens
    Renderer.drawLine(ctx, originX, originY - lensHeight / 2, originX, originY + lensHeight / 2, {
      stroke: 'rgba(94, 231, 255, 0.3)',
      lineDash: [3, 3],
      lineWidth: 1
    });

    // 4. Object Arrow (-u, ho)
    const u = this.physics.objectDistance;
    const ho = this.physics.objectHeight;
    const { sx: objSx, sy: objSy } = this.worldToScreen(-u, ho);
    const { sx: objBaseSx } = this.worldToScreen(-u, 0);

    // Object Arrow Line
    Renderer.drawLine(ctx, objBaseSx, originY, objSx, objSy, {
      stroke: Colors.green,
      lineWidth: 3.5,
      glowColor: Colors.green,
      glowBlur: 10
    });

    // Object Arrow Head
    ctx.save();
    ctx.translate(objSx, objSy);
    ctx.fillStyle = Colors.green;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-6, 10);
    ctx.lineTo(6, 10);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Object Drag Handle Glow Indicator
    Renderer.drawCircle(ctx, objSx, objSy, this.isDraggingObject ? 10 : 7, {
      fill: Colors.green,
      stroke: '#FFFFFF',
      lineWidth: 2,
      glowColor: Colors.green,
      glowBlur: 12
    });

    Renderer.drawText(ctx, 'OBJECT (Drag Me)', objSx, objSy - 18, {
      fill: Colors.green,
      font: 'bold 11px "Segoe UI", Roboto, sans-serif',
      align: 'center',
      baseline: 'bottom'
    });

    // 5. Image Arrow & Ray Tracing Calculation
    const v = this.physics.imageDistance;
    const hi = this.physics.imageHeight;

    if (!this.physics.isAtFocalPoint) {
      const { sx: imgSx, sy: imgSy } = this.worldToScreen(v, hi);
      const { sx: imgBaseSx } = this.worldToScreen(v, 0);

      const isReal = v > 0;
      const imgColor = isReal ? Colors.purple : Colors.yellow;

      // Image Arrow Line
      Renderer.drawLine(ctx, imgBaseSx, originY, imgSx, imgSy, {
        stroke: imgColor,
        lineWidth: 3,
        lineDash: isReal ? [] : [6, 4],
        glowColor: imgColor,
        glowBlur: 10
      });

      // Image Arrow Head
      ctx.save();
      ctx.translate(imgSx, imgSy);
      ctx.fillStyle = imgColor;
      ctx.beginPath();
      // Direction depends on hi (upright vs inverted)
      const headDir = hi >= 0 ? 1 : -1;
      ctx.moveTo(0, 0);
      ctx.lineTo(-6, 10 * headDir);
      ctx.lineTo(6, 10 * headDir);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      Renderer.drawText(ctx, `IMAGE (${this.physics.imageType})`, imgSx, imgSy + (hi >= 0 ? -18 : 22), {
        fill: imgColor,
        font: 'bold 11px "Segoe UI", Roboto, sans-serif',
        align: 'center'
      });

      // 6. Three Principal Rays Tracing
      // Ray 1 (Cyan): Parallel to axis -> lens plane (0, ho) -> refracts through F2 (+f, 0)
      const ray1LensPt = this.worldToScreen(0, ho);
      const ray1F2Pt = this.worldToScreen(f, 0);

      Renderer.drawLine(ctx, objSx, objSy, ray1LensPt.sx, ray1LensPt.sy, {
        stroke: Colors.cyan,
        lineWidth: 2,
        glowColor: Colors.cyan,
        glowBlur: 6
      });

      // Refracted ray extending through image tip
      if (isReal) {
        Renderer.drawLine(ctx, ray1LensPt.sx, ray1LensPt.sy, imgSx, imgSy, {
          stroke: Colors.cyan,
          lineWidth: 2,
          glowColor: Colors.cyan,
          glowBlur: 6
        });
      } else {
        // Virtual image: ray goes forward through F2, dashed extension backwards to image tip
        const farPt = this.worldToScreen(100, (100 - f) * (-ho / f));
        Renderer.drawLine(ctx, ray1LensPt.sx, ray1LensPt.sy, farPt.sx, farPt.sy, {
          stroke: Colors.cyan,
          lineWidth: 2,
          glowColor: Colors.cyan,
          glowBlur: 6
        });
        Renderer.drawLine(ctx, ray1LensPt.sx, ray1LensPt.sy, imgSx, imgSy, {
          stroke: Colors.cyan,
          lineWidth: 1.5,
          lineDash: [4, 4]
        });
      }

      // Ray 2 (Yellow): Straight through Optical Center O (0,0)
      Renderer.drawLine(ctx, objSx, objSy, originX, originY, {
        stroke: Colors.yellow,
        lineWidth: 2,
        glowColor: Colors.yellow,
        glowBlur: 6
      });

      if (isReal) {
        Renderer.drawLine(ctx, originX, originY, imgSx, imgSy, {
          stroke: Colors.yellow,
          lineWidth: 2,
          glowColor: Colors.yellow,
          glowBlur: 6
        });
      } else {
        const farPt2 = this.worldToScreen(100, -100 * (ho / u));
        Renderer.drawLine(ctx, originX, originY, farPt2.sx, farPt2.sy, {
          stroke: Colors.yellow,
          lineWidth: 2,
          glowColor: Colors.yellow,
          glowBlur: 6
        });
        Renderer.drawLine(ctx, originX, originY, imgSx, imgSy, {
          stroke: Colors.yellow,
          lineWidth: 1.5,
          lineDash: [4, 4]
        });
      }

      // Ray 3 (Purple): Through F1 (-f, 0) -> lens plane -> emerges parallel
      const ray3LensPt = this.worldToScreen(0, hi);
      Renderer.drawLine(ctx, objSx, objSy, ray3LensPt.sx, ray3LensPt.sy, {
        stroke: Colors.purple,
        lineWidth: 2,
        glowColor: Colors.purple,
        glowBlur: 6
      });

      if (isReal) {
        Renderer.drawLine(ctx, ray3LensPt.sx, ray3LensPt.sy, imgSx, imgSy, {
          stroke: Colors.purple,
          lineWidth: 2,
          glowColor: Colors.purple,
          glowBlur: 6
        });
      } else {
        const farPt3 = this.worldToScreen(100, hi);
        Renderer.drawLine(ctx, ray3LensPt.sx, ray3LensPt.sy, farPt3.sx, farPt3.sy, {
          stroke: Colors.purple,
          lineWidth: 2,
          glowColor: Colors.purple,
          glowBlur: 6
        });
        Renderer.drawLine(ctx, ray3LensPt.sx, ray3LensPt.sy, imgSx, imgSy, {
          stroke: Colors.purple,
          lineWidth: 1.5,
          lineDash: [4, 4]
        });
      }
    } else {
      // Object at Focal Point (u = f): Parallel emerging rays
      const ray1LensPt = this.worldToScreen(0, ho);
      const ray1F2Pt = this.worldToScreen(f, 0);

      Renderer.drawLine(ctx, objSx, objSy, ray1LensPt.sx, ray1LensPt.sy, {
        stroke: Colors.cyan,
        lineWidth: 2
      });
      Renderer.drawLine(ctx, ray1LensPt.sx, ray1LensPt.sy, diag.x + diag.w, ray1F2Pt.sy + 120, {
        stroke: Colors.cyan,
        lineWidth: 2
      });

      Renderer.drawLine(ctx, objSx, objSy, originX, originY, {
        stroke: Colors.yellow,
        lineWidth: 2
      });
      Renderer.drawLine(ctx, originX, originY, diag.x + diag.w, originY + 120, {
        stroke: Colors.yellow,
        lineWidth: 2
      });

      Renderer.drawText(ctx, 'PARALLEL RAYS — IMAGE AT INFINITY', originX + 40, originY - 40, {
        fill: Colors.yellow,
        font: 'bold 14px "Segoe UI", Roboto, sans-serif'
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

    Renderer.drawText(ctx, 'OPTICAL CONTROLS', sb.x + 20, sb.y + 30, {
      fill: Colors.cyan,
      font: 'bold 13px "Segoe UI", Roboto, sans-serif',
      baseline: 'middle'
    });

    Renderer.drawLine(ctx, sb.x + 20, sb.y + 48, sb.x + sb.w - 20, sb.y + 48, {
      stroke: Colors.panelBorder,
      lineWidth: 1
    });

    const statsY = sb.y + 245;
    Renderer.drawText(ctx, 'IMAGE ANALYSIS & TELEMETRY', sb.x + 20, statsY, {
      fill: Colors.purple,
      font: 'bold 13px "Segoe UI", Roboto, sans-serif',
      baseline: 'middle'
    });

    Renderer.drawLine(ctx, sb.x + 20, statsY + 15, sb.x + sb.w - 20, statsY + 15, {
      stroke: Colors.panelBorder,
      lineWidth: 1
    });

    const p = this.physics;
    const vStr = p.isAtFocalPoint ? '∞ (Infinity)' : `${p.imageDistance.toFixed(2)} cm`;
    const mStr = p.isAtFocalPoint ? '∞' : `${p.magnification.toFixed(2)}×`;

    const telemetryItems = [
      { label: 'CASE CLASSIFICATION', value: p.getCaseName(), color: Colors.yellow },
      { label: 'FOCAL LENGTH (f)', value: `${p.focalLength.toFixed(1)} cm`, color: Colors.purple },
      { label: 'OBJECT DISTANCE (u)', value: `${p.objectDistance.toFixed(1)} cm`, color: Colors.green },
      { label: 'IMAGE DISTANCE (v)', value: vStr, color: Colors.cyan },
      { label: 'MAGNIFICATION (m)', value: mStr, color: Colors.cyan },
      { label: 'IMAGE TYPE', value: p.imageType, color: Colors.purple },
      { label: 'ORIENTATION', value: p.orientation, color: Colors.purple },
      { label: 'SIZE CLASSIFICATION', value: p.sizeClass, color: Colors.text }
    ];

    let itemY = statsY + 35;
    for (const item of telemetryItems) {
      Renderer.drawText(ctx, item.label, sb.x + 20, itemY, {
        fill: Colors.textMuted,
        font: '11px "Segoe UI", Roboto, sans-serif',
        baseline: 'middle'
      });

      Renderer.drawText(ctx, item.value, sb.x + sb.w - 20, itemY, {
        fill: item.color,
        font: 'bold 11px "Segoe UI", Roboto, sans-serif',
        align: 'right',
        baseline: 'middle'
      });

      itemY += 23;
    }
  }

  renderEducationPanel(ctx) {
    const edu = this.eduRect;

    Renderer.drawPanel(ctx, edu.x, edu.y, edu.w, edu.h, {
      fill: Colors.panel,
      stroke: Colors.panelBorder,
      radius: 12
    });

    Renderer.drawText(ctx, 'HOW IT WORKS — THIN LENS FORMULA', edu.x + 20, edu.y + 22, {
      fill: Colors.cyan,
      font: 'bold 13px "Segoe UI", Roboto, sans-serif',
      baseline: 'middle'
    });

    // Formula Badge Box
    Renderer.drawRoundedRect(ctx, edu.x + 20, edu.y + 40, 180, 36, 6, {
      fill: 'rgba(94, 231, 255, 0.1)',
      stroke: Colors.cyan,
      lineWidth: 1
    });

    Renderer.drawText(ctx, '1/f = 1/u + 1/v', edu.x + 110, edu.y + 58, {
      fill: Colors.cyan,
      font: 'bold 15px "Segoe UI", Roboto, sans-serif',
      align: 'center',
      baseline: 'middle'
    });

    // Definition Explanations
    const defX1 = edu.x + 220;
    const defX2 = edu.x + 460;
    const defY = edu.y + 34;

    Renderer.drawText(ctx, 'f : Focal Length (distance from optical center O to focal point F)', defX1, defY, {
      fill: Colors.text,
      font: '12px "Segoe UI", Roboto, sans-serif'
    });

    Renderer.drawText(ctx, 'u : Object Distance (distance from optical center O to object)', defX1, defY + 22, {
      fill: Colors.text,
      font: '12px "Segoe UI", Roboto, sans-serif'
    });

    Renderer.drawText(ctx, 'v : Image Distance (positive for Real images, negative for Virtual)', defX1, defY + 44, {
      fill: Colors.text,
      font: '12px "Segoe UI", Roboto, sans-serif'
    });
  }

  destroy() {
    this.buttons = [];
    this.sliders = [];
    this.isDraggingObject = false;
  }
}
