// Conservation Laws Unified Laboratory Scene for PhysicsLab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Button, Slider } from '../../engine/ui.js';
import { ConservationLawsPhysics } from '../../physics/mechanics/conservation.js';
import { Collision1DPhysics } from '../../physics/mechanics/collision.js';
import { SHMPhysics } from '../../physics/mechanics/shm.js';
import { AngularMomentumPhysics } from '../../physics/mechanics/angularMomentum.js';
import { GraphRenderer } from '../../engine/graphRenderer.js';
import { MechanicsControlBar, MechanicsDataPanel, MechanicsModalOverlay } from '../../engine/mechanicsUI.js';

export class ConservationLawsScene {
  constructor() {
    this.conservation = new ConservationLawsPhysics();
    this.activeMode = 'MOMENTUM'; // 'MOMENTUM' | 'ENERGY' | 'ANGULAR'

    // Sub-simulators
    this.collisionPhysics = new Collision1DPhysics({ m1: 3.0, u1: 8.0, m2: 2.0, u2: -4.0, restitution: 1.0 });
    this.shmPhysics = new SHMPhysics({ mass: 2.0, springConstant: 40.0, amplitude: 5.0 });
    this.angularPhysics = new AngularMomentumPhysics({ mass: 4.0, initialRadius: 3.0, initialOmega: 2.0 });

    this.controlBar = new MechanicsControlBar({
      onPlay: () => this.startActive(),
      onPause: () => this.pauseActive(),
      onReset: () => this.resetActive(),
      onStepForward: () => this.stepActive(0.05),
      onToggleSlowMo: () => {
        this.isSlowMo = !this.isSlowMo;
        this.controlBar.setSlowMo(this.isSlowMo);
      },
      onOpenFormula: () => this.modal.openFormula('CONSERVATION LAWS', [
        { name: 'Conservation of Linear Momentum', formula: 'Σp_initial = Σp_final', desc: 'Total momentum remains constant in isolated systems with zero external net force' },
        { name: 'Conservation of Mechanical Energy', formula: 'E_mech = KE + PE = Constant', desc: 'Holds true in conservative force fields (gravity, ideal springs)' },
        { name: 'Conservation of Angular Momentum', formula: 'L = I₁·ω₁ = I₂·ω₂ = Constant', desc: 'Total angular momentum is conserved when external net torque τ_ext = 0' }
      ]),
      onOpenConcept: () => this.modal.openConcept('FUNDAMENTAL CONSERVATION LAWS', {
        what: 'Conservation laws state that measurable physical properties of an isolated physical system remain unchanged as the system evolves over time.',
        how: 'By Noether\'s Theorem, conservation of momentum arises from spatial translation symmetry, energy conservation from time translation symmetry, and angular momentum conservation from rotational symmetry.',
        keyIdea: 'Conservation laws are the most fundamental, universal principles across classical mechanics, astrophysics, and quantum physics.'
      }),
      onOpenProblem: () => this.modal.openProblem('MOMENTUM_1D'),
      onBack: () => {
        import('./mechanicsMenuScene.js').then(m => this.sceneManager.changeScene(new m.MechanicsMenuScene()));
      }
    });

    this.dataPanel = new MechanicsDataPanel({ title: 'CONSERVATION AUDIT' });
    this.modal = new MechanicsModalOverlay();
    this.graph = new GraphRenderer({
      title: 'Conserved Quantity vs Time (Continuity Verification)',
      xLabel: 'Time',
      xUnit: 's',
      yLabel: 'Quantity Value',
      yUnit: 'SI Units'
    });

    this.modeButtons = [];
    this.sliders = [];
    this.isSlowMo = false;
    this.lastWidth = 0;
    this.lastHeight = 0;
  }

  startActive() {
    if (this.activeMode === 'MOMENTUM') this.collisionPhysics.start();
    else if (this.activeMode === 'ENERGY') this.shmPhysics.start();
    else this.angularPhysics.start();
  }

