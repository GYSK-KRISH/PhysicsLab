// Mechanical Resonance Laboratory Scene for PhysicsLab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Slider } from '../../engine/ui.js';
import { ForcedOscillationPhysics } from '../../physics/mechanics/shm.js';
import { GraphRenderer } from '../../engine/graphRenderer.js';
import { MechanicsControlBar, MechanicsDataPanel, MechanicsModalOverlay } from '../../engine/mechanicsUI.js';
import { LayoutEngine } from '../../engine/layout.js';

export class ResonanceScene {
  constructor() {
    this.physics = new ForcedOscillationPhysics({
      mass: 1.0,
      springConstant: 40.0,
      damping: 0.4,
      f0: 15.0,
      drivingOmega: 6.32
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
      onOpenFormula: () => this.modal.openFormula('RESONANCE & RESPONSE CURVE', [
        { name: 'Resonance Condition', formula: 'ω_res = √(ω₀² - 2·γ²)', desc: 'Driving frequency that produces peak steady-state amplitude' },
        { name: 'Quality Factor Q', formula: 'Q = (m·ω₀) / c = ω₀ / (2·γ)', desc: 'Dimensionless parameter measuring resonance sharpness and damping energy loss' },
        { name: 'Resonance Amplitude Peak', formula: 'A_max ≈ (F₀ · Q) / k', desc: 'Maximum response amplitude at resonance' }
      ]),
      onOpenConcept: () => this.modal.openConcept('MECHANICAL RESONANCE', {
        what: 'Resonance occurs when an oscillating system is driven at a frequency equal or very close to its natural frequency.',
        how: 'Energy transfer from driver to oscillator reaches maximum efficiency. Light damping yields an extremely sharp, high-amplitude peak.',
        keyIdea: 'Uncontrolled resonance can cause structural failure in bridges, buildings, and mechanical systems (e.g. Tacoma Narrows Bridge collapse).'
      }),
      onOpenProblem: () => this.modal.openProblem('RESONANCE_PEAK'),
      onBack: () => {
        import('./mechanicsMenuScene.js').then(m => this.sceneManager.changeScene(new m.MechanicsMenuScene()));
      }
    });

    this.dataPanel = new MechanicsDataPanel({ title: 'RESONANCE DATA' });
    this.modal = new MechanicsModalOverlay();
    this.graph = new GraphRenderer({
      title: 'Resonance Response Curve A(ω) vs Driving Frequency',
      xLabel: 'Driving Frequency ω',
      xUnit: 'rad/s',
      yLabel: 'Steady Amplitude A',
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
      min: 1.0,
      max: 15.0,
      value: this.physics.drivingOmega || 6.32,
      step: 0.1,
      label: 'DRIVING FREQ (ω)',
      unit: ' rad/s',
      accentColor: Colors.purple,
      callback: (val) => this.physics.setParameters(this.physics.mass, this.physics.springConstant, this.physics.damping, this.physics.f0, val)
    }));

    sY += 44;
    this.sliders.push(new Slider({
      x: layout.controlRect.x + 12,
      y: sY,
      width: sW,
      min: 0.05,
      max: 2.0,
      value: this.physics.damping || 0.4,
      step: 0.05,
      label: 'DAMPING (c)',
      unit: ' N·s/m',
      accentColor: Colors.yellow,
      callback: (val) => this.physics.setParameters(this.physics.mass, this.physics.springConstant, val, this.physics.f0, this.physics.drivingOmega)
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

    const w0 = this.physics.naturalOmega || 6.32;
    const qFactor = (this.physics.mass * w0) / (this.physics.damping || 0.4);

    this.dataPanel.setItems([
      { label: 'Natural Freq (ω₀)', value: w0.toFixed(2), unit: 'rad/s', color: Colors.cyan },
      { label: 'Driving Freq (ω)', value: (this.physics.drivingOmega || 0).toFixed(2), unit: 'rad/s', color: Colors.purple },
      { label: 'Quality Factor Q', value: qFactor.toFixed(1), unit: '', color: Colors.green },
      { label: 'Steady State Amp', value: (this.physics.steadyStateAmplitude || 0).toFixed(2), unit: 'm', color: Colors.yellow },
      { label: 'Resonance Peak', value: this.physics.isAtResonance ? 'ACTIVE RESONANCE!' : 'OFF-PEAK', color: this.physics.isAtResonance ? '#EF4444' : Colors.textMuted }
    ]);

    const curvePts = [];
    for (let w = 1.0; w <= 15.0; w += 0.2) {
      const amp = (this.physics.f0 / this.physics.mass) / Math.sqrt(Math.pow(w0 * w0 - w * w, 2) + Math.pow((this.physics.damping / this.physics.mass) * w, 2));
      curvePts.push({ x: w, y: amp });
    }

    this.graph.clearDatasets();
    this.graph.addDataset({ label: 'Resonance Curve A(ω)', color: Colors.cyan, points: curvePts, lineWidth: 2 });
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
