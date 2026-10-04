// Motion in 2D Kinematics Laboratory Scene for PhysicsLab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Slider } from '../../engine/ui.js';
import { LayoutEngine } from '../../engine/layout.js';
import { Kinematics2DPhysics } from '../../physics/mechanics/kinematics.js';
import { VectorRenderer } from '../../engine/vectorRenderer.js';
import { GraphRenderer } from '../../engine/graphRenderer.js';
import { MechanicsControlBar, MechanicsDataPanel, MechanicsModalOverlay } from '../../engine/mechanicsUI.js';

export class Kinematics2DScene {
  constructor() {
    this.physics = new Kinematics2DPhysics({
      pos0: { x: 0, y: 0 },
      vel0: { x: 15, y: 15 },
      acc: { x: 0, y: -9.8 }
    });

    this.controlBar = new MechanicsControlBar({
      onPlay: () => this.physics.start(),
      onPause: () => this.physics.pause(),
      onReset: () => this.physics.reset(),
      onStepForward: () => this.physics.step(0.1),
      onToggleSlowMo: () => {
        this.isSlowMo = !this.isSlowMo;
        this.controlBar.setSlowMo(this.isSlowMo);
      },
      onOpenFormula: () => this.modal.openFormula('MOTION IN 2D / VECTORS', [
        { name: 'Velocity Decomposition', formula: 'v = (vx² + vy²)^½', desc: 'Pythagorean vector magnitude of velocity' },
        { name: 'X-Displacement', formula: 'x = ux·t + ½·ax·t²', desc: 'Horizontal motion component evolution' },
        { name: 'Y-Displacement', formula: 'y = uy·t + ½·ay·t²', desc: 'Vertical motion component evolution' }
      ]),
      onOpenConcept: () => this.modal.openConcept('MOTION IN A PLANE', {
        what: 'Two-dimensional kinematics resolves rectilinear motions along mutually perpendicular axes (X and Y) independently.',
        how: 'Vector equations r(t) = r0 + v0·t + ½·a·t² apply independently to each Cartesian coordinate.',
        keyIdea: 'Orthogonal axes are completely decoupled in classical Newtonian mechanics.'
      }),
      onOpenProblem: () => this.modal.openProblem('PROJECTILE_MAX_HEIGHT'),
      onBack: () => {
        import('./mechanicsMenuScene.js').then(m => this.sceneManager.changeScene(new m.MechanicsMenuScene()));
      }
    });

    this.dataPanel = new MechanicsDataPanel({ title: '2D KINEMATICS DATA' });
    this.modal = new MechanicsModalOverlay();
    this.graph = new GraphRenderer({
      title: 'Trajectory y(x) & Speed v(t)',
      xLabel: 'X-Pos / Time',
      xUnit: 'm, s',
      yLabel: 'Y-Pos / Speed',
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
    const layout = LayoutEngine.calculateExperimentLayout(width, height);

    this.controlBar.setBounds(layout.toolbarRect.x, layout.toolbarRect.y, layout.toolbarRect.width);

    this.sliders = [];
    let sY = layout.controlRect.y + 14;
    const sW = layout.controlRect.width - 24;

    this.sliders.push(new Slider({
      x: layout.controlRect.x + 12,
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

    sY += 42;
    this.sliders.push(new Slider({
      x: layout.controlRect.x + 12,
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

    sY += 42;
    this.sliders.push(new Slider({
      x: layout.controlRect.x + 12,
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

    sY += 42;
    this.sliders.push(new Slider({
      x: layout.controlRect.x + 12,
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

    this.simRect = layout.simRect;
    this.controlRect = layout.controlRect;
    this.dataRect = layout.dataRect;
    this.dataPanel.setRect(layout.dataRect.x, layout.dataRect.y, layout.dataRect.width, layout.dataRect.height);
    this.graph.setRect(layout.graphRect.x, layout.graphRect.y, layout.graphRect.width, layout.graphRect.height);
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
      { label: 'Position X', value: st.pos.x.toFixed(2), unit: 'm', color: Colors.purple },
      { label: 'Position Y', value: st.pos.y.toFixed(2), unit: 'm', color: Colors.purple },
      { label: 'Velocity Vx', value: st.vel.x.toFixed(2), unit: 'm/s', color: Colors.cyan },
      { label: 'Velocity Vy', value: st.vel.y.toFixed(2), unit: 'm/s', color: Colors.cyan },
      { label: 'Total Speed (v)', value: st.speed.toFixed(2), unit: 'm/s', color: Colors.green }
    ]);

    const trajPoints = this.physics.trajectory.map(p => ({ x: p.pos.x, y: p.pos.y }));
    const speedPoints = this.physics.trajectory.map(p => ({ x: p.t, y: p.speed }));

    this.graph.clearDatasets();
    this.graph.addDataset({ label: 'Trajectory Y(X)', color: Colors.purple, points: trajPoints });
    this.graph.addDataset({ label: 'Speed v(t)', color: Colors.green, points: speedPoints });
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
      Renderer.drawText(ctx, '2D VECTOR CONTROLS', this.controlRect.x + 14, this.controlRect.y + 14, {
        fill: Colors.textMuted,
        font: 'bold 11px "Segoe UI"'
      });
      for (const s of this.sliders) {
        s.render(ctx);
      }
    }

    if (this.dataRect) {
      this.dataPanel.render(ctx);
    }

    // 2D Plane Simulation Viewport with strict clipping
    if (this.simRect) {
      Renderer.drawPanel(ctx, this.simRect.x, this.simRect.y, this.simRect.width, this.simRect.height, {
        fill: '#080D18',
        stroke: Colors.panelBorder
      });

      ctx.save();
      ctx.beginPath();
      ctx.rect(this.simRect.x, this.simRect.y, this.simRect.width, this.simRect.height);
      ctx.clip();

      const st = this.physics.getCurrentState();
      const originX = this.simRect.x + 40;
      const originY = this.simRect.y + this.simRect.height - 40;
      const scale = 5.0; // 5 pixels per meter

      // Axes
      Renderer.drawLine(ctx, originX, originY, this.simRect.x + this.simRect.width - 20, originY, { stroke: 'rgba(255,255,255,0.3)', lineWidth: 1.5 });
      Renderer.drawLine(ctx, originX, originY, originX, this.simRect.y + 20, { stroke: 'rgba(255,255,255,0.3)', lineWidth: 1.5 });

      // Trail
      if (this.controlBar.showTrail && this.physics.trajectory.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(94, 231, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        const p0 = this.physics.trajectory[0];
        ctx.moveTo(originX + p0.pos.x * scale, originY - p0.pos.y * scale);
        for (let i = 1; i < this.physics.trajectory.length; i++) {
          const pt = this.physics.trajectory[i];
          ctx.lineTo(originX + pt.pos.x * scale, originY - pt.pos.y * scale);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Moving Particle
      const px = originX + st.pos.x * scale;
      const py = originY - st.pos.y * scale;

      Renderer.drawCircle(ctx, px, py, 9, {
        fill: Colors.cyan,
        stroke: '#FFFFFF',
        lineWidth: 2,
        glowColor: Colors.cyan,
        glowBlur: 10
      });

      // Vectors
      if (this.controlBar.showVectors) {
        VectorRenderer.drawVector(ctx, px, py, st.vel.x, -st.vel.y, 2.5, {
          color: Colors.green,
          label: `v = ${st.speed.toFixed(1)} m/s`,
          glow: true
        });
      }

      ctx.restore();
    }

    this.graph.render(ctx);
    this.modal.render(ctx, width, height);
  }
}
