// Motion in 2D Kinematics Laboratory Scene for PhysicsLab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Slider } from '../../engine/ui.js';
import { Kinematics2DPhysics } from '../../physics/mechanics/kinematics.js';
import { VectorRenderer } from '../../engine/vectorRenderer.js';
import { GraphRenderer } from '../../engine/graphRenderer.js';
import { MechanicsControlBar, MechanicsDataPanel, MechanicsModalOverlay } from '../../engine/mechanicsUI.js';

export class Kinematics2DScene {
  constructor() {
    this.physics = new Kinematics2DPhysics({ vx0: 15, vy0: 20, ax: 0, ay: -9.81 });
    this.controlBar = new MechanicsControlBar({
      onPlay: () => this.physics.start(),
      onPause: () => this.physics.pause(),
      onReset: () => this.physics.reset(),
      onStepForward: () => this.physics.step(0.1),
      onToggleSlowMo: () => {
        this.isSlowMo = !this.isSlowMo;
        this.controlBar.setSlowMo(this.isSlowMo);
      },
      onOpenFormula: () => this.modal.openFormula('MOTION IN 2D', [
        { name: '2D Position Vector', formula: 'r(t) = (x₀ + vx₀·t + ½ax·t²) î + (y₀ + vy₀·t + ½ay·t²) ĵ', desc: 'Vector position in Cartesian plane' },
        { name: '2D Velocity Vector', formula: 'v(t) = (vx₀ + ax·t) î + (vy₀ + ay·t) ĵ', desc: 'Independent x and y velocity components' },
        { name: 'Speed Magnitude', formula: '|v| = √(vx² + vy²)', desc: 'Scalar instantaneous speed' }
      ]),
      onOpenConcept: () => this.modal.openConcept('MOTION IN 2D', {
        what: 'Two-dimensional kinematics models curved particle motion using independent orthogonal component vectors.',
        how: 'The horizontal and vertical motions are completely independent of each other except for sharing the same elapsed time t.',
        keyIdea: 'Resolving velocity and acceleration into perpendicular components simplifies complex 2D curves into two 1D equations.'
      }),
      onOpenProblem: () => this.modal.openProblem('PROJECTILE_RANGE'),
      onBack: () => {
        import('./mechanicsMenuScene.js').then(m => this.sceneManager.changeScene(new m.MechanicsMenuScene()));
      }
    });

    this.dataPanel = new MechanicsDataPanel({ title: '2D MOTION READOUT' });
    this.modal = new MechanicsModalOverlay();
    this.graph = new GraphRenderer({
      title: '2D Trajectory (Y vs X)',
      xLabel: 'X Position',
      xUnit: 'm',
      yLabel: 'Y Position',
      yUnit: 'm',
      autoScale: true
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

    // Sliders
    this.sliders = [];
    let sY = contentY + 20;
    const sW = sidebarW - 40;

    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: 0,
      max: 30,
      value: this.physics.vel0.x,
      step: 1,
      label: 'INITIAL Vx (m/s)',
      unit: ' m/s',
      accentColor: Colors.cyan,
      callback: (val) => this.physics.setParameters(val, this.physics.vel0.y, this.physics.acc.x, this.physics.acc.y)
    }));

