// Wave Laboratory Scene for PhysicsLab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Button, Slider } from '../../engine/ui.js';
import { WaveLabPhysics } from '../../physics/mechanics/waves.js';
import { GraphRenderer } from '../../engine/graphRenderer.js';
import { MechanicsControlBar, MechanicsDataPanel, MechanicsModalOverlay } from '../../engine/mechanicsUI.js';

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
    this.controlBar.setBounds(20, 12, width - 40);

    const sidebarW = Math.max(260, Math.min(320, width * 0.28));
    const sidebarX = width - sidebarW - 20;
    const contentY = 64;
    const contentH = height - contentY - 20;

    this.sliders = [];
    this.typeButtons = [];
    let sY = contentY + 15;
    const sW = sidebarW - 40;

    const btnW = (sW - 10) / 2;
    this.typeButtons.push(new Button({
      x: sidebarX + 20,
      y: sY,
      width: btnW,
      height: 28,
      text: 'TRANSVERSE',
      color: this.physics.waveType === 'TRANSVERSE' ? '#0284C7' : '#334155',
      callback: () => {
        this.physics.waveType = 'TRANSVERSE';
        this.updateButtonColors();
      }
    }));

    this.typeButtons.push(new Button({
      x: sidebarX + 20 + btnW + 10,
      y: sY,
      width: btnW,
      height: 28,
      text: 'LONGITUDINAL',
      color: this.physics.waveType === 'LONGITUDINAL' ? '#0284C7' : '#334155',
      callback: () => {
        this.physics.waveType = 'LONGITUDINAL';
        this.updateButtonColors();
      }
    }));

    sY += 45;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: 0.5,
      max: 5.0,
      value: this.physics.amplitude,
      step: 0.2,
      label: 'AMPLITUDE (A)',
      unit: ' m',
      accentColor: Colors.cyan,
      callback: (val) => this.physics.setParameters(val, this.physics.frequency, this.physics.wavelength, this.physics.waveType)
    }));

    sY += 55;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: 0.2,
      max: 5.0,
      value: this.physics.frequency,
      step: 0.1,
      label: 'FREQUENCY (f)',
      unit: ' Hz',
      accentColor: Colors.yellow,
      callback: (val) => this.physics.setParameters(this.physics.amplitude, val, this.physics.wavelength, this.physics.waveType)
    }));

    sY += 55;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: 4.0,
      max: 25.0,
      value: this.physics.wavelength,
      step: 1.0,
      label: 'WAVELENGTH (λ)',
      unit: ' m',
      accentColor: '#10B981',
      callback: (val) => this.physics.setParameters(this.physics.amplitude, this.physics.frequency, val, this.physics.waveType)
    }));

    this.sidebarRect = { x: sidebarX, y: contentY, w: sidebarW, h: contentH };
    this.dataPanel.setRect(sidebarX, contentY + 230, sidebarW, contentH - 230);

    const mainW = sidebarX - 40;
    const simH = Math.floor(contentH * 0.44);
    const graphH = contentH - simH - 15;

    this.simRect = { x: 20, y: contentY, w: mainW, h: simH };
    this.graph.setRect(20, contentY + simH + 15, mainW, graphH);
  }

  updateButtonColors() {
    if (this.typeButtons.length >= 2) {
      this.typeButtons[0].color = this.physics.waveType === 'TRANSVERSE' ? '#0284C7' : '#334155';
      this.typeButtons[1].color = this.physics.waveType === 'LONGITUDINAL' ? '#0284C7' : '#334155';
    }
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
    for (const btn of this.typeButtons) {
      btn.handleInput(inputManager);
    }
  }

  update(dt) {
    const effectiveDt = this.isSlowMo ? dt * 0.25 : dt;
    this.physics.update(effectiveDt);
    this.controlBar.setRunning(this.physics.isRunning);

    this.dataPanel.setMetrics([
      { label: 'Wave Speed (v = fλ)', value: `${this.physics.waveSpeed.toFixed(2)} m/s` },
      { label: 'Period (T = 1/f)', value: `${this.physics.period.toFixed(3)} s` },
      { label: 'Angular Freq (ω)', value: `${this.physics.omega.toFixed(2)} rad/s` },
      { label: 'Wave Number (k)', value: `${this.physics.k.toFixed(3)} rad/m` },
      { label: 'Wavelength (λ)', value: `${this.physics.wavelength.toFixed(1)} m` },
      { label: 'Amplitude (A)', value: `${this.physics.amplitude.toFixed(2)} m` },
      { label: 'Simulation Time', value: `${this.physics.time.toFixed(2)} s` }
    ]);

    // Update graph profile
    const profilePoints = [];
    const maxDist = 30.0;
    const steps = 100;
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * maxDist;
      const y = this.physics.getDisplacementAt(x);
      profilePoints.push({ x, y });
    }

    this.graph.setDatasets([
      { label: 'Displacement y(x)', data: profilePoints, color: Colors.cyan, width: 2.5 }
    ]);
    this.graph.setLimits(0, maxDist, -this.physics.amplitude * 1.3, this.physics.amplitude * 1.3);
  }

  render(ctx) {
    Renderer.drawRect(ctx, 0, 0, ctx.canvas.width, ctx.canvas.height, { fill: Colors.bgDark });

    this.controlBar.render(ctx);

    // Sidebar
    Renderer.drawCard(ctx, this.sidebarRect.x, this.sidebarRect.y, this.sidebarRect.w, this.sidebarRect.h, {
      title: 'WAVE PARAMETERS',
      accentColor: '#10B981'
    });

    for (const btn of this.typeButtons) {
      btn.render(ctx);
    }
    for (const slider of this.sliders) {
      slider.render(ctx);
    }
    this.dataPanel.render(ctx);

    // Simulation Viewport
    Renderer.drawCard(ctx, this.simRect.x, this.simRect.y, this.simRect.w, this.simRect.h, {
      title: `PROPAGATION: ${this.physics.waveType} WAVE (v = ${this.physics.waveSpeed.toFixed(1)} m/s)`,
      accentColor: Colors.cyan
    });

    this.renderWaveMedium(ctx);

    // Graph
    this.graph.render(ctx);

    // Modal
    this.modal.render(ctx);
  }

  renderWaveMedium(ctx) {
    const startX = this.simRect.x + 30;
    const endX = this.simRect.x + this.simRect.w - 30;
    const cy = this.simRect.y + this.simRect.h * 0.52;
    const length = endX - startX;

    if (this.physics.waveType === 'TRANSVERSE') {
      // Draw reference equilibrium axis
      Renderer.drawLine(ctx, startX, cy, endX, cy, { color: '#334155', width: 1, dash: [4, 4] });

      // Continuous wave line
      ctx.beginPath();
      ctx.strokeStyle = Colors.cyan;
      ctx.lineWidth = 3;

      const pxPerM = length / 30.0;
      const ampScale = 12;

      for (let px = 0; px <= length; px += 2) {
        const xPhys = px / pxPerM;
        const yPhys = this.physics.getDisplacementAt(xPhys);
        const scrX = startX + px;
        const scrY = cy - yPhys * ampScale;
        if (px === 0) ctx.moveTo(scrX, scrY);
        else ctx.lineTo(scrX, scrY);
      }
      ctx.stroke();

      // Draw distinct oscillating beads/particles
      const numBeads = 24;
      for (let i = 0; i <= numBeads; i++) {
        const px = (i / numBeads) * length;
        const xPhys = px / pxPerM;
        const yPhys = this.physics.getDisplacementAt(xPhys);
        const scrX = startX + px;
        const scrY = cy - yPhys * ampScale;

        Renderer.drawCircle(ctx, scrX, scrY, 4, {
          fill: i % 4 === 0 ? '#EF4444' : Colors.yellow,
          stroke: '#FFFFFF',
          width: 1
        });
      }

      // Indicator for wave speed direction
      Renderer.drawText(ctx, `Propagation Speed v ➔ ${this.physics.waveSpeed.toFixed(1)} m/s`, endX - 160, this.simRect.y + 24, {
        color: '#38BDF8',
        size: 11,
        weight: 'bold'
      });

    } else {
      // LONGITUDINAL WAVE
      // Draw vibrating density bars / compressions & rarefactions
      const numLines = 60;
      const pxPerM = length / 30.0;
      const ampScale = 8;

      for (let i = 0; i <= numLines; i++) {
        const unperturbedX = startX + (i / numLines) * length;
        const xPhys = (i / numLines) * 30.0;
        const displacement = this.physics.getDisplacementAt(xPhys);
        const actualX = unperturbedX + displacement * ampScale;

        // Draw vertical particle lines
        const isHighlight = i % 8 === 0;
        Renderer.drawLine(ctx, actualX, cy - 35, actualX, cy + 35, {
          color: isHighlight ? '#EF4444' : '#38BDF8',
          width: isHighlight ? 3 : 1.5
        });
      }

      Renderer.drawText(ctx, 'COMPRESSION ➔ Rarefaction ➔ COMPRESSION', startX + 20, cy - 50, {
        color: '#94A3B8',
        size: 11
      });
    }
  }
}
