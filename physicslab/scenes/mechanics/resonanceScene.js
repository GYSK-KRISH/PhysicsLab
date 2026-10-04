// Resonance Laboratory Scene for PhysicsLab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Slider } from '../../engine/ui.js';
import { ForcedOscillationPhysics } from '../../physics/mechanics/shm.js';
import { GraphRenderer } from '../../engine/graphRenderer.js';
import { MechanicsControlBar, MechanicsDataPanel, MechanicsModalOverlay } from '../../engine/mechanicsUI.js';

export class ResonanceScene {
  constructor() {
    this.physics = new ForcedOscillationPhysics({
      mass: 1.0,
      springConstant: 100.0,
      damping: 0.3,
      f0: 15.0,
      drivingOmega: 10.0
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
      onOpenFormula: () => this.modal.openFormula('RESONANCE & Q-FACTOR', [
        { name: 'Resonance Condition', formula: 'ω = ω₀ = √(k / m)', desc: 'Peak amplitude occurs when driving frequency equals natural frequency' },
        { name: 'Resonant Amplitude', formula: 'A_max = F₀ / (c · ω₀)', desc: 'Peak height is inversely proportional to damping coefficient c' },
        { name: 'Quality Factor (Q)', formula: 'Q = (m · ω₀) / c = ω₀ / Δω', desc: 'Sharpness of the resonance peak; higher Q gives sharper response' }
      ]),
      onOpenConcept: () => this.modal.openConcept('MECHANICAL RESONANCE', {
        what: 'Resonance is the dramatic amplification of oscillatory amplitude when a periodic driving force matches the system natural frequency.',
        how: 'Energy from the external driver is transferred to the oscillator with maximum efficiency because the driving force is in phase with velocity.',
        keyIdea: 'Excessive resonance can cause structural failure (e.g. bridges and helicopter blades), while controlled resonance is used in radio tuners and musical instruments.'
      }),
      onOpenProblem: () => this.modal.openProblem('SHM_TIME_PERIOD'),
      onBack: () => {
        import('./mechanicsMenuScene.js').then(m => this.sceneManager.changeScene(new m.MechanicsMenuScene()));
      }
    });

    this.dataPanel = new MechanicsDataPanel({ title: 'RESONANCE METRICS' });
    this.modal = new MechanicsModalOverlay();
    this.graph = new GraphRenderer({
      title: 'Amplitude vs Driving Frequency (Resonance Curve)',
      xLabel: 'Driving Frequency ω',
      xUnit: 'rad/s',
      yLabel: 'Steady-State Amplitude',
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
      min: 2.0,
      max: 20.0,
      value: this.physics.drivingOmega,
      step: 0.2,
      label: 'DRIVING FREQ (ω)',
      unit: ' rad/s',
      accentColor: '#EF4444',
      callback: (val) => this.physics.setParameters(this.physics.mass, this.physics.springConstant, this.physics.damping, this.physics.f0, val)
    }));