  pauseActive() {
    if (this.activeMode === 'MOMENTUM') this.collisionPhysics.pause();
    else if (this.activeMode === 'ENERGY') this.shmPhysics.pause();
    else this.angularPhysics.pause();
  }

  resetActive() {
    if (this.activeMode === 'MOMENTUM') this.collisionPhysics.reset();
    else if (this.activeMode === 'ENERGY') this.shmPhysics.reset();
    else this.angularPhysics.reset();
  }

  stepActive(dt) {
    if (this.activeMode === 'MOMENTUM') this.collisionPhysics.update(dt);
    else if (this.activeMode === 'ENERGY') this.shmPhysics.update(dt);
    else this.angularPhysics.update(dt);
  }

  init() {
    this.startActive();
    this.rebuildUI();
  }

  rebuildUI() {
    const { width, height } = this.canvasEngine.getBounds();
    this.controlBar.setBounds(20, 12, width - 40);

    const sidebarW = Math.max(260, Math.min(320, width * 0.28));
    const sidebarX = width - sidebarW - 20;
    const contentY = 64;
    const contentH = height - contentY - 20;

    this.modeButtons = [];
    this.sliders = [];
    let sY = contentY + 15;
    const sW = sidebarW - 40;

    const btnW = (sW - 8) / 3;
    const modes = [
      { id: 'MOMENTUM', label: 'MOMENTUM' },
      { id: 'ENERGY', label: 'ENERGY' },
      { id: 'ANGULAR', label: 'ANGULAR' }
    ];

    modes.forEach((m, idx) => {
      this.modeButtons.push(new Button({
        x: sidebarX + 20 + idx * (btnW + 4),
        y: sY,
        width: btnW,
        height: 28,
        text: m.label,
        color: this.activeMode === m.id ? '#0284C7' : '#334155',
        callback: () => {
          this.activeMode = m.id;
          this.updateModeBtnColors();
          this.rebuildSliders(sidebarX, contentY, sW);
        }
      }));
    });

    this.rebuildSliders(sidebarX, contentY, sW);

    this.sidebarRect = { x: sidebarX, y: contentY, w: sidebarW, h: contentH };
    this.dataPanel.setRect(sidebarX, contentY + 230, sidebarW, contentH - 230);

    const mainW = sidebarX - 40;
    const simH = Math.floor(contentH * 0.44);
    const graphH = contentH - simH - 15;

    this.simRect = { x: 20, y: contentY, w: mainW, h: simH };
    this.graph.setRect(20, contentY + simH + 15, mainW, graphH);
  }

  rebuildSliders(sidebarX, contentY, sW) {
    this.sliders = [];
    let sY = contentY + 60;

    if (this.activeMode === 'MOMENTUM') {
      this.sliders.push(new Slider({
        x: sidebarX + 20,
        y: sY,
        width: sW,
        min: 1.0,
        max: 8.0,
        value: this.collisionPhysics.m1,
        step: 0.5,
        label: 'MASS 1 (m₁)',
        unit: ' kg',
        accentColor: Colors.cyan,
        callback: (val) => {
          this.collisionPhysics.m1 = val;
          this.collisionPhysics.recalculate();
        }
      }));
      sY += 55;
      this.sliders.push(new Slider({
        x: sidebarX + 20,
        y: sY,
        width: sW,
        min: 1.0,
        max: 8.0,
        value: this.collisionPhysics.m2,
        step: 0.5,
        label: 'MASS 2 (m₂)',
        unit: ' kg',
        accentColor: '#EC4899',
        callback: (val) => {
          this.collisionPhysics.m2 = val;
          this.collisionPhysics.recalculate();
        }
      }));
    } else if (this.activeMode === 'ENERGY') {
      this.sliders.push(new Slider({
        x: sidebarX + 20,
        y: sY,
        width: sW,
        min: 10,
        max: 100,
        value: this.shmPhysics.springConstant,
        step: 5,
        label: 'SPRING CONST (k)',
        unit: ' N/m',
        accentColor: Colors.yellow,
        callback: (val) => this.shmPhysics.setParameters(this.shmPhysics.mass, val, this.shmPhysics.amplitude)
      }));
      sY += 55;
      this.sliders.push(new Slider({
        x: sidebarX + 20,
        y: sY,
        width: sW,
        min: 1.0,
        max: 10.0,
        value: this.shmPhysics.amplitude,
        step: 0.5,
        label: 'AMPLITUDE (A)',
        unit: ' m',
        accentColor: Colors.cyan,
        callback: (val) => this.shmPhysics.setParameters(this.shmPhysics.mass, this.shmPhysics.springConstant, val)
      }));
    } else {
      this.sliders.push(new Slider({
        x: sidebarX + 20,
        y: sY,
        width: sW,
        min: 1.0,
        max: 6.0,
        value: this.angularPhysics.initialRadius,
        step: 0.2,
        label: 'INITIAL RADIUS (R₀)',
        unit: ' m',
        accentColor: '#A855F7',
        callback: (val) => this.angularPhysics.setParameters(this.angularPhysics.mass, val, this.angularPhysics.initialOmega)
      }));
    }
  }

