// SHM Energy Conservation Laboratory Scene for PhysicsLab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Slider } from '../../engine/ui.js';
import { SHMPhysics } from '../../physics/mechanics/shm.js';
import { GraphRenderer } from '../../engine/graphRenderer.js';
import { MechanicsControlBar, MechanicsDataPanel, MechanicsModalOverlay } from '../../engine/mechanicsUI.js';

export class SHMEnergyScene {
  constructor() {
    this.physics = new SHMPhysics({ mass: 2.0, springConstant: 50.0, amplitude: 5.0 });
    this.controlBar = new MechanicsControlBar({
      onPlay: () => this.physics.start(),
      onPause: () => this.physics.pause(),
      onReset: () => this.physics.reset(),
      onStepForward: () => this.physics.update(0.05),
      onToggleSlowMo: () => {
        this.isSlowMo = !this.isSlowMo;
        this.controlBar.setSlowMo(this.isSlowMo);
      },
      onOpenFormula: () => this.modal.openFormula('SHM ENERGY CONSERVATION', [
        { name: 'Potential Energy', formula: 'U(t) = ½·k·x² = ½·k·A²·cos²(ωt)', desc: 'Elastic energy stored in spring extension/compression' },
        { name: 'Kinetic Energy', formula: 'K(t) = ½·m·v² = ½·k·A²·sin²(ωt)', desc: 'Energy of moving mass, maximum at x = 0' },
        { name: 'Total Mechanical Energy', formula: 'E_total = U + K = ½·k·A² = constant', desc: 'Continuous energy oscillation with constant total sum' }
      ]),
      onOpenConcept: () => this.modal.openConcept('SHM ENERGY OSCILLATION', {
        what: 'In Simple Harmonic Motion, energy continuously transforms back and forth between potential energy (stored in spring) and kinetic energy (mass motion).',
        how: 'At maximum displacement (x = ±A), velocity is zero and all energy is purely potential. At equilibrium (x = 0), potential is zero and all energy is kinetic.',
        keyIdea: 'KE + PE equals constant ½kA² at every instant throughout the oscillation cycle.'
      }),
      onOpenProblem: () => this.modal.openProblem('SHM_TIME_PERIOD'),
      onBack: () => {
        import('./mechanicsMenuScene.js').then(m => this.sceneManager.changeScene(new m.MechanicsMenuScene()));
      }
    });

    this.dataPanel = new MechanicsDataPanel({ title: 'ENERGY BREAKDOWN' });
    this.modal = new MechanicsModalOverlay();
    this.graph = new GraphRenderer({
      title: 'Kinetic (Green), Potential (Purple), & Total Energy (Yellow) vs Time',
      xLabel: 'Time',
      xUnit: 's',
      yLabel: 'Energy',
      yUnit: 'Joules (J)'
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
      label: 'MASS (m)',
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
      max: 8,
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

    if (this.modal.isOpen) {
      this.modal.update(dt, this.inputManager);
      return;
    }

    this.controlBar.update(dt, this.inputManager);
    for (const s of this.sliders) s.update(dt, this.inputManager);

    const st = this.physics.getCurrentState();
    this.dataPanel.setItems([
      { label: 'Displacement (x)', value: st.x.toFixed(2), unit: 'm', color: Colors.text },
      { label: 'Speed (v)', value: Math.abs(st.v).toFixed(2), unit: 'm/s', color: Colors.cyan },
      { label: 'Kinetic Energy (K)', value: st.ke.toFixed(2), unit: 'J', color: Colors.green },
      { label: 'Potential Energy (U)', value: st.pe.toFixed(2), unit: 'J', color: Colors.purple },
      { label: 'Total Energy (E)', value: st.totalE.toFixed(2), unit: 'J', color: Colors.yellow },
      { label: 'Conservation Check', value: 'KE + PE = ½kA²', unit: 'EXACT', color: Colors.green }
    ]);

    const kePts = this.physics.history.map(h => ({ x: h.t, y: h.ke }));
    const pePts = this.physics.history.map(h => ({ x: h.t, y: h.pe }));
    const totPts = this.physics.history.map(h => ({ x: h.t, y: h.totalE }));

    this.graph.clearDatasets();
    this.graph.addDataset({ label: 'Kinetic Energy K', color: Colors.green, points: kePts });
    this.graph.addDataset({ label: 'Potential Energy U', color: Colors.purple, points: pePts });
    this.graph.addDataset({ label: 'Total Energy E', color: Colors.yellow, points: totPts, lineWidth: 3 });
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

    // Interactive Animated Energy Bar Display
    if (this.simRect) {
      Renderer.drawPanel(ctx, this.simRect.x, this.simRect.y, this.simRect.w, this.simRect.h, {
        fill: '#090E1A',
        stroke: Colors.panelBorder
      });

      const st = this.physics.getCurrentState();
      const barW = this.simRect.w - 80;
      const barH = 36;
      const barX = this.simRect.x + 40;
      const barY = this.simRect.y + 40;

      const keFraction = st.totalE > 0 ? st.ke / st.totalE : 0;
      const peFraction = st.totalE > 0 ? st.pe / st.totalE : 0;

      // Energy Bar (Stacked KE and PE)
      Renderer.drawRoundedRect(ctx, barX, barY, barW, barH, 8, {
        fill: '#060A14',
        stroke: Colors.panelBorder
      });

      // Kinetic Segment (Green)
      Renderer.drawRoundedRect(ctx, barX, barY, barW * keFraction, barH, 8, {
        fill: Colors.green,
        glowColor: Colors.green,
        glowBlur: 10
      });

      // Potential Segment (Purple)
      Renderer.drawRoundedRect(ctx, barX + barW * keFraction, barY, barW * peFraction, barH, 8, {
        fill: Colors.purple,
        glowColor: Colors.purple,
        glowBlur: 10
      });

      // Labels below energy bar
      Renderer.drawText(ctx, `Kinetic Energy: ${(keFraction * 100).toFixed(0)}%`, barX, barY + barH + 20, {
        fill: Colors.green,
        font: 'bold 12px "Segoe UI"'
      });
      Renderer.drawText(ctx, `Potential Energy: ${(peFraction * 100).toFixed(0)}%`, barX + barW, barY + barH + 20, {
        fill: Colors.purple,
        font: 'bold 12px "Segoe UI"',
        align: 'right'
      });
    }

    this.graph.render(ctx);
    this.modal.render(ctx, width, height);
  }
}
