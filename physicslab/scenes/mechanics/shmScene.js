// Simple Harmonic Motion Laboratory Scene for PhysicsLab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Slider } from '../../engine/ui.js';
import { SHMPhysics } from '../../physics/mechanics/shm.js';
import { VectorRenderer } from '../../engine/vectorRenderer.js';
import { GraphRenderer } from '../../engine/graphRenderer.js';
import { MechanicsControlBar, MechanicsDataPanel, MechanicsModalOverlay } from '../../engine/mechanicsUI.js';

export class SHMScene {
  constructor() {
    this.physics = new SHMPhysics({ mass: 2.0, springConstant: 40.0, amplitude: 4.0, phaseRad: 0 });
    this.controlBar = new MechanicsControlBar({
      onPlay: () => this.physics.start(),
      onPause: () => this.physics.pause(),
      onReset: () => this.physics.reset(),
      onStepForward: () => this.physics.update(0.05),
      onToggleSlowMo: () => {
        this.isSlowMo = !this.isSlowMo;
        this.controlBar.setSlowMo(this.isSlowMo);
      },
      onOpenFormula: () => this.modal.openFormula('SIMPLE HARMONIC MOTION (SHM)', [
        { name: 'Displacement Equation', formula: 'x(t) = A·cos(ω·t + φ)', desc: 'Sinusoidal oscillation around equilibrium position' },
        { name: 'Angular Frequency & Period', formula: 'ω = √(k / m),  T = 2π·√(m / k)', desc: 'Natural oscillation frequency determined by mass and spring constant' },
        { name: 'Restoring Acceleration', formula: 'a(t) = -ω²·x(t)', desc: 'Acceleration always proportional and directed oppositely to displacement' }
      ]),
      onOpenConcept: () => this.modal.openConcept('SIMPLE HARMONIC MOTION', {
        what: 'Simple Harmonic Motion (SHM) is periodic oscillatory motion where the restoring force is directly proportional to displacement from equilibrium.',
        how: 'Hooke\'s law F = -k·x pulls the mass back towards x = 0. Inertia carries the mass past equilibrium, sustaining eternal cycles in frictionless systems.',
        keyIdea: 'Velocity is 90° out of phase with displacement; acceleration is 180° out of phase with displacement.'
      }),
      onOpenProblem: () => this.modal.openProblem('SHM_TIME_PERIOD'),
      onBack: () => {
        import('./mechanicsMenuScene.js').then(m => this.sceneManager.changeScene(new m.MechanicsMenuScene()));
      }
    });

    this.dataPanel = new MechanicsDataPanel({ title: 'SHM STATE DATA' });
    this.modal = new MechanicsModalOverlay();
    this.graph = new GraphRenderer({
      title: 'Displacement x(t) & Velocity v(t) vs Time',
      xLabel: 'Time',
      xUnit: 's',
      yLabel: 'Oscillation',
      yUnit: 'm, m/s'
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
      min: 0.5,
      max: 10,
      value: this.physics.mass,
      step: 0.5,
      label: 'OSCILLATOR MASS (m)',
      unit: ' kg',
      accentColor: Colors.cyan,
      callback: (val) => this.physics.setParameters(val, this.physics.springConstant, this.physics.amplitude)
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
      callback: (val) => this.physics.setParameters(this.physics.mass, val, this.physics.amplitude)
    }));

    sY += 55;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: 1,
      max: 6,
      value: this.physics.amplitude,
      step: 0.5,
      label: 'AMPLITUDE (A)',
      unit: ' m',
      accentColor: Colors.purple,
      callback: (val) => this.physics.setParameters(this.physics.mass, this.physics.springConstant, val)
    }));

    this.sidebarRect = { x: sidebarX, y: contentY, w: sidebarW, h: contentH };
    this.dataPanel.setRect(sidebarX, contentY + 200, sidebarW, contentH - 200);

    const mainW = sidebarX - 40;
    const simH = Math.floor(contentH * 0.52);
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

    const st = this.physics.getCurrentState();
    this.dataPanel.setItems([
      { label: 'Time (t)', value: st.t.toFixed(2), unit: 's', color: Colors.text },
      { label: 'Displacement (x)', value: st.x.toFixed(2), unit: 'm', color: Colors.purple },
      { label: 'Velocity (v)', value: st.v.toFixed(2), unit: 'm/s', color: Colors.cyan },
      { label: 'Acceleration (a)', value: st.a.toFixed(2), unit: 'm/s²', color: Colors.yellow },
      { label: 'Angular Freq (ω)', value: this.physics.omega.toFixed(2), unit: 'rad/s', color: Colors.green },
      { label: 'Period (T)', value: this.physics.period.toFixed(2), unit: 's', color: Colors.textMuted }
    ]);

    const xPts = this.physics.history.map(h => ({ x: h.t, y: h.x }));
    const vPts = this.physics.history.map(h => ({ x: h.t, y: h.v }));

    this.graph.clearDatasets();
    this.graph.addDataset({ label: 'Position x(t)', color: Colors.purple, points: xPts });
    this.graph.addDataset({ label: 'Velocity v(t)', color: Colors.cyan, points: vPts });
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
      const scale = 22.0;

      const st = this.physics.getCurrentState();
      const massX = eqX + st.x * scale;

      // Rigid Wall Support
      Renderer.drawRect(ctx, wallX - 16, trackY - 60, 16, 120, {
        fill: '#151F30',
        stroke: Colors.panelBorder
      });

      // Equilibrium dashed line
      Renderer.drawLine(ctx, eqX, trackY - 50, eqX, trackY + 50, {
        stroke: 'rgba(255, 255, 255, 0.2)',
        lineWidth: 1.5,
        lineDash: [4, 4]
      });
      Renderer.drawText(ctx, 'x = 0', eqX, trackY + 65, {
        fill: Colors.textMuted,
        font: '11px "Segoe UI"',
        align: 'center'
      });

      // Coiled Spring
      VectorRenderer.drawSpring(ctx, wallX, trackY, massX - 30, trackY, 14, 14, {
        color: Colors.cyan,
        glow: true
      });

      // Moving Mass Block
      const bw = 60;
      const bh = 50;
      Renderer.drawRoundedRect(ctx, massX - bw / 2, trackY - bh / 2, bw, bh, 6, {
        fill: '#152136',
        stroke: Colors.purple,
        lineWidth: 2.5,
        glowColor: Colors.purple,
        glowBlur: 10
      });

      Renderer.drawText(ctx, `${this.physics.mass}kg`, massX, trackY, {
        fill: Colors.text,
        font: 'bold 12px "Segoe UI"',
        align: 'center',
        baseline: 'middle'
      });

      // Live Vectors
      if (this.controlBar.showVectors) {
        // Velocity (Cyan)
        VectorRenderer.drawVector(ctx, massX, trackY - bh / 2 - 12, st.v * 4.0, 0, 1.0, {
          color: Colors.cyan,
          label: `v = ${st.v.toFixed(1)}`
        });

        // Restoring Force / Acceleration (Yellow - points toward equilibrium)
        VectorRenderer.drawVector(ctx, massX, trackY + bh / 2 + 12, st.a * 2.0, 0, 1.0, {
          color: Colors.yellow,
          label: `a = ${st.a.toFixed(1)}`
        });
      }
    }

    this.graph.render(ctx);
    this.modal.render(ctx, width, height);
  }
}
