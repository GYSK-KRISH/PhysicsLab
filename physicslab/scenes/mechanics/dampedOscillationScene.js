// Damped Oscillation Laboratory Scene for PhysicsLab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Slider } from '../../engine/ui.js';
import { DampedOscillationPhysics } from '../../physics/mechanics/shm.js';
import { GraphRenderer } from '../../engine/graphRenderer.js';
import { MechanicsControlBar, MechanicsDataPanel, MechanicsModalOverlay } from '../../engine/mechanicsUI.js';

export class DampedOscillationScene {
  constructor() {
    this.physics = new DampedOscillationPhysics({ mass: 2.0, dampingCoeff: 0.8, springConstant: 30.0, initialDisp: 6.0 });
    this.controlBar = new MechanicsControlBar({
      onPlay: () => this.physics.start(),
      onPause: () => this.physics.pause(),
      onReset: () => this.physics.reset(),
      onStepForward: () => this.physics.update(0.05),
      onToggleSlowMo: () => {
        this.isSlowMo = !this.isSlowMo;
        this.controlBar.setSlowMo(this.isSlowMo);
      },
      onOpenFormula: () => this.modal.openFormula('DAMPED OSCILLATIONS', [
        { name: 'Differential Equation', formula: 'm·x\'\' + c·x\' + k·x = 0', desc: 'Second-order linear ODE with viscous damping term' },
        { name: 'Discriminant Classification', formula: 'Δ = c² - 4·m·k', desc: 'Underdamped (c² < 4mk), Critical (c² = 4mk), Overdamped (c² > 4mk)' },
        { name: 'Decay Envelope', formula: 'A(t) = A₀ · e^{-γ·t},  where γ = c / (2m)', desc: 'Exponential amplitude attenuation curve' }
      ]),
      onOpenConcept: () => this.modal.openConcept('DAMPED OSCILLATIONS', {
        what: 'Damping introduces dissipative resistive drag (like air or oil friction) that removes mechanical energy from an oscillating system.',
        how: 'Underdamping produces decaying oscillations; critical damping returns to equilibrium as fast as possible without overshoot; overdamping creates sluggish non-oscillatory return.',
        keyIdea: 'Car shock absorbers are tuned precisely to critical damping (c² = 4mk) for optimal passenger comfort and wheel grip.'
      }),
      onOpenProblem: () => this.modal.openProblem('SHM_TIME_PERIOD'),
      onBack: () => {
        import('./mechanicsMenuScene.js').then(m => this.sceneManager.changeScene(new m.MechanicsMenuScene()));
      }
    });

    this.dataPanel = new MechanicsDataPanel({ title: 'DAMPING METRICS' });
    this.modal = new MechanicsModalOverlay();
    this.graph = new GraphRenderer({
      title: 'Displacement x(t) & Decay Envelope vs Time',
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
      min: 0,
      max: 20,
      value: this.physics.dampingCoeff,
      step: 0.2,
      label: 'DAMPING COEFF (c)',
      unit: ' N·s/m',
      accentColor: '#EF4444',
      callback: (val) => this.physics.setParameters(this.physics.mass, val, this.physics.springConstant, this.physics.initialDisp)
    }));

