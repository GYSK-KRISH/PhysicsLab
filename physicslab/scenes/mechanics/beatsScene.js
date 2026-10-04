// Beats & Envelope Interference Laboratory Scene for PhysicsLab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Slider } from '../../engine/ui.js';
import { BeatsPhysics } from '../../physics/mechanics/waves.js';
import { GraphRenderer } from '../../engine/graphRenderer.js';
import { MechanicsControlBar, MechanicsDataPanel, MechanicsModalOverlay } from '../../engine/mechanicsUI.js';
import { LayoutEngine } from '../../engine/layout.js';

export class BeatsScene {
  constructor() {
    this.physics = new BeatsPhysics({ f1: 256.0, f2: 262.0, amplitude: 2.0 });

    this.controlBar = new MechanicsControlBar({
      onPlay: () => this.physics.start(),
      onPause: () => this.physics.pause(),
      onReset: () => this.physics.reset(),
      onStepForward: () => this.physics.update(0.05),
      onToggleSlowMo: () => {
        this.isSlowMo = !this.isSlowMo;
        this.controlBar.setSlowMo(this.isSlowMo);
      },
      onOpenFormula: () => this.modal.openFormula('BEAT FREQUENCY & ENVELOPE', [
        { name: 'Beat Frequency Formula', formula: 'f_beat = |f₁ - f₂|', desc: 'Number of amplitude intensity pulses per second' },
        { name: 'Carrier Frequency', formula: 'f_carrier = (f₁ + f₂) / 2', desc: 'Average pitch frequency inside modulation envelope' },
        { name: 'Amplitude Modulation Envelope', formula: 'A_env(t) = 2·A · |cos( π·f_beat·t )|', desc: 'Slowly pulsing amplitude boundary' }
      ]),
      onOpenConcept: () => this.modal.openConcept('ACOUSTIC BEATS', {
        what: 'Beats are periodic variations in sound intensity produced when two sound waves of slightly different frequencies superimpose.',
        how: 'The two waves alternate between in-phase constructive interference (loud pulse) and out-of-phase destructive interference (silence).',
        keyIdea: 'Musicians tune instruments by listening for beats; when beat frequency reaches 0 Hz, the instruments are in perfect pitch unison.'
      }),
      onOpenProblem: () => this.modal.openProblem('BEAT_FREQUENCY'),
      onBack: () => {
        import('./mechanicsMenuScene.js').then(m => this.sceneManager.changeScene(new m.MechanicsMenuScene()));
      }
    });

    this.dataPanel = new MechanicsDataPanel({ title: 'BEAT METRICS' });
    this.modal = new MechanicsModalOverlay();
    this.graph = new GraphRenderer({
      title: 'Acoustic Signal & Beat Envelope vs Time',
      xLabel: 'Time',
      xUnit: 's',
      yLabel: 'Amplitude',
      yUnit: 'Units'
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
      min: 200,
      max: 300,
      value: this.physics.f1 || 256,
      step: 1,
      label: 'FREQUENCY 1 (f₁)',
      unit: ' Hz',
      accentColor: Colors.cyan,
      callback: (val) => {
        this.physics.f1 = val;
        this.physics.recalculate();
      }
    }));

    sY += 44;
    this.sliders.push(new Slider({
      x: layout.controlRect.x + 12,
      y: sY,
      width: sW,
      min: 200,
      max: 300,
      value: this.physics.f2 || 262,
      step: 1,
      label: 'FREQUENCY 2 (f₂)',
      unit: ' Hz',
      accentColor: Colors.green,
      callback: (val) => {
        this.physics.f2 = val;
        this.physics.recalculate();
      }
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

    const fBeat = Math.abs((this.physics.f1 || 256) - (this.physics.f2 || 262));
    const fAvg = ((this.physics.f1 || 256) + (this.physics.f2 || 262)) / 2;

    this.dataPanel.setItems([
      { label: 'Frequency 1 (f₁)', value: `${this.physics.f1.toFixed(1)}`, unit: 'Hz', color: Colors.cyan },
      { label: 'Frequency 2 (f₂)', value: `${this.physics.f2.toFixed(1)}`, unit: 'Hz', color: Colors.green },
      { label: 'Beat Frequency (f_b)', value: `${fBeat.toFixed(1)}`, unit: 'Hz', color: Colors.yellow },
      { label: 'Carrier Pitch (f_avg)', value: `${fAvg.toFixed(1)}`, unit: 'Hz', color: Colors.purple }
    ]);

    const maxT = 1.0;
    const steps = 80;
    const signalPts = [], envPts = [];

    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * maxT;
      const sig = this.physics.getSignalAt(t);
      const env = this.physics.getEnvelopeAt(t);
      signalPts.push({ x: t, y: sig });
      envPts.push({ x: t, y: env });
    }

    this.graph.clearDatasets();
    this.graph.addDataset({ label: 'Acoustic Signal', color: Colors.cyan, points: signalPts });
    this.graph.addDataset({ label: 'Beat Envelope', color: Colors.yellow, points: envPts, lineWidth: 2 });
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
