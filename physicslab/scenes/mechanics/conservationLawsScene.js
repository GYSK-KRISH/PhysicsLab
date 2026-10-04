// Conservation Laws Unified Laboratory Scene for PhysicsLab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Button, Slider } from '../../engine/ui.js';
import { ConservationLawsPhysics } from '../../physics/mechanics/conservation.js';
import { Collision1DPhysics } from '../../physics/mechanics/collision.js';
import { SHMPhysics } from '../../physics/mechanics/shm.js';
import { AngularMomentumPhysics } from '../../physics/mechanics/angularMomentum.js';
import { GraphRenderer } from '../../engine/graphRenderer.js';
import { MechanicsControlBar, MechanicsDataPanel, MechanicsModalOverlay } from '../../engine/mechanicsUI.js';
import { LayoutEngine } from '../../engine/layout.js';

export class ConservationLawsScene {
  constructor() {
    this.conservation = new ConservationLawsPhysics();
    this.activeMode = 'MOMENTUM'; // 'MOMENTUM' | 'ENERGY' | 'ANGULAR'

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
    this.rebuildUI();
  }

  rebuildUI() {
    const { width, height } = this.canvasEngine.getBounds();
    const layout = LayoutEngine.calculateExperimentLayout(width, height);

    this.controlBar.setBounds(layout.toolbarRect.x, layout.toolbarRect.y, layout.toolbarRect.width);

    this.modeButtons = [];
    const modes = [
      { id: 'MOMENTUM', label: 'MOMENTUM', color: Colors.cyan },
      { id: 'ENERGY', label: 'ENERGY', color: Colors.green },
      { id: 'ANGULAR', label: 'ANGULAR L', color: Colors.purple }
    ];

    const modeW = (layout.controlRect.width - 24) / 3;
    for (let i = 0; i < modes.length; i++) {
      const m = modes[i];
      const isSel = this.activeMode === m.id;
      this.modeButtons.push(new Button({
        x: layout.controlRect.x + 12 + i * modeW,
        y: layout.controlRect.y + 10,
        width: modeW - 4,
        height: 28,
        text: m.label,
        accentColor: isSel ? m.color : Colors.panelBorder,
        callback: () => {
          this.activeMode = m.id;
          this.rebuildUI();
        }
      }));
    }

    this.rebuildSliders(layout.controlRect.x, layout.controlRect.y + 44, layout.controlRect.width - 24);

    this.simRect = layout.simRect;
    this.controlRect = layout.controlRect;
    this.dataPanel.setRect(layout.dataRect.x, layout.dataRect.y, layout.dataRect.width, layout.dataRect.height);
    this.graph.setRect(layout.graphRect.x, layout.graphRect.y, layout.graphRect.width, layout.graphRect.height);
  }

