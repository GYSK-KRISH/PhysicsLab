// Power Laboratory Scene for PhysicsLab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Slider } from '../../engine/ui.js';
import { WorkEnergyPhysics } from '../../physics/mechanics/workEnergy.js';
import { VectorRenderer } from '../../engine/vectorRenderer.js';
import { GraphRenderer } from '../../engine/graphRenderer.js';
import { MechanicsControlBar, MechanicsDataPanel, MechanicsModalOverlay } from '../../engine/mechanicsUI.js';

export class PowerLabScene {
  constructor() {
    this.mass = 4.0; // kg
    this.force = 24.0; // N
    this.time = 0;
    this.pos = 0;
    this.vel = 0;
    this.isRunning = false;
    this.history = [];

    this.controlBar = new MechanicsControlBar({
      onPlay: () => { this.isRunning = true; },
      onPause: () => { this.isRunning = false; },
      onReset: () => this.reset(),
      onStepForward: () => this.update(0.05),
      onToggleSlowMo: () => {
        this.isSlowMo = !this.isSlowMo;
        this.controlBar.setSlowMo(this.isSlowMo);
      },
      onOpenFormula: () => this.modal.openFormula('POWER MECHANICS', [
        { name: 'Instantaneous Power', formula: 'P_inst = F · v = dW / dt', desc: 'Instantaneous rate of mechanical work output (Watts)' },
        { name: 'Average Power', formula: 'P_avg = W_total / Δt', desc: 'Total work divided by total elapsed time interval' },
        { name: 'SI Unit of Power', formula: '1 Watt (W) = 1 Joule / second (J/s)', desc: '1 Horsepower (hp) ≈ 746 Watts' }
      ]),
      onOpenConcept: () => this.modal.openConcept('POWER LAB', {
        what: 'Power measures how rapidly work is done or energy is transformed over time.',
        how: 'Under constant accelerating force, velocity increases linearly, so instantaneous power P = F·v increases linearly with time.',
        keyIdea: 'High power allows performing the same amount of work in a significantly shorter time duration.'
      }),
      onOpenProblem: () => this.modal.openProblem('WORK_DONE'),
      onBack: () => {
        import('./mechanicsMenuScene.js').then(m => this.sceneManager.changeScene(new m.MechanicsMenuScene()));
      }
    });

    this.dataPanel = new MechanicsDataPanel({ title: 'POWER READOUT' });
    this.modal = new MechanicsModalOverlay();
    this.graph = new GraphRenderer({
      title: 'Instantaneous Power P(t) vs Time',
      xLabel: 'Time',
      xUnit: 's',
      yLabel: 'Power',
      yUnit: 'Watts (W)'
    });

    this.sliders = [];
    this.isSlowMo = false;
    this.lastWidth = 0;
    this.lastHeight = 0;
  }

  reset() {
    this.time = 0;
    this.pos = 0;
    this.vel = 0;
    this.isRunning = false;
    this.history = [];
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
      min: 1,
      max: 10,
      value: this.mass,
      step: 0.5,
      label: 'MASS (m)',
      unit: ' kg',
      accentColor: Colors.cyan,
      callback: (val) => { this.mass = val; this.reset(); }
    }));

    sY += 55;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: 5,
      max: 60,
      value: this.force,
      step: 1,
      label: 'DRIVING FORCE (F)',
      unit: ' N',
      accentColor: '#EF4444',
      callback: (val) => { this.force = val; this.reset(); }
    }));

    this.sidebarRect = { x: sidebarX, y: contentY, w: sidebarW, h: contentH };
    this.dataPanel.setRect(sidebarX, contentY + 160, sidebarW, contentH - 160);

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
    this.controlBar.setRunning(this.isRunning);

    if (this.isRunning) {
      this.time += effectiveDt;
      const acc = this.force / this.mass;
      this.vel += acc * effectiveDt;
      this.pos += this.vel * effectiveDt;

      const pInst = this.force * this.vel;
      const workDone = this.force * this.pos;
      const pAvg = this.time > 0 ? workDone / this.time : 0;

      this.history.push({ t: this.time, pInst, pAvg });
      if (this.history.length > 400) this.history.shift();
    }

    if (this.modal.isOpen) {
      this.modal.update(dt, this.inputManager);
      return;
    }

    this.controlBar.update(dt, this.inputManager);
    for (const s of this.sliders) s.update(dt, this.inputManager);

    const pInst = this.force * this.vel;
    const workDone = this.force * this.pos;
    const pAvg = this.time > 0 ? workDone / this.time : 0;

    this.dataPanel.setItems([
      { label: 'Time (t)', value: this.time.toFixed(2), unit: 's', color: Colors.text },
      { label: 'Speed (v)', value: this.vel.toFixed(2), unit: 'm/s', color: Colors.cyan },
      { label: 'Work Done (W)', value: workDone.toFixed(1), unit: 'J', color: Colors.purple },
      { label: 'Instant Power P = F·v', value: pInst.toFixed(1), unit: 'W', color: '#EF4444' },
      { label: 'Average Power W/t', value: pAvg.toFixed(1), unit: 'W', color: Colors.green },
      { label: 'Horsepower Equivalent', value: (pInst / 746).toFixed(3), unit: 'hp', color: Colors.yellow }
    ]);

    const pInstPts = this.history.map(h => ({ x: h.t, y: h.pInst }));
    const pAvgPts = this.history.map(h => ({ x: h.t, y: h.pAvg }));

    this.graph.clearDatasets();
    this.graph.addDataset({ label: 'P_instantaneous', color: '#EF4444', points: pInstPts });
    this.graph.addDataset({ label: 'P_average', color: Colors.green, points: pAvgPts });
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

      const groundY = this.simRect.y + this.simRect.h - 60;
      const boxW = 80;
      const boxH = 50;
      const curX = this.simRect.x + 80 + ((this.pos * 3.0) % (this.simRect.w - 160));
      const boxY = groundY - boxH;

      Renderer.drawLine(ctx, this.simRect.x + 20, groundY, this.simRect.x + this.simRect.w - 20, groundY, {
        stroke: Colors.panelBorder,
        lineWidth: 3
      });

      Renderer.drawRoundedRect(ctx, curX, boxY, boxW, boxH, 8, {
        fill: '#151F30',
        stroke: Colors.cyan,
        lineWidth: 2,
        glowColor: Colors.cyan,
        glowBlur: 10
      });

      Renderer.drawText(ctx, `${this.vel.toFixed(1)} m/s`, curX + boxW / 2, boxY + boxH / 2, {
        fill: Colors.text,
        font: 'bold 12px "Segoe UI"',
        align: 'center',
        baseline: 'middle'
      });

      if (this.controlBar.showVectors) {
        VectorRenderer.drawVector(ctx, curX + boxW, boxY + boxH / 2, this.force * 2.0, 0, 1.0, {
          color: '#EF4444',
          label: `F = ${this.force.toFixed(0)}N`
        });
      }
    }

    this.graph.render(ctx);
    this.modal.render(ctx, width, height);
  }
}
