// Spring Combinations Laboratory Scene for PhysicsLab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Button, Slider } from '../../engine/ui.js';
import { SpringCombinationsPhysics } from '../../physics/mechanics/shm.js';
import { VectorRenderer } from '../../engine/vectorRenderer.js';
import { MechanicsControlBar, MechanicsDataPanel, MechanicsModalOverlay } from '../../engine/mechanicsUI.js';

export class SpringLabScene {
  constructor() {
    this.mode = 'SERIES'; // 'SINGLE' | 'SERIES' | 'PARALLEL'
    this.k1 = 40.0; // N/m
    this.k2 = 60.0; // N/m
    this.mass = 2.0; // kg

    this.time = 0;
    this.isRunning = true;

    this.controlBar = new MechanicsControlBar({
      onPlay: () => { this.isRunning = true; },
      onPause: () => { this.isRunning = false; },
      onReset: () => { this.time = 0; },
      onOpenFormula: () => this.modal.openFormula('SPRING COMBINATIONS', [
        { name: 'Springs in Series', formula: '1/k_eff = 1/k₁ + 1/k₂  ⇒  k_eff = (k₁·k₂) / (k₁ + k₂)', desc: 'Equal tension forces, displacements add up' },
        { name: 'Springs in Parallel', formula: 'k_eff = k₁ + k₂', desc: 'Equal displacements, restoring forces add up' },
        { name: 'Combined Oscillation Period', formula: 'T = 2π·√(m / k_eff)', desc: 'Determined by total effective system stiffness' }
      ]),
      onOpenConcept: () => this.modal.openConcept('SPRING COMBINATIONS', {
        what: 'Connecting multiple springs modifies overall structural stiffness according to series or parallel network rules.',
        how: 'Series springs are softer than either individual spring (lower k_eff). Parallel springs share the load, becoming significantly stiffer (higher k_eff).',
        keyIdea: 'Parallel springs increase frequency (faster oscillations), whereas series springs reduce frequency (slower oscillations).'
      }),
      onOpenProblem: () => this.modal.openProblem('SHM_TIME_PERIOD'),
      onBack: () => {
        import('./mechanicsMenuScene.js').then(m => this.sceneManager.changeScene(new m.MechanicsMenuScene()));
      }
    });

    this.dataPanel = new MechanicsDataPanel({ title: 'EQUIVALENT STIFFNESS' });
    this.modal = new MechanicsModalOverlay();
    this.modeButtons = [];
    this.sliders = [];
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

    // Mode Buttons (Series vs Parallel)
    this.modeButtons = [];
    const modes = [
      { id: 'SERIES', label: 'SERIES (1/k)' },
      { id: 'PARALLEL', label: 'PARALLEL (k1+k2)' }
    ];

    const mbW = (sidebarW - 40) / 2;
    for (let i = 0; i < modes.length; i++) {
      const m = modes[i];
      const isSel = this.mode === m.id;
      this.modeButtons.push(new Button({
        x: sidebarX + 20 + i * mbW,
        y: contentY + 20,
        width: mbW - 4,
        height: 32,
        text: m.label.split(' ')[0],
        accentColor: isSel ? Colors.cyan : Colors.panelBorder,
        callback: () => {
          this.mode = m.id;
          this.rebuildUI();
        }
      }));
    }

    this.sliders = [];
    let sY = contentY + 70;
    const sW = sidebarW - 40;

    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: 10,
      max: 100,
      value: this.k1,
      step: 5,
      label: 'SPRING 1 CONSTANT (k1)',
      unit: ' N/m',
      accentColor: Colors.cyan,
      callback: (val) => { this.k1 = val; }
    }));

    sY += 55;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: 10,
      max: 100,
      value: this.k2,
      step: 5,
      label: 'SPRING 2 CONSTANT (k2)',
      unit: ' N/m',
      accentColor: Colors.yellow,
      callback: (val) => { this.k2 = val; }
    }));

    sY += 55;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: 0.5,
      max: 8,
      value: this.mass,
      step: 0.5,
      label: 'MASS (m)',
      unit: ' kg',
      accentColor: Colors.purple,
      callback: (val) => { this.mass = val; }
    }));

    this.sidebarRect = { x: sidebarX, y: contentY, w: sidebarW, h: contentH };
    this.dataPanel.setRect(sidebarX, contentY + 240, sidebarW, contentH - 240);

    const mainW = sidebarX - 40;
    this.simRect = { x: 20, y: contentY, w: mainW, h: contentH };
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
    if (this.isRunning) {
      this.time += dt;
    }

    if (this.modal.isOpen) {
      this.modal.update(dt, this.inputManager);
      return;
    }

    this.controlBar.update(dt, this.inputManager);
    for (const b of this.modeButtons) b.update(dt, this.inputManager);
    for (const s of this.sliders) s.update(dt, this.inputManager);

    let k_eff = 0;
    if (this.mode === 'SERIES') {
      k_eff = (this.k1 * this.k2) / (this.k1 + this.k2);
    } else {
      k_eff = this.k1 + this.k2;
    }

    const omega = Math.sqrt(k_eff / this.mass);
    const period = (2 * Math.PI) / omega;
    const frequency = 1 / period;

    this.dataPanel.setItems([
      { label: 'Configuration', value: this.mode, unit: '', color: Colors.cyan },
      { label: 'Spring 1 (k1)', value: this.k1.toFixed(0), unit: 'N/m', color: Colors.cyan },
      { label: 'Spring 2 (k2)', value: this.k2.toFixed(0), unit: 'N/m', color: Colors.yellow },
      { label: 'Effective k_eff', value: k_eff.toFixed(2), unit: 'N/m', color: Colors.green },
      { label: 'Angular Freq (ω)', value: omega.toFixed(2), unit: 'rad/s', color: Colors.purple },
      { label: 'Oscillation Period (T)', value: period.toFixed(2), unit: 's', color: Colors.text }
    ]);
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
      for (const b of this.modeButtons) b.render(ctx);
      for (const s of this.sliders) s.render(ctx);
      this.dataPanel.render(ctx);
    }

    if (this.simRect) {
      Renderer.drawPanel(ctx, this.simRect.x, this.simRect.y, this.simRect.w, this.simRect.h, {
        fill: '#090E1A',
        stroke: Colors.panelBorder
      });

      const wallX = this.simRect.x + 60;
      const centerY = this.simRect.y + this.simRect.h / 2;
      const eqX = this.simRect.x + this.simRect.w / 2 + 30;

      let k_eff = this.mode === 'SERIES' ? (this.k1 * this.k2) / (this.k1 + this.k2) : this.k1 + this.k2;
      const omega = Math.sqrt(k_eff / this.mass);
      const amp = 40; // visual amplitude
      const disp = amp * Math.cos(omega * this.time);
      const massX = eqX + disp;

      // Wall
      Renderer.drawRect(ctx, wallX - 16, centerY - 80, 16, 160, { fill: '#151F30', stroke: Colors.panelBorder });

      if (this.mode === 'SERIES') {
        // Series Springs connected end to end
        const midJunctionX = (wallX + massX - 30) / 2;

        VectorRenderer.drawSpring(ctx, wallX, centerY, midJunctionX, centerY, 8, 12, { color: Colors.cyan });
        Renderer.drawCircle(ctx, midJunctionX, centerY, 4, { fill: '#FFFFFF' });
        VectorRenderer.drawSpring(ctx, midJunctionX, centerY, massX - 30, centerY, 8, 12, { color: Colors.yellow });

        Renderer.drawText(ctx, `k1 = ${this.k1} N/m`, (wallX + midJunctionX) / 2, centerY - 22, { fill: Colors.cyan, font: '11px "Segoe UI"', align: 'center' });
        Renderer.drawText(ctx, `k2 = ${this.k2} N/m`, (midJunctionX + massX) / 2, centerY - 22, { fill: Colors.yellow, font: '11px "Segoe UI"', align: 'center' });
      } else {
        // Parallel Springs mounted side by side
        VectorRenderer.drawSpring(ctx, wallX, centerY - 30, massX - 30, centerY - 30, 10, 10, { color: Colors.cyan });
        VectorRenderer.drawSpring(ctx, wallX, centerY + 30, massX - 30, centerY + 30, 10, 10, { color: Colors.yellow });

        Renderer.drawText(ctx, `k1 = ${this.k1} N/m`, (wallX + massX) / 2, centerY - 45, { fill: Colors.cyan, font: '11px "Segoe UI"', align: 'center' });
        Renderer.drawText(ctx, `k2 = ${this.k2} N/m`, (wallX + massX) / 2, centerY + 48, { fill: Colors.yellow, font: '11px "Segoe UI"', align: 'center' });
      }

      // Mass Block
      Renderer.drawRoundedRect(ctx, massX - 30, centerY - 30, 60, 60, 8, {
        fill: '#152136',
        stroke: Colors.purple,
        lineWidth: 2.5,
        glowColor: Colors.purple,
        glowBlur: 10
      });
      Renderer.drawText(ctx, `${this.mass}kg`, massX, centerY, { fill: Colors.text, font: 'bold 12px "Segoe UI"', align: 'center', baseline: 'middle' });
    }

    this.modal.render(ctx, width, height);
  }
}
