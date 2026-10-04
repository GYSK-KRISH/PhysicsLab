// Rotational Dynamics Laboratory Scene for PhysicsLab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Slider } from '../../engine/ui.js';
import { RotationalDynamicsPhysics } from '../../physics/mechanics/rotation.js';
import { MechanicsControlBar, MechanicsDataPanel, MechanicsModalOverlay } from '../../engine/mechanicsUI.js';

export class RotationScene {
  constructor() {
    this.physics = new RotationalDynamicsPhysics({ torque: 10, momentOfInertia: 2.5 });
    this.controlBar = new MechanicsControlBar({
      onPlay: () => this.physics.start(),
      onPause: () => this.physics.pause(),
      onReset: () => this.physics.reset(),
      onStepForward: () => this.physics.update(0.05),
      onToggleSlowMo: () => {
        this.isSlowMo = !this.isSlowMo;
        this.controlBar.setSlowMo(this.isSlowMo);
      },
      onOpenFormula: () => this.modal.openFormula('ROTATIONAL DYNAMICS', [
        { name: 'Rotational Second Law', formula: 'τ_net = I·α  ⇒  α = τ_net / I', desc: 'Torque equals moment of inertia times angular acceleration' },
        { name: 'Angular Kinematics', formula: 'ω = ω₀ + α·t,  θ = ω₀·t + ½·α·t²', desc: 'Angular velocity and displacement evolution' },
        { name: 'Rotational Kinetic Energy', formula: 'K_rot = ½·I·ω²', desc: 'Energy stored in rotation of rigid body' }
      ]),
      onOpenConcept: () => this.modal.openConcept('ROTATIONAL MOTION', {
        what: 'Rotational dynamics describes how applied torques cause angular acceleration in rigid bodies.',
        how: 'Moment of inertia I represents rotational inertia. Higher I resists changes in angular velocity ω, demanding greater torque.',
        keyIdea: 'Rotational quantities (τ, I, α, ω, θ) directly parallel translational quantities (F, m, a, v, x).'
      }),
      onOpenProblem: () => this.modal.openProblem('TORQUE_LEVER'),
      onBack: () => {
        import('./mechanicsMenuScene.js').then(m => this.sceneManager.changeScene(new m.MechanicsMenuScene()));
      }
    });

    this.dataPanel = new MechanicsDataPanel({ title: 'ROTATIONAL DYNAMICS' });
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
      min: -30,
      max: 30,
      value: this.physics.torque,
      step: 1,
      label: 'APPLIED TORQUE (τ)',
      unit: ' N·m',
      accentColor: '#EF4444',
      callback: (val) => this.physics.setParameters(val, this.physics.momentOfInertia)
    }));

    sY += 60;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: 0.5,
      max: 10,
      value: this.physics.momentOfInertia,
      step: 0.5,
      label: 'INERTIA (I)',
      unit: ' kg·m²',
      accentColor: Colors.yellow,
      callback: (val) => this.physics.setParameters(this.physics.torque, val)
    }));

    this.sidebarRect = { x: sidebarX, y: contentY, w: sidebarW, h: contentH };
    this.dataPanel.setRect(sidebarX, contentY + 180, sidebarW, contentH - 180);

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
      { label: 'Torque (τ)', value: this.physics.torque.toFixed(1), unit: 'N·m', color: '#EF4444' },
      { label: 'Inertia (I)', value: this.physics.momentOfInertia.toFixed(2), unit: 'kg·m²', color: Colors.yellow },
      { label: 'Angular Acc (α)', value: this.physics.angularAcceleration.toFixed(2), unit: 'rad/s²', color: Colors.cyan },
      { label: 'Angular Vel (ω)', value: this.physics.angularVelocity.toFixed(2), unit: 'rad/s', color: Colors.green },
      { label: 'Rotational KE', value: this.physics.rotationalKE.toFixed(2), unit: 'J', color: Colors.purple },
      { label: 'Angle (θ)', value: `${((this.physics.angleRad * 180) / Math.PI).toFixed(1)}°`, unit: '', color: Colors.text }
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

      const cx = this.simRect.x + this.simRect.w / 2;
      const cy = this.simRect.y + this.simRect.h / 2;
      const discRadius = 110;

      // Outer Rotating Disc
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(this.physics.angleRad);

      Renderer.drawCircle(ctx, 0, 0, discRadius, {
        fill: '#152136',
        stroke: Colors.cyan,
        lineWidth: 3,
        glowColor: Colors.cyan,
        glowBlur: 12
      });

      // Spoke Lines inside rotating disc
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3;
        Renderer.drawLine(ctx, 0, 0, discRadius * Math.cos(ang), discRadius * Math.sin(ang), {
          stroke: 'rgba(94, 231, 255, 0.3)',
          lineWidth: 2
        });
      }

      // Marker on circumference
      Renderer.drawCircle(ctx, discRadius - 12, 0, 6, { fill: Colors.yellow });

      ctx.restore();

      // Center Axle Pin
      Renderer.drawCircle(ctx, cx, cy, 14, { fill: Colors.purple, stroke: '#FFFFFF', lineWidth: 2 });

      // Torque Rotation Arrow
      if (Math.abs(this.physics.torque) > 0.5) {
        ctx.save();
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 3;
        ctx.beginPath();
        const startA = this.physics.torque > 0 ? -Math.PI / 3 : Math.PI / 3;
        const endA = this.physics.torque > 0 ? Math.PI / 3 : -Math.PI / 3;
        ctx.arc(cx, cy, discRadius + 24, startA, endA, this.physics.torque < 0);
        ctx.stroke();
        Renderer.drawText(ctx, `τ = ${this.physics.torque.toFixed(0)} N·m`, cx + discRadius + 34, cy, {
          fill: '#EF4444',
          font: 'bold 12px "Segoe UI"',
          baseline: 'middle'
        });
        ctx.restore();
      }
    }

    this.modal.render(ctx, width, height);
  }
}
