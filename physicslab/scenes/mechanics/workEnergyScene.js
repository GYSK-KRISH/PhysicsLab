// Work-Energy Theorem Laboratory Scene for PhysicsLab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Slider } from '../../engine/ui.js';
import { WorkEnergyPhysics } from '../../physics/mechanics/workEnergy.js';
import { VectorRenderer } from '../../engine/vectorRenderer.js';
import { MechanicsControlBar, MechanicsDataPanel, MechanicsModalOverlay } from '../../engine/mechanicsUI.js';

export class WorkEnergyScene {
  constructor() {
    this.mass = 3.0; // kg
    this.initialVelocity = 4.0; // m/s
    this.appliedForce = 20.0; // N
    this.distance = 6.0; // m

    this.time = 0;
    this.pos = 0;
    this.velocity = this.initialVelocity;
    this.isRunning = false;

    this.controlBar = new MechanicsControlBar({
      onPlay: () => { this.isRunning = true; },
      onPause: () => { this.isRunning = false; },
      onReset: () => this.reset(),
      onStepForward: () => this.update(0.05),
      onToggleSlowMo: () => {
        this.isSlowMo = !this.isSlowMo;
        this.controlBar.setSlowMo(this.isSlowMo);
      },
      onOpenFormula: () => this.modal.openFormula('WORK-ENERGY THEOREM', [
        { name: 'Work-Energy Theorem Statement', formula: 'W_net = ΔK = K_final - K_initial', desc: 'Net work done on a body equals its change in kinetic energy' },
        { name: 'Kinetic Energy Definition', formula: 'K = ½·m·v²', desc: 'Translational kinetic energy of moving mass' },
        { name: 'Kinematic Verification', formula: 'v_f² = v_i² + 2·a·d  ⇒  ½m·v_f² - ½m·v_i² = m·a·d = F_net·d', desc: 'Exact mathematical equivalence' }
      ]),
      onOpenConcept: () => this.modal.openConcept('WORK-ENERGY THEOREM', {
        what: 'The work-energy theorem states that the work done by the sum of all forces acting on a particle equals the change in kinetic energy of the particle.',
        how: 'As force acts over displacement d, it continuously accelerates the body, pumping mechanical work directly into kinetic energy.',
        keyIdea: 'No matter what path or variable forces act, W_net strictly accounts for ΔK.'
      }),
      onOpenProblem: () => this.modal.openProblem('WORK_DONE'),
      onBack: () => {
        import('./mechanicsMenuScene.js').then(m => this.sceneManager.changeScene(new m.MechanicsMenuScene()));
      }
    });

    this.dataPanel = new MechanicsDataPanel({ title: 'WORK & KINETIC ENERGY' });
    this.modal = new MechanicsModalOverlay();
    this.sliders = [];
    this.isSlowMo = false;
    this.lastWidth = 0;
    this.lastHeight = 0;
  }

