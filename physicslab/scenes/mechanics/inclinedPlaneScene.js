// Inclined Plane Laboratory Scene for PhysicsLab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Slider } from '../../engine/ui.js';
import { InclinedPlanePhysics } from '../../physics/mechanics/inclinedPlane.js';
import { VectorRenderer } from '../../engine/vectorRenderer.js';
import { MechanicsControlBar, MechanicsDataPanel, MechanicsModalOverlay } from '../../engine/mechanicsUI.js';

export class InclinedPlaneScene {
  constructor() {
    this.physics = new InclinedPlanePhysics({ angleDeg: 30, mass: 2, mu: 0.2 });
    this.controlBar = new MechanicsControlBar({
      onPlay: () => this.physics.start(),
      onPause: () => this.physics.pause(),
      onReset: () => this.physics.reset(),
      onStepForward: () => this.physics.update(0.1),
      onToggleSlowMo: () => {
        this.isSlowMo = !this.isSlowMo;
        this.controlBar.setSlowMo(this.isSlowMo);
      },
      onOpenFormula: () => this.modal.openFormula('INCLINED PLANE', [
        { name: 'Parallel Gravity Component', formula: 'F_parallel = m·g·sin θ', desc: 'Gravitational force component acting down along the ramp' },
        { name: 'Perpendicular Component & Normal', formula: 'N = F_perp = m·g·cos θ', desc: 'Normal reaction force exerted perpendicular to the surface' },
        { name: 'Sliding Acceleration', formula: 'a = g·(sin θ - μ·cos θ)', desc: 'Net downhill acceleration when parallel gravity exceeds friction' }
      ]),
      onOpenConcept: () => this.modal.openConcept('INCLINED PLANE', {
        what: 'An inclined plane decomposes gravity into parallel (sliding) and perpendicular (pressing) components.',
        how: 'Weight mg acts vertically downwards; resolving along the plane tilts our coordinate system by angle θ.',
        keyIdea: 'Motion starts only when the incline angle exceeds the angle of repose: tan θ > μ.'
      }),
      onOpenProblem: () => this.modal.openProblem('WORK_DONE'),
      onBack: () => {
        import('./mechanicsMenuScene.js').then(m => this.sceneManager.changeScene(new m.MechanicsMenuScene()));
      }
    });

    this.dataPanel = new MechanicsDataPanel({ title: 'INCLINE FORCES' });
    this.modal = new MechanicsModalOverlay();
    this.sliders = [];
    this.isSlowMo = false;
    this.lastWidth = 0;
    this.lastHeight = 0;
  }

  init() {
    this.rebuildUI();
  }

