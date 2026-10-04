// Banked Road Laboratory Scene for PhysicsLab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Slider } from '../../engine/ui.js';
import { BankedRoadPhysics } from '../../physics/mechanics/bankedRoad.js';
import { VectorRenderer } from '../../engine/vectorRenderer.js';
import { MechanicsControlBar, MechanicsDataPanel, MechanicsModalOverlay } from '../../engine/mechanicsUI.js';

export class BankedRoadScene {
  constructor() {
    this.physics = new BankedRoadPhysics({ radius: 50, speed: 20, bankAngleDeg: 20, mu: 0.25 });
    this.controlBar = new MechanicsControlBar({
      onPlay: () => {},
      onPause: () => {},
      onReset: () => this.physics.recalculate(),
      onOpenFormula: () => this.modal.openFormula('BANKED ROAD MECHANICS', [
        { name: 'Ideal Frictionless Bank Angle', formula: 'tan θ = v² / (r·g)', desc: 'Angle where normal force alone provides full centripetal force' },
        { name: 'Maximum Safe Speed with Friction', formula: 'v_max = √( r·g·(tan θ + μ) / (1 - μ·tan θ) )', desc: 'Maximum speed before vehicle skids upwards out of curve' },
        { name: 'Minimum Safe Speed with Friction', formula: 'v_min = √( r·g·(tan θ - μ) / (1 + μ·tan θ) )', desc: 'Minimum speed before vehicle slides downwards into curve' }
      ]),
      onOpenConcept: () => this.modal.openConcept('BANKED ROAD', {
        what: 'Road banking tilts a highway curve towards the center to assist vehicle turning at high speeds.',
        how: 'The horizontal component of the normal reaction force (N sin θ) points inward, providing centripetal acceleration without relying exclusively on tyre friction.',
        keyIdea: 'At the ideal speed v_ideal, zero lateral tyre friction is required, maximizing vehicle safety and minimizing tyre wear.'
      }),
      onOpenProblem: () => this.modal.openProblem('CIRCULAR_CENTRIPETAL_FORCE'),
      onBack: () => {
        import('./mechanicsMenuScene.js').then(m => this.sceneManager.changeScene(new m.MechanicsMenuScene()));
      }
    });

    this.dataPanel = new MechanicsDataPanel({ title: 'BANKING METRICS' });
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
      min: 10,
      max: 120,
      value: this.physics.radius,
      step: 5,
      label: 'CURVE RADIUS (r)',
      unit: ' m',
      accentColor: Colors.yellow,
      callback: (val) => this.physics.setParameters(val, this.physics.speed, this.physics.bankAngleDeg, this.physics.mu)
    }));

    sY += 55;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: 5,
      max: 45,
      value: this.physics.speed,
      step: 1,
      label: 'VEHICLE SPEED (v)',
      unit: ' m/s',
      accentColor: Colors.cyan,
      callback: (val) => this.physics.setParameters(this.physics.radius, val, this.physics.bankAngleDeg, this.physics.mu)
    }));

    sY += 55;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: 0,
      max: 45,
      value: this.physics.bankAngleDeg,
      step: 1,
      label: 'BANK ANGLE (θ)',
      unit: '°',
      accentColor: Colors.green,
      callback: (val) => this.physics.setParameters(this.physics.radius, this.physics.speed, val, this.physics.mu)
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
      callback: (val) => this.physics.setParameters(this.physics.radius, this.physics.speed, this.physics.bankAngleDeg, val)
    }));

    this.sidebarRect = { x: sidebarX, y: contentY, w: sidebarW, h: contentH };
    this.dataPanel.setRect(sidebarX, contentY + 250, sidebarW, contentH - 250);

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
      { label: 'Ideal Speed (v_ideal)', value: this.physics.idealSpeed.toFixed(1), unit: 'm/s', color: Colors.green },
      { label: 'Ideal Bank Angle', value: `${this.physics.idealBankAngleDeg.toFixed(1)}°`, unit: '', color: Colors.yellow },
      { label: 'Min Safe Speed (v_min)', value: this.physics.minSafeSpeed.toFixed(1), unit: 'm/s', color: Colors.purple },
      { label: 'Max Safe Speed (v_max)', value: this.physics.maxSafeSpeed > 500 ? '∞' : this.physics.maxSafeSpeed.toFixed(1), unit: 'm/s', color: '#EF4444' },
      { label: 'Required Centripetal F', value: this.physics.requiredCentripetalForce.toFixed(0), unit: 'N', color: Colors.cyan },
      { label: 'Safety Margin', value: this.physics.isSafe ? 'STABLE & SAFE' : 'SKID RISK!', unit: '', color: this.physics.isSafe ? Colors.green : '#EF4444' }
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

      const groundY = this.simRect.y + this.simRect.h - 80;
      const roadOriginX = this.simRect.x + 80;
      const roadW = Math.min(480, this.simRect.w - 160);
      const thetaRad = (this.physics.bankAngleDeg * Math.PI) / 180;
      const roadH = roadW * Math.tan(thetaRad);

      // Draw Banked Road Wedge
      VectorRenderer.drawIncline(ctx, roadOriginX, groundY, roadW, roadH, this.physics.bankAngleDeg);

      // Car on the Banked Slope
      const carDistPixels = roadW * 0.5;
      const carX = roadOriginX + roadW - carDistPixels;
      const carY = groundY - (carDistPixels * Math.tan(thetaRad));

      ctx.save();
      ctx.translate(carX, carY);
      ctx.rotate(-thetaRad);

      const cw = 70;
      const ch = 40;
      // Car Body
      Renderer.drawRoundedRect(ctx, -cw / 2, -ch, cw, ch, 6, {
        fill: '#182438',
        stroke: this.physics.isSafe ? Colors.green : '#EF4444',
        lineWidth: 2,
        glowColor: this.physics.isSafe ? Colors.green : '#EF4444',
        glowBlur: 10
      });

      Renderer.drawText(ctx, 'VEHICLE', 0, -ch / 2, {
        fill: Colors.text,
        font: 'bold 11px "Segoe UI"',
        align: 'center',
        baseline: 'middle'
      });

      // Normal vector
      if (this.controlBar.showVectors) {
        VectorRenderer.drawVector(ctx, 0, -ch, 0, -60, 1.0, {
          color: Colors.green,
          label: 'N'
        });
      }

      ctx.restore();

      // Gravity and Centripetal Vectors in World Coordinates
      if (this.controlBar.showVectors) {
        // Gravity (Down)
        VectorRenderer.drawVector(ctx, carX, carY, 0, 60, 1.0, {
          color: Colors.yellow,
          label: 'mg'
        });

        // Centripetal Direction (Left toward curve center)
        VectorRenderer.drawVector(ctx, carX, carY - 20, -70, 0, 1.0, {
          color: Colors.cyan,
          label: 'Centripetal direction (F_c)',
          glow: true
        });
      }
    }

    this.modal.render(ctx, width, height);
  }
}
