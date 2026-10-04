// Superposition & Interference Laboratory Scene for PhysicsLab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Slider } from '../../engine/ui.js';
import { SuperpositionPhysics } from '../../physics/mechanics/waves.js';
import { GraphRenderer } from '../../engine/graphRenderer.js';
import { MechanicsControlBar, MechanicsDataPanel, MechanicsModalOverlay } from '../../engine/mechanicsUI.js';
import { LayoutEngine } from '../../engine/layout.js';

export class SuperpositionScene {
  constructor() {
    this.physics = new SuperpositionPhysics({
      a1: 2.0, f1: 1.0, phi1: 0,
      a2: 2.0, f2: 1.0, phi2: Math.PI / 2
    });

    this.controlBar = new MechanicsControlBar({
      onPlay: () => this.physics.start(),
      onPause: () => this.physics.pause(),
      onReset: () => this.physics.reset(),
      onStepForward: () => this.physics.update(0.05),
      onToggleSlowMo: () => {
        this.isSlowMo = !this.isSlowMo;
        this.controlBar.setSlowMo(this.isSlowMo);
      },
      onOpenFormula: () => this.modal.openFormula('SUPERPOSITION PRINCIPLE', [
        { name: 'Superposition Principle', formula: 'y_net(x, t) = y₁(x, t) + y₂(x, t)', desc: 'Net displacement is the algebraic vector sum of individual wave displacements' },
        { name: 'Phase Difference Δφ', formula: 'Δφ = (k₂x - ω₂t + φ₂) - (k₁x - ω₁t + φ₁)', desc: 'Determines constructive vs destructive interference' },
        { name: 'Constructive Condition', formula: 'Δφ = 2n·π (n = 0, 1, 2...)', desc: 'Waves add in phase producing maximum amplitude A_max = A₁ + A₂' },
        { name: 'Destructive Condition', formula: 'Δφ = (2n + 1)·π', desc: 'Waves add out of phase producing minimum amplitude A_min = |A₁ - A₂|' }
      ]),
      onOpenConcept: () => this.modal.openConcept('SUPERPOSITION & INTERFERENCE', {
        what: 'When two or more waves travel through the same medium simultaneously, the resultant displacement at any point is the sum of displacements produced by each wave.',
        how: 'If crest meets crest, constructive interference amplifies the signal. If crest meets trough, destructive interference cancels the wave.',
        keyIdea: 'Overlapping waves pass through each other without altering their individual speeds, wavelengths, or characteristic profiles.'
      }),
      onOpenProblem: () => this.modal.openProblem('WAVE_SUPERPOSITION'),
      onBack: () => {
        import('./mechanicsMenuScene.js').then(m => this.sceneManager.changeScene(new m.MechanicsMenuScene()));
      }
    });

    this.dataPanel = new MechanicsDataPanel({ title: 'INTERFERENCE DATA' });
    this.modal = new MechanicsModalOverlay();
    this.graph = new GraphRenderer({
      title: 'Resultant Wave y_net(x) vs Component Waves',
      xLabel: 'Position x',
      xUnit: 'm',
      yLabel: 'Displacement y',
      yUnit: 'm'
    });

    this.sliders = [];
    this.isSlowMo = false;
    this.lastWidth = 0;
    this.lastHeight = 0;
  }

  init() {
    this.physics.start();
    this.rebuildUI();
  }

  rebuildUI() {
    const { width, height } = this.canvasEngine.getBounds();
    const layout = LayoutEngine.calculateExperimentLayout(width, height);

    this.controlBar.setBounds(layout.toolbarRect.x, layout.toolbarRect.y, layout.toolbarRect.width);

    this.sliders = [];
    let sY = layout.controlRect.y + 16;
    const sW = layout.controlRect.width - 24;

    this.sliders.push(new Slider({
      x: layout.controlRect.x + 12,
      y: sY,
      width: sW,
      min: 0.5,
      max: 4.0,
      value: this.physics.a1 || 2.0,
      step: 0.2,
      label: 'WAVE 1 AMP (A₁)',
      unit: ' m',
      accentColor: Colors.cyan,
      callback: (val) => this.physics.setWave1(val, this.physics.f1, this.physics.phi1)
    }));

    sY += 44;
    this.sliders.push(new Slider({
      x: layout.controlRect.x + 12,
      y: sY,
      width: sW,
      min: 0.5,
      max: 4.0,
      value: this.physics.a2 || 2.0,
      step: 0.2,
      label: 'WAVE 2 AMP (A₂)',
      unit: ' m',
      accentColor: Colors.green,
      callback: (val) => this.physics.setWave2(val, this.physics.f2, this.physics.phi2)
    }));

    sY += 44;
    this.sliders.push(new Slider({
      x: layout.controlRect.x + 12,
      y: sY,
      width: sW,
      min: 0,
      max: 180,
      value: (this.physics.phi2 * 180 / Math.PI) || 90,
      step: 15,
      label: 'PHASE SHIFT (Δφ)',
      unit: '°',
      accentColor: Colors.purple,
      callback: (deg) => this.physics.setWave2(this.physics.a2, this.physics.f2, (deg * Math.PI) / 180)
    }));

    this.simRect = layout.simRect;
    this.controlRect = layout.controlRect;
    this.dataPanel.setRect(layout.dataRect.x, layout.dataRect.y, layout.dataRect.width, layout.dataRect.height);
    this.graph.setRect(layout.graphRect.x, layout.graphRect.y, layout.graphRect.width, layout.graphRect.height);
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

    const phiDeg = ((this.physics.phi2 - this.physics.phi1) * 180 / Math.PI) % 360;
    const interType = Math.abs(phiDeg) < 15 ? 'CONSTRUCTIVE' : (Math.abs(phiDeg - 180) < 15 ? 'DESTRUCTIVE' : 'PARTIAL');

    this.dataPanel.setItems([
      { label: 'Wave 1 Amplitude', value: (this.physics.a1 || 0).toFixed(1), unit: 'm', color: Colors.cyan },
      { label: 'Wave 2 Amplitude', value: (this.physics.a2 || 0).toFixed(1), unit: 'm', color: Colors.green },
      { label: 'Phase Difference', value: phiDeg.toFixed(0), unit: '°', color: Colors.purple },
      { label: 'Interference Type', value: interType, unit: '', color: interType === 'CONSTRUCTIVE' ? Colors.cyan : Colors.yellow }
    ]);

    const maxDist = 20.0;
    const steps = 60;
    const w1Pts = [], w2Pts = [], netPts = [];

    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * maxDist;
      const res = this.physics.getDisplacementsAt(x);
      w1Pts.push({ x, y: res.y1 });
      w2Pts.push({ x, y: res.y2 });
      netPts.push({ x, y: res.yNet });
    }

    this.graph.clearDatasets();
    this.graph.addDataset({ label: 'Wave 1 y₁(x)', color: Colors.cyan, points: w1Pts });
    this.graph.addDataset({ label: 'Wave 2 y₂(x)', color: Colors.green, points: w2Pts });
    this.graph.addDataset({ label: 'Resultant y_net(x)', color: Colors.yellow, points: netPts, lineWidth: 2.5 });
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
