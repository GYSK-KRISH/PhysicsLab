// Friction Laboratory Scene for PhysicsLab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Slider } from '../../engine/ui.js';
import { FrictionPhysics } from '../../physics/mechanics/friction.js';
import { VectorRenderer } from '../../engine/vectorRenderer.js';
import { GraphRenderer } from '../../engine/graphRenderer.js';
import { MechanicsControlBar, MechanicsDataPanel, MechanicsModalOverlay } from '../../engine/mechanicsUI.js';

export class FrictionScene {
  constructor() {
    this.physics = new FrictionPhysics({ mass: 4, appliedForce: 10, mu_s: 0.5, mu_k: 0.35 });
    this.controlBar = new MechanicsControlBar({
      onPlay: () => this.physics.start(),
      onPause: () => this.physics.pause(),
      onReset: () => this.physics.reset(),
      onStepForward: () => this.physics.update(0.1),
      onToggleSlowMo: () => {
        this.isSlowMo = !this.isSlowMo;
        this.controlBar.setSlowMo(this.isSlowMo);
      },
      onOpenFormula: () => this.modal.openFormula('FRICTION MECHANICS', [
        { name: 'Limiting Static Friction', formula: 'f_s,max = μ_s·N = μ_s·m·g', desc: 'Maximum threshold before motion commences' },
        { name: 'Kinetic Friction', formula: 'f_k = μ_k·N = μ_k·m·g', desc: 'Steady opposing friction during active sliding' },
        { name: 'Breakaway Condition', formula: 'F_applied > f_s,max  ⇒  BREAKAWAY', desc: 'Transition from static grip to kinetic sliding' }
      ]),
      onOpenConcept: () => this.modal.openConcept('FRICTION LAB', {
        what: 'Friction is the contact force resisting relative lateral motion between two surfaces.',
        how: 'While stationary, static friction exactly equals the applied force up to f_s,max. Once exceeded, friction drops to kinetic value f_k.',
        keyIdea: 'Because μ_s > μ_k, breaking away requires higher force than sustaining continuous sliding motion.'
      }),
      onOpenProblem: () => this.modal.openProblem('WORK_DONE'),
      onBack: () => {
        import('./mechanicsMenuScene.js').then(m => this.sceneManager.changeScene(new m.MechanicsMenuScene()));
      }
    });

    this.dataPanel = new MechanicsDataPanel({ title: 'FRICTION STATES' });
    this.modal = new MechanicsModalOverlay();
    this.graph = new GraphRenderer({
      title: 'Applied Force vs Friction Force',
      xLabel: 'Time',
      xUnit: 's',
      yLabel: 'Force',
      yUnit: 'N'
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
      min: 1,
      max: 15,
      value: this.physics.mass,
      step: 0.5,
      label: 'MASS (m)',
      unit: ' kg',
      accentColor: Colors.cyan,
      callback: (val) => this.physics.setParameters(val, this.physics.appliedForce, this.physics.mu_s, this.physics.mu_k)
    }));

