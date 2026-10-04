// Angular Momentum Conservation Laboratory Scene for PhysicsLab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Slider } from '../../engine/ui.js';
import { AngularMomentumPhysics } from '../../physics/mechanics/angularMomentum.js';
import { MechanicsControlBar, MechanicsDataPanel, MechanicsModalOverlay } from '../../engine/mechanicsUI.js';

export class AngularMomentumScene {
  constructor() {
    this.physics = new AngularMomentumPhysics({ mass: 5.0, initialRadius: 2.5, initialOmega: 3.0 });
    this.controlBar = new MechanicsControlBar({
      onPlay: () => this.physics.start(),
      onPause: () => this.physics.pause(),
      onReset: () => this.physics.reset(),
      onStepForward: () => this.physics.update(0.05),
      onToggleSlowMo: () => {
        this.isSlowMo = !this.isSlowMo;
        this.controlBar.setSlowMo(this.isSlowMo);
      },
      onOpenFormula: () => this.modal.openFormula('CONSERVATION OF ANGULAR MOMENTUM', [
        { name: 'Angular Momentum Definition', formula: 'L = I·ω = M·R²·ω', desc: 'Conserved rotational quantity under zero net external torque' },
        { name: 'Conservation Principle', formula: 'I₁·ω₁ = I₂·ω₂ = constant', desc: 'Decreasing moment of inertia causes proportional increase in spin rate' },
        { name: 'Rotational Kinetic Energy Change', formula: 'ΔK = ½·I₂·ω₂² - ½·I₁·ω₁² = W_inward', desc: 'Extra kinetic energy provided by internal muscular/pulling work' }
      ]),
      onOpenConcept: () => this.modal.openConcept('ANGULAR MOMENTUM CONSERVATION', {
        what: 'When the net external torque on a system is zero, total angular momentum L remains strictly constant.',
        how: 'When a spinning ice skater or star pulls mass inwards (R decreases), moment of inertia drops (I ∝ R²), forcing angular velocity ω to increase.',
        keyIdea: 'Spin speed accelerates dramatically even without any external push.'
      }),
      onOpenProblem: () => this.modal.openProblem('TORQUE_LEVER'),
      onBack: () => {
        import('./mechanicsMenuScene.js').then(m => this.sceneManager.changeScene(new m.MechanicsMenuScene()));
      }
    });

    this.dataPanel = new MechanicsDataPanel({ title: 'CONSERVATION STATE' });
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
      min: 0.5,
      max: 3.5,
      value: this.physics.currentRadius,
      step: 0.1,
      label: 'CURRENT RADIUS (R)',
      unit: ' m',
      accentColor: Colors.yellow,
      callback: (val) => this.physics.setRadius(val)
    }));

    sY += 60;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: 1,
      max: 10,
      value: this.physics.mass,
      step: 0.5,
      label: 'MASS (M)',
      unit: ' kg',
      accentColor: Colors.cyan,
      callback: (val) => this.physics.setParameters(val, this.physics.initialRadius, this.physics.initialOmega)
    }));

    sY += 60;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: 0.5,
      max: 6,
      value: this.physics.initialOmega,
      step: 0.5,
      label: 'INITIAL OMEGA (ω₀)',
      unit: ' rad/s',
      accentColor: Colors.green,
      callback: (val) => this.physics.setParameters(this.physics.mass, this.physics.initialRadius, val)
    }));

    this.sidebarRect = { x: sidebarX, y: contentY, w: sidebarW, h: contentH };
    this.dataPanel.setRect(sidebarX, contentY + 220, sidebarW, contentH - 220);

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
      { label: 'Current Radius (R)', value: this.physics.currentRadius.toFixed(2), unit: 'm', color: Colors.yellow },
      { label: 'Moment of Inertia (I)', value: this.physics.currentI.toFixed(2), unit: 'kg·m²', color: Colors.text },
      { label: 'Angular Speed (ω)', value: this.physics.currentOmega.toFixed(2), unit: 'rad/s', color: Colors.green },
      { label: 'Angular Momentum (L)', value: this.physics.currentL.toFixed(2), unit: 'kg·m²/s (CONSERVED)', color: Colors.cyan },
      { label: 'Rotational KE (K)', value: this.physics.currentKE.toFixed(1), unit: 'J', color: Colors.purple },
      { label: 'Work Done Inward', value: this.physics.workDoneInward.toFixed(1), unit: 'J', color: '#EF4444' }
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
      const scale = 40.0;
      const rPix = this.physics.currentRadius * scale;

      // Outer dashed track showing contractable orbital path
      ctx.save();
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(cx, cy, rPix, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Rotating mass arms
      const cosA = Math.cos(this.physics.angleRad);
      const sinA = Math.sin(this.physics.angleRad);

      const m1X = cx + rPix * cosA;
      const m1Y = cy + rPix * sinA;
      const m2X = cx - rPix * cosA;
      const m2Y = cy - rPix * sinA;

      // Connecting Arm
      Renderer.drawLine(ctx, m1X, m1Y, m2X, m2Y, {
        stroke: 'rgba(255, 255, 255, 0.4)',
        lineWidth: 3
      });

      // Center Spindle
      Renderer.drawCircle(ctx, cx, cy, 14, { fill: Colors.purple, stroke: '#FFFFFF', lineWidth: 2 });

      // Masses on ends
      Renderer.drawCircle(ctx, m1X, m1Y, 12, {
        fill: '#152136',
        stroke: Colors.cyan,
        lineWidth: 3,
        glowColor: Colors.cyan,
        glowBlur: 10
      });
      Renderer.drawCircle(ctx, m2X, m2Y, 12, {
        fill: '#152136',
        stroke: Colors.cyan,
        lineWidth: 3,
        glowColor: Colors.cyan,
        glowBlur: 10
      });
    }

    this.modal.render(ctx, width, height);
  }
}
