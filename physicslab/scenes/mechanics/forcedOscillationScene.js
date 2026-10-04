// Forced Oscillation Laboratory Scene for PhysicsLab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Slider } from '../../engine/ui.js';
import { ForcedOscillationPhysics } from '../../physics/mechanics/shm.js';
import { GraphRenderer } from '../../engine/graphRenderer.js';
import { MechanicsControlBar, MechanicsDataPanel, MechanicsModalOverlay } from '../../engine/mechanicsUI.js';
import { VectorRenderer } from '../../engine/vectorRenderer.js';

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
      title: 'Displacement x(t) vs Time (RK4 Simulation)',
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
      min: 1.0,
      max: 15.0,
      value: this.physics.drivingOmega,
      step: 0.1,
      label: 'DRIVING FREQUENCY (ω)',
      unit: ' rad/s',
      accentColor: '#8B5CF6',
      callback: (val) => this.physics.setParameters(this.physics.mass, this.physics.springConstant, this.physics.damping, this.physics.f0, val)
    }));

    sY += 55;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
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

    sY += 55;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
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

    this.sidebarRect = { x: sidebarX, y: contentY, w: sidebarW, h: contentH };
    this.dataPanel.setRect(sidebarX, contentY + 200, sidebarW, contentH - 200);

    const mainW = sidebarX - 40;
    const simH = Math.floor(contentH * 0.40);
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
      { label: 'Natural Freq (ω₀)', value: `${this.physics.naturalOmega.toFixed(2)} rad/s` },
      { label: 'Driving Freq (ω)', value: `${this.physics.drivingOmega.toFixed(2)} rad/s` },
      { label: 'Current Pos (x)', value: `${this.physics.pos.toFixed(3)} m` },
      { label: 'Current Vel (v)', value: `${this.physics.vel.toFixed(3)} m/s` },
      { label: 'Steady State Amp', value: `${this.physics.steadyStateAmplitude.toFixed(2)} m` },
      { label: 'Driving Force F(t)', value: `${(this.physics.f0 * Math.cos(this.physics.drivingOmega * this.physics.time)).toFixed(1)} N` },
      { label: 'Status', value: this.physics.isAtResonance ? 'NEAR RESONANCE!' : 'FORCED OSCILLATION' }
    ]);

    if (this.physics.history.length > 1) {
      const xDataset = this.physics.history.map(pt => ({ x: pt.t, y: pt.x }));
      const maxT = this.physics.history[this.physics.history.length - 1].t;
      const minT = Math.max(0, maxT - 15);

      this.graph.setDatasets([
        { label: 'Displacement x(t)', data: xDataset, color: Colors.cyan, width: 2 }
      ]);
      this.graph.setLimits(minT, maxT, -this.physics.steadyStateAmplitude * 1.5 - 2, this.physics.steadyStateAmplitude * 1.5 + 2);
    }
  }

  render(ctx) {
    Renderer.drawRect(ctx, 0, 0, ctx.canvas.width, ctx.canvas.height, { fill: Colors.bgDark });

    this.controlBar.render(ctx);

    // Sidebar
    Renderer.drawCard(ctx, this.sidebarRect.x, this.sidebarRect.y, this.sidebarRect.w, this.sidebarRect.h, {
      title: 'DRIVER & DAMPING CONTROLS',
      accentColor: '#8B5CF6'
    });

    for (const slider of this.sliders) {
      slider.render(ctx);
    }
    this.dataPanel.render(ctx);

    // Simulation Viewport
    Renderer.drawCard(ctx, this.simRect.x, this.simRect.y, this.simRect.w, this.simRect.h, {
      title: 'PHYSICAL OSCILLATOR SYSTEM',
      accentColor: this.physics.isAtResonance ? '#EF4444' : Colors.cyan
    });

    this.renderOscillatorSystem(ctx);

    // Graph
    this.graph.render(ctx);

    // Modal
    this.modal.render(ctx);
  }

  renderOscillatorSystem(ctx) {
    const cx = this.simRect.x + this.simRect.w * 0.5;
    const cy = this.simRect.y + this.simRect.h * 0.55;

    // Fixed wall
    const wallX = this.simRect.x + 40;
    Renderer.drawRect(ctx, wallX - 10, cy - 60, 10, 120, { fill: '#334155' });
    for (let y = cy - 55; y < cy + 55; y += 12) {
      Renderer.drawLine(ctx, wallX - 10, y + 10, wallX, y, { color: '#64748B', width: 2 });
    }

    // Equilibrium marker
    Renderer.drawLine(ctx, cx, cy - 50, cx, cy + 50, { color: '#64748B', width: 1, dash: [4, 4] });
    Renderer.drawText(ctx, 'Equilibrium x = 0', cx, cy - 55, { color: '#94A3B8', size: 11, align: 'center' });

    // Block position: scale 1 m = 18 px
    const scale = 18;
    const blockX = cx + this.physics.pos * scale;
    const blockW = 60;
    const blockH = 50;

    // Draw Spring
    VectorRenderer.drawSpring(ctx, wallX, cy - 12, blockX - blockW / 2, cy - 12, {
      coils: 12,
      radius: 12,
      color: Colors.yellow,
      lineWidth: 2.5
    });

    // Draw Dashpot/Damper
    const damperY = cy + 18;
    Renderer.drawLine(ctx, wallX, damperY, blockX - blockW / 2 - 20, damperY, { color: '#64748B', width: 3 });
    // Damper cylinder
    Renderer.drawRect(ctx, blockX - blockW / 2 - 35, damperY - 8, 25, 16, { fill: '#1E293B', stroke: '#94A3B8', width: 1.5 });
    // Piston
    Renderer.drawLine(ctx, blockX - blockW / 2 - 25, damperY - 6, blockX - blockW / 2 - 25, damperY + 6, { color: '#EF4444', width: 3 });
    Renderer.drawLine(ctx, blockX - blockW / 2 - 25, damperY, blockX - blockW / 2, damperY, { color: '#EF4444', width: 2 });

    // Draw Block
    Renderer.drawRect(ctx, blockX - blockW / 2, cy - blockH / 2, blockW, blockH, {
      fill: '#0284C7',
      stroke: Colors.cyan,
      width: 2,
      radius: 4
    });
    Renderer.drawText(ctx, `${this.physics.mass} kg`, blockX, cy + 4, {
      color: '#FFFFFF',
      size: 12,
      weight: 'bold',
      align: 'center'
    });

    // Draw Periodic Driving Force arrow F(t)
    const drivingF = this.physics.f0 * Math.cos(this.physics.drivingOmega * this.physics.time);
    const forceArrowLen = drivingF * 1.5;
    if (Math.abs(forceArrowLen) > 3) {
      VectorRenderer.drawVector(ctx, blockX, cy - 35, forceArrowLen, 0, {
        color: '#A855F7',
        lineWidth: 3,
        label: `F_drive: ${drivingF.toFixed(1)} N`
      });
    }

    if (this.physics.isAtResonance) {
      Renderer.drawRect(ctx, cx - 100, this.simRect.y + 12, 200, 24, {
        fill: 'rgba(239, 68, 68, 0.25)',
        stroke: '#EF4444',
        width: 1.5,
        radius: 4
      });
      Renderer.drawText(ctx, '⚡ RESONANCE CONDITION ⚡', cx, this.simRect.y + 28, {
        color: '#FCA5A5',
        size: 11,
        weight: 'bold',
        align: 'center'
      });
    }
  }
}