  rebuildSliders(sidebarX, startY, sW) {
    this.sliders = [];
    let sY = startY;

    if (this.activeMode === 'MOMENTUM') {
      this.sliders.push(new Slider({
        x: sidebarX + 12,
        y: sY,
        width: sW,
        min: 1.0,
        max: 8.0,
        value: this.collisionPhysics.m1 || 3.0,
        step: 0.5,
        label: 'MASS 1 (m₁)',
        unit: ' kg',
        accentColor: Colors.cyan,
        callback: (val) => {
          this.collisionPhysics.m1 = val;
          this.collisionPhysics.recalculate();
        }
      }));
      sY += 44;
      this.sliders.push(new Slider({
        x: sidebarX + 12,
        y: sY,
        width: sW,
        min: 1.0,
        max: 8.0,
        value: this.collisionPhysics.m2 || 2.0,
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
        x: sidebarX + 12,
        y: sY,
        width: sW,
        min: 10,
        max: 100,
        value: this.shmPhysics.springConstant || 40.0,
        step: 5,
        label: 'SPRING CONSTANT (k)',
        unit: ' N/m',
        accentColor: Colors.green,
        callback: (val) => this.shmPhysics.setParameters(this.shmPhysics.mass, val, this.shmPhysics.amplitude)
      }));
    } else {
      this.sliders.push(new Slider({
        x: sidebarX + 12,
        y: sY,
        width: sW,
        min: 1.0,
        max: 6.0,
        value: this.angularPhysics.initialRadius || 3.0,
        step: 0.2,
        label: 'INITIAL RADIUS (R₀)',
        unit: ' m',
        accentColor: Colors.purple,
        callback: (val) => this.angularPhysics.setParameters(this.angularPhysics.mass, val, this.angularPhysics.initialOmega)
      }));
    }
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
    this.stepActive(effectiveDt);

    let isRunning = false;
    if (this.activeMode === 'MOMENTUM') {
      isRunning = this.collisionPhysics.isRunning;
      const initialP = this.collisionPhysics.initialMomentum || 0;
      const currentP = (this.collisionPhysics.m1 || 1) * (this.collisionPhysics.v1 || 0) + (this.collisionPhysics.m2 || 1) * (this.collisionPhysics.v2 || 0);

      this.dataPanel.setItems([
        { label: 'Initial Momentum (p₀)', value: initialP.toFixed(2), unit: 'kg·m/s', color: Colors.cyan },
        { label: 'Current Momentum (p)', value: currentP.toFixed(2), unit: 'kg·m/s', color: Colors.cyan },
        { label: 'Momentum Error Δp', value: Math.abs(currentP - initialP).toFixed(4), unit: 'kg·m/s', color: Colors.green }
      ]);
    } else if (this.activeMode === 'ENERGY') {
      isRunning = this.shmPhysics.isRunning;
      const st = this.shmPhysics.getCurrentState();
      this.dataPanel.setItems([
        { label: 'Kinetic Energy (KE)', value: (st.ke || 0).toFixed(2), unit: 'J', color: Colors.cyan },
        { label: 'Potential Energy (PE)', value: (st.pe || 0).toFixed(2), unit: 'J', color: Colors.green },
        { label: 'Total Mechanical (E)', value: (st.totalE || 0).toFixed(2), unit: 'J', color: Colors.yellow }
      ]);
    } else {
      isRunning = this.angularPhysics.isRunning;
      this.dataPanel.setItems([
        { label: 'Initial Angular L₀', value: (this.angularPhysics.initialL || 0).toFixed(2), unit: 'kg·m²/s', color: Colors.purple },
        { label: 'Current Angular L', value: (this.angularPhysics.currentL || 0).toFixed(2), unit: 'kg·m²/s', color: Colors.purple },
        { label: 'Angular Velocity (ω)', value: (this.angularPhysics.currentOmega || 0).toFixed(2), unit: 'rad/s', color: Colors.cyan }
      ]);
    }

    this.controlBar.setRunning(isRunning);

    if (this.modal.isOpen) {
      this.modal.update(dt, this.inputManager);
      return;
    }

    this.controlBar.update(dt, this.inputManager);
    for (const b of this.modeButtons) b.update(dt, this.inputManager);
    for (const s of this.sliders) s.update(dt, this.inputManager);
  }

  render(ctx) {
    const { width, height } = this.canvasEngine.getBounds();

    Renderer.drawRect(ctx, 0, 0, width, height, { fill: Colors.background });
    Renderer.drawGrid(ctx, width, height, 40);

    this.controlBar.render(ctx);

    if (this.controlRect) {
      Renderer.drawPanel(ctx, this.controlRect.x, this.controlRect.y, this.controlRect.width, this.controlRect.height, {
        fill: Colors.panel,
        stroke: Colors.panelBorder
      });
      for (const b of this.modeButtons) b.render(ctx);
      for (const s of this.sliders) s.render(ctx);
    }

    this.dataPanel.render(ctx);

    if (this.simRect) {
      Renderer.drawPanel(ctx, this.simRect.x, this.simRect.y, this.simRect.width, this.simRect.height, {
        fill: '#090E1A',
        stroke: Colors.panelBorder
      });
    }

    this.graph.render(ctx);
    this.modal.render(ctx, width, height);
  }
}
