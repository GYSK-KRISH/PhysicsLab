// 2D Collision Laboratory Scene for PhysicsLab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Slider } from '../../engine/ui.js';
import { Collision2DPhysics } from '../../physics/mechanics/collision.js';
import { VectorRenderer } from '../../engine/vectorRenderer.js';
import { Vector2D } from '../../physics/mechanics/vector2d.js';
import { MechanicsControlBar, MechanicsDataPanel, MechanicsModalOverlay } from '../../engine/mechanicsUI.js';

export class Collision2DScene {
  constructor() {
    this.physics = new Collision2DPhysics({ m1: 2.0, m2: 2.0, e: 1.0 });
    this.controlBar = new MechanicsControlBar({
      onPlay: () => this.physics.start(),
      onPause: () => this.physics.pause(),
      onReset: () => this.physics.reset(),
      onStepForward: () => this.physics.update(0.05),
      onToggleSlowMo: () => {
        this.isSlowMo = !this.isSlowMo;
        this.controlBar.setSlowMo(this.isSlowMo);
      },
      onOpenFormula: () => this.modal.openFormula('2D COLLISION MECHANICS', [
        { name: 'Vector Momentum Conservation', formula: 'P_total = m₁·v₁ + m₂·v₂ = constant', desc: 'Vector sum of momenta conserved in both x and y' },
        { name: 'Normal Impact Line Decomposition', formula: 'v_n,after = (m₁·v₁n + m₂·v₂n - m₂·e·Δvn) / (m₁ + m₂)', desc: '1D restitution along line of contact centers' },
        { name: 'Tangential Invariance', formula: 'v_t,after = v_t,before', desc: 'Frictionless spherical contact leaves tangential component unaltered' }
      ]),
      onOpenConcept: () => this.modal.openConcept('2D COLLISIONS', {
        what: 'Two-dimensional collisions involve oblique contact where impact force acts along the normal line connecting body centers.',
        how: 'Velocity is resolved into normal and tangential coordinates. Restitution acts purely along the normal, while tangential velocities are conserved.',
        keyIdea: 'Total 2D momentum vector P_total is perfectly conserved in both magnitude and direction.'
      }),
      onOpenProblem: () => this.modal.openProblem('MOMENTUM_ELASTIC_COLLISION'),
      onBack: () => {
        import('./mechanicsMenuScene.js').then(m => this.sceneManager.changeScene(new m.MechanicsMenuScene()));
      }
    });

    this.dataPanel = new MechanicsDataPanel({ title: '2D MOMENTUM CONSERVATION' });
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
      max: 6,
      value: this.physics.m1,
      step: 0.5,
      label: 'MASS 1 (m1)',
      unit: ' kg',
      accentColor: Colors.cyan,
      callback: (val) => this.physics.setParameters(val, this.physics.m2, this.physics.vel1.x, this.physics.vel1.y, this.physics.e)
    }));

    sY += 55;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: 0.5,
      max: 6,
      value: this.physics.m2,
      step: 0.5,
      label: 'MASS 2 (m2)',
      unit: ' kg',
      accentColor: Colors.purple,
      callback: (val) => this.physics.setParameters(this.physics.m1, val, this.physics.vel1.x, this.physics.vel1.y, this.physics.e)
    }));

    sY += 55;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: -4,
      max: 4,
      value: this.physics.pos1.y,
      step: 0.5,
      label: 'IMPACT OFFSET (Y)',
      unit: ' m',
      accentColor: Colors.yellow,
      callback: (val) => this.physics.setParameters(this.physics.m1, this.physics.m2, 15, 0, this.physics.e, val)
    }));

    sY += 55;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: 0,
      max: 1.0,
      value: this.physics.e,
      step: 0.1,
      label: 'RESTITUTION (e)',
      unit: '',
      accentColor: Colors.green,
      callback: (val) => this.physics.setParameters(this.physics.m1, this.physics.m2, 15, 0, val, this.physics.pos1.y)
    }));

    this.sidebarRect = { x: sidebarX, y: contentY, w: sidebarW, h: contentH };
    this.dataPanel.setRect(sidebarX, contentY + 250, sidebarW, contentH - 250);

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
    const effectiveDt = this.isSlowMo ? dt * 0.25 : dt;
    this.physics.update(effectiveDt);
    this.controlBar.setRunning(this.physics.isRunning);

    if (this.modal.isOpen) {
      this.modal.update(dt, this.inputManager);
      return;
    }

    this.controlBar.update(dt, this.inputManager);
    for (const s of this.sliders) s.update(dt, this.inputManager);

    const pTotal = this.physics.getTotalMomentum();
    const ke1 = 0.5 * this.physics.m1 * this.physics.vel1.magnitudeSquared();
    const ke2 = 0.5 * this.physics.m2 * this.physics.vel2.magnitudeSquared();

    this.dataPanel.setItems([
      { label: 'State', value: this.physics.hasCollided ? 'POST-IMPACT' : 'APPROACH', unit: '', color: this.physics.hasCollided ? Colors.yellow : Colors.green },
      { label: 'Total P_x', value: pTotal.x.toFixed(1), unit: 'kg·m/s', color: Colors.cyan },
      { label: 'Total P_y', value: pTotal.y.toFixed(1), unit: 'kg·m/s', color: Colors.cyan },
      { label: 'Total Momentum |P|', value: pTotal.magnitude().toFixed(1), unit: 'kg·m/s', color: Colors.green },
      { label: 'Total Kinetic Energy', value: (ke1 + ke2).toFixed(1), unit: 'J', color: Colors.yellow }
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
      for (const s of this.sliders) s.render(ctx);
      this.dataPanel.render(ctx);
    }

    if (this.simRect) {
      Renderer.drawPanel(ctx, this.simRect.x, this.simRect.y, this.simRect.w, this.simRect.h, {
        fill: '#090E1A',
        stroke: Colors.panelBorder
      });

      const centerX = this.simRect.x + this.simRect.w / 2;
      const centerY = this.simRect.y + this.simRect.h / 2;
      const scale = 5.0;

      // Trajectory trails
      if (this.physics.trajectory1.length > 1) {
        ctx.save();
        ctx.strokeStyle = 'rgba(94, 231, 255, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i < this.physics.trajectory1.length; i++) {
          const pt = this.physics.trajectory1[i];
          const px = centerX + pt.x * scale;
          const py = centerY + pt.y * scale;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.restore();
      }

      // Sphere 1 (Cyan)
      const s1X = centerX + this.physics.pos1.x * scale;
      const s1Y = centerY + this.physics.pos1.y * scale;
      const r1Pix = this.physics.radius * scale;

      Renderer.drawCircle(ctx, s1X, s1Y, r1Pix, {
        fill: '#152238',
        stroke: Colors.cyan,
        lineWidth: 2.5,
        glowColor: Colors.cyan,
        glowBlur: 8
      });
      Renderer.drawText(ctx, `1`, s1X, s1Y, { fill: Colors.text, font: 'bold 12px "Segoe UI"', align: 'center', baseline: 'middle' });

      // Sphere 2 (Purple)
      const s2X = centerX + this.physics.pos2.x * scale;
      const s2Y = centerY + this.physics.pos2.y * scale;
      const r2Pix = this.physics.radius * scale;

      Renderer.drawCircle(ctx, s2X, s2Y, r2Pix, {
        fill: '#241738',
        stroke: Colors.purple,
        lineWidth: 2.5,
        glowColor: Colors.purple,
        glowBlur: 8
      });
      Renderer.drawText(ctx, `2`, s2X, s2Y, { fill: Colors.text, font: 'bold 12px "Segoe UI"', align: 'center', baseline: 'middle' });

      // 2D Momentum Vectors
      if (this.controlBar.showVectors) {
        VectorRenderer.drawVector(ctx, s1X, s1Y, this.physics.vel1.x * 3.5, this.physics.vel1.y * 3.5, 1.0, {
          color: Colors.cyan,
          label: 'v1'
        });

        VectorRenderer.drawVector(ctx, s2X, s2Y, this.physics.vel2.x * 3.5, this.physics.vel2.y * 3.5, 1.0, {
          color: Colors.purple,
          label: 'v2'
        });
      }
    }

    this.modal.render(ctx, width, height);
  }
}
