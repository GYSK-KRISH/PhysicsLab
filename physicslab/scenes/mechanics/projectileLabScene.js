// Advanced Projectile Motion Laboratory Scene for PhysicsLab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Button, Slider } from '../../engine/ui.js';
import { AdvancedProjectilePhysics } from '../../physics/mechanics/projectile.js';
import { VectorRenderer } from '../../engine/vectorRenderer.js';
import { GraphRenderer } from '../../engine/graphRenderer.js';
import { MechanicsControlBar, MechanicsDataPanel, MechanicsModalOverlay } from '../../engine/mechanicsUI.js';
import { LayoutEngine } from '../../engine/layout.js';

export class ProjectileLabScene {
  constructor() {
    this.physics = new AdvancedProjectilePhysics({
      velocity: 25,
      angle: 45,
      gravity: 9.81,
      launchHeight: 0,
      airResistance: 0
    });

    this.controlBar = new MechanicsControlBar({
      onPlay: () => this.physics.start(),
      onPause: () => this.physics.pause(),
      onReset: () => this.physics.reset(),
      onStepForward: () => this.physics.update(0.05),
      onToggleSlowMo: () => {
        this.isSlowMo = !this.isSlowMo;
        this.controlBar.setSlowMo(this.isSlowMo);
      },
      onOpenFormula: () => this.modal.openFormula('PROJECTILE MOTION', [
        { name: 'Horizontal Range', formula: 'R = (u²·sin 2θ) / g', desc: 'Maximum horizontal distance on flat ground' },
        { name: 'Maximum Height', formula: 'H = h₀ + (u²·sin²θ) / (2g)', desc: 'Peak apex altitude above ground' },
        { name: 'Time of Flight', formula: 'T = (u·sin θ + √(u²·sin²θ + 2gh₀)) / g', desc: 'Total air flight time before ground collision' }
      ]),
      onOpenConcept: () => this.modal.openConcept('PROJECTILE MOTION', {
        what: 'Projectile motion is the 2D parabolic curve of an object thrown into a uniform gravitational field.',
        how: 'With zero air resistance, horizontal velocity remains constant (ax = 0) while vertical motion undergoes constant gravity deceleration (ay = -g).',
        keyIdea: 'Air drag couples x and y components via quadratic speed resistive force F_drag = -k·v², reducing both range and height.'
      }),
      onOpenProblem: () => this.modal.openProblem('PROJECTILE_RANGE'),
      onBack: () => {
        import('./mechanicsMenuScene.js').then(m => this.sceneManager.changeScene(new m.MechanicsMenuScene()));
      }
    });

    this.dataPanel = new MechanicsDataPanel({ title: 'PROJECTILE METRICS' });
    this.modal = new MechanicsModalOverlay();
    this.graph = new GraphRenderer({
      title: 'Trajectory Height Y vs Range X',
      xLabel: 'Distance',
      xUnit: 'm',
      yLabel: 'Altitude',
      yUnit: 'm'
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
    let sY = layout.controlRect.y + 16;
    const sW = layout.controlRect.width - 24;

    this.sliders.push(new Slider({
      x: layout.controlRect.x + 12,
      y: sY,
      width: sW,
      min: 5,
      max: 50,
      value: this.physics.velocity,
      step: 1,
      label: 'LAUNCH SPEED (u)',
      unit: ' m/s',
      accentColor: Colors.cyan,
      callback: (val) => this.physics.setParameters(val, this.physics.angle, this.physics.gravity, this.physics.launchHeight, this.physics.airResistance)
    }));

    sY += 44;
    this.sliders.push(new Slider({
      x: layout.controlRect.x + 12,
      y: sY,
      width: sW,
      min: 0,
      max: 85,
      value: this.physics.angle,
      step: 1,
      label: 'LAUNCH ANGLE (θ)',
      unit: '°',
      accentColor: Colors.cyan,
      callback: (val) => this.physics.setParameters(this.physics.velocity, val, this.physics.gravity, this.physics.launchHeight, this.physics.airResistance)
    }));

    sY += 44;
    this.sliders.push(new Slider({
      x: layout.controlRect.x + 12,
      y: sY,
      width: sW,
      min: 0,
      max: 30,
      value: this.physics.launchHeight || 0,
      step: 1,
      label: 'LAUNCH HEIGHT (h0)',
      unit: ' m',
      accentColor: Colors.purple,
      callback: (val) => this.physics.setParameters(this.physics.velocity, this.physics.angle, this.physics.gravity, val, this.physics.airResistance)
    }));

    sY += 44;
    this.sliders.push(new Slider({
      x: layout.controlRect.x + 12,
      y: sY,
      width: sW,
      min: 0,
      max: 20,
      value: this.physics.gravity,
      step: 0.1,
      label: 'GRAVITY (g)',
      unit: ' m/s²',
      accentColor: Colors.yellow,
      callback: (val) => this.physics.setParameters(this.physics.velocity, this.physics.angle, val, this.physics.launchHeight, this.physics.airResistance)
    }));

    this.dataPanel.setRect(layout.dataRect.x, layout.dataRect.y, layout.dataRect.width, layout.dataRect.height);
    this.graph.setRect(layout.graphRect.x, layout.graphRect.y, layout.graphRect.width, layout.graphRect.height);

    this.simRect = layout.simRect;
    this.controlRect = layout.controlRect;
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
    this.controlBar.setRunning(this.physics.isFlying);

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
      { label: 'Speed |v|', value: st.v.toFixed(2), unit: 'm/s', color: Colors.cyan },
      { label: 'Max Height (H)', value: this.physics.maxHeight.toFixed(2), unit: 'm', color: Colors.yellow },
      { label: 'Range (R)', value: this.physics.range.toFixed(2), unit: 'm', color: Colors.green }
    ]);

    const traj = this.physics.trajectory.map(p => ({ x: p.x, y: p.y }));
    this.graph.clearDatasets();
    this.graph.addDataset({ label: 'Trajectory Y(X)', color: Colors.cyan, points: traj, fillArea: true });
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
      for (const s of this.sliders) {
        s.render(ctx);
      }
    }

