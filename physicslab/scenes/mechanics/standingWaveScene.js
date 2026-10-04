// Standing Waves & Harmonics Laboratory Scene for PhysicsLab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Slider } from '../../engine/ui.js';
import { StandingWavePhysics } from '../../physics/mechanics/waves.js';
import { GraphRenderer } from '../../engine/graphRenderer.js';
import { MechanicsControlBar, MechanicsDataPanel, MechanicsModalOverlay } from '../../engine/mechanicsUI.js';
import { LayoutEngine } from '../../engine/layout.js';

export class StandingWaveScene {
  constructor() {
    this.physics = new StandingWavePhysics({
      length: 10.0,
      tension: 100.0,
      linearDensity: 0.01,
      harmonicN: 2
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
      onOpenFormula: () => this.modal.openFormula('STANDING WAVES & HARMONICS', [
        { name: 'String Wave Speed', formula: 'v = √(T / μ)', desc: 'Speed of transverse wave along string under tension T and linear mass density μ' },
        { name: 'Harmonic Wavelength', formula: 'λ_n = (2·L) / n', desc: 'Wavelength for nth harmonic node-to-node standing wave' },
        { name: 'Harmonic Frequency', formula: 'f_n = n · f₁ = (n / 2L) · √(T / μ)', desc: 'Resonant frequency of nth standing wave harmonic' }
      ]),
      onOpenConcept: () => this.modal.openConcept('STANDING WAVES & NODES', {
        what: 'Standing waves are produced by the interference of two identical counter-propagating traveling waves trapped between boundaries.',
        how: 'Fixed ends enforce zero-displacement points called nodes. Midpoints between nodes experience maximum oscillation amplitude called antinodes.',
        keyIdea: 'Integer harmonic modes (n = 1, 2, 3...) produce discrete fundamental and overtone musical pitches on stretched strings.'
      }),
      onOpenProblem: () => this.modal.openProblem('STANDING_WAVE_HARMONIC'),
      onBack: () => {
        import('./mechanicsMenuScene.js').then(m => this.sceneManager.changeScene(new m.MechanicsMenuScene()));
      }
    });

    this.dataPanel = new MechanicsDataPanel({ title: 'HARMONIC DATA' });
    this.modal = new MechanicsModalOverlay();
    this.graph = new GraphRenderer({
      title: 'Standing Wave Envelope y(x) & Nodes',
      xLabel: 'String Position x',
      xUnit: 'm',
      yLabel: 'Envelope Displacement',
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
      min: 1,
      max: 5,
      value: this.physics.harmonicN || 2,
      step: 1,
      label: 'HARMONIC NUMBER (n)',
      unit: '',
      accentColor: Colors.yellow,
      callback: (nVal) => {
        this.physics.harmonicN = nVal;
        this.physics.recalculate();
      }
    }));

    sY += 44;
    this.sliders.push(new Slider({
      x: layout.controlRect.x + 12,
      y: sY,
      width: sW,
      min: 20,
      max: 300,
      value: this.physics.tension || 100,
      step: 10,
      label: 'STRING TENSION (T)',
      unit: ' N',
      accentColor: Colors.cyan,
      callback: (tVal) => {
        this.physics.tension = tVal;
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

    this.dataPanel.setItems([
      { label: 'Harmonic Mode (n)', value: `${this.physics.harmonicN}`, unit: '', color: Colors.yellow },
      { label: 'Wave Speed (v)', value: (this.physics.waveSpeed || 0).toFixed(1), unit: 'm/s', color: Colors.cyan },
      { label: 'Wavelength (λ_n)', value: (this.physics.wavelength || 0).toFixed(2), unit: 'm', color: Colors.green },
      { label: 'Frequency (f_n)', value: (this.physics.frequency || 0).toFixed(2), unit: 'Hz', color: Colors.purple },
      { label: 'Nodes Count', value: `${(this.physics.harmonicN || 1) + 1}`, unit: 'nodes', color: Colors.text }
    ]);

    const L = this.physics.length || 10;
    const steps = 60;
    const profilePts = [];

    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * L;
      const y = this.physics.getDisplacementAt(x);
      profilePts.push({ x, y });
    }

    this.graph.clearDatasets();
    this.graph.addDataset({ label: `Harmonic n=${this.physics.harmonicN}`, color: Colors.yellow, points: profilePts, lineWidth: 2.5 });
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

      ctx.save();
      ctx.beginPath();
      ctx.rect(this.simRect.x, this.simRect.y, this.simRect.width, this.simRect.height);
      ctx.clip();

      const centerY = this.simRect.y + this.simRect.height / 2;
      const startX = this.simRect.x + 30;
      const endX = this.simRect.x + this.simRect.width - 30;
      const stringW = endX - startX;

      // Fixed end supports
      Renderer.drawRect(ctx, startX - 8, centerY - 25, 8, 50, { fill: '#1E293B', stroke: Colors.panelBorder });
      Renderer.drawRect(ctx, endX, centerY - 25, 8, 50, { fill: '#1E293B', stroke: Colors.panelBorder });

      // Vibrating String
      ctx.strokeStyle = Colors.yellow;
      ctx.lineWidth = 3;
      ctx.beginPath();
      const pts = 80;
      const L = this.physics.length || 10;
      for (let i = 0; i <= pts; i++) {
        const px = startX + (i / pts) * stringW;
        const xMeters = (i / pts) * L;
        const disp = this.physics.getDisplacementAt(xMeters);
        const py = centerY - disp * 12.0;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      ctx.restore();
    }

    this.graph.render(ctx);
    this.modal.render(ctx, width, height);
  }
}
