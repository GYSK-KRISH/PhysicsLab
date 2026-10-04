// Beats Laboratory Scene for PhysicsLab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Slider } from '../../engine/ui.js';
import { BeatsPhysics } from '../../physics/mechanics/waves.js';
import { GraphRenderer } from '../../engine/graphRenderer.js';
import { MechanicsControlBar, MechanicsDataPanel, MechanicsModalOverlay } from '../../engine/mechanicsUI.js';

export class BeatsScene {
  constructor() {
    this.physics = new BeatsPhysics({
      f1: 10.0,
      f2: 12.0,
      amplitude: 2.0
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
      onOpenFormula: () => this.modal.openFormula('ACOUSTIC BEATS', [
        { name: 'Beat Frequency', formula: 'f_b = |f₁ - f₂|', desc: 'Number of amplitude intensity peaks heard per second' },
        { name: 'Beat Period', formula: 'T_b = 1 / f_b = 1 / |f₁ - f₂|', desc: 'Time duration between successive intensity maxima' },
        { name: 'Carrier (Average) Frequency', formula: 'f_avg = (f₁ + f₂) / 2', desc: 'Fast oscillatory pitch heard within the modulating envelope' },
        { name: 'Modulated Wave Equation', formula: 'y(t) = 2A · cos(π·f_b·t) · cos(2π·f_avg·t)', desc: 'Envelope modulation factor times carrier wave' }
      ]),
      onOpenConcept: () => this.modal.openConcept('BEAT PHENOMENON', {
        what: 'Beats are periodic fluctuations in sound loudness produced when two sound waves of slightly different frequencies interfere.',
        how: 'The two waves alternate between being in phase (constructive interference: loud) and out of phase (destructive interference: silence).',
        keyIdea: 'Musicians tune instruments by listening for beats; as the two notes approach the exact same pitch, the beat frequency drops to zero (f_b → 0).'
      }),
      onOpenProblem: () => this.modal.openProblem('WAVE_SPEED'),
      onBack: () => {
        import('./mechanicsMenuScene.js').then(m => this.sceneManager.changeScene(new m.MechanicsMenuScene()));
      }
    });

    this.dataPanel = new MechanicsDataPanel({ title: 'BEAT METRICS' });
    this.modal = new MechanicsModalOverlay();
    this.graph = new GraphRenderer({
      title: 'Resultant Acoustic Pressure y(t) & Modulating Envelope',
      xLabel: 'Time t',
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
    this.physics.start();
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
      min: 5.0,
      max: 20.0,
      value: this.physics.f1,
      step: 0.5,
      label: 'FREQUENCY 1 (f₁)',
      unit: ' Hz',
      accentColor: Colors.cyan,
      callback: (val) => this.physics.setParameters(val, this.physics.f2, this.physics.amplitude)
    }));