    this.dataPanel.render(ctx);

    if (this.simRect) {
      Renderer.drawPanel(ctx, this.simRect.x, this.simRect.y, this.simRect.width, this.simRect.height, {
        fill: '#090E1A',
        stroke: Colors.panelBorder
      });

      const st = this.physics.getCurrentState();
      const originX = this.simRect.x + 30;
      const groundY = this.simRect.y + this.simRect.height - 30;
      const scale = Math.min(
        (this.simRect.width - 60) / Math.max(10, this.physics.range * 1.1),
        (this.simRect.height - 60) / Math.max(10, this.physics.maxHeight * 1.2)
      );

      // Ground line
      Renderer.drawLine(ctx, originX - 10, groundY, this.simRect.x + this.simRect.width - 10, groundY, {
        stroke: Colors.panelBorder,
        lineWidth: 3
      });

      // Trajectory Path
      if (this.physics.trajectory.length > 1) {
        ctx.save();
        ctx.strokeStyle = 'rgba(94, 231, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < this.physics.trajectory.length; i++) {
          const pt = this.physics.trajectory[i];
          const px = originX + pt.x * scale;
          const py = groundY - pt.y * scale;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.restore();
      }

      // Projectile Ball
      const ballX = originX + st.x * scale;
      const ballY = groundY - st.y * scale;

      Renderer.drawCircle(ctx, ballX, ballY, 7, {
        fill: Colors.yellow,
        stroke: '#FFFFFF',
        lineWidth: 2,
        glowColor: Colors.yellow,
        glowBlur: 8
      });

      // Velocity vector
      if (this.controlBar.showVectors && Math.abs(st.v) > 0.1) {
        VectorRenderer.drawVector(ctx, ballX, ballY, st.vx * 1.5, -st.vy * 1.5, 1.0, {
          color: Colors.cyan,
          label: `v=${st.v.toFixed(1)}m/s`,
          glow: true
        });
      }
    }

    this.graph.render(ctx);
    this.modal.render(ctx, width, height);
  }
}
