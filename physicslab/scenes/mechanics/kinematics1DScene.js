// Motion in 1D Kinematics Laboratory Scene for PhysicsLab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Slider } from '../../engine/ui.js';
import { Kinematics1DPhysics } from '../../physics/mechanics/kinematics.js';
import { VectorRenderer } from '../../engine/vectorRenderer.js';
import { GraphRenderer } from '../../engine/graphRenderer.js';
import { MechanicsControlBar, MechanicsDataPanel, MechanicsModalOverlay } from '../../engine/mechanicsUI.js';

export class Kinematics1DScene {
  constructor() {
    this.physics = new Kinematics1DPhysics({ x0: 0, v0: 10, a: 2 });
    this.controlBar = new MechanicsControlBar({
      onPlay: () => this.physics.start(),
      onPause: () => this.physics.pause(),
      onReset: () => this.physics.reset(),
      onStepForward: () => this.physics.step(0.1),
      onToggleSlowMo: () => {
        this.isSlowMo = !this.isSlowMo;
        this.controlBar.setSlowMo(this.isSlowMo);
      },
      onOpenFormula: () => this.modal.openFormula('MOTION IN 1D', [
        { name: 'Velocity-Time Relation', formula: 'v = u + a·t', desc: 'Linear velocity evolution under constant acceleration' },
        { name: 'Displacement-Time Relation', formula: 's = u·t + ½·a·t²', desc: 'Quadratic position as a function of time' },
        { name: 'Velocity-Displacement Relation', formula: 'v² = u² + 2·a·s', desc: 'Direct kinematic link independent of elapsed time' }
      ]),
      onOpenConcept: () => this.modal.openConcept('MOTION IN 1D', {
        what: 'One-dimensional rectilinear kinematics describes particles moving along a straight line with uniform acceleration.',
        how: 'Given initial velocity u and constant acceleration a, position and velocity advance continuously according to Newton\'s equations.',
        keyIdea: 'The slope of the position-time curve is velocity (v = dx/dt), and the slope of the velocity-time curve is acceleration (a = dv/dt).'
      }),
      onOpenProblem: () => this.modal.openProblem('KINEMATICS_1D_STOPPING'),
      onBack: () => {
        import('./mechanicsMenuScene.js').then(m => this.sceneManager.changeScene(new m.MechanicsMenuScene()));
      }
    });

    this.dataPanel = new MechanicsDataPanel({ title: '1D KINEMATICS DATA' });
    this.modal = new MechanicsModalOverlay();
    this.graph = new GraphRenderer({
      title: 'Position & Velocity vs Time',
      xLabel: 'Time',
      xUnit: 's',
      yLabel: 'Kinematics',
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
      min: -30,
      max: 30,
      value: this.physics.v0,
      step: 1,
      label: 'INITIAL VELOCITY (u)',
      unit: ' m/s',
      accentColor: Colors.cyan,
      callback: (val) => this.physics.setParameters(this.physics.x0, val, this.physics.a)
    }));