    sY += 55;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: 5.0,
      max: 20.0,
      value: this.physics.f2,
      step: 0.5,
      label: 'FREQUENCY 2 (f₂)',
      unit: ' Hz',
      accentColor: '#EC4899',
      callback: (val) => this.physics.setParameters(this.physics.f1, val, this.physics.amplitude)
    }));

    sY += 55;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: 0.5,
      max: 4.0,
      value: this.physics.amplitude,
      step: 0.2,
      label: 'AMPLITUDE (A)',
      unit: ' m',
      accentColor: Colors.yellow,
      callback: (val) => this.physics.setParameters(this.physics.f1, this.physics.f2, val)
    }));

    this.sidebarRect = { x: sidebarX, y: contentY, w: sidebarW, h: contentH };
    this.dataPanel.setRect(sidebarX, contentY + 200, sidebarW, contentH - 200);

    const mainW = sidebarX - 40;
    const simH = Math.floor(contentH * 0.38);
    const graphH = contentH - simH - 15;

    this.simRect = { x: 20, y: contentY, w: mainW, h: simH };
    this.graph.setRect(20, contentY + simH + 15, mainW, graphH);
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

    this.dataPanel.setMetrics([
      { label: 'Beat Frequency (f_b)', value: `${this.physics.beatFrequency.toFixed(1)} Hz (${this.physics.beatFrequency.toFixed(1)} beats/s)` },
      { label: 'Beat Period (T_b)', value: `${this.physics.beatPeriod.toFixed(2)} s` },
      { label: 'Carrier Freq (f_avg)', value: `${this.physics.carrierFrequency.toFixed(1)} Hz` },
      { label: 'Freq 1 (f₁)', value: `${this.physics.f1.toFixed(1)} Hz` },
      { label: 'Freq 2 (f₂)', value: `${this.physics.f2.toFixed(1)} Hz` },
      { label: 'Max Envelope Amp', value: `${(2 * this.physics.amplitude).toFixed(1)} m` }
    ]);

    // Build timeline window
    const duration = 2.0;
    const tCenter = this.physics.time;
    const tStart = Math.max(0, tCenter - duration * 0.5);
    const tEnd = tStart + duration;
    const steps = 300;

    const dsResultant = [];
    const dsEnvPos = [];
    const dsEnvNeg = [];

    for (let i = 0; i <= steps; i++) {
      const t = tStart + (i / steps) * duration;
      const state = this.physics.getStateAt(t);
      dsResultant.push({ x: t, y: state.resultant });
      dsEnvPos.push({ x: t, y: state.envelope });
      dsEnvNeg.push({ x: t, y: state.negEnvelope });
    }

    this.graph.setDatasets([
      { label: 'Resultant Beat Wave', data: dsResultant, color: Colors.cyan, width: 2 },
      { label: '+Envelope', data: dsEnvPos, color: Colors.yellow, width: 1.5, dash: [4, 4] },
      { label: '-Envelope', data: dsEnvNeg, color: Colors.yellow, width: 1.5, dash: [4, 4] }
    ]);
    const maxA = 2 * this.physics.amplitude * 1.25;
    this.graph.setLimits(tStart, tEnd, -maxA, maxA);
  }

  render(ctx) {
    Renderer.drawRect(ctx, 0, 0, ctx.canvas.width, ctx.canvas.height, { fill: Colors.bgDark });

    this.controlBar.render(ctx);

    // Sidebar
    Renderer.drawCard(ctx, this.sidebarRect.x, this.sidebarRect.y, this.sidebarRect.w, this.sidebarRect.h, {
      title: 'BEAT GENERATOR',
      accentColor: Colors.yellow
    });

    for (const slider of this.sliders) {
      slider.render(ctx);
    }
    this.dataPanel.render(ctx);

    // Simulation Viewport
    Renderer.drawCard(ctx, this.simRect.x, this.simRect.y, this.simRect.w, this.simRect.h, {
      title: `ACOUSTIC BEATS (f_b = |${this.physics.f1} - ${this.physics.f2}| = ${this.physics.beatFrequency.toFixed(1)} Hz)`,
      accentColor: Colors.cyan
    });

    this.renderVisualizer(ctx);

    // Graph
    this.graph.render(ctx);

    // Modal
    this.modal.render(ctx);
  }

  renderVisualizer(ctx) {
    const cx = this.simRect.x + this.simRect.w * 0.5;
    const cy = this.simRect.y + this.simRect.h * 0.52;

    const state = this.physics.getStateAt(this.physics.time);

    // Render Tuning Forks
    const fork1X = this.simRect.x + 80;
    const fork2X = this.simRect.x + this.simRect.w - 80;

    // Fork 1 (Cyan)
    Renderer.drawRect(ctx, fork1X - 6, cy - 30, 12, 60, { fill: '#334155' });
    Renderer.drawRect(ctx, fork1X - 16, cy - 60, 8, 35, { fill: Colors.cyan });
    Renderer.drawRect(ctx, fork1X + 8, cy - 60, 8, 35, { fill: Colors.cyan });
    Renderer.drawText(ctx, `Fork 1: ${this.physics.f1} Hz`, fork1X, cy + 45, { color: Colors.cyan, size: 11, align: 'center', weight: 'bold' });

    // Fork 2 (Pink)
    Renderer.drawRect(ctx, fork2X - 6, cy - 30, 12, 60, { fill: '#334155' });
    Renderer.drawRect(ctx, fork2X - 16, cy - 60, 8, 35, { fill: '#EC4899' });
    Renderer.drawRect(ctx, fork2X + 8, cy - 60, 8, 35, { fill: '#EC4899' });
    Renderer.drawText(ctx, `Fork 2: ${this.physics.f2} Hz`, fork2X, cy + 45, { color: '#EC4899', size: 11, align: 'center', weight: 'bold' });

    // Center pulsating acoustic pressure indicator
    const currentIntensityRatio = Math.abs(state.resultant) / (2 * this.physics.amplitude || 1);
    const radius = 20 + currentIntensityRatio * 35;

    Renderer.drawCircle(ctx, cx, cy - 10, radius, {
      fill: `rgba(56, 189, 248, ${0.15 + currentIntensityRatio * 0.5})`,
      stroke: Colors.yellow,
      width: 2 + currentIntensityRatio * 2
    });

    Renderer.drawText(ctx, 'LOUDNESS INTENSITY', cx, cy - 14, {
      color: '#FFFFFF',
      size: 11,
      weight: 'bold',
      align: 'center'
    });
    Renderer.drawText(ctx, `${(currentIntensityRatio * 100).toFixed(0)}%`, cx, cy + 4, {
      color: Colors.yellow,
      size: 13,
      weight: 'bold',
      align: 'center'
    });
  }
}
