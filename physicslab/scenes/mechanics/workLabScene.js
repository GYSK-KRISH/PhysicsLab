// Work Laboratory Scene for PhysicsLab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Button, Slider } from '../../engine/ui.js';
import { WorkEnergyPhysics } from '../../physics/mechanics/workEnergy.js';
import { VectorRenderer } from '../../engine/vectorRenderer.js';
import { MechanicsControlBar, MechanicsDataPanel, MechanicsModalOverlay } from '../../engine/mechanicsUI.js';

export class WorkLabScene {
  constructor() {
    this.force = 30.0; // N
    this.displacement = 5.0; // m
    this.angleDeg = 30.0; // degrees

    this.controlBar = new MechanicsControlBar({
      onPlay: () => {},
      onPause: () => {},
      onReset: () => {
        this.force = 30;
        this.displacement = 5;
        this.angleDeg = 30;
      },
      onOpenFormula: () => this.modal.openFormula('WORK MECHANICS', [
        { name: 'Work Definition (Dot Product)', formula: 'W = F · d = F·d·cos θ', desc: 'Scalar product of applied force and displacement vectors' },
        { name: 'Positive Work (θ < 90°)', formula: 'W > 0', desc: 'Force adds kinetic energy to the body' },
        { name: 'Zero Work (θ = 90°)', formula: 'W = 0', desc: 'Perpendicular force causes zero energy transfer' },
        { name: 'Negative Work (θ > 90°)', formula: 'W < 0', desc: 'Force opposes displacement, extracting mechanical energy' }
      ]),
      onOpenConcept: () => this.modal.openConcept('WORK LAB', {
        what: 'Work is the measure of energy transfer that occurs when an object is displaced by an external force.',
        how: 'Only the force component parallel to displacement performs work (F cos θ). The perpendicular component does no work.',
        keyIdea: 'Work is positive when force aids motion, zero when perpendicular, and negative when opposing motion.'
      }),
      onOpenProblem: () => this.modal.openProblem('WORK_DONE'),
      onBack: () => {
        import('./mechanicsMenuScene.js').then(m => this.sceneManager.changeScene(new m.MechanicsMenuScene()));
      }
    });

    this.dataPanel = new MechanicsDataPanel({ title: 'WORK & ENERGY' });
    this.modal = new MechanicsModalOverlay();
    this.presetButtons = [];
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

    // Presets Buttons (Positive, Zero, Negative Work)
    this.presetButtons = [];
    const presets = [
      { label: '+ WORK (0°)', angle: 0, color: Colors.green },
      { label: '0 WORK (90°)', angle: 90, color: Colors.yellow },
      { label: '- WORK (180°)', angle: 180, color: '#EF4444' }
    ];

    const pbW = (sidebarW - 40) / 3;
    for (let i = 0; i < presets.length; i++) {
      const p = presets[i];
      this.presetButtons.push(new Button({
        x: sidebarX + 20 + i * pbW,
        y: contentY + 20,
        width: pbW - 4,
        height: 32,
        text: p.label.split(' ')[0],
        accentColor: this.angleDeg === p.angle ? p.color : Colors.panelBorder,
        callback: () => {
          this.angleDeg = p.angle;
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
      min: 1,
      max: 60,
      value: this.force,
      step: 1,
      label: 'FORCE (F)',
      unit: ' N',
      accentColor: '#EF4444',
      callback: (val) => { this.force = val; }
    }));

    sY += 55;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: 0.5,
      max: 15,
      value: this.displacement,
      step: 0.5,
      label: 'DISPLACEMENT (d)',
      unit: ' m',
      accentColor: Colors.purple,
      callback: (val) => { this.displacement = val; }
    }));

    sY += 55;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: 0,
      max: 180,
      value: this.angleDeg,
      step: 5,
      label: 'ANGLE (θ)',
      unit: '°',
      accentColor: Colors.yellow,
      callback: (val) => { this.angleDeg = val; }
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
    if (this.modal.isOpen) {
      this.modal.update(dt, this.inputManager);
      return;
    }

