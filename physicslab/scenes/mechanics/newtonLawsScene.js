// Newton's Laws & Free Body Diagram Laboratory Scene for PhysicsLab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Slider } from '../../engine/ui.js';
import { NewtonLawsPhysics } from '../../physics/mechanics/forces.js';
import { VectorRenderer } from '../../engine/vectorRenderer.js';
import { MechanicsControlBar, MechanicsDataPanel, MechanicsModalOverlay } from '../../engine/mechanicsUI.js';
import { LayoutEngine } from '../../engine/layout.js';

export class NewtonLawsScene {
  constructor() {
    this.physics = new NewtonLawsPhysics({ mass: 5, appliedForce: 25, frictionCoeff: 0.2 });
    this.controlBar = new MechanicsControlBar({
      onPlay: () => this.physics.start(),
      onPause: () => this.physics.pause(),
      onReset: () => this.physics.reset(),
      onStepForward: () => this.physics.update(0.1),
      onToggleSlowMo: () => {
        this.isSlowMo = !this.isSlowMo;
        this.controlBar.setSlowMo(this.isSlowMo);
      },
      onOpenFormula: () => this.modal.openFormula('NEWTON\'S LAWS & FORCES', [
        { name: 'Newton\'s Second Law', formula: 'F_net = m·a', desc: 'Net force accelerates mass in the direction of force' },
        { name: 'Net Horizontal Force', formula: 'F_net = F_applied + F_tension - f_friction', desc: 'Algebraic sum of all external horizontal forces' },
        { name: 'Normal Force & Friction', formula: 'N = m·g,  f_max = μ·N', desc: 'Normal reaction balances vertical weight on flat surface' }
      ]),
      onOpenConcept: () => this.modal.openConcept('NEWTON\'S LAWS & FBD', {
        what: 'A Free Body Diagram (FBD) isolates a single body and illustrates all external vector forces acting upon it.',
        how: 'Forces in opposite directions cancel or combine. Unbalanced net force creates acceleration inversely proportional to mass (a = F_net / m).',
        keyIdea: 'Motion is governed by the vector sum of forces, not by any single individual force.'
      }),
      onOpenProblem: () => this.modal.openProblem('CIRCULAR_CENTRIPETAL_FORCE'),
      onBack: () => {
        import('./mechanicsMenuScene.js').then(m => this.sceneManager.changeScene(new m.MechanicsMenuScene()));
      }
    });

    this.dataPanel = new MechanicsDataPanel({ title: 'FORCE & ACCELERATION' });
    this.modal = new MechanicsModalOverlay();
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
    const layout = LayoutEngine.calculateExperimentLayout(width, height);

    this.controlBar.setBounds(layout.toolbarRect.x, layout.toolbarRect.y, layout.toolbarRect.width);

    this.sliders = [];
    let sY = layout.controlRect.y + 16;
    const sW = layout.controlRect.width - 24;

    this.sliders.push(new Slider({
      x: layout.controlRect.x + 12,
      y: sY,
      width: sW,
      min: 1,
      max: 20,
      value: this.physics.mass || 5,
      step: 0.5,
      label: 'MASS (m)',
      unit: ' kg',
      accentColor: Colors.cyan,
      callback: (val) => this.physics.setParameters(val, this.physics.appliedForce, this.physics.frictionCoeff, this.physics.gravity, this.physics.tensionForce)
    }));

    sY += 44;
    this.sliders.push(new Slider({
      x: layout.controlRect.x + 12,
      y: sY,
      width: sW,
      min: -50,
      max: 50,
      value: this.physics.appliedForce || 25,
      step: 1,
      label: 'APPLIED FORCE (F_app)',
      unit: ' N',
      accentColor: '#EF4444',
      callback: (val) => this.physics.setParameters(this.physics.mass, val, this.physics.frictionCoeff, this.physics.gravity, this.physics.tensionForce)
    }));

    sY += 44;
    this.sliders.push(new Slider({
      x: layout.controlRect.x + 12,
      y: sY,
      width: sW,
      min: 0,
      max: 0.8,
      value: this.physics.frictionCoeff || 0.2,
      step: 0.05,
      label: 'FRICTION COEFF (μ)',
      unit: '',
      accentColor: Colors.yellow,
      callback: (val) => this.physics.setParameters(this.physics.mass, this.physics.appliedForce, val, this.physics.gravity, this.physics.tensionForce)
    }));

    this.simRect = layout.simRect;
    this.controlRect = layout.controlRect;
    this.dataPanel.setRect(layout.dataRect.x, layout.dataRect.y, layout.dataRect.width, layout.dataRect.height);
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
      { label: 'Mass (m)', value: (this.physics.mass || 0).toFixed(1), unit: 'kg', color: Colors.text },
      { label: 'Normal Force (N)', value: (this.physics.normalForce || 0).toFixed(1), unit: 'N', color: Colors.green },
      { label: 'Weight (mg)', value: (this.physics.weightForce || 0).toFixed(1), unit: 'N', color: Colors.yellow },
      { label: 'Friction Force', value: (this.physics.frictionForce || 0).toFixed(1), unit: 'N', color: '#EC4899' },
      { label: 'Net Force (F_net)', value: (this.physics.netForce || 0).toFixed(1), unit: 'N', color: '#EF4444' },
      { label: 'Acceleration (a)', value: (this.physics.acceleration || 0).toFixed(2), unit: 'm/s²', color: Colors.cyan },
      { label: 'Velocity (v)', value: (this.physics.velocity || 0).toFixed(2), unit: 'm/s', color: Colors.cyan }
    ]);
  }

  render(ctx) {
    const { width, height } = this.canvasEngine.getBounds();

    Renderer.drawRect(ctx, 0, 0, width, height, { fill: Colors.background });
    Renderer.drawGrid(ctx, width, height, 40);

    this.controlBar.render(ctx);

    if (this.controlRect) {
      Renderer.drawPanel(ctx, this.controlRect.x, this.controlRect.y, this.controlRect.width, this.controlRect.height, {
        fill: Colors.panel,
        stroke: Colors.panelBorder
      });
      Renderer.drawText(ctx, 'FORCE PARAMETERS', this.controlRect.x + 12, this.controlRect.y + 6, {
        fill: Colors.textMuted,
        font: 'bold 10px "Segoe UI"'
      });
      for (const s of this.sliders) s.render(ctx);
    }

    this.dataPanel.render(ctx);

    if (this.simRect) {
      Renderer.drawPanel(ctx, this.simRect.x, this.simRect.y, this.simRect.width, this.simRect.height, {
        fill: '#090E1A',
        stroke: Colors.panelBorder
      });

      ctx.save();
      ctx.beginPath();
      ctx.rect(this.simRect.x, this.simRect.y, this.simRect.width, this.simRect.height);
      ctx.clip();

      const groundY = this.simRect.y + this.simRect.height - 60;
      const boxW = 70;
      const boxH = 50;
      const centerSimX = this.simRect.x + this.simRect.width / 2;
      const boxX = centerSimX + (((this.physics.position || 0) * 4.0) % (this.simRect.width - 140)) - boxW / 2;
      const boxY = groundY - boxH;

      Renderer.drawLine(ctx, this.simRect.x + 10, groundY, this.simRect.x + this.simRect.width - 10, groundY, {
        stroke: Colors.panelBorder,
        lineWidth: 3
      });

      Renderer.drawRoundedRect(ctx, boxX, boxY, boxW, boxH, 8, {
        fill: '#151F30',
        stroke: Colors.cyan,
        lineWidth: 2,
        glowColor: Colors.cyan,
        glowBlur: 10
      });

      Renderer.drawText(ctx, `${(this.physics.mass || 0).toFixed(1)} kg`, boxX + boxW / 2, boxY + boxH / 2, {
        fill: Colors.text,
        font: 'bold 12px "Segoe UI"',
        align: 'center',
        baseline: 'middle'
      });

      const cx = boxX + boxW / 2;
      const cy = boxY + boxH / 2;

      if (this.controlBar.showVectors) {
        if (Math.abs(this.physics.normalForce || 0) > 0.1) {
          VectorRenderer.drawVector(ctx, cx, boxY, 0, -(this.physics.normalForce || 0) * 1.2, 1.0, {
            color: Colors.green,
            label: `N = ${(this.physics.normalForce || 0).toFixed(0)}N`
          });
        }
        if (Math.abs(this.physics.weightForce || 0) > 0.1) {
          VectorRenderer.drawVector(ctx, cx, groundY, 0, (this.physics.weightForce || 0) * 1.2, 1.0, {
            color: Colors.yellow,
            label: `mg = ${(this.physics.weightForce || 0).toFixed(0)}N`
          });
        }
        if (Math.abs(this.physics.appliedForce || 0) > 0.5) {
          VectorRenderer.drawVector(ctx, cx, cy, (this.physics.appliedForce || 0) * 1.5, 0, 1.0, {
            color: '#EF4444',
            label: `F_app = ${(this.physics.appliedForce || 0).toFixed(0)}N`,
            glow: true
          });
        }
      }

      ctx.restore();
    }

    this.modal.render(ctx, width, height);
  }
}
