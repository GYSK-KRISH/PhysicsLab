// Standing Wave Laboratory Scene for PhysicsLab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Button, Slider } from '../../engine/ui.js';
import { StandingWavePhysics } from '../../physics/mechanics/waves.js';
import { GraphRenderer } from '../../engine/graphRenderer.js';
import { MechanicsControlBar, MechanicsDataPanel, MechanicsModalOverlay } from '../../engine/mechanicsUI.js';

export class StandingWaveScene {
  constructor() {
    this.physics = new StandingWavePhysics({
      length: 20.0,
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
      onOpenFormula: () => this.modal.openFormula('STANDING WAVES ON A STRING', [
        { name: 'Wave Speed on String', formula: 'v = √(T / μ)', desc: 'T is string tension, μ is linear mass density' },
        { name: 'Harmonic Wavelength', formula: 'λₙ = 2·L / n', desc: 'Boundary condition requires zero displacement at both fixed ends' },
        { name: 'Harmonic Frequency', formula: 'fₙ = n · v / (2·L) = n · f₁', desc: 'Integer multiples of the fundamental frequency' },
        { name: 'Standing Wave Function', formula: 'y(x, t) = 2A · sin(k·x) · cos(ω·t)', desc: 'Product of spatial mode envelope and harmonic oscillation' }
      ]),
      onOpenConcept: () => this.modal.openConcept('STANDING WAVES & HARMONICS', {
        what: 'A standing wave forms from the superposition of two identical waves traveling in opposite directions along a bounded medium.',
        how: 'Nodes are points of complete destructive interference that remain permanently stationary. Antinodes are points of maximum constructive interference.',
        keyIdea: 'Musical instruments (like guitars, violins, and pianos) produce pitch by exciting standing wave harmonics on tensioned strings.'
      }),
      onOpenProblem: () => this.modal.openProblem('WAVE_SPEED'),
      onBack: () => {
        import('./mechanicsMenuScene.js').then(m => this.sceneManager.changeScene(new m.MechanicsMenuScene()));
      }
    });

    this.dataPanel = new MechanicsDataPanel({ title: 'STANDING WAVE METRICS' });
    this.modal = new MechanicsModalOverlay();
    this.graph = new GraphRenderer({
      title: 'String Displacement Profile y(x) & Envelope',
      xLabel: 'Position along string x',
      xUnit: 'm',
      yLabel: 'Displacement',
      yUnit: 'm'
    });

    this.sliders = [];
    this.harmonicButtons = [];
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
    this.harmonicButtons = [];
    let sY = contentY + 15;
    const sW = sidebarW - 40;

    // Harmonic selector buttons (n = 1, 2, 3, 4, 5)
    const btnW = (sW - 16) / 5;
    for (let n = 1; n <= 5; n++) {
      this.harmonicButtons.push(new Button({
        x: sidebarX + 20 + (n - 1) * (btnW + 4),
        y: sY,
        width: btnW,
        height: 28,
        text: `n=${n}`,
        color: this.physics.harmonicN === n ? '#0284C7' : '#334155',
        callback: () => {
          this.physics.setParameters(this.physics.length, this.physics.tension, this.physics.linearDensity, n);
          this.updateHarmonicBtnColors();
        }
      }));
    }

    sY += 45;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: 20,
      max: 400,
      value: this.physics.tension,
      step: 10,
      label: 'TENSION (T)',
      unit: ' N',
      accentColor: '#EF4444',
      callback: (val) => this.physics.setParameters(this.physics.length, val, this.physics.linearDensity, this.physics.harmonicN)
    }));

    sY += 55;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: 0.005,
      max: 0.05,
      value: this.physics.linearDensity,
      step: 0.005,
      label: 'LINEAR DENSITY (μ)',
      unit: ' kg/m',
      accentColor: Colors.yellow,
      callback: (val) => this.physics.setParameters(this.physics.length, this.physics.tension, val, this.physics.harmonicN)
    }));

    sY += 55;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: 5.0,
      max: 30.0,
      value: this.physics.length,
      step: 1.0,
      label: 'STRING LENGTH (L)',
      unit: ' m',
      accentColor: Colors.cyan,
      callback: (val) => this.physics.setParameters(val, this.physics.tension, this.physics.linearDensity, this.physics.harmonicN)
    }));

    this.sidebarRect = { x: sidebarX, y: contentY, w: sidebarW, h: contentH };
    this.dataPanel.setRect(sidebarX, contentY + 230, sidebarW, contentH - 230);

    const mainW = sidebarX - 40;
    const simH = Math.floor(contentH * 0.44);
    const graphH = contentH - simH - 15;

    this.simRect = { x: 20, y: contentY, w: mainW, h: simH };
    this.graph.setRect(20, contentY + simH + 15, mainW, graphH);
  }

  updateHarmonicBtnColors() {
    this.harmonicButtons.forEach((btn, idx) => {
      btn.color = (this.physics.harmonicN === idx + 1) ? '#0284C7' : '#334155';
    });
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
    for (const btn of this.harmonicButtons) {
      btn.handleInput(inputManager);
    }
  }

  update(dt) {
    const effectiveDt = this.isSlowMo ? dt * 0.25 : dt;
    this.physics.update(effectiveDt);
    this.controlBar.setRunning(this.physics.isRunning);

    this.dataPanel.setMetrics([
      { label: 'Harmonic Number (n)', value: `${this.physics.harmonicN} (${this.physics.harmonicN === 1 ? 'Fundamental' : `${this.physics.harmonicN}th Harmonic`})` },
      { label: 'Wave Speed (v)', value: `${this.physics.waveSpeed.toFixed(1)} m/s` },
      { label: 'Frequency (fₙ)', value: `${this.physics.frequency.toFixed(2)} Hz` },
      { label: 'Wavelength (λₙ)', value: `${this.physics.wavelength.toFixed(2)} m` },
      { label: 'Nodes Count (N)', value: `${this.physics.nodes.length}` },
      { label: 'Antinodes (A)', value: `${this.physics.antinodes.length}` }
    ]);

    // Graph profile
    const steps = 100;
    const dsLive = [];
    const dsEnvPos = [];
    const dsEnvNeg = [];

    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * this.physics.length;
      const y = this.physics.getDisplacementAt(x);
      const env = 2 * this.physics.amplitude * Math.abs(Math.sin(this.physics.k * x));
      dsLive.push({ x, y });
      dsEnvPos.push({ x, y: env });
      dsEnvNeg.push({ x, y: -env });
    }

    this.graph.setDatasets([
      { label: 'String Shape y(x, t)', data: dsLive, color: Colors.cyan, width: 2.5 },
      { label: '+Envelope', data: dsEnvPos, color: '#64748B', width: 1, dash: [4, 4] },
      { label: '-Envelope', data: dsEnvNeg, color: '#64748B', width: 1, dash: [4, 4] }
    ]);
    const maxA = 2 * this.physics.amplitude * 1.3;
    this.graph.setLimits(0, this.physics.length, -maxA, maxA);
  }

  render(ctx) {
    Renderer.drawRect(ctx, 0, 0, ctx.canvas.width, ctx.canvas.height, { fill: Colors.bgDark });

    this.controlBar.render(ctx);

    // Sidebar
    Renderer.drawCard(ctx, this.sidebarRect.x, this.sidebarRect.y, this.sidebarRect.w, this.sidebarRect.h, {
      title: 'HARMONIC & STRING CONTROLS',
      accentColor: '#0284C7'
    });

    for (const btn of this.harmonicButtons) {
      btn.render(ctx);
    }
    for (const slider of this.sliders) {
      slider.render(ctx);
    }
    this.dataPanel.render(ctx);

    // Simulation Viewport
    Renderer.drawCard(ctx, this.simRect.x, this.simRect.y, this.simRect.w, this.simRect.h, {
      title: `STANDING WAVE (HARMONIC n = ${this.physics.harmonicN}, f = ${this.physics.frequency.toFixed(1)} Hz)`,
      accentColor: Colors.cyan
    });

    this.renderString(ctx);

    // Graph
    this.graph.render(ctx);

    // Modal
    this.modal.render(ctx);
  }

  renderString(ctx) {
    const startX = this.simRect.x + 40;
    const endX = this.simRect.x + this.simRect.w - 40;
    const cy = this.simRect.y + this.simRect.h * 0.52;
    const lengthPx = endX - startX;

    // Fixed end supports
    Renderer.drawRect(ctx, startX - 12, cy - 45, 12, 90, { fill: '#334155' });
    Renderer.drawRect(ctx, endX, cy - 45, 12, 90, { fill: '#334155' });

    // Reference axis
    Renderer.drawLine(ctx, startX, cy, endX, cy, { color: '#1E293B', width: 1, dash: [4, 4] });

    const pxPerM = lengthPx / this.physics.length;
    const ampScale = 14;

    // Draw Dotted Envelope
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    for (let px = 0; px <= lengthPx; px += 2) {
      const xPhys = px / pxPerM;
      const env = 2 * this.physics.amplitude * Math.sin(this.physics.k * xPhys);
      const scrX = startX + px;
      const scrY = cy - env * ampScale;
      if (px === 0) ctx.moveTo(scrX, scrY);
      else ctx.lineTo(scrX, scrY);
    }
    for (let px = 0; px <= lengthPx; px += 2) {
      const xPhys = px / pxPerM;
      const env = -2 * this.physics.amplitude * Math.sin(this.physics.k * xPhys);
      const scrX = startX + px;
      const scrY = cy - env * ampScale;
      if (px === 0) ctx.moveTo(scrX, scrY);
      else ctx.lineTo(scrX, scrY);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Vibrating String
    ctx.beginPath();
    ctx.strokeStyle = Colors.cyan;
    ctx.lineWidth = 3.5;
    for (let px = 0; px <= lengthPx; px += 2) {
      const xPhys = px / pxPerM;
      const yPhys = this.physics.getDisplacementAt(xPhys);
      const scrX = startX + px;
      const scrY = cy - yPhys * ampScale;
      if (px === 0) ctx.moveTo(scrX, scrY);
      else ctx.lineTo(scrX, scrY);
    }
    ctx.stroke();

    // Mark Nodes (N)
    for (const nodeX of this.physics.nodes) {
      const scrX = startX + nodeX * pxPerM;
      Renderer.drawCircle(ctx, scrX, cy, 5, { fill: '#EF4444', stroke: '#FFFFFF', width: 1.5 });
      Renderer.drawText(ctx, 'N', scrX, cy + 20, { color: '#EF4444', size: 11, weight: 'bold', align: 'center' });
    }

    // Mark Antinodes (A)
    for (const antinodeX of this.physics.antinodes) {
      const scrX = startX + antinodeX * pxPerM;
      Renderer.drawCircle(ctx, scrX, cy - 35, 4, { fill: '#10B981' });
      Renderer.drawText(ctx, 'A', scrX, cy - 42, { color: '#10B981', size: 11, weight: 'bold', align: 'center' });
    }
  }
}
