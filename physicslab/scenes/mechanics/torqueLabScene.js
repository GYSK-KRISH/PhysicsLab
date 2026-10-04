// Torque & Lever Laboratory Scene for PhysicsLab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Slider } from '../../engine/ui.js';
import { TorquePhysics } from '../../physics/mechanics/torque.js';
import { VectorRenderer } from '../../engine/vectorRenderer.js';
import { MechanicsControlBar, MechanicsDataPanel, MechanicsModalOverlay } from '../../engine/mechanicsUI.js';

export class TorqueLabScene {
  constructor() {
    this.physics = new TorquePhysics({ distance: 2.5, force: 20, angleDeg: 90 });
    this.controlBar = new MechanicsControlBar({
      onPlay: () => {},
      onPause: () => {},
      onReset: () => {
        this.physics.setParameters(2.5, 20, 90);
      },
      onOpenFormula: () => this.modal.openFormula('TORQUE & LEVER ARM', [
        { name: 'Torque Vector Cross Product', formula: 'τ = r × F', desc: 'Vector cross product of position vector and applied force' },
        { name: 'Torque Scalar Magnitude', formula: 'τ = r·F·sin θ = r_perp·F', desc: 'Lever arm length r times perpendicular force component' },
        { name: 'Maximum Torque (θ = 90°)', formula: 'τ_max = r·F', desc: 'Peak turning effect when force is strictly perpendicular' }
      ]),
      onOpenConcept: () => this.modal.openConcept('TORQUE LAB', {
        what: 'Torque (also known as moment of force) is the rotational equivalent of linear force, causing rotational acceleration about a pivot.',
        how: 'Applying force further from the pivot (large r) or more perpendicularly (θ near 90°) maximizes torque output.',
        keyIdea: 'Forces directed along the lever arm (θ = 0° or 180°) generate zero rotational torque because sin θ = 0.'
      }),
      onOpenProblem: () => this.modal.openProblem('TORQUE_LEVER'),
      onBack: () => {
        import('./mechanicsMenuScene.js').then(m => this.sceneManager.changeScene(new m.MechanicsMenuScene()));
      }
    });

    this.dataPanel = new MechanicsDataPanel({ title: 'TORQUE METRICS' });
    this.modal = new MechanicsModalOverlay();
    this.sliders = [];
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
      min: 0.2,
      max: 5.0,
      value: this.physics.distance,
      step: 0.1,
      label: 'DISTANCE (r)',
      unit: ' m',
      accentColor: Colors.yellow,
      callback: (val) => this.physics.setParameters(val, this.physics.force, this.physics.angleDeg)
    }));

    sY += 55;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: 0,
      max: 50,
      value: this.physics.force,
      step: 1,
      label: 'FORCE MAGNITUDE (F)',
      unit: ' N',
      accentColor: '#EF4444',
      callback: (val) => this.physics.setParameters(this.physics.distance, val, this.physics.angleDeg)
    }));

    sY += 55;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: 0,
      max: 180,
      value: this.physics.angleDeg,
      step: 5,
      label: 'FORCE ANGLE (θ)',
      unit: '°',
      accentColor: Colors.cyan,
      callback: (val) => this.physics.setParameters(this.physics.distance, this.physics.force, val)
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
    if (this.modal.isOpen) {
      this.modal.update(dt, this.inputManager);
      return;
    }

    this.controlBar.update(dt, this.inputManager);
    for (const s of this.sliders) s.update(dt, this.inputManager);

    this.dataPanel.setItems([
      { label: 'Lever Arm (r)', value: this.physics.distance.toFixed(2), unit: 'm', color: Colors.yellow },
      { label: 'Applied Force (F)', value: this.physics.force.toFixed(1), unit: 'N', color: '#EF4444' },
      { label: 'Angle (θ)', value: `${this.physics.angleDeg.toFixed(0)}°`, unit: '', color: Colors.cyan },
      { label: 'Perp Force (F·sin θ)', value: this.physics.fPerp.toFixed(1), unit: 'N', color: Colors.green },
      { label: 'Parallel Force (F·cos θ)', value: this.physics.fParallel.toFixed(1), unit: 'N (0 Torque)', color: Colors.textMuted },
      { label: 'Resulting Torque (τ)', value: this.physics.torqueMagnitude.toFixed(2), unit: 'N·m', color: Colors.yellow },
      { label: 'Direction', value: this.physics.direction, unit: '', color: Colors.green }
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

      const pivotX = this.simRect.x + 80;
      const pivotY = this.simRect.y + this.simRect.h / 2;
      const leverLengthPixels = Math.min(480, this.simRect.w - 160);
      const scale = leverLengthPixels / this.physics.leverLength;

      // Draw Pivot Support Triangle
      ctx.fillStyle = '#1E293B';
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(pivotX - 16, pivotY + 30);
      ctx.lineTo(pivotX + 16, pivotY + 30);
      ctx.closePath();
      ctx.fill();

      // Lever Beam
      Renderer.drawRoundedRect(ctx, pivotX, pivotY - 8, leverLengthPixels, 16, 4, {
        fill: '#152136',
        stroke: Colors.panelBorder,
        lineWidth: 2
      });

      // Pivot Pin
      Renderer.drawCircle(ctx, pivotX, pivotY, 6, { fill: Colors.purple, stroke: '#FFFFFF', lineWidth: 1.5 });

      // Force Application Point
      const appX = pivotX + this.physics.distance * scale;
      const appY = pivotY;

      Renderer.drawCircle(ctx, appX, appY, 8, { fill: Colors.yellow, stroke: '#FFFFFF', lineWidth: 2, glowColor: Colors.yellow, glowBlur: 8 });

      // Lever measurement ruler
      VectorRenderer.drawRuler(ctx, pivotX, pivotY + 20, appX, pivotY + 20, this.physics.distance, 'm', { color: Colors.yellow });

      // Applied Force Vector at Angle θ
      const thetaRad = (this.physics.angleDeg * Math.PI) / 180;
      const fx = Math.cos(thetaRad) * this.physics.force * 2.2;
      const fy = -Math.sin(thetaRad) * this.physics.force * 2.2;

      VectorRenderer.drawVector(ctx, appX, appY, fx, fy, 1.0, {
        color: '#EF4444',
        label: `F = ${this.physics.force.toFixed(0)} N`,
        glow: true
      });

      // Angle Arc
      VectorRenderer.drawAngleArc(ctx, appX, appY, 30, 0, -thetaRad, `${this.physics.angleDeg}°`, { color: Colors.cyan });
    }

    this.modal.render(ctx, width, height);
  }
}
