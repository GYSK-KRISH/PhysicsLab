// Advanced Projectile Motion Laboratory Scene for PhysicsLab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Button, Slider } from '../../engine/ui.js';
import { AdvancedProjectilePhysics } from '../../physics/mechanics/projectile.js';
import { VectorRenderer } from '../../engine/vectorRenderer.js';
import { GraphRenderer } from '../../engine/graphRenderer.js';
import { MechanicsControlBar, MechanicsDataPanel, MechanicsModalOverlay } from '../../engine/mechanicsUI.js';

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
      min: 5,
      max: 50,
      value: this.physics.velocity,
      step: 1,
      label: 'LAUNCH SPEED (u)',
      unit: ' m/s',
      accentColor: Colors.cyan,
      callback: (val) => this.physics.setParameters(val, this.physics.angle, this.physics.gravity, this.physics.launchHeight, this.physics.airResistance)
    }));

    sY += 55;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
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

    sY += 55;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: 0,
      max: 30,
      value: this.physics.launchHeight,
      step: 1,
      label: 'LAUNCH HEIGHT (h0)',
      unit: ' m',
      accentColor: Colors.purple,
      callback: (val) => this.physics.setParameters(this.physics.velocity, this.physics.angle, this.physics.gravity, val, this.physics.airResistance)
    }));

    sY += 55;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: 0,
      max: 0.1,
      value: this.physics.airResistance,
      step: 0.005,
      label: 'AIR DRAG (k)',
      unit: '',
      accentColor: Colors.yellow,
      callback: (val) => this.physics.setParameters(this.physics.velocity, this.physics.angle, this.physics.gravity, this.physics.launchHeight, val)
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
      { label: 'Speed |v|', value: st.speed.toFixed(2), unit: 'm/s', color: Colors.cyan },
      { label: 'Max Height (H)', value: st.maxHeight.toFixed(2), unit: 'm', color: Colors.yellow },
      { label: 'Range (R)', value: st.range.toFixed(2), unit: 'm', color: Colors.green }
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

    if (this.sidebarRect) {
      Renderer.drawPanel(ctx, this.sidebarRect.x, this.sidebarRect.y, this.sidebarRect.w, this.sidebarRect.h, {
        fill: Colors.panel,
        stroke: Colors.panelBorder
      });
      Renderer.drawText(ctx, 'PROJECTILE PARAMETERS', this.sidebarRect.x + 16, this.sidebarRect.y + 16, {
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
      const groundY = this.simRect.y + this.simRect.h - 40;
      const scale = 4.5; // 4.5 px per meter

      // Ground line
      Renderer.drawLine(ctx, originX - 20, groundY, this.simRect.x + this.simRect.w - 20, groundY, {
        stroke: Colors.panelBorder,
        lineWidth: 3
      });

      // Elevated Launch Platform
      if (this.physics.launchHeight > 0) {
        const platH = this.physics.launchHeight * scale;
        Renderer.drawRect(ctx, originX - 25, groundY - platH, 30, platH, {
          fill: '#151F30',
          stroke: Colors.panelBorder
        });
        VectorRenderer.drawRuler(ctx, originX - 32, groundY, originX - 32, groundY - platH, this.physics.launchHeight, 'm');
      }

      // Trajectory Path
      if (this.physics.trajectory.length > 1) {
        ctx.save();
        ctx.strokeStyle = 'rgba(94, 231, 255, 0.5)';
        ctx.lineWidth = 2.5;
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

      Renderer.drawCircle(ctx, ballX, ballY, 8, {
        fill: Colors.yellow,
        stroke: '#FFFFFF',
        lineWidth: 2,
        glowColor: Colors.yellow,
        glowBlur: 10
      });

      // Velocity vector
      if (this.controlBar.showVectors) {
        VectorRenderer.drawVector(ctx, ballX, ballY, st.vx * 2.0, -st.vy * 2.0, 1.0, {
          color: Colors.cyan,
          label: `v=${st.speed.toFixed(1)}m/s`,
          glow: true
        });
      }
    }

    this.graph.render(ctx);
    this.modal.render(ctx, width, height);
  }
}