    sY += 60;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: -10,
      max: 10,
      value: this.physics.a,
      step: 0.5,
      label: 'ACCELERATION (a)',
      unit: ' m/s²',
      accentColor: Colors.yellow,
      callback: (val) => this.physics.setParameters(this.physics.x0, this.physics.v0, val)
    }));

    sY += 60;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: -50,
      max: 50,
      value: this.physics.x0,
      step: 5,
      label: 'INITIAL POSITION (x0)',
      unit: ' m',
      accentColor: Colors.purple,
      callback: (val) => this.physics.setParameters(val, this.physics.v0, this.physics.a)
    }));

    this.sidebarRect = { x: sidebarX, y: contentY, w: sidebarW, h: contentH };
    this.dataPanel.setRect(sidebarX, contentY + 200, sidebarW, contentH - 200);

    // Simulation Viewport & Graph Viewport
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
    for (const s of this.sliders) {
      s.update(dt, this.inputManager);
    }

    // Update Data Panel
    const st = this.physics.getCurrentState();
    this.dataPanel.setItems([
      { label: 'Time (t)', value: st.t.toFixed(2), unit: 's', color: Colors.text },
      { label: 'Position (x)', value: st.x.toFixed(2), unit: 'm', color: Colors.purple },
      { label: 'Displacement (s)', value: st.displacement.toFixed(2), unit: 'm', color: Colors.purple },
      { label: 'Velocity (v)', value: st.v.toFixed(2), unit: 'm/s', color: Colors.cyan },
      { label: 'Acceleration (a)', value: st.a.toFixed(2), unit: 'm/s²', color: Colors.yellow }
    ]);

    // Update Graph with live trajectory points
    const xPoints = this.physics.trajectory.map(p => ({ x: p.t, y: p.x }));
    const vPoints = this.physics.trajectory.map(p => ({ x: p.t, y: p.v }));

    this.graph.clearDatasets();
    this.graph.addDataset({ label: 'Position x(t)', color: Colors.purple, points: xPoints });
    this.graph.addDataset({ label: 'Velocity v(t)', color: Colors.cyan, points: vPoints });
  }

  render(ctx) {
    const { width, height } = this.canvasEngine.getBounds();

    Renderer.drawRect(ctx, 0, 0, width, height, { fill: Colors.background });
    Renderer.drawGrid(ctx, width, height, 40);

    this.controlBar.render(ctx);

    // Sidebar & Data Panel
    if (this.sidebarRect) {
      Renderer.drawPanel(ctx, this.sidebarRect.x, this.sidebarRect.y, this.sidebarRect.w, this.sidebarRect.h, {
        fill: Colors.panel,
        stroke: Colors.panelBorder
      });
      Renderer.drawText(ctx, 'KINEMATICS PARAMETERS', this.sidebarRect.x + 16, this.sidebarRect.y + 16, {
        fill: Colors.textMuted,
        font: 'bold 11px "Segoe UI"'
      });
      for (const s of this.sliders) {
        s.render(ctx);
      }
      this.dataPanel.render(ctx);
    }

    // 1D Simulation Viewport
    if (this.simRect) {
      Renderer.drawPanel(ctx, this.simRect.x, this.simRect.y, this.simRect.w, this.simRect.h, {
        fill: '#090E1A',
        stroke: Colors.panelBorder
      });

      const st = this.physics.getCurrentState();
      const originX = this.simRect.x + this.simRect.w / 2;
      const trackY = this.simRect.y + this.simRect.h / 2;
      const scale = 3.0; // 3 pixels per meter

      // Draw Coordinate Axis
      Renderer.drawLine(ctx, this.simRect.x + 20, trackY, this.simRect.x + this.simRect.w - 20, trackY, {
        stroke: 'rgba(255, 255, 255, 0.2)',
        lineWidth: 2
      });

      // Axis graduation ticks
      for (let m = -80; m <= 80; m += 10) {
        const tx = originX + m * scale;
        if (tx >= this.simRect.x + 20 && tx <= this.simRect.x + this.simRect.w - 20) {
          Renderer.drawLine(ctx, tx, trackY - 6, tx, trackY + 6, {
            stroke: m === 0 ? Colors.cyan : 'rgba(255, 255, 255, 0.3)',
            lineWidth: m === 0 ? 2 : 1
          });
          Renderer.drawText(ctx, `${m}m`, tx, trackY + 18, {
            fill: m === 0 ? Colors.cyan : Colors.textMuted,
            font: '10px "Segoe UI"',
            align: 'center'
          });
        }
      }

      // Draw Moving Vehicle / Particle
      const objX = originX + st.x * scale;
      const objY = trackY - 14;

      // Glow & Body
      Renderer.drawRoundedRect(ctx, objX - 22, objY - 14, 44, 28, 6, {
        fill: Colors.panel,
        stroke: Colors.cyan,
        lineWidth: 2,
        glowColor: Colors.cyan,
        glowBlur: 10
      });

      Renderer.drawCircle(ctx, objX - 12, trackY + 1, 5, { fill: '#FFFFFF' });
      Renderer.drawCircle(ctx, objX + 12, trackY + 1, 5, { fill: '#FFFFFF' });

      // Live Vectors
      if (this.controlBar.showVectors) {
        // Velocity Vector (Cyan)
        VectorRenderer.drawVector(ctx, objX, objY, st.v, 0, 3.5, {
          color: Colors.cyan,
          label: `v = ${st.v.toFixed(1)} m/s`,
          glow: true
        });

        // Acceleration Vector (Yellow)
        if (Math.abs(st.a) > 0.01) {
          VectorRenderer.drawVector(ctx, objX, objY - 24, st.a, 0, 8.0, {
            color: Colors.yellow,
            label: `a = ${st.a.toFixed(1)} m/s²`,
            glow: true
          });
        }
      }
    }

    this.graph.render(ctx);
    this.modal.render(ctx, width, height);
  }
}
