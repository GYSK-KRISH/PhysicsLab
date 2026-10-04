// Superposition Principle Laboratory Scene for PhysicsLab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Button, Slider } from '../../engine/ui.js';
import { SuperpositionPhysics } from '../../physics/mechanics/waves.js';
import { GraphRenderer } from '../../engine/graphRenderer.js';
import { MechanicsControlBar, MechanicsDataPanel, MechanicsModalOverlay } from '../../engine/mechanicsUI.js';

export class SuperpositionScene {
  constructor() {
    this.physics = new SuperpositionPhysics({
      a1: 2.0,
      f1: 1.0,
      lambda1: 10.0,
      a2: 2.0,
      f2: 1.0,
      lambda2: 10.0,
      phaseDiffDeg: 0
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
        { name: 'Linear Superposition', formula: 'y(x, t) = y₁(x, t) + y₂(x, t)', desc: 'Net displacement is algebraic sum of individual wave displacements' },
        { name: 'Constructive Interference', formula: 'Δφ = 2n·π (0°, 360°, ...)', desc: 'Waves in phase produce maximum resultant amplitude A = A₁ + A₂' },
        { name: 'Destructive Interference', formula: 'Δφ = (2n + 1)·π (180°, 540°, ...)', desc: 'Waves completely out of phase cancel out: A = |A₁ - A₂|' }
      ]),
      onOpenConcept: () => this.modal.openConcept('WAVE INTERFERENCE', {
        what: 'When two or more waves overlap in space and time, the resultant wave displacement at any point is the sum of the individual wave displacements.',
        how: 'If wave crests align with crests (in phase), they constructively reinforce. If crests align with troughs (180° out of phase), they destructively cancel.',
        keyIdea: 'Noise-canceling headphones utilize destructive superposition by generating an inverted (180° phase shifted) sound wave to cancel ambient noise.'
      }),
      onOpenProblem: () => this.modal.openProblem('WAVE_SPEED'),
      onBack: () => {
        import('./mechanicsMenuScene.js').then(m => this.sceneManager.changeScene(new m.MechanicsMenuScene()));
      }
    });

    this.dataPanel = new MechanicsDataPanel({ title: 'INTERFERENCE METRICS' });
    this.modal = new MechanicsModalOverlay();
    this.graph = new GraphRenderer({
      title: 'Individual Waves & Resultant y(x)',
      xLabel: 'Position x',
      xUnit: 'm',
      yLabel: 'Displacement',
      yUnit: 'm'
    });

    this.sliders = [];
    this.presetButtons = [];
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
    this.presetButtons = [];
    let sY = contentY + 15;
    const sW = sidebarW - 40;

    const btnW = (sW - 10) / 2;
    this.presetButtons.push(new Button({
      x: sidebarX + 20,
      y: sY,
      width: btnW,
      height: 26,
      text: 'IN-PHASE (0°)',
      color: '#0284C7',
      callback: () => this.setPhasePreset(0)
    }));

    this.presetButtons.push(new Button({
      x: sidebarX + 20 + btnW + 10,
      y: sY,
      width: btnW,
      height: 26,
      text: 'OUT (180°)',
      color: '#EF4444',
      callback: () => this.setPhasePreset(180)
    }));

    sY += 40;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: 0,
      max: 360,
      value: this.physics.phaseDiffDeg,
      step: 5,
      label: 'PHASE DIFF (Δφ)',
      unit: '°',
      accentColor: '#A855F7',
      callback: (val) => this.physics.setParameters(this.physics.a1, this.physics.f1, this.physics.a2, this.physics.f2, val)
    }));

    sY += 55;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: 0.5,
      max: 4.0,
      value: this.physics.a1,
      step: 0.2,
      label: 'WAVE 1 AMP (A₁)',
      unit: ' m',
      accentColor: Colors.cyan,
      callback: (val) => this.physics.setParameters(val, this.physics.f1, this.physics.a2, this.physics.f2, this.physics.phaseDiffDeg)
    }));

    sY += 55;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: 0.5,
      max: 4.0,
      value: this.physics.a2,
      step: 0.2,
      label: 'WAVE 2 AMP (A₂)',
      unit: ' m',
      accentColor: '#EC4899',
      callback: (val) => this.physics.setParameters(this.physics.a1, this.physics.f1, val, this.physics.f2, this.physics.phaseDiffDeg)
    }));

    this.sidebarRect = { x: sidebarX, y: contentY, w: sidebarW, h: contentH };
    this.dataPanel.setRect(sidebarX, contentY + 230, sidebarW, contentH - 230);

    const mainW = sidebarX - 40;
    const simH = Math.floor(contentH * 0.44);
    const graphH = contentH - simH - 15;

    this.simRect = { x: 20, y: contentY, w: mainW, h: simH };
    this.graph.setRect(20, contentY + simH + 15, mainW, graphH);
  }

  setPhasePreset(deg) {
    this.physics.setParameters(this.physics.a1, this.physics.f1, this.physics.a2, this.physics.f2, deg);
    if (this.sliders[0]) this.sliders[0].setValue(deg);
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
      return;
    }
    for (const btn of this.presetButtons) {
      btn.handleInput(inputManager);
    }
  }

  update(dt) {
    const effectiveDt = this.isSlowMo ? dt * 0.25 : dt;
    this.physics.update(effectiveDt);
    this.controlBar.setRunning(this.physics.isRunning);

    const isConstructive = Math.abs(this.physics.phaseDiffDeg % 360) < 15;
    const isDestructive = Math.abs((this.physics.phaseDiffDeg % 360) - 180) < 15;

    let stateLabel = 'INTERMEDIATE';
    if (isConstructive) stateLabel = 'CONSTRUCTIVE (Max Amp)';
    else if (isDestructive) stateLabel = 'DESTRUCTIVE (Min Amp)';

    this.dataPanel.setMetrics([
      { label: 'Phase Difference', value: `${this.physics.phaseDiffDeg}°` },
      { label: 'Wave 1 Amp (A₁)', value: `${this.physics.a1.toFixed(1)} m` },
      { label: 'Wave 2 Amp (A₂)', value: `${this.physics.a2.toFixed(1)} m` },
      { label: 'Max Possible Amp', value: `${(this.physics.a1 + this.physics.a2).toFixed(1)} m` },
      { label: 'Min Possible Amp', value: `${Math.abs(this.physics.a1 - this.physics.a2).toFixed(1)} m` },
      { label: 'Interference Type', value: stateLabel }
    ]);

    // Build curve datasets
    const maxDist = 30.0;
    const steps = 100;
    const ds1 = [];
    const ds2 = [];
    const dsRes = [];

    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * maxDist;
      const { y1, y2, yResultant } = this.physics.getWavesAt(x);
      ds1.push({ x, y: y1 });
      ds2.push({ x, y: y2 });
      dsRes.push({ x, y: yResultant });
    }

    this.graph.setDatasets([
      { label: 'Wave 1 (Cyan)', data: ds1, color: Colors.cyan, width: 1.5, dash: [4, 4] },
      { label: 'Wave 2 (Pink)', data: ds2, color: '#EC4899', width: 1.5, dash: [4, 4] },
      { label: 'Resultant (Yellow)', data: dsRes, color: Colors.yellow, width: 2.5 }
    ]);
    const maxA = this.physics.a1 + this.physics.a2 + 1;
    this.graph.setLimits(0, maxDist, -maxA, maxA);
  }

  render(ctx) {
    Renderer.drawRect(ctx, 0, 0, ctx.canvas.width, ctx.canvas.height, { fill: Colors.bgDark });

    this.controlBar.render(ctx);

    // Sidebar
    Renderer.drawCard(ctx, this.sidebarRect.x, this.sidebarRect.y, this.sidebarRect.w, this.sidebarRect.h, {
      title: 'CONTROLS & PRESETS',
      accentColor: '#A855F7'
    });

    for (const btn of this.presetButtons) {
      btn.render(ctx);
    }
    for (const slider of this.sliders) {
      slider.render(ctx);
    }
    this.dataPanel.render(ctx);

    // Simulation Viewport
    Renderer.drawCard(ctx, this.simRect.x, this.simRect.y, this.simRect.w, this.simRect.h, {
      title: 'WAVE OVERLAP & RESULTANT SUPERPOSITION',
      accentColor: Colors.yellow
    });

    this.renderWaveCanvas(ctx);

    // Graph
    this.graph.render(ctx);

    // Modal
    this.modal.render(ctx);
  }

  renderWaveCanvas(ctx) {
    const startX = this.simRect.x + 30;
    const endX = this.simRect.x + this.simRect.w - 30;
    const cy = this.simRect.y + this.simRect.h * 0.52;
    const length = endX - startX;

    // Axis
    Renderer.drawLine(ctx, startX, cy, endX, cy, { color: '#334155', width: 1, dash: [4, 4] });

    const pxPerM = length / 30.0;
    const ampScale = 10;

    // Draw Resultant Wave
    ctx.beginPath();
    ctx.strokeStyle = Colors.yellow;
    ctx.lineWidth = 3.5;

    for (let px = 0; px <= length; px += 2) {
      const xPhys = px / pxPerM;
      const { yResultant } = this.physics.getWavesAt(xPhys);
      const scrX = startX + px;
      const scrY = cy - yResultant * ampScale;
      if (px === 0) ctx.moveTo(scrX, scrY);
      else ctx.lineTo(scrX, scrY);
    }
    ctx.stroke();

    // Legends
    Renderer.drawCircle(ctx, startX + 15, this.simRect.y + 24, 4, { fill: Colors.cyan });
    Renderer.drawText(ctx, 'Wave 1', startX + 25, this.simRect.y + 28, { color: Colors.cyan, size: 11 });

    Renderer.drawCircle(ctx, startX + 90, this.simRect.y + 24, 4, { fill: '#EC4899' });
    Renderer.drawText(ctx, 'Wave 2', startX + 100, this.simRect.y + 28, { color: '#EC4899', size: 11 });

    Renderer.drawCircle(ctx, startX + 165, this.simRect.y + 24, 4, { fill: Colors.yellow });
    Renderer.drawText(ctx, 'Resultant (y₁ + y₂)', startX + 175, this.simRect.y + 28, { color: Colors.yellow, size: 11, weight: 'bold' });
  }
}