    sY += 55;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: 0.05,
      max: 2.0,
      value: this.physics.damping,
      step: 0.05,
      label: 'DAMPING COEFF (c)',
      unit: ' N·s/m',
      accentColor: Colors.yellow,
      callback: (val) => this.physics.setParameters(this.physics.mass, this.physics.springConstant, val, this.physics.f0, this.physics.drivingOmega)
    }));

    sY += 55;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: 20,
      max: 200,
      value: this.physics.springConstant,
      step: 10,
      label: 'SPRING CONSTANT (k)',
      unit: ' N/m',
      accentColor: Colors.cyan,
      callback: (val) => this.physics.setParameters(this.physics.mass, val, this.physics.damping, this.physics.f0, this.physics.drivingOmega)
    }));

    this.sidebarRect = { x: sidebarX, y: contentY, w: sidebarW, h: contentH };
    this.dataPanel.setRect(sidebarX, contentY + 200, sidebarW, contentH - 200);

    const mainW = sidebarX - 40;
    const simH = Math.floor(contentH * 0.35);
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

    const qFactor = (this.physics.mass * this.physics.naturalOmega) / this.physics.damping;

    this.dataPanel.setMetrics([
      { label: 'Natural Freq (ω₀)', value: `${this.physics.naturalOmega.toFixed(2)} rad/s` },
      { label: 'Driving Freq (ω)', value: `${this.physics.drivingOmega.toFixed(2)} rad/s` },
      { label: 'Freq Ratio (ω/ω₀)', value: `${(this.physics.drivingOmega / this.physics.naturalOmega).toFixed(3)}` },
      { label: 'Current Amp (A)', value: `${this.physics.steadyStateAmplitude.toFixed(2)} m` },
      { label: 'Quality Factor (Q)', value: `${qFactor.toFixed(1)}` },
      { label: 'State', value: this.physics.isAtResonance ? '🚨 RESONANCE PEAK 🚨' : 'OFF-RESONANCE' }
    ]);

    // Compute full resonance curve
    const curvePoints = this.physics.getResonanceCurvePoints();
    const dataset = curvePoints.map(pt => ({ x: pt.omega, y: pt.amp }));

    this.graph.setDatasets([
      { label: 'Theoretical Response A(ω)', data: dataset, color: '#A855F7', width: 2.5 }
    ]);
    this.graph.setMarker(this.physics.drivingOmega, this.physics.steadyStateAmplitude, '#EF4444');
    this.graph.setLimits(0, this.physics.naturalOmega * 2.2, 0, Math.max(...dataset.map(d => d.y)) * 1.15);
  }

  render(ctx) {
    Renderer.drawRect(ctx, 0, 0, ctx.canvas.width, ctx.canvas.height, { fill: Colors.bgDark });

    this.controlBar.render(ctx);

    // Sidebar
    Renderer.drawCard(ctx, this.sidebarRect.x, this.sidebarRect.y, this.sidebarRect.w, this.sidebarRect.h, {
      title: 'PARAMETERS',
      accentColor: '#EF4444'
    });

    for (const slider of this.sliders) {
      slider.render(ctx);
    }
    this.dataPanel.render(ctx);

    // Simulation Viewport
    Renderer.drawCard(ctx, this.simRect.x, this.simRect.y, this.simRect.w, this.simRect.h, {
      title: 'DRIVEN HARMONIC SYSTEM VISUALIZER',
      accentColor: this.physics.isAtResonance ? '#EF4444' : Colors.cyan
    });

    this.renderVisualizer(ctx);

    // Graph
    this.graph.render(ctx);

    // Modal
    this.modal.render(ctx);
  }

  renderVisualizer(ctx) {
    const cx = this.simRect.x + this.simRect.w * 0.5;
    const cy = this.simRect.y + this.simRect.h * 0.55;

    // Center equilibrium
    Renderer.drawLine(ctx, cx, cy - 45, cx, cy + 45, { color: '#475569', width: 1, dash: [4, 4] });

    const scale = 14;
    const blockX = cx + this.physics.pos * scale;
    const blockW = 55;
    const blockH = 45;

    // Wall
    const wallX = this.simRect.x + 35;
    Renderer.drawRect(ctx, wallX - 8, cy - 40, 8, 80, { fill: '#334155' });

    // Draw Spring
    const numCoils = 14;
    const springLen = blockX - blockW / 2 - wallX;
    ctx.beginPath();
    ctx.strokeStyle = Colors.yellow;
    ctx.lineWidth = 2.5;
    ctx.moveTo(wallX, cy);
    for (let i = 0; i <= numCoils; i++) {
      const x = wallX + (springLen / numCoils) * i;
      const y = cy + (i % 2 === 0 ? -12 : 12);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(blockX - blockW / 2, cy);
    ctx.stroke();

    // Draw Block
    const blockColor = this.physics.isAtResonance ? '#EF4444' : '#0284C7';
    Renderer.drawRect(ctx, blockX - blockW / 2, cy - blockH / 2, blockW, blockH, {
      fill: blockColor,
      stroke: this.physics.isAtResonance ? '#FCA5A5' : Colors.cyan,
      width: 2,
      radius: 4
    });
    Renderer.drawText(ctx, `${this.physics.mass} kg`, blockX, cy + 4, {
      color: '#FFFFFF',
      size: 11,
      weight: 'bold',
      align: 'center'
    });

    if (this.physics.isAtResonance) {
      Renderer.drawRect(ctx, cx - 120, this.simRect.y + 12, 240, 24, {
        fill: 'rgba(239, 68, 68, 0.25)',
        stroke: '#EF4444',
        width: 1.5,
        radius: 4
      });
      Renderer.drawText(ctx, '⚡ MAXIMUM RESONANCE AMPLITUDE ⚡', cx, this.simRect.y + 28, {
        color: '#FCA5A5',
        size: 11,
        weight: 'bold',
        align: 'center'
      });
    }
  }
}
