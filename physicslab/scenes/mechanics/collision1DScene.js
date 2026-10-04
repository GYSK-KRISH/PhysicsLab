// 1D Collision Laboratory Scene for PhysicsLab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Button, Slider } from '../../engine/ui.js';
import { Collision1DPhysics } from '../../physics/mechanics/collision.js';
import { VectorRenderer } from '../../engine/vectorRenderer.js';
import { GraphRenderer } from '../../engine/graphRenderer.js';
import { MechanicsControlBar, MechanicsDataPanel, MechanicsModalOverlay } from '../../engine/mechanicsUI.js';

export class Collision1DScene {
  constructor() {
    this.physics = new Collision1DPhysics({ m1: 2, u1: 8, m2: 3, u2: -2, e: 1.0 });
    this.controlBar = new MechanicsControlBar({
      onPlay: () => this.physics.start(),
      onPause: () => this.physics.pause(),
      onReset: () => this.physics.reset(),
      onStepForward: () => this.physics.update(0.05),
      onToggleSlowMo: () => {
        this.isSlowMo = !this.isSlowMo;
        this.controlBar.setSlowMo(this.isSlowMo);
      },
      onOpenFormula: () => this.modal.openFormula('1D COLLISION MECHANICS', [
        { name: 'Conservation of Linear Momentum', formula: 'm₁·u₁ + m₂·u₂ = m₁·v₁ + m₂·v₂', desc: 'Total momentum strictly invariant before, during, and after impact' },
        { name: 'Coefficient of Restitution', formula: 'e = -(v₁ - v₂) / (u₁ - u₂)', desc: 'Elastic (e=1), Inelastic (0 < e < 1), Perfectly Inelastic (e=0)' },
        { name: 'Kinetic Energy Conservation (Elastic)', formula: '½m₁u₁² + ½m₂u₂² = ½m₁v₁² + ½m₂v₂²', desc: 'Zero kinetic energy loss in ideal elastic collisions' }
      ]),
      onOpenConcept: () => this.modal.openConcept('1D COLLISIONS', {
        what: 'Collisions model instantaneous momentum and energy exchange between colliding masses.',
        how: 'Internal collision contact forces are equal and opposite (Newton\'s 3rd Law), conserving total system momentum regardless of elasticity.',
        keyIdea: 'Elasticity e determines whether kinetic energy is fully preserved (e = 1) or partially dissipated into internal heat/deformation.'
      }),
      onOpenProblem: () => this.modal.openProblem('MOMENTUM_ELASTIC_COLLISION'),
      onBack: () => {
        import('./mechanicsMenuScene.js').then(m => this.sceneManager.changeScene(new m.MechanicsMenuScene()));
      }
    });

    this.dataPanel = new MechanicsDataPanel({ title: 'COLLISION CONSERVATION' });
    this.modal = new MechanicsModalOverlay();
    this.graph = new GraphRenderer({
      title: 'Total System Momentum & Kinetic Energy vs Time',
      xLabel: 'Time',
      xUnit: 's',
      yLabel: 'Conservation',
      yUnit: 'kg·m/s, J'
    });

    this.typeButtons = [];
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

    // Collision Type Presets
    this.typeButtons = [];
    const types = [
      { label: 'ELASTIC (e=1)', e: 1.0, color: Colors.green },
      { label: 'INELASTIC (e=0.5)', e: 0.5, color: Colors.yellow },
      { label: 'STICKY (e=0)', e: 0.0, color: '#EF4444' }
    ];

    const tbW = (sidebarW - 40) / 3;
    for (let i = 0; i < types.length; i++) {
      const t = types[i];
      this.typeButtons.push(new Button({
        x: sidebarX + 20 + i * tbW,
        y: contentY + 20,
        width: tbW - 4,
        height: 30,
        text: t.label.split(' ')[0],
        accentColor: this.physics.e === t.e ? t.color : Colors.panelBorder,
        callback: () => {
          this.physics.setParameters(this.physics.m1, this.physics.u1, this.physics.m2, this.physics.u2, t.e);
          this.rebuildUI();
        }
      }));
    }

    this.sliders = [];
    let sY = contentY + 65;
    const sW = sidebarW - 40;

    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: 0.5,
      max: 10,
      value: this.physics.m1,
      step: 0.5,
      label: 'MASS 1 (m1)',
      unit: ' kg',
      accentColor: Colors.cyan,
      callback: (val) => this.physics.setParameters(val, this.physics.u1, this.physics.m2, this.physics.u2, this.physics.e)
    }));

    sY += 55;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: -15,
      max: 15,
      value: this.physics.u1,
      step: 1,
      label: 'INITIAL VEL 1 (u1)',
      unit: ' m/s',
      accentColor: Colors.cyan,
      callback: (val) => this.physics.setParameters(this.physics.m1, val, this.physics.m2, this.physics.u2, this.physics.e)
    }));

    sY += 55;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: 0.5,
      max: 10,
      value: this.physics.m2,
      step: 0.5,
      label: 'MASS 2 (m2)',
      unit: ' kg',
      accentColor: Colors.purple,
      callback: (val) => this.physics.setParameters(this.physics.m1, this.physics.u1, val, this.physics.u2, this.physics.e)
    }));

    sY += 55;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: -15,
      max: 15,
      value: this.physics.u2,
      step: 1,
      label: 'INITIAL VEL 2 (u2)',
      unit: ' m/s',
      accentColor: Colors.purple,
      callback: (val) => this.physics.setParameters(this.physics.m1, this.physics.u1, this.physics.m2, val, this.physics.e)
    }));

    this.sidebarRect = { x: sidebarX, y: contentY, w: sidebarW, h: contentH };
    this.dataPanel.setRect(sidebarX, contentY + 290, sidebarW, contentH - 290);

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
    for (const b of this.typeButtons) b.update(dt, this.inputManager);
    for (const s of this.sliders) s.update(dt, this.inputManager);

    const pCur = this.physics.m1 * this.physics.v1 + this.physics.m2 * this.physics.v2;
    const keCur = 0.5 * this.physics.m1 * this.physics.v1 * this.physics.v1 + 0.5 * this.physics.m2 * this.physics.v2 * this.physics.v2;

    this.dataPanel.setItems([
      { label: 'Collision Event', value: this.physics.hasCollided ? 'AFTER IMPACT' : 'BEFORE IMPACT', unit: '', color: this.physics.hasCollided ? Colors.yellow : Colors.green },
      { label: 'Initial Momentum (p_i)', value: this.physics.p_total_initial.toFixed(1), unit: 'kg·m/s', color: Colors.cyan },
      { label: 'Current Momentum (p)', value: pCur.toFixed(1), unit: 'kg·m/s', color: Colors.cyan },
      { label: 'Initial KE (K_i)', value: this.physics.ke_total_initial.toFixed(1), unit: 'J', color: Colors.green },
      { label: 'Current KE (K)', value: keCur.toFixed(1), unit: 'J', color: Colors.green },
      { label: 'Energy Loss (ΔK)', value: Math.max(0, this.physics.ke_total_initial - keCur).toFixed(1), unit: 'J', color: '#EF4444' },
      { label: 'COM Velocity (v_cm)', value: this.physics.v_cm.toFixed(2), unit: 'm/s', color: Colors.purple }
    ]);

    const pPts = this.physics.history.map(h => ({ x: h.t, y: h.pTotal }));
    const kePts = this.physics.history.map(h => ({ x: h.t, y: h.keTotal }));

    this.graph.clearDatasets();
    this.graph.addDataset({ label: 'Total Momentum p(t)', color: Colors.cyan, points: pPts });
    this.graph.addDataset({ label: 'Total Kinetic Energy K(t)', color: Colors.green, points: kePts });
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
      for (const b of this.typeButtons) b.render(ctx);
      for (const s of this.sliders) s.render(ctx);
      this.dataPanel.render(ctx);
    }

    if (this.simRect) {
      Renderer.drawPanel(ctx, this.simRect.x, this.simRect.y, this.simRect.w, this.simRect.h, {
        fill: '#090E1A',
        stroke: Colors.panelBorder
      });

      const groundY = this.simRect.y + this.simRect.h - 50;
      const originX = this.simRect.x + this.simRect.w / 2;
      const scale = 5.0;

      // Track line
      Renderer.drawLine(ctx, this.simRect.x + 20, groundY, this.simRect.x + this.simRect.w - 20, groundY, {
        stroke: Colors.panelBorder,
        lineWidth: 3
      });

      // Mass 1 Cart (Cyan)
      const c1X = originX + this.physics.pos1 * scale;
      const c1W = Math.max(40, this.physics.m1 * 10);
      const c1H = 45;
      const c1Y = groundY - c1H;

      Renderer.drawRoundedRect(ctx, c1X - c1W / 2, c1Y, c1W, c1H, 6, {
        fill: '#151F30',
        stroke: Colors.cyan,
        lineWidth: 2,
        glowColor: Colors.cyan,
        glowBlur: 8
      });
      Renderer.drawText(ctx, `m1: ${this.physics.m1}kg`, c1X, c1Y + c1H / 2, {
        fill: Colors.text,
        font: 'bold 10px "Segoe UI"',
        align: 'center',
        baseline: 'middle'
      });

      // Mass 2 Cart (Purple)
      const c2X = originX + this.physics.pos2 * scale;
      const c2W = Math.max(40, this.physics.m2 * 10);
      const c2H = 45;
      const c2Y = groundY - c2H;

      Renderer.drawRoundedRect(ctx, c2X - c2W / 2, c2Y, c2W, c2H, 6, {
        fill: '#1E1528',
        stroke: Colors.purple,
        lineWidth: 2,
        glowColor: Colors.purple,
        glowBlur: 8
      });
      Renderer.drawText(ctx, `m2: ${this.physics.m2}kg`, c2X, c2Y + c2H / 2, {
        fill: Colors.text,
        font: 'bold 10px "Segoe UI"',
        align: 'center',
        baseline: 'middle'
      });

      // Live Velocity Vectors
      if (this.controlBar.showVectors) {
        VectorRenderer.drawVector(ctx, c1X, c1Y - 14, this.physics.v1 * 4.0, 0, 1.0, {
          color: Colors.cyan,
          label: `v1=${this.physics.v1.toFixed(1)}`
        });

        VectorRenderer.drawVector(ctx, c2X, c2Y - 14, this.physics.v2 * 4.0, 0, 1.0, {
          color: Colors.purple,
          label: `v2=${this.physics.v2.toFixed(1)}`
        });
      }
    }

    this.graph.render(ctx);
    this.modal.render(ctx, width, height);
  }
}
