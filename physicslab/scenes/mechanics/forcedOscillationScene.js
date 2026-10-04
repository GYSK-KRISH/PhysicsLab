// Forced Oscillation Laboratory Scene for PhysicsLab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Slider } from '../../engine/ui.js';
import { ForcedOscillationPhysics } from '../../physics/mechanics/shm.js';
import { GraphRenderer } from '../../engine/graphRenderer.js';
import { MechanicsControlBar, MechanicsDataPanel, MechanicsModalOverlay } from '../../engine/mechanicsUI.js';
import { VectorRenderer } from '../../engine/vectorRenderer.js';
import { LayoutEngine } from '../../engine/layout.js';

export class ForcedOscillationScene {
  constructor() {
    this.physics = new ForcedOscillationPhysics({
      mass: 1.5,
      springConstant: 60.0,
      damping: 0.6,
      f0: 20.0,
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
      onOpenFormula: () => this.modal.openFormula('FORCED OSCILLATIONS', [
        { name: 'Equation of Motion', formula: 'm·x\'\' + c·x\' + k·x = F₀·cos(ω·t)', desc: 'Driven damped harmonic oscillator ODE' },
        { name: 'Natural Frequency', formula: 'ω₀ = √(k / m)', desc: 'System resonance frequency in rad/s' },
        { name: 'Steady State Amplitude', formula: 'A(ω) = (F₀/m) / √((ω₀² - ω²)² + (c·ω/m)²)', desc: 'Amplitude response determined by driving frequency and damping' }
      ]),
      onOpenConcept: () => this.modal.openConcept('FORCED OSCILLATIONS', {
        what: 'A forced oscillator is driven by a periodic external sinusoidal force F(t) = F₀ cos(ωt).',
        how: 'The transient solution quickly dies out due to damping, leaving a steady-state oscillation at the driving frequency ω rather than the natural frequency ω₀.',
        keyIdea: 'When the driving frequency matches the natural frequency (ω ≈ ω₀), the amplitude spikes drastically, creating mechanical resonance.'
      }),
      onOpenProblem: () => this.modal.openProblem('SHM_TIME_PERIOD'),
      onBack: () => {
        import('./mechanicsMenuScene.js').then(m => this.sceneManager.changeScene(new m.MechanicsMenuScene()));
      }
    });

    this.dataPanel = new MechanicsDataPanel({ title: 'FORCED RESPONSE' });
    this.modal = new MechanicsModalOverlay();
    this.graph = new GraphRenderer({
      title: 'Displacement x(t) vs Time',
      xLabel: 'Time',
      xUnit: 's',
      yLabel: 'Displacement',
      yUnit: 'm'
    });

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
      value: this.physics.drivingOmega,
      step: 0.1,
      label: 'DRIVING FREQUENCY (ω)',
      unit: ' rad/s',
      accentColor: Colors.purple,
      callback: (val) => this.physics.setParameters(this.physics.mass, this.physics.springConstant, this.physics.damping, this.physics.f0, val)
    }));

    sY += 44;
    this.sliders.push(new Slider({
      x: layout.controlRect.x + 12,
      y: sY,
      width: sW,
      min: 0,
      max: 50,
      value: this.physics.f0,
      step: 2,
      label: 'DRIVING FORCE (F₀)',
      unit: ' N',
      accentColor: '#EF4444',
      callback: (val) => this.physics.setParameters(this.physics.mass, this.physics.springConstant, this.physics.damping, val, this.physics.drivingOmega)
    }));

    sY += 44;
    this.sliders.push(new Slider({
      x: layout.controlRect.x + 12,
      y: sY,
      width: sW,
      min: 0.05,
      max: 3.0,
      value: this.physics.damping,
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

    this.dataPanel.setItems([
      { label: 'Natural Freq (ω₀)', value: (this.physics.naturalOmega || 0).toFixed(2), unit: 'rad/s', color: Colors.cyan },
      { label: 'Driving Freq (ω)', value: (this.physics.drivingOmega || 0).toFixed(2), unit: 'rad/s', color: Colors.purple },
      { label: 'Current Pos (x)', value: (this.physics.pos || 0).toFixed(2), unit: 'm', color: Colors.text },
      { label: 'Current Vel (v)', value: (this.physics.vel || 0).toFixed(2), unit: 'm/s', color: Colors.cyan },
      { label: 'Steady State Amp', value: (this.physics.steadyStateAmplitude || 0).toFixed(2), unit: 'm', color: Colors.yellow },
      { label: 'Driving Force F(t)', value: ((this.physics.f0 || 0) * Math.cos((this.physics.drivingOmega || 0) * (this.physics.time || 0))).toFixed(1), unit: 'N', color: '#EF4444' }
    ]);

    if (this.physics.history && this.physics.history.length > 1) {
      const xDataset = this.physics.history.map(pt => ({ x: pt.t, y: pt.x }));
      this.graph.clearDatasets();
      this.graph.addDataset({ label: 'Displacement x(t)', color: Colors.cyan, points: xDataset });
    }
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
      Renderer.drawText(ctx, 'DRIVER & DAMPING CONTROLS', this.controlRect.x + 12, this.controlRect.y + 6, {
        fill: Colors.textMuted,
        font: 'bold 10px "Segoe UI"'
      });
      for (const s of this.sliders) s.render(ctx);
    }

    this.dataPanel.render(ctx);

    if (this.simRect) {
      Renderer.drawPanel(ctx, this.simRect.x, this.simRect.y, this.simRect.width, this.simRect.height, {
        fill: '#090E1A',
        stroke: Colors.panelBorder
      });

      ctx.save();
      ctx.beginPath();
      ctx.rect(this.simRect.x, this.simRect.y, this.simRect.width, this.simRect.height);
      ctx.clip();

      const centerY = this.simRect.y + this.simRect.height / 2;
      const originX = this.simRect.x + 60;
      const scale = 8.0;
      const blockX = originX + 120 + (this.physics.pos || 0) * scale;

      // Spring coil line
      Renderer.drawLine(ctx, originX, centerY, blockX - 25, centerY, {
        stroke: Colors.cyan,
        lineWidth: 2.5
      });

      // Mass block
      Renderer.drawRoundedRect(ctx, blockX - 25, centerY - 25, 50, 50, 6, {
        fill: '#151F30',
        stroke: Colors.cyan,
        lineWidth: 2,
        glowColor: Colors.cyan,
        glowBlur: 8
      });

      // Vectors
      if (this.controlBar.showVectors) {
        const fDrive = (this.physics.f0 || 0) * Math.cos((this.physics.drivingOmega || 0) * (this.physics.time || 0));
        VectorRenderer.drawVector(ctx, blockX, centerY - 35, fDrive * 1.5, 0, 1.0, {
          color: '#EF4444',
          label: `F_drive=${fDrive.toFixed(1)}N`
        });
      }

      ctx.restore();
    }

    this.graph.render(ctx);
    this.modal.render(ctx, width, height);
  }
}