    sY += 55;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: 10,
      max: 100,
      value: this.physics.springConstant,
      step: 5,
      label: 'SPRING CONSTANT (k)',
      unit: ' N/m',
      accentColor: Colors.yellow,
      callback: (val) => this.physics.setParameters(this.physics.mass, this.physics.dampingCoeff, val, this.physics.initialDisp)
    }));

    sY += 55;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: 0.5,
      max: 8,
      value: this.physics.mass,
      step: 0.5,
      label: 'MASS (m)',
      unit: ' kg',
      accentColor: Colors.cyan,
      callback: (val) => this.physics.setParameters(val, this.physics.dampingCoeff, this.physics.springConstant, this.physics.initialDisp)
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

    if (this.modal.isOpen) {
      this.modal.update(dt, this.inputManager);
      return;
    }

    this.controlBar.update(dt, this.inputManager);
    for (const s of this.sliders) s.update(dt, this.inputManager);

    const criticalC = 2 * Math.sqrt(this.physics.mass * this.physics.springConstant);

    this.dataPanel.setItems([
      { label: 'Damping Regime', value: this.physics.regime, unit: '', color: this.physics.type === 'UNDERDAMPED' ? Colors.cyan : (this.physics.type === 'CRITICAL' ? Colors.green : '#EF4444') },
      { label: 'Critical Threshold (2√mk)', value: criticalC.toFixed(2), unit: 'N·s/m', color: Colors.yellow },
      { label: 'Current Damping (c)', value: this.physics.dampingCoeff.toFixed(2), unit: 'N·s/m', color: Colors.text },
      { label: 'Decay Factor γ = c/(2m)', value: this.physics.gamma.toFixed(3), unit: 's⁻¹', color: Colors.purple },
      { label: 'Natural Freq (ω₀)', value: this.physics.omega0.toFixed(2), unit: 'rad/s', color: Colors.green }
    ]);

    const xPts = this.physics.history.map(h => ({ x: h.t, y: h.x }));
    const envPts = this.physics.history.map(h => ({ x: h.t, y: h.envelope }));
    const negEnvPts = this.physics.history.map(h => ({ x: h.t, y: h.negEnvelope }));

    this.graph.clearDatasets();
    this.graph.addDataset({ label: 'Position x(t)', color: Colors.cyan, points: xPts });
    this.graph.addDataset({ label: '+Envelope', color: 'rgba(250, 204, 21, 0.6)', points: envPts });
    this.graph.addDataset({ label: '-Envelope', color: 'rgba(250, 204, 21, 0.6)', points: negEnvPts });
  }

  render(ctx) {
    const { width, height } = this.canvasEngine.getBounds();

    Renderer.drawRect(ctx, 0, 0, width, height, { fill: Colors.background });
    Renderer.drawGrid(ctx, width, height, 40);

    this.controlBar.render(ctx);

    if (this.sidebarRect) {
      Renderer.drawPanel(ctx, this.sidebarRect.x, this.sidebarRect.y, this.sidebarRect.w, this.sidebarRect.h, {
        fill: Colors.panel,
        stroke: Colors.panelBorder
      });
      for (const s of this.sliders) s.render(ctx);
      this.dataPanel.render(ctx);
    }

    if (this.simRect) {
      Renderer.drawPanel(ctx, this.simRect.x, this.simRect.y, this.simRect.w, this.simRect.h, {
        fill: '#090E1A',
        stroke: Colors.panelBorder
      });

      const trackY = this.simRect.y + this.simRect.h / 2;
      const wallX = this.simRect.x + 60;
      const eqX = this.simRect.x + this.simRect.w / 2;
      const scale = 20.0;
      const massX = eqX + this.physics.pos * scale;

      Renderer.drawRect(ctx, wallX - 16, trackY - 50, 16, 100, { fill: '#151F30', stroke: Colors.panelBorder });

      // Spring & Dashpot Damper in parallel
      VectorRenderer.drawSpring(ctx, wallX, trackY - 16, massX - 30, trackY - 16, 12, 10, { color: Colors.yellow });

      // Dashpot / Damper Cylinder
      const dashX = (wallX + massX - 30) / 2;
      Renderer.drawRect(ctx, wallX, trackY + 12, 80, 16, { fill: '#0E1726', stroke: Colors.panelBorder });
      Renderer.drawLine(ctx, wallX + 60, trackY + 20, massX - 30, trackY + 20, { stroke: '#EF4444', lineWidth: 3 });

      // Mass Block
      Renderer.drawRoundedRect(ctx, massX - 30, trackY - 25, 60, 50, 6, {
        fill: '#152136',
        stroke: Colors.cyan,
        lineWidth: 2,
        glowColor: Colors.cyan,
        glowBlur: 8
      });
      Renderer.drawText(ctx, `${this.physics.mass}kg`, massX, trackY, { fill: Colors.text, font: 'bold 11px "Segoe UI"', align: 'center', baseline: 'middle' });
    }

    this.graph.render(ctx);
    this.modal.render(ctx, width, height);
  }
}
