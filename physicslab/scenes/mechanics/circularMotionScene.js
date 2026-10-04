// Circular Motion Laboratory Scene for PhysicsLab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Slider } from '../../engine/ui.js';
import { CircularMotionPhysics } from '../../physics/mechanics/circularMotion.js';
import { VectorRenderer } from '../../engine/vectorRenderer.js';
import { MechanicsControlBar, MechanicsDataPanel, MechanicsModalOverlay } from '../../engine/mechanicsUI.js';

export class CircularMotionScene {
  constructor() {
    this.physics = new CircularMotionPhysics({ radius: 3.5, mass: 2.0, speed: 8.0 });
    this.controlBar = new MechanicsControlBar({
      onPlay: () => this.physics.start(),
      onPause: () => this.physics.pause(),
      onReset: () => this.physics.reset(),
      onStepForward: () => this.physics.update(0.05),
      onToggleSlowMo: () => {
        this.isSlowMo = !this.isSlowMo;
        this.controlBar.setSlowMo(this.isSlowMo);
      },
      onOpenFormula: () => this.modal.openFormula('CIRCULAR MOTION', [
        { name: 'Angular Velocity Relation', formula: 'v = r·ω  ⇒  ω = v / r', desc: 'Linear tangential speed to angular rate of rotation' },
        { name: 'Centripetal Acceleration', formula: 'a_c = v² / r = r·ω²', desc: 'Radially inward acceleration maintaining the circle' },
        { name: 'Centripetal Force & Period', formula: 'F_c = (m·v²) / r,  T = 2π / ω', desc: 'Required radial force and duration of one full revolution' }
      ]),
      onOpenConcept: () => this.modal.openConcept('CIRCULAR MOTION', {
        what: 'Uniform circular motion occurs when a particle travels along a circular trajectory at constant scalar speed.',
        how: 'Even though speed is constant, the velocity direction continually changes, demanding a continuous inward centripetal acceleration.',
        keyIdea: 'Centripetal force is always orthogonal to tangential velocity; thus it does zero work on the particle.'
      }),
      onOpenProblem: () => this.modal.openProblem('CIRCULAR_CENTRIPETAL_FORCE'),
      onBack: () => {
        import('./mechanicsMenuScene.js').then(m => this.sceneManager.changeScene(new m.MechanicsMenuScene()));
      }
    });

    this.dataPanel = new MechanicsDataPanel({ title: 'CIRCULAR DYNAMICS' });
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
      min: 1,
      max: 6,
      value: this.physics.radius,
      step: 0.2,
      label: 'ORBIT RADIUS (r)',
      unit: ' m',
      accentColor: Colors.yellow,
      callback: (val) => this.physics.setParameters(val, this.physics.mass, this.physics.speed)
    }));

    sY += 55;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: 1,
      max: 20,
      value: this.physics.speed,
      step: 0.5,
      label: 'TANGENTIAL SPEED (v)',
      unit: ' m/s',
      accentColor: Colors.cyan,
      callback: (val) => this.physics.setParameters(this.physics.radius, this.physics.mass, val)
    }));

    sY += 55;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: 0.5,
      max: 10,
      value: this.physics.mass,
      step: 0.5,
      label: 'OBJECT MASS (m)',
      unit: ' kg',
      accentColor: Colors.purple,
      callback: (val) => this.physics.setParameters(this.physics.radius, val, this.physics.speed)
    }));

    this.sidebarRect = { x: sidebarX, y: contentY, w: sidebarW, h: contentH };
    this.dataPanel.setRect(sidebarX, contentY + 200, sidebarW, contentH - 200);

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

    this.dataPanel.setItems([
      { label: 'Radius (r)', value: this.physics.radius.toFixed(1), unit: 'm', color: Colors.yellow },
      { label: 'Speed (v)', value: this.physics.speed.toFixed(1), unit: 'm/s', color: Colors.cyan },
      { label: 'Angular Vel (ω)', value: this.physics.angularVelocity.toFixed(2), unit: 'rad/s', color: Colors.green },
      { label: 'Centripetal Acc (a_c)', value: this.physics.centripetalAcc.toFixed(1), unit: 'm/s²', color: '#F97316' },
      { label: 'Centripetal Force (F_c)', value: this.physics.centripetalForce.toFixed(1), unit: 'N', color: '#EF4444' },
      { label: 'Period (T)', value: this.physics.period.toFixed(2), unit: 's', color: Colors.purple },
      { label: 'Frequency (f)', value: this.physics.frequency.toFixed(2), unit: 'Hz', color: Colors.text }
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
      const scale = 32.0; // 32 px per meter
      const rPixels = this.physics.radius * scale;

      // Circular Path Outline
      ctx.save();
      ctx.strokeStyle = 'rgba(94, 231, 255, 0.2)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(centerX, centerY, rPixels, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Center Anchor Point
      Renderer.drawCircle(ctx, centerX, centerY, 6, { fill: Colors.purple });

      // Object position on circle
      const objX = centerX + rPixels * Math.cos(this.physics.angleRad);
      const objY = centerY + rPixels * Math.sin(this.physics.angleRad);

      // Tether Line from Center
      Renderer.drawLine(ctx, centerX, centerY, objX, objY, {
        stroke: 'rgba(255, 255, 255, 0.3)',
        lineWidth: 1.5
      });

      // Rotating Mass Bob
      Renderer.drawCircle(ctx, objX, objY, 14, {
        fill: '#151F30',
        stroke: Colors.cyan,
        lineWidth: 3,
        glowColor: Colors.cyan,
        glowBlur: 10
      });

      Renderer.drawText(ctx, `${this.physics.mass.toFixed(0)}kg`, objX, objY, {
        fill: Colors.text,
        font: 'bold 10px "Segoe UI"',
        align: 'center',
        baseline: 'middle'
      });

      // Dynamic Vectors
      if (this.controlBar.showVectors) {
        // Tangential Velocity Vector (Cyan)
        const vx = -Math.sin(this.physics.angleRad) * this.physics.speed * 4.0;
        const vy = Math.cos(this.physics.angleRad) * this.physics.speed * 4.0;
        VectorRenderer.drawVector(ctx, objX, objY, vx, vy, 1.0, {
          color: Colors.cyan,
          label: `v = ${this.physics.speed.toFixed(1)} m/s`,
          glow: true
        });

        // Centripetal Acceleration / Force Vector (pointing to center)
        const ax = -Math.cos(this.physics.angleRad) * Math.min(60, this.physics.centripetalAcc * 1.5);
        const ay = -Math.sin(this.physics.angleRad) * Math.min(60, this.physics.centripetalAcc * 1.5);
        VectorRenderer.drawVector(ctx, objX, objY, ax, ay, 1.0, {
          color: '#EF4444',
          label: `F_c = ${this.physics.centripetalForce.toFixed(0)}N`,
          glow: true
        });
      }
    }

    this.modal.render(ctx, width, height);
  }
}