    sY += 55;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: 0,
      max: 30,
      value: this.physics.vel0.y,
      step: 1,
      label: 'INITIAL Vy (m/s)',
      unit: ' m/s',
      accentColor: Colors.cyan,
      callback: (val) => this.physics.setParameters(this.physics.vel0.x, val, this.physics.acc.x, this.physics.acc.y)
    }));

    sY += 55;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: -15,
      max: 15,
      value: this.physics.acc.x,
      step: 0.5,
      label: 'ACCELERATION Ax',
      unit: ' m/s²',
      accentColor: Colors.yellow,
      callback: (val) => this.physics.setParameters(this.physics.vel0.x, this.physics.vel0.y, val, this.physics.acc.y)
    }));

    sY += 55;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: -20,
      max: 0,
      value: this.physics.acc.y,
      step: 0.5,
      label: 'ACCELERATION Ay',
      unit: ' m/s²',
      accentColor: Colors.yellow,
      callback: (val) => this.physics.setParameters(this.physics.vel0.x, this.physics.vel0.y, this.physics.acc.x, val)
    }));

    this.sidebarRect = { x: sidebarX, y: contentY, w: sidebarW, h: contentH };
    this.dataPanel.setRect(sidebarX, contentY + 250, sidebarW, contentH - 250);

    const mainW = sidebarX - 40;
    const simH = Math.floor(contentH * 0.54);
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
    for (const s of this.sliders) {
      s.update(dt, this.inputManager);
    }

    const st = this.physics.getCurrentState();
    this.dataPanel.setItems([
      { label: 'Time (t)', value: st.t.toFixed(2), unit: 's', color: Colors.text },
      { label: 'Position (X, Y)', value: `(${st.x.toFixed(1)}, ${st.y.toFixed(1)})`, unit: 'm', color: Colors.purple },
      { label: 'Velocity (Vx, Vy)', value: `(${st.vx.toFixed(1)}, ${st.vy.toFixed(1)})`, unit: 'm/s', color: Colors.cyan },
      { label: 'Speed |v|', value: st.speed.toFixed(2), unit: 'm/s', color: Colors.cyan },
      { label: 'Acc |a|', value: st.accMag.toFixed(2), unit: 'm/s²', color: Colors.yellow }
    ]);

    const traj = this.physics.trajectory.map(p => ({ x: p.x, y: p.y }));
    this.graph.clearDatasets();
    this.graph.addDataset({ label: 'Path Y(X)', color: Colors.cyan, points: traj });
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
      Renderer.drawText(ctx, '2D VECTORS & CONTROLS', this.sidebarRect.x + 16, this.sidebarRect.y + 16, {
        fill: Colors.textMuted,
        font: 'bold 11px "Segoe UI"'
      });
      for (const s of this.sliders) {
        s.render(ctx);
      }
      this.dataPanel.render(ctx);
    }

    if (this.simRect) {
      Renderer.drawPanel(ctx, this.simRect.x, this.simRect.y, this.simRect.w, this.simRect.h, {
        fill: '#090E1A',
        stroke: Colors.panelBorder
      });

      const st = this.physics.getCurrentState();
      const originX = this.simRect.x + 40;
      const originY = this.simRect.y + this.simRect.h - 40;
      const scale = 5.0; // 5 px per meter

      // Draw Grid / Ground Lines
      Renderer.drawLine(ctx, originX, originY, this.simRect.x + this.simRect.w - 20, originY, {
        stroke: 'rgba(255, 255, 255, 0.2)',
        lineWidth: 2
      });
      Renderer.drawLine(ctx, originX, originY, originX, this.simRect.y + 20, {
        stroke: 'rgba(255, 255, 255, 0.2)',
        lineWidth: 2
      });

      // Draw Trajectory Trail
      if (this.physics.trajectory.length > 1) {
        ctx.save();
        ctx.strokeStyle = 'rgba(94, 231, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        for (let i = 0; i < this.physics.trajectory.length; i++) {
          const pt = this.physics.trajectory[i];
          const px = originX + pt.x * scale;
          const py = originY - pt.y * scale;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.restore();
      }

      // Draw Particle
      const objX = originX + st.x * scale;
      const objY = originY - st.y * scale;

      Renderer.drawCircle(ctx, objX, objY, 10, {
        fill: Colors.panel,
        stroke: Colors.cyan,
        lineWidth: 3,
        glowColor: Colors.cyan,
        glowBlur: 10
      });

      // Draw Velocity and Component Vectors
      if (this.controlBar.showVectors) {
        VectorRenderer.drawComponentVector(ctx, objX, objY, st.vx * 2.0, -st.vy * 2.0, 1.0, {
          color: Colors.cyan,
          label: 'v'
        });

        // Acceleration Vector
        if (st.accMag > 0.05) {
          VectorRenderer.drawVector(ctx, objX, objY, st.ax * 3.0, -st.ay * 3.0, 1.0, {
            color: Colors.yellow,
            label: 'a'
          });
        }
      }
    }

    this.graph.render(ctx);
    this.modal.render(ctx, width, height);
  }
}