    this.controlBar.update(dt, this.inputManager);
    for (const b of this.presetButtons) b.update(dt, this.inputManager);
    for (const s of this.sliders) s.update(dt, this.inputManager);

    const calc = WorkEnergyPhysics.calculateWork(this.force, this.displacement, this.angleDeg);
    const workColor = calc.work > 0.01 ? Colors.green : (calc.work < -0.01 ? '#EF4444' : Colors.yellow);

    this.dataPanel.setItems([
      { label: 'Force |F|', value: calc.force.toFixed(1), unit: 'N', color: '#EF4444' },
      { label: 'Displacement |d|', value: calc.displacement.toFixed(1), unit: 'm', color: Colors.purple },
      { label: 'Angle θ', value: `${calc.angleDeg.toFixed(0)}°`, unit: '', color: Colors.yellow },
      { label: 'cos(θ)', value: calc.cosTheta.toFixed(3), unit: '', color: Colors.textMuted },
      { label: 'Parallel Force F·cos(θ)', value: (calc.force * calc.cosTheta).toFixed(1), unit: 'N', color: Colors.cyan },
      { label: 'Total Work Done (W)', value: calc.work.toFixed(2), unit: 'J', color: workColor }
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
      for (const b of this.presetButtons) b.render(ctx);
      for (const s of this.sliders) s.render(ctx);
      this.dataPanel.render(ctx);
    }

    if (this.simRect) {
      Renderer.drawPanel(ctx, this.simRect.x, this.simRect.y, this.simRect.w, this.simRect.h, {
        fill: '#090E1A',
        stroke: Colors.panelBorder
      });

      const groundY = this.simRect.y + this.simRect.h - 80;
      const startX = this.simRect.x + 80;
      const scale = 25.0; // 25 px per meter
      const dispPixels = this.displacement * scale;
      const endX = startX + dispPixels;

      // Ground Track
      Renderer.drawLine(ctx, this.simRect.x + 20, groundY, this.simRect.x + this.simRect.w - 20, groundY, {
        stroke: Colors.panelBorder,
        lineWidth: 3
      });

      // Displacement Arrow along ground
      VectorRenderer.drawArrow(ctx, startX, groundY + 25, endX, groundY + 25, {
        stroke: Colors.purple,
        lineWidth: 3,
        label: `d = ${this.displacement.toFixed(1)} m`,
        glow: true
      });

      // Block at initial position
      const bw = 70;
      const bh = 50;
      Renderer.drawRoundedRect(ctx, startX - bw / 2, groundY - bh, bw, bh, 6, {
        fill: '#141D2C',
        stroke: Colors.cyan,
        lineWidth: 2,
        glowColor: Colors.cyan,
        glowBlur: 8
      });

      // Ghost block at destination position
      Renderer.drawRoundedRect(ctx, endX - bw / 2, groundY - bh, bw, bh, 6, {
        fill: 'rgba(94, 231, 255, 0.05)',
        stroke: 'rgba(94, 231, 255, 0.3)',
        lineDash: [4, 4]
      });

      // Force Vector Vector applied at block center
      const cx = startX;
      const cy = groundY - bh / 2;
      const thetaRad = (this.angleDeg * Math.PI) / 180;
      const fx = Math.cos(thetaRad) * this.force * 2.2;
      const fy = -Math.sin(thetaRad) * this.force * 2.2;

      VectorRenderer.drawVector(ctx, cx, cy, fx, fy, 1.0, {
        color: '#EF4444',
        label: `F = ${this.force.toFixed(0)} N`,
        glow: true
      });

      // Angle Arc
      VectorRenderer.drawAngleArc(ctx, cx, cy, 35, 0, -thetaRad, `${this.angleDeg}°`, {
        color: Colors.yellow
      });

      // Parallel Component Dashed Line
      if (Math.abs(this.angleDeg) > 5 && Math.abs(this.angleDeg) < 175) {
        VectorRenderer.drawVector(ctx, cx, cy, fx, 0, 1.0, {
          color: Colors.cyan,
          label: `F·cos θ`,
          headLength: 7
        });
      }
    }

    this.modal.render(ctx, width, height);
  }
}