  reset() {
    this.time = 0;
    this.pos = 0;
    this.velocity = this.initialVelocity;
    this.isRunning = false;
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
      min: 1,
      max: 10,
      value: this.mass,
      step: 0.5,
      label: 'MASS (m)',
      unit: ' kg',
      accentColor: Colors.cyan,
      callback: (val) => { this.mass = val; this.reset(); }
    }));

    sY += 55;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: 0,
      max: 15,
      value: this.initialVelocity,
      step: 0.5,
      label: 'INITIAL SPEED (v_i)',
      unit: ' m/s',
      accentColor: Colors.purple,
      callback: (val) => { this.initialVelocity = val; this.reset(); }
    }));

    sY += 55;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: 5,
      max: 50,
      value: this.appliedForce,
      step: 1,
      label: 'NET FORCE (F)',
      unit: ' N',
      accentColor: '#EF4444',
      callback: (val) => { this.appliedForce = val; this.reset(); }
    }));

    sY += 55;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: 2,
      max: 15,
      value: this.distance,
      step: 0.5,
      label: 'DISPLACEMENT (d)',
      unit: ' m',
      accentColor: Colors.yellow,
      callback: (val) => { this.distance = val; this.reset(); }
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
    const effectiveDt = this.isSlowMo ? dt * 0.25 : dt;
    this.controlBar.setRunning(this.isRunning);

    if (this.isRunning) {
      this.time += effectiveDt;
      const acc = this.appliedForce / this.mass;
      this.velocity += acc * effectiveDt;
      this.pos += this.velocity * effectiveDt;

      if (this.pos >= this.distance) {
        this.pos = this.distance;
        this.isRunning = false;
      }
    }

    if (this.modal.isOpen) {
      this.modal.update(dt, this.inputManager);
      return;
    }

    this.controlBar.update(dt, this.inputManager);
    for (const s of this.sliders) s.update(dt, this.inputManager);

    // Final theoretical velocity: v_f = sqrt(v_i^2 + 2*a*d)
    const acc = this.appliedForce / this.mass;
    const finalVTheoretical = Math.sqrt(this.initialVelocity * this.initialVelocity + 2 * acc * this.distance);
    const netWork = this.appliedForce * this.distance;

    const check = WorkEnergyPhysics.checkWorkEnergyTheorem(
      this.mass,
      this.initialVelocity,
      finalVTheoretical,
      netWork
    );

    this.dataPanel.setItems([
      { label: 'Initial KE (K_i)', value: check.initialKE.toFixed(2), unit: 'J', color: Colors.purple },
      { label: 'Final KE (K_f)', value: check.finalKE.toFixed(2), unit: 'J', color: Colors.green },
      { label: 'Change in KE (ΔK)', value: check.deltaKE.toFixed(2), unit: 'J', color: Colors.cyan },
      { label: 'Net Work Done (W_net)', value: check.netWork.toFixed(2), unit: 'J', color: Colors.cyan },
      { label: 'Error |W - ΔK|', value: check.difference.toFixed(4), unit: 'J', color: check.isConsistent ? Colors.green : '#EF4444' },
      { label: 'Theorem Agreement', value: check.isConsistent ? 'VERIFIED (ΔK ≈ W)' : 'CALCULATING', unit: '', color: Colors.green }
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
      const startX = this.simRect.x + 80;
      const scale = 25.0;
      const endX = startX + this.distance * scale;
      const curX = startX + this.pos * scale;

      Renderer.drawLine(ctx, this.simRect.x + 20, groundY, this.simRect.x + this.simRect.w - 20, groundY, {
        stroke: Colors.panelBorder,
        lineWidth: 3
      });

      // Target Finish Line
      Renderer.drawLine(ctx, endX, groundY - 80, endX, groundY, {
        stroke: 'rgba(74, 222, 128, 0.4)',
        lineWidth: 2,
        lineDash: [4, 4]
      });

      // Moving Block
      const bw = 65;
      const bh = 45;
      Renderer.drawRoundedRect(ctx, curX - bw / 2, groundY - bh, bw, bh, 6, {
        fill: '#151F30',
        stroke: Colors.cyan,
        lineWidth: 2,
        glowColor: Colors.cyan,
        glowBlur: 10
      });

      Renderer.drawText(ctx, `${this.velocity.toFixed(1)} m/s`, curX, groundY - bh / 2, {
        fill: Colors.text,
        font: 'bold 11px "Segoe UI"',
        align: 'center',
        baseline: 'middle'
      });

      // Vectors
      if (this.controlBar.showVectors) {
        // Applied Force Arrow
        VectorRenderer.drawVector(ctx, curX + bw / 2, groundY - bh / 2, this.appliedForce * 2.0, 0, 1.0, {
          color: '#EF4444',
          label: `F = ${this.appliedForce.toFixed(0)}N`
        });

        // Velocity Arrow
        VectorRenderer.drawVector(ctx, curX, groundY - bh - 15, this.velocity * 4.0, 0, 1.0, {
          color: Colors.cyan,
          label: `v`
        });
      }
    }

    this.modal.render(ctx, width, height);
  }
}