    sY += 55;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: 0,
      max: 60,
      value: this.physics.appliedForce,
      step: 1,
      label: 'APPLIED FORCE (F_app)',
      unit: ' N',
      accentColor: '#EF4444',
      callback: (val) => this.physics.setParameters(this.physics.mass, val, this.physics.mu_s, this.physics.mu_k)
    }));

    sY += 55;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: 0.1,
      max: 0.9,
      value: this.physics.mu_s,
      step: 0.05,
      label: 'STATIC COEFF (μ_s)',
      unit: '',
      accentColor: Colors.yellow,
      callback: (val) => this.physics.setParameters(this.physics.mass, this.physics.appliedForce, val, this.physics.mu_k)
    }));

    sY += 55;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: 0.05,
      max: 0.8,
      value: this.physics.mu_k,
      step: 0.05,
      label: 'KINETIC COEFF (μ_k)',
      unit: '',
      accentColor: Colors.purple,
      callback: (val) => this.physics.setParameters(this.physics.mass, this.physics.appliedForce, this.physics.mu_s, val)
    }));

    this.sidebarRect = { x: sidebarX, y: contentY, w: sidebarW, h: contentH };
    this.dataPanel.setRect(sidebarX, contentY + 250, sidebarW, contentH - 250);

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

    this.dataPanel.setItems([
      { label: 'State', value: this.physics.isMoving ? 'KINETIC SLIDING' : 'STATIC EQUILIBRIUM', unit: '', color: this.physics.isMoving ? Colors.green : Colors.yellow },
      { label: 'Normal Force (N)', value: this.physics.normalForce.toFixed(1), unit: 'N', color: Colors.text },
      { label: 'Max Static (fs_max)', value: this.physics.maxStaticFriction.toFixed(1), unit: 'N', color: Colors.yellow },
      { label: 'Kinetic Friction (fk)', value: this.physics.kineticFriction.toFixed(1), unit: 'N', color: Colors.purple },
      { label: 'Applied Force (F)', value: this.physics.appliedForce.toFixed(1), unit: 'N', color: '#EF4444' },
      { label: 'Actual Friction (f)', value: this.physics.frictionForce.toFixed(1), unit: 'N', color: '#EC4899' },
      { label: 'Acceleration', value: this.physics.acceleration.toFixed(2), unit: 'm/s²', color: Colors.cyan }
    ]);

    const fAppPts = this.physics.history.map(h => ({ x: h.t, y: h.fApplied }));
    const fFricPts = this.physics.history.map(h => ({ x: h.t, y: h.fFriction }));

    this.graph.clearDatasets();
    this.graph.addDataset({ label: 'Applied Force', color: '#EF4444', points: fAppPts });
    this.graph.addDataset({ label: 'Friction Force', color: '#EC4899', points: fFricPts });
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

      const groundY = this.simRect.y + this.simRect.h - 50;
      const boxW = 85;
      const boxH = 55;
      const boxX = this.simRect.x + 80 + ((this.physics.position * 4.0) % (this.simRect.w - 180));
      const boxY = groundY - boxH;

      // Ground line with roughness texture
      Renderer.drawLine(ctx, this.simRect.x + 20, groundY, this.simRect.x + this.simRect.w - 20, groundY, {
        stroke: Colors.panelBorder,
        lineWidth: 3
      });

      // Breakaway Highlight Banner
      if (this.physics.justBrokenAway) {
        Renderer.drawRoundedRect(ctx, this.simRect.x + this.simRect.w / 2 - 120, this.simRect.y + 20, 240, 36, 6, {
          fill: 'rgba(239, 68, 68, 0.2)',
          stroke: '#EF4444',
          glowColor: '#EF4444',
          glowBlur: 14
        });
        Renderer.drawText(ctx, '⚡ BREAKAWAY TRANSITION!', this.simRect.x + this.simRect.w / 2, this.simRect.y + 38, {
          fill: '#EF4444',
          font: '900 13px "Segoe UI"',
          align: 'center',
          baseline: 'middle'
        });
      }

      // Block
      Renderer.drawRoundedRect(ctx, boxX, boxY, boxW, boxH, 8, {
        fill: '#131B2B',
        stroke: this.physics.isMoving ? Colors.green : Colors.cyan,
        lineWidth: 2,
        glowColor: this.physics.isMoving ? Colors.green : Colors.cyan,
        glowBlur: 8
      });

      Renderer.drawText(ctx, `${this.physics.mass.toFixed(1)} kg`, boxX + boxW / 2, boxY + boxH / 2, {
        fill: Colors.text,
        font: 'bold 13px "Segoe UI"',
        align: 'center',
        baseline: 'middle'
      });

      // Vectors
      if (this.controlBar.showVectors) {
        // Applied Force (Right)
        if (this.physics.appliedForce > 0.1) {
          VectorRenderer.drawVector(ctx, boxX + boxW, boxY + boxH / 2, this.physics.appliedForce * 2.5, 0, 1.0, {
            color: '#EF4444',
            label: `F_app = ${this.physics.appliedForce.toFixed(0)}N`,
            glow: true
          });
        }

        // Friction Force (Left)
        if (this.physics.frictionForce > 0.1) {
          VectorRenderer.drawVector(ctx, boxX, groundY, -this.physics.frictionForce * 2.5, 0, 1.0, {
            color: '#EC4899',
            label: `f = ${this.physics.frictionForce.toFixed(1)}N`
          });
        }
      }
    }

    this.graph.render(ctx);
    this.modal.render(ctx, width, height);
  }
}