  rebuildUI() {
    const { width, height } = this.canvasEngine.getBounds();
    this.controlBar.setBounds(20, 12, width - 40);

    const sidebarW = Math.max(260, Math.min(320, width * 0.28));
    const sidebarX = width - sidebarW - 20;
    const contentY = 64;
    const contentH = height - contentY - 20;

    this.sliders = [];
    let sY = contentY + 20;
    const sW = sidebarW - 40;

    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: 5,
      max: 75,
      value: this.physics.angleDeg,
      step: 1,
      label: 'INCLINE ANGLE (θ)',
      unit: '°',
      accentColor: Colors.yellow,
      callback: (val) => this.physics.setParameters(val, this.physics.mass, this.physics.mu, this.physics.gravity)
    }));

    sY += 55;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: 0.5,
      max: 10,
      value: this.physics.mass,
      step: 0.5,
      label: 'BLOCK MASS (m)',
      unit: ' kg',
      accentColor: Colors.cyan,
      callback: (val) => this.physics.setParameters(this.physics.angleDeg, val, this.physics.mu, this.physics.gravity)
    }));

    sY += 55;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: 0,
      max: 0.8,
      value: this.physics.mu,
      step: 0.05,
      label: 'FRICTION COEFF (μ)',
      unit: '',
      accentColor: Colors.purple,
      callback: (val) => this.physics.setParameters(this.physics.angleDeg, this.physics.mass, val, this.physics.gravity)
    }));

    this.sidebarRect = { x: sidebarX, y: contentY, w: sidebarW, h: contentH };
    this.dataPanel.setRect(sidebarX, contentY + 200, sidebarW, contentH - 200);

    const mainW = sidebarX - 40;
    this.simRect = { x: 20, y: contentY, w: mainW, h: contentH };
  }

  handleInput(inputManager) {
    const { width, height } = this.canvasEngine.getBounds();
    if (this.lastWidth !== width || this.lastHeight !== height) {
      this.lastWidth = width;
      this.lastHeight = height;
      this.rebuildUI();
    }
    if (this.modal.isOpen) {
      this.modal.update(0, inputManager);
    }
  }

  update(dt) {
    const effectiveDt = this.isSlowMo ? dt * 0.25 : dt;
    this.physics.update(effectiveDt);
    this.controlBar.setRunning(this.physics.isRunning);

    if (this.modal.isOpen) {
      this.modal.update(dt, this.inputManager);
      return;
    }

    this.controlBar.update(dt, this.inputManager);
    for (const s of this.sliders) s.update(dt, this.inputManager);

    this.dataPanel.setItems([
      { label: 'Weight (mg)', value: this.physics.weight.toFixed(1), unit: 'N', color: Colors.yellow },
      { label: 'Parallel mg·sin(θ)', value: this.physics.parallelWeight.toFixed(1), unit: 'N', color: '#EF4444' },
      { label: 'Normal N = mg·cos(θ)', value: this.physics.normalForce.toFixed(1), unit: 'N', color: Colors.green },
      { label: 'Friction Force', value: this.physics.frictionForce.toFixed(1), unit: 'N', color: '#EC4899' },
      { label: 'Net Force', value: this.physics.netForce.toFixed(1), unit: 'N', color: Colors.cyan },
      { label: 'Downhill Acc (a)', value: this.physics.acceleration.toFixed(2), unit: 'm/s²', color: Colors.cyan },
      { label: 'Velocity (v)', value: this.physics.velocity.toFixed(2), unit: 'm/s', color: Colors.text }
    ]);
  }

  render(ctx) {
    const { width, height } = this.canvasEngine.getBounds();

    Renderer.drawRect(ctx, 0, 0, width, height, { fill: Colors.background });
    Renderer.drawGrid(ctx, width, height, 40);

    this.controlBar.render(ctx);

    if (this.sidebarRect) {
      Renderer.drawPanel(ctx, this.sidebarRect.x, this.sidebarRect.y, this.sidebarRect.w, this.sidebarRect.h, {
        fill: Colors.panel,
        stroke: Colors.panelBorder
      });
      for (const s of this.sliders) s.render(ctx);
      this.dataPanel.render(ctx);
    }

    if (this.simRect) {
      Renderer.drawPanel(ctx, this.simRect.x, this.simRect.y, this.simRect.w, this.simRect.h, {
        fill: '#090E1A',
        stroke: Colors.panelBorder
      });

      const groundY = this.simRect.y + this.simRect.h - 60;
      const originX = this.simRect.x + 60;
      const inclineBaseW = Math.min(500, this.simRect.w - 120);
      const thetaRad = (this.physics.angleDeg * Math.PI) / 180;
      const inclineHeight = inclineBaseW * Math.tan(thetaRad);

      // Draw the Inclined Plane wedge
      VectorRenderer.drawIncline(ctx, originX, groundY, inclineBaseW, inclineHeight, this.physics.angleDeg);

      // Ramp top vertex and bottom vertex
      const topX = originX;
      const topY = groundY - inclineHeight;
      const bottomX = originX + inclineBaseW;
      const bottomY = groundY;

      // Incline hypotenuse length in pixels
      const rampPixelLength = Math.sqrt(inclineBaseW * inclineBaseW + inclineHeight * inclineHeight);
      const normDist = this.physics.distanceAlongIncline / this.physics.inclineLength;
      const blockDistPixels = normDist * (rampPixelLength - 60) + 30;

      // Block Position on the slope
      const cosT = Math.cos(thetaRad);
      const sinT = Math.sin(thetaRad);
      const slopeX = topX + blockDistPixels * cosT;
      const slopeY = topY + blockDistPixels * sinT;

      ctx.save();
      ctx.translate(slopeX, slopeY);
      ctx.rotate(thetaRad);

      const bw = 50;
      const bh = 35;
      // Draw Block rotated along incline
      Renderer.drawRoundedRect(ctx, -bw / 2, -bh, bw, bh, 6, {
        fill: '#151F30',
        stroke: Colors.cyan,
        lineWidth: 2,
        glowColor: Colors.cyan,
        glowBlur: 8
      });

      Renderer.drawText(ctx, `${this.physics.mass.toFixed(1)}kg`, 0, -bh / 2, {
        fill: Colors.text,
        font: 'bold 11px "Segoe UI"',
        align: 'center',
        baseline: 'middle'
      });

      // Vectors drawn in slope frame
      if (this.controlBar.showVectors) {
        // Normal force (perpendicular up from slope)
        VectorRenderer.drawVector(ctx, 0, -bh, 0, -this.physics.normalForce * 2.5, 1.0, {
          color: Colors.green,
          label: 'N'
        });

        // Parallel gravity down incline
        VectorRenderer.drawVector(ctx, 0, -bh / 2, this.physics.parallelWeight * 2.5, 0, 1.0, {
          color: '#EF4444',
          label: 'mg·sin θ'
        });

        // Friction opposing motion
        if (this.physics.frictionForce > 0.1) {
          VectorRenderer.drawVector(ctx, 0, 0, -this.physics.frictionForce * 2.5, 0, 1.0, {
            color: '#EC4899',
            label: 'f'
          });
        }
      }

      ctx.restore();

      // True downward weight vector in world coordinates
      if (this.controlBar.showVectors) {
        VectorRenderer.drawVector(ctx, slopeX, slopeY - 15, 0, this.physics.weight * 2.5, 1.0, {
          color: Colors.yellow,
          label: 'mg',
          glow: true
        });
      }
    }

    this.modal.render(ctx, width, height);
  }
}
