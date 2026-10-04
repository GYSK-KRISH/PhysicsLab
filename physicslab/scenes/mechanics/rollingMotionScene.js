// Rolling Motion on Incline Laboratory Scene for PhysicsLab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Slider } from '../../engine/ui.js';
import { RollingMotionPhysics } from '../../physics/mechanics/rotation.js';
import { VectorRenderer } from '../../engine/vectorRenderer.js';
import { MechanicsControlBar, MechanicsDataPanel, MechanicsModalOverlay } from '../../engine/mechanicsUI.js';

export class RollingMotionScene {
  constructor() {
    this.physics = new RollingMotionPhysics({ angleDeg: 25, mass: 2.0, radius: 0.5 });
    this.controlBar = new MechanicsControlBar({
      onPlay: () => this.physics.start(),
      onPause: () => this.physics.pause(),
      onReset: () => this.physics.reset(),
      onStepForward: () => this.physics.update(0.05),
      onToggleSlowMo: () => {
        this.isSlowMo = !this.isSlowMo;
        this.controlBar.setSlowMo(this.isSlowMo);
      },
      onOpenFormula: () => this.modal.openFormula('ROLLING WITHOUT SLIPPING', [
        { name: 'Pure Rolling Condition', formula: 'v_cm = ω·R', desc: 'Instantaneous contact point is momentarily at rest' },
        { name: 'Linear Acceleration Down Incline', formula: 'a = (g·sin θ) / (1 + c),  where c = I / (M·R²)', desc: 'Bodies with smaller c accelerate faster' },
        { name: 'Total Kinetic Energy', formula: 'K_total = K_trans + K_rot = ½·M·v² + ½·I·ω²', desc: 'Partitioned into translational and rotational kinetic energy' }
      ]),
      onOpenConcept: () => this.modal.openConcept('ROLLING MOTION', {
        what: 'Pure rolling motion combines linear translation of the center of mass with simultaneous rotation about the COM.',
        how: 'Static friction at the contact point provides torque causing rotation without dissipating mechanical energy.',
        keyIdea: 'Because the solid sphere has the lowest inertia fraction (c = 0.4), less potential energy is diverted into rotation, allowing it to win the downhill race!'
      }),
      onOpenProblem: () => this.modal.openProblem('TORQUE_LEVER'),
      onBack: () => {
        import('./mechanicsMenuScene.js').then(m => this.sceneManager.changeScene(new m.MechanicsMenuScene()));
      }
    });

    this.dataPanel = new MechanicsDataPanel({ title: 'ROLLING RACE DATA' });
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
      min: 10,
      max: 50,
      value: this.physics.angleDeg,
      step: 1,
      label: 'INCLINE ANGLE (θ)',
      unit: '°',
      accentColor: Colors.yellow,
      callback: (val) => this.physics.setParameters(val, this.physics.mass, this.physics.radius)
    }));

    sY += 55;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: 0.5,
      max: 5,
      value: this.physics.mass,
      step: 0.5,
      label: 'MASS (M)',
      unit: ' kg',
      accentColor: Colors.cyan,
      callback: (val) => this.physics.setParameters(this.physics.angleDeg, val, this.physics.radius)
    }));

    this.sidebarRect = { x: sidebarX, y: contentY, w: sidebarW, h: contentH };
    this.dataPanel.setRect(sidebarX, contentY + 160, sidebarW, contentH - 160);

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

    const sphere = this.physics.bodies[0];
    const cylinder = this.physics.bodies[1];
    const hoop = this.physics.bodies[3];

    this.dataPanel.setItems([
      { label: '1st: Solid Sphere (c=0.4)', value: `${sphere.acc.toFixed(2)} m/s²`, unit: `v=${sphere.vel.toFixed(1)}`, color: sphere.color },
      { label: '2nd: Solid Cylinder (c=0.5)', value: `${cylinder.acc.toFixed(2)} m/s²`, unit: `v=${cylinder.vel.toFixed(1)}`, color: cylinder.color },
      { label: '3rd: Hollow Sphere (c=0.67)', value: `${this.physics.bodies[2].acc.toFixed(2)} m/s²`, unit: `v=${this.physics.bodies[2].vel.toFixed(1)}`, color: this.physics.bodies[2].color },
      { label: '4th: Hollow Cylinder (c=1.0)', value: `${hoop.acc.toFixed(2)} m/s²`, unit: `v=${hoop.vel.toFixed(1)}`, color: hoop.color },
      { label: 'Total Energy Conserved', value: 'E_total = mgh', unit: 'Constant', color: Colors.green }
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

      const groundY = this.simRect.y + this.simRect.h - 50;
      const originX = this.simRect.x + 50;
      const inclineW = Math.min(460, this.simRect.w - 100);
      const thetaRad = (this.physics.angleDeg * Math.PI) / 180;
      const inclineH = inclineW * Math.tan(thetaRad);

      VectorRenderer.drawIncline(ctx, originX, groundY, inclineW, inclineH, this.physics.angleDeg);

      const rampPixLen = Math.sqrt(inclineW * inclineW + inclineH * inclineH);
      const topX = originX;
      const topY = groundY - inclineH;
      const cosT = Math.cos(thetaRad);
      const sinT = Math.sin(thetaRad);

      // Render the 4 Rolling Bodies racing down the incline
      const laneOffsets = [-30, -10, 10, 30];

      for (let i = 0; i < this.physics.bodies.length; i++) {
        const b = this.physics.bodies[i];
        const normDist = b.dist / this.physics.inclineLength;
        const dPixels = normDist * (rampPixLen - 40) + 20;

        const bx = topX + dPixels * cosT;
        const by = topY + dPixels * sinT;

        ctx.save();
        ctx.translate(bx, by);
        ctx.rotate(thetaRad);

        const rRadius = 14;
        const bodyY = -rRadius + laneOffsets[i];

        // Body with rolling rotation angle
        ctx.save();
        ctx.translate(0, bodyY);
        ctx.rotate(b.dist / this.physics.radius);

        Renderer.drawCircle(ctx, 0, 0, rRadius, {
          fill: '#152136',
          stroke: b.color,
          lineWidth: 2.5,
          glowColor: b.color,
          glowBlur: 8
        });
        Renderer.drawLine(ctx, 0, 0, rRadius, 0, { stroke: '#FFFFFF', lineWidth: 2 });
        ctx.restore();

        ctx.restore();
      }
    }

    this.modal.render(ctx, width, height);
  }
}
