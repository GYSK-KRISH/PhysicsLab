// Escape Velocity Laboratory Scene for PhysicsLab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Button, Slider } from '../../engine/ui.js';
import { GravitationPhysics, GRAVITATIONAL_CONSTANT } from '../../physics/mechanics/gravitation.js';
import { VectorRenderer } from '../../engine/vectorRenderer.js';
import { MechanicsControlBar, MechanicsDataPanel, MechanicsModalOverlay } from '../../engine/mechanicsUI.js';

export class EscapeVelocityScene {
  constructor() {
    this.selectedBody = 'EARTH';
    this.planetMass = 5.972e24; // Earth mass
    this.planetRadius = 6.371e6; // Earth radius
    this.launchSpeed = 11200; // m/s

    this.simRadius = 1.0;
    this.simSpeed = 11200;
    this.time = 0;
    this.isRunning = false;
    this.trajectory = [];

    this.controlBar = new MechanicsControlBar({
      onPlay: () => { this.isRunning = true; },
      onPause: () => { this.isRunning = false; },
      onReset: () => this.reset(),
      onStepForward: () => this.update(0.05),
      onToggleSlowMo: () => {
        this.isSlowMo = !this.isSlowMo;
        this.controlBar.setSlowMo(this.isSlowMo);
      },
      onOpenFormula: () => this.modal.openFormula('ESCAPE VELOCITY', [
        { name: 'Escape Velocity Formula', formula: 'v_e = √( (2·G·M) / R ) = √(2·g·R)', desc: 'Speed where kinetic energy overcomes gravitational potential well' },
        { name: 'Energy Conservation at Escape', formula: 'E_total = ½·m·v_e² - (G·M·m)/R = 0', desc: 'Zero total mechanical energy at infinite distance' },
        { name: 'Orbital Speed Relation', formula: 'v_e = √2 · v_orbital ≈ 1.414 · v_o', desc: '41.4% higher than circular orbital velocity at surface' }
      ]),
      onOpenConcept: () => this.modal.openConcept('ESCAPE VELOCITY', {
        what: 'Escape velocity is the minimum initial speed required for an unpowered ballistic projectile to escape completely from a celestial gravitational field.',
        how: 'If v < v_e, total energy E < 0 and the trajectory falls back. At v = v_e, E = 0 (parabolic escape). If v > v_e, E > 0 (hyperbolic escape).',
        keyIdea: 'Escape velocity depends solely on the planet\'s mass and radius, completely independent of the projectile\'s mass or launch angle.'
      }),
      onOpenProblem: () => this.modal.openProblem('ESCAPE_VELOCITY'),
      onBack: () => {
        import('./mechanicsMenuScene.js').then(m => this.sceneManager.changeScene(new m.MechanicsMenuScene()));
      }
    });

    this.dataPanel = new MechanicsDataPanel({ title: 'ESCAPE DYNAMICS' });
    this.modal = new MechanicsModalOverlay();
    this.presetButtons = [];
    this.sliders = [];
    this.isSlowMo = false;
    this.lastWidth = 0;
    this.lastHeight = 0;
  }

  setPreset(preset) {
    this.selectedBody = preset;
    if (preset === 'EARTH') {
      this.planetMass = 5.972e24;
      this.planetRadius = 6.371e6;
      this.launchSpeed = 11200;
    } else if (preset === 'MOON') {
      this.planetMass = 7.342e22;
      this.planetRadius = 1.737e6;
      this.launchSpeed = 2380;
    } else if (preset === 'MARS') {
      this.planetMass = 6.417e23;
      this.planetRadius = 3.390e6;
      this.launchSpeed = 5030;
    }
    this.reset();
    this.rebuildUI();
  }