  updateModeBtnColors() {
    const ids = ['MOMENTUM', 'ENERGY', 'ANGULAR'];
    this.modeButtons.forEach((btn, idx) => {
      btn.color = (this.activeMode === ids[idx]) ? '#0284C7' : '#334155';
    });
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
      return;
    }
    for (const btn of this.modeButtons) {
      btn.handleInput(inputManager);
    }
  }

  update(dt) {
    const effectiveDt = this.isSlowMo ? dt * 0.25 : dt;
    this.stepActive(effectiveDt);

    let isRunning = false;
    if (this.activeMode === 'MOMENTUM') {
      isRunning = this.collisionPhysics.isRunning;
      const initialP = this.collisionPhysics.initialMomentum;
      const currentP = this.collisionPhysics.m1 * this.collisionPhysics.v1 + this.collisionPhysics.m2 * this.collisionPhysics.v2;
      const check = ConservationLawsPhysics.verifyMomentumConservation(initialP, currentP);

      this.dataPanel.setMetrics([
        { label: 'Initial Momentum (p₀)', value: `${initialP.toFixed(2)} kg·m/s` },
        { label: 'Current Momentum (p)', value: `${currentP.toFixed(2)} kg·m/s` },
        { label: 'Absolute Difference', value: `${check.diff.toFixed(4)} kg·m/s` },
        { label: 'Relative Error', value: `${check.relativeError.toFixed(3)}%` },
        { label: 'Conservation Status', value: check.isConserved ? '✅ PERFECTLY CONSERVED' : '⚠️ VIOLATION' }
      ]);

      if (this.collisionPhysics.history.length > 1) {
        const p1Ds = this.collisionPhysics.history.map(h => ({ x: h.t, y: this.collisionPhysics.m1 * h.v1 }));
        const p2Ds = this.collisionPhysics.history.map(h => ({ x: h.t, y: this.collisionPhysics.m2 * h.v2 }));
        const pTotDs = this.collisionPhysics.history.map(h => ({ x: h.t, y: this.collisionPhysics.m1 * h.v1 + this.collisionPhysics.m2 * h.v2 }));

        this.graph.setDatasets([
          { label: 'Total Momentum p_tot', data: pTotDs, color: '#10B981', width: 2.5 },
          { label: 'Cart 1 p₁', data: p1Ds, color: Colors.cyan, width: 1.5 },
          { label: 'Cart 2 p₂', data: p2Ds, color: '#EC4899', width: 1.5 }
        ]);
      }
    } else if (this.activeMode === 'ENERGY') {
      isRunning = this.shmPhysics.isRunning;
      const state = this.shmPhysics.getCurrentState();
      const initialE = this.shmPhysics.totalEnergy;
      const currentE = state.totalE;
      const check = ConservationLawsPhysics.verifyEnergyConservation(initialE, currentE);

      this.dataPanel.setMetrics([
        { label: 'Total Mechanical E₀', value: `${initialE.toFixed(2)} J` },
        { label: 'Current Total E(t)', value: `${currentE.toFixed(2)} J` },
        { label: 'Kinetic Energy (KE)', value: `${state.ke.toFixed(2)} J` },
        { label: 'Potential Energy (PE)', value: `${state.pe.toFixed(2)} J` },
        { label: 'Numerical Error', value: `${check.relativeError.toFixed(3)}%` },
        { label: 'Conservation Status', value: check.isConserved ? '✅ CONSTANT TOTAL ENERGY' : '⚠️ VIOLATION' }
      ]);

      if (this.shmPhysics.history.length > 1) {
        const keDs = this.shmPhysics.history.map(h => ({ x: h.t, y: h.ke }));
        const peDs = this.shmPhysics.history.map(h => ({ x: h.t, y: h.pe }));
        const totDs = this.shmPhysics.history.map(h => ({ x: h.t, y: h.totalE }));

        this.graph.setDatasets([
          { label: 'Total Energy E_tot', data: totDs, color: '#10B981', width: 2.5 },
          { label: 'Kinetic Energy KE', data: keDs, color: Colors.cyan, width: 1.5 },
          { label: 'Potential Energy PE', data: peDs, color: Colors.yellow, width: 1.5 }
        ]);
      }
    } else {
      isRunning = this.angularPhysics.isRunning;
      const initialL = this.angularPhysics.initialL;
      const currentL = this.angularPhysics.currentL;
      const check = ConservationLawsPhysics.verifyAngularMomentumConservation(initialL, currentL);

      this.dataPanel.setMetrics([
        { label: 'Initial Angular Mom (L₀)', value: `${initialL.toFixed(2)} kg·m²/s` },
        { label: 'Current Angular Mom (L)', value: `${currentL.toFixed(2)} kg·m²/s` },
        { label: 'Current Radius (r)', value: `${this.angularPhysics.currentRadius.toFixed(2)} m` },
        { label: 'Current Speed (ω)', value: `${this.angularPhysics.currentOmega.toFixed(2)} rad/s` },
        { label: 'Numerical Error', value: `${check.relativeError.toFixed(3)}%` },
        { label: 'Conservation Status', value: check.isConserved ? '✅ L = I·ω CONSTANT' : '⚠️ VIOLATION' }
      ]);

      if (this.angularPhysics.history.length > 1) {
        const lDs = this.angularPhysics.history.map(h => ({ x: h.t, y: h.l }));
        const wDs = this.angularPhysics.history.map(h => ({ x: h.t, y: h.omega }));

        this.graph.setDatasets([
          { label: 'Angular Momentum L(t)', data: lDs, color: '#10B981', width: 2.5 },
          { label: 'Angular Velocity ω(t)', data: wDs, color: '#A855F7', width: 1.5 }
        ]);
      }
    }

    this.controlBar.setRunning(isRunning);
  }

  render(ctx) {
    Renderer.drawRect(ctx, 0, 0, ctx.canvas.width, ctx.canvas.height, { fill: Colors.bgDark });

    this.controlBar.render(ctx);

    // Sidebar
    Renderer.drawCard(ctx, this.sidebarRect.x, this.sidebarRect.y, this.sidebarRect.w, this.sidebarRect.h, {
      title: 'CONSERVATION MODE',
      accentColor: '#10B981'
    });

    for (const btn of this.modeButtons) {
      btn.render(ctx);
    }
    for (const slider of this.sliders) {
      slider.render(ctx);
    }
    this.dataPanel.render(ctx);

    // Simulation Viewport
    Renderer.drawCard(ctx, this.simRect.x, this.simRect.y, this.simRect.w, this.simRect.h, {
      title: `CONSERVATION LABORATORY — ${this.activeMode} SYSTEM`,
      accentColor: '#10B981'
    });

    this.renderActiveSim(ctx);

    // Graph
    this.graph.render(ctx);

    // Modal
    this.modal.render(ctx);
  }

  renderActiveSim(ctx) {
    const cx = this.simRect.x + this.simRect.w * 0.5;
    const cy = this.simRect.y + this.simRect.h * 0.55;

    if (this.activeMode === 'MOMENTUM') {
      // Draw track
      Renderer.drawLine(ctx, this.simRect.x + 30, cy + 30, this.simRect.x + this.simRect.w - 30, cy + 30, {
        color: '#64748B',
        width: 3
      });

      // Scale 1 m = 16 px
      const s = 16;
      const x1 = cx + this.collisionPhysics.pos1 * s;
      const x2 = cx + this.collisionPhysics.pos2 * s;

      // Cart 1
      Renderer.drawRect(ctx, x1 - 25, cy - 10, 50, 35, { fill: '#0284C7', stroke: Colors.cyan, width: 2, radius: 4 });
      Renderer.drawText(ctx, `${this.collisionPhysics.m1}kg`, x1, cy + 12, { color: '#FFFFFF', size: 11, align: 'center', weight: 'bold' });

      // Cart 2
      Renderer.drawRect(ctx, x2 - 25, cy - 10, 50, 35, { fill: '#BE185D', stroke: '#EC4899', width: 2, radius: 4 });
      Renderer.drawText(ctx, `${this.collisionPhysics.m2}kg`, x2, cy + 12, { color: '#FFFFFF', size: 11, align: 'center', weight: 'bold' });
    } else if (this.activeMode === 'ENERGY') {
      // Draw spring and mass
      const wallX = this.simRect.x + 40;
      Renderer.drawRect(ctx, wallX - 10, cy - 40, 10, 80, { fill: '#334155' });
      Renderer.drawLine(ctx, wallX, cy + 25, this.simRect.x + this.simRect.w - 30, cy + 25, { color: '#475569', width: 2 });

      const state = this.shmPhysics.getCurrentState();
      const blockX = cx + state.x * 16;
      const blockW = 50;

      // Draw spring
      const numCoils = 12;
      const springLen = blockX - blockW / 2 - wallX;
      ctx.beginPath();
      ctx.strokeStyle = Colors.yellow;
      ctx.lineWidth = 2.5;
      ctx.moveTo(wallX, cy);
      for (let i = 0; i <= numCoils; i++) {
        const x = wallX + (springLen / numCoils) * i;
        const y = cy + (i % 2 === 0 ? -10 : 10);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(blockX - blockW / 2, cy);
      ctx.stroke();

      Renderer.drawRect(ctx, blockX - blockW / 2, cy - 25, blockW, 50, { fill: '#0284C7', stroke: Colors.cyan, width: 2, radius: 4 });
      Renderer.drawText(ctx, `${this.shmPhysics.mass}kg`, blockX, cy + 4, { color: '#FFFFFF', size: 11, align: 'center', weight: 'bold' });
    } else {
      // Angular momentum circle
      const rPx = this.angularPhysics.currentRadius * 24;
      Renderer.drawCircle(ctx, cx, cy, rPx, { stroke: '#475569', width: 1, dash: [4, 4] });
      Renderer.drawCircle(ctx, cx, cy, 5, { fill: '#94A3B8' });

      // Mass orbiting
      const angle = this.angularPhysics.angle;
      const mx = cx + rPx * Math.cos(angle);
      const my = cy + rPx * Math.sin(angle);

      Renderer.drawLine(ctx, cx, cy, mx, my, { color: '#A855F7', width: 2 });
      Renderer.drawCircle(ctx, mx, my, 12, { fill: '#8B5CF6', stroke: '#DDD6FE', width: 2 });
      Renderer.drawText(ctx, `${this.angularPhysics.mass}kg`, mx, my - 16, { color: '#DDD6FE', size: 11, align: 'center', weight: 'bold' });
    }
  }
}
