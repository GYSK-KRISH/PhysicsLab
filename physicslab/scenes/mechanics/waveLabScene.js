// Wave Laboratory Scene for PhysicsLab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Button, Slider } from '../../engine/ui.js';
import { WaveLabPhysics } from '../../physics/mechanics/waves.js';
import { GraphRenderer } from '../../engine/graphRenderer.js';
import { MechanicsControlBar, MechanicsDataPanel, MechanicsModalOverlay } from '../../engine/mechanicsUI.js';
import { LayoutEngine } from '../../engine/layout.js';

export class WaveLabScene {
  constructor() {
    this.physics = new WaveLabPhysics({
      amplitude: 2.5,
      frequency: 1.5,
      wavelength: 10.0,
      waveType: 'TRANSVERSE'
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
      onOpenFormula: () => this.modal.openFormula('WAVE SPEED & PROPERTIES', [
        { name: 'Wave Speed Formula', formula: 'v = f · λ = λ / T', desc: 'Speed of wave propagation equals frequency times wavelength' },
        { name: 'Wave Number (k)', formula: 'k = 2·π / λ', desc: 'Spatial frequency in rad/m' },
        { name: 'Angular Frequency (ω)', formula: 'ω = 2·π · f', desc: 'Temporal frequency in rad/s' },
        { name: 'Traveling Wave Equation', formula: 'y(x, t) = A · sin(k·x - ω·t)', desc: 'Wave traveling in positive x-direction' }
      ]),
      onOpenConcept: () => this.modal.openConcept('WAVE PROPAGATION', {
        what: 'A wave is a traveling disturbance that transfers energy and momentum through a medium without transferring matter itself.',
        how: 'In a transverse wave, medium particles vibrate perpendicular to wave propagation. In a longitudinal wave, particles vibrate parallel to propagation, creating alternating compressions and rarefactions.',
        keyIdea: 'Wave speed depends only on properties of the medium (e.g. tension and linear density on a string, bulk modulus and density in sound).'
      }),
      onOpenProblem: () => this.modal.openProblem('WAVE_SPEED'),
      onBack: () => {
        import('./mechanicsMenuScene.js').then(m => this.sceneManager.changeScene(new m.MechanicsMenuScene()));
      }
    });

    this.dataPanel = new MechanicsDataPanel({ title: 'WAVE METRICS' });
    this.modal = new MechanicsModalOverlay();
    this.graph = new GraphRenderer({
      title: 'Wave Profile y(x) at Current Time',
      xLabel: 'Position x',
      xUnit: 'm',
      yLabel: 'Displacement y',
      yUnit: 'm'
    });

    this.sliders = [];
    this.typeButtons = [];
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

    this.typeButtons = [];
    const types = ['TRANSVERSE', 'LONGITUDINAL'];
    const tbW = (layout.controlRect.width - 24) / 2;

    for (let i = 0; i < types.length; i++) {
      const t = types[i];
      const isSel = this.physics.waveType === t;
      this.typeButtons.push(new Button({
        x: layout.controlRect.x + 12 + i * tbW,
        y: layout.controlRect.y + 10,
        width: tbW - 4,
        height: 28,
        text: t,
        accentColor: isSel ? Colors.cyan : Colors.panelBorder,
        callback: () => {
          this.physics.waveType = t;
          this.rebuildUI();
        }
      }));
    }

    this.sliders = [];
    let sY = layout.controlRect.y + 44;
    const sW = layout.controlRect.width - 24;

    this.sliders.push(new Slider({
      x: layout.controlRect.x + 12,
      y: sY,
      width: sW,
      min: 0.5,
      max: 5.0,
      value: this.physics.amplitude || 2.5,
      step: 0.2,
      label: 'AMPLITUDE (A)',
      unit: ' m',
      accentColor: Colors.cyan,
      callback: (val) => this.physics.setParameters(val, this.physics.frequency, this.physics.wavelength, this.physics.waveType)
    }));

    sY += 44;
    this.sliders.push(new Slider({
      x: layout.controlRect.x + 12,
      y: sY,
      width: sW,
      min: 0.2,
      max: 4.0,
      value: this.physics.frequency || 1.5,
      step: 0.1,
      label: 'FREQUENCY (f)',
      unit: ' Hz',
      accentColor: Colors.purple,
      callback: (val) => this.physics.setParameters(this.physics.amplitude, val, this.physics.wavelength, this.physics.waveType)
    }));

    sY += 44;
    this.sliders.push(new Slider({
      x: layout.controlRect.x + 12,
      y: sY,
      width: sW,
      min: 4.0,
      max: 25.0,
      value: this.physics.wavelength || 10.0,
      step: 1.0,
      label: 'WAVELENGTH (λ)',
      unit: ' m',
      accentColor: Colors.green,
      callback: (val) => this.physics.setParameters(this.physics.amplitude, this.physics.frequency, val, this.physics.waveType)
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
    for (const b of this.typeButtons) b.update(dt, this.inputManager);
    for (const s of this.sliders) s.update(dt, this.inputManager);

    this.dataPanel.setItems([
      { label: 'Wave Speed (v)', value: (this.physics.waveSpeed || 0).toFixed(2), unit: 'm/s', color: Colors.cyan },
      { label: 'Period (T = 1/f)', value: (this.physics.period || 0).toFixed(3), unit: 's', color: Colors.purple },
      { label: 'Angular Freq (ω)', value: (this.physics.omega || 0).toFixed(2), unit: 'rad/s', color: Colors.purple },
      { label: 'Wave Number (k)', value: (this.physics.k || 0).toFixed(3), unit: 'rad/m', color: Colors.green },
      { label: 'Wavelength (λ)', value: (this.physics.wavelength || 0).toFixed(1), unit: 'm', color: Colors.green },
      { label: 'Amplitude (A)', value: (this.physics.amplitude || 0).toFixed(2), unit: 'm', color: Colors.cyan },
      { label: 'Sim Time (t)', value: (this.physics.time || 0).toFixed(2), unit: 's', color: Colors.text }
    ]);

    const profilePoints = [];
    const maxDist = 30.0;
    const steps = 60;
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * maxDist;
      const y = this.physics.getDisplacementAt(x);
      profilePoints.push({ x, y });
    }

    this.graph.clearDatasets();
    this.graph.addDataset({ label: 'Displacement y(x)', color: Colors.cyan, points: profilePoints });
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
      for (const b of this.typeButtons) b.render(ctx);
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
      const startX = this.simRect.x + 20;
      const endX = this.simRect.x + this.simRect.width - 20;
      const waveW = endX - startX;

      if (this.physics.waveType === 'TRANSVERSE') {
        ctx.strokeStyle = Colors.cyan;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        const pts = 80;
        for (let i = 0; i <= pts; i++) {
          const px = startX + (i / pts) * waveW;
          const xMeters = (i / pts) * 30.0;
          const disp = this.physics.getDisplacementAt(xMeters);
          const py = centerY - disp * 6.0;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      } else {
        const dots = 30;
        for (let i = 0; i <= dots; i++) {
          const xMeters = (i / dots) * 30.0;
          const disp = this.physics.getDisplacementAt(xMeters);
          const px = startX + (i / dots) * waveW + disp * 4.0;
          Renderer.drawCircle(ctx, px, centerY, 5, { fill: Colors.cyan });
        }
      }

      ctx.restore();
    }

    this.graph.render(ctx);
    this.modal.render(ctx, width, height);
  }
}