  reset() {
    this.simRadius = this.planetRadius;
    this.simSpeed = this.launchSpeed;
    this.time = 0;
    this.isRunning = false;
    this.trajectory = [];
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

    // Presets Buttons
    this.presetButtons = [];
    const presets = ['EARTH', 'MOON', 'MARS'];
    const pbW = (sidebarW - 40) / 3;

    for (let i = 0; i < presets.length; i++) {
      const p = presets[i];
      const isSel = this.selectedBody === p;
      this.presetButtons.push(new Button({
        x: sidebarX + 20 + i * pbW,
        y: contentY + 20,
        width: pbW - 4,
        height: 32,
        text: p,
        accentColor: isSel ? Colors.cyan : Colors.panelBorder,
        callback: () => this.setPreset(p)
      }));
    }

    this.sliders = [];
    let sY = contentY + 70;
    const sW = sidebarW - 40;

    const vEscapeCalc = GravitationPhysics.calculateEscapeVelocity(this.planetMass, this.planetRadius, GRAVITATIONAL_CONSTANT);

    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: Math.floor(vEscapeCalc.v_escape * 0.4),
      max: Math.ceil(vEscapeCalc.v_escape * 1.6),
      value: this.launchSpeed,
      step: 50,
      label: 'LAUNCH SPEED (v)',
      unit: ' m/s',
      accentColor: Colors.yellow,
      callback: (val) => { this.launchSpeed = val; this.reset(); }
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
    const effectiveDt = (this.isSlowMo ? dt * 0.25 : dt) * 15; // Scaled time for orbital distances
    this.controlBar.setRunning(this.isRunning);

    const vEscapeCalc = GravitationPhysics.calculateEscapeVelocity(this.planetMass, this.planetRadius, GRAVITATIONAL_CONSTANT);

    if (this.isRunning) {
      this.time += effectiveDt;
      // Numerical integration of vertical escape: a = -GM / r^2
      const acc = -(GRAVITATIONAL_CONSTANT * this.planetMass) / (this.simRadius * this.simRadius);
      this.simSpeed += acc * effectiveDt;
      this.simRadius += this.simSpeed * effectiveDt;

      if (this.simRadius < this.planetRadius) {
        this.simRadius = this.planetRadius;
        this.simSpeed = 0;
        this.isRunning = false;
      }
      this.trajectory.push(this.simRadius);
      if (this.trajectory.length > 300) this.trajectory.shift();
    }

    if (this.modal.isOpen) {
      this.modal.update(dt, this.inputManager);
      return;
    }

    this.controlBar.update(dt, this.inputManager);
    for (const b of this.presetButtons) b.update(dt, this.inputManager);
    for (const s of this.sliders) s.update(dt, this.inputManager);

    let trajType = 'SUB-ORBITAL (FALLS BACK)';
    if (this.launchSpeed >= vEscapeCalc.v_escape * 1.005) trajType = 'HYPERBOLIC ESCAPE (E > 0)';
    else if (Math.abs(this.launchSpeed - vEscapeCalc.v_escape) <= vEscapeCalc.v_escape * 0.005) trajType = 'PARABOLIC ESCAPE (E = 0)';

    this.dataPanel.setItems([
      { label: 'Planet Preset', value: this.selectedBody, unit: '', color: Colors.cyan },
      { label: 'Surface Radius R', value: (this.planetRadius / 1e3).toFixed(0), unit: 'km', color: Colors.text },
      { label: 'Escape Velocity (v_e)', value: vEscapeCalc.v_escape.toFixed(0), unit: 'm/s', color: Colors.green },
      { label: 'Surface Orbit (v_o)', value: vEscapeCalc.v_orbital_surface.toFixed(0), unit: 'm/s', color: Colors.purple },
      { label: 'Current Speed', value: this.simSpeed.toFixed(0), unit: 'm/s', color: Colors.yellow },
      { label: 'Trajectory Type', value: trajType, unit: '', color: this.launchSpeed >= vEscapeCalc.v_escape ? Colors.green : '#EF4444' }
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
      for (const b of this.presetButtons) b.render(ctx);
      for (const s of this.sliders) s.render(ctx);
      this.dataPanel.render(ctx);
    }

    if (this.simRect) {
      Renderer.drawPanel(ctx, this.simRect.x, this.simRect.y, this.simRect.w, this.simRect.h, {
        fill: '#080D18',
        stroke: Colors.panelBorder
      });

      const cx = this.simRect.x + this.simRect.w / 2;
      const cy = this.simRect.y + this.simRect.h - 50;
      const pRadiusPix = 70;

      // Planet Sphere
      Renderer.drawCircle(ctx, cx, cy, pRadiusPix, {
        fill: '#15243B',
        stroke: Colors.cyan,
        lineWidth: 3,
        glowColor: Colors.cyan,
        glowBlur: 14
      });

      Renderer.drawText(ctx, this.selectedBody, cx, cy - 20, {
        fill: Colors.text,
        font: 'bold 12px "Segoe UI"',
        align: 'center'
      });

      // Rocket Probe Position
      const normAlt = (this.simRadius - this.planetRadius) / this.planetRadius;
      const rocketY = (cy - pRadiusPix) - normAlt * 180;

      Renderer.drawCircle(ctx, cx, rocketY, 8, {
        fill: Colors.yellow,
        stroke: '#FFFFFF',
        lineWidth: 2,
        glowColor: Colors.yellow,
        glowBlur: 10
      });

      // Velocity Vector Arrow
      if (this.controlBar.showVectors && Math.abs(this.simSpeed) > 10) {
        VectorRenderer.drawVector(ctx, cx, rocketY, 0, -this.simSpeed * 0.005, 1.0, {
          color: this.simSpeed > 0 ? Colors.green : '#EF4444',
          label: `v = ${this.simSpeed.toFixed(0)} m/s`
        });
      }
    }

    this.modal.render(ctx, width, height);
  }
}
