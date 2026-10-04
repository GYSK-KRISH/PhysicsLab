// Escape Velocity & Planet Gravitation Presets Laboratory Scene for PhysicsLab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Button, Slider } from '../../engine/ui.js';
import { GravitationPhysics, GRAVITATIONAL_CONSTANT } from '../../physics/mechanics/gravitation.js';
import { VectorRenderer } from '../../engine/vectorRenderer.js';
import { MechanicsControlBar, MechanicsDataPanel, MechanicsModalOverlay } from '../../engine/mechanicsUI.js';
import { LayoutEngine } from '../../engine/layout.js';

export class EscapeVelocityScene {
  constructor() {
    this.selectedBody = 'EARTH';
    this.planetMass = 5.972e24; // Earth mass
    this.planetRadius = 6.371e6; // Earth radius
    this.launchSpeed = 11200; // m/s

    this.simRadius = 6.371e6;
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
      onOpenFormula: () => this.modal.openFormula('ESCAPE VELOCITY & PLANETARY GRAVITY', [
        { name: 'Escape Velocity Formula', formula: 'v_e = √( (2·G·M) / R ) = √(2·g·R)', desc: 'Speed where kinetic energy overcomes gravitational potential well' },
        { name: 'Surface Gravity g', formula: 'g = (G · M) / R²', desc: 'Local acceleration due to gravity on planet surface' },
        { name: 'Energy Conservation', formula: 'E_total = ½·m·v_e² - (G·M·m)/R = 0', desc: 'Zero total mechanical energy at infinite distance' }
      ]),
      onOpenConcept: () => this.modal.openConcept('ESCAPE VELOCITY', {
        what: 'Escape velocity is the minimum initial speed required for a projectile to break free from a planet\'s gravitational pull without further propulsion.',
        how: 'If launch speed v < v_e, the projectile reaches an apex and falls back. At v = v_e, energy E = 0 (parabolic escape). If v > v_e, E > 0 (hyperbolic escape).',
        keyIdea: 'Planet presets (Earth: 9.81 m/s², Moon: 1.62 m/s², Mars: 3.71 m/s², Custom) directly scale the gravitational field, escape velocity, and trajectory dynamics.'
      }),
      onOpenProblem: () => this.modal.openProblem('ESCAPE_VELOCITY'),
      onBack: () => {
        import('./mechanicsMenuScene.js').then(m => this.sceneManager.changeScene(new m.MechanicsMenuScene()));
      }
    });

    this.dataPanel = new MechanicsDataPanel({ title: 'PLANETARY METRICS' });
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
    } else if (preset === 'CUSTOM') {
      // Keep current mass and radius
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
    const layout = LayoutEngine.calculateExperimentLayout(width, height);

    this.controlBar.setBounds(layout.toolbarRect.x, layout.toolbarRect.y, layout.toolbarRect.width);

    // Sidebar Preset Buttons & Sliders
    this.presetButtons = [];
    const presets = ['EARTH', 'MOON', 'MARS', 'CUSTOM'];
    const pW = (layout.controlRect.width - 24) / 4;

    for (let i = 0; i < presets.length; i++) {
      const p = presets[i];
      const isSel = this.selectedBody === p;
      this.presetButtons.push(new Button({
        x: layout.controlRect.x + 12 + i * pW,
        y: layout.controlRect.y + 12,
        width: pW - 4,
        height: 28,
        text: p,
        accentColor: isSel ? Colors.cyan : Colors.panelBorder,
        callback: () => this.setPreset(p)
      }));
    }

    this.sliders = [];
    let sY = layout.controlRect.y + 48;
    const sW = layout.controlRect.width - 24;

    const vEscapeCalc = GravitationPhysics.calculateEscapeVelocity(this.planetMass, this.planetRadius, GRAVITATIONAL_CONSTANT);

    this.sliders.push(new Slider({
      x: layout.controlRect.x + 12,
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

    if (this.selectedBody === 'CUSTOM') {
      sY += 45;
      const gSurface = (GRAVITATIONAL_CONSTANT * this.planetMass) / (this.planetRadius * this.planetRadius);
      this.sliders.push(new Slider({
        x: layout.controlRect.x + 12,
        y: sY,
        width: sW,
        min: 0.5,
        max: 25.0,
        value: gSurface,
        step: 0.1,
        label: 'CUSTOM GRAVITY (g)',
        unit: ' m/s²',
        accentColor: Colors.cyan,
        callback: (gVal) => {
          this.planetMass = (gVal * this.planetRadius * this.planetRadius) / GRAVITATIONAL_CONSTANT;
          this.reset();
        }
      }));
    }

    this.dataPanel.setRect(layout.dataRect.x, layout.dataRect.y, layout.dataRect.width, layout.dataRect.height);
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
    const effectiveDt = (this.isSlowMo ? dt * 0.25 : dt) * 15;
    this.controlBar.setRunning(this.isRunning);

    const vEscapeCalc = GravitationPhysics.calculateEscapeVelocity(this.planetMass, this.planetRadius, GRAVITATIONAL_CONSTANT);

    if (this.isRunning) {
      this.time += effectiveDt;
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

    const gSurface = (GRAVITATIONAL_CONSTANT * this.planetMass) / (this.planetRadius * this.planetRadius);

    this.dataPanel.setItems([
      { label: 'Planet Preset', value: this.selectedBody, unit: '', color: Colors.cyan },
      { label: 'Surface Gravity (g)', value: gSurface.toFixed(2), unit: 'm/s²', color: Colors.yellow },
      { label: 'Surface Radius (R)', value: (this.planetRadius / 1e3).toFixed(0), unit: 'km', color: Colors.text },
      { label: 'Escape Velocity (v_e)', value: vEscapeCalc.v_escape.toFixed(0), unit: 'm/s', color: Colors.green },
      { label: 'Surface Orbit Speed (v_o)', value: vEscapeCalc.v_orbital_surface.toFixed(0), unit: 'm/s', color: Colors.purple },
      { label: 'Current Speed', value: this.simSpeed.toFixed(0), unit: 'm/s', color: Colors.yellow },
      { label: 'Trajectory Type', value: trajType, unit: '', color: this.launchSpeed >= vEscapeCalc.v_escape ? Colors.green : '#EF4444' }
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
      Renderer.drawText(ctx, 'PLANET PRESETS & CONTROLS', this.controlRect.x + 12, this.controlRect.y + 6, {
        fill: Colors.textMuted,
        font: 'bold 10px "Segoe UI"'
      });
      for (const b of this.presetButtons) b.render(ctx);
      for (const s of this.sliders) s.render(ctx);
    }

    this.dataPanel.render(ctx);

    if (this.simRect) {
      Renderer.drawPanel(ctx, this.simRect.x, this.simRect.y, this.simRect.width, this.simRect.height, {
        fill: '#080D18',
        stroke: Colors.panelBorder
      });

      const cx = this.simRect.x + this.simRect.width / 2;
      const cy = this.simRect.y + this.simRect.height - 40;
      const pRadiusPix = Math.min(65, this.simRect.height * 0.22);

      // Planet Sphere
      Renderer.drawCircle(ctx, cx, cy, pRadiusPix, {
        fill: '#15243B',
        stroke: Colors.cyan,
        lineWidth: 3,
        glowColor: Colors.cyan,
        glowBlur: 14
      });

      Renderer.drawText(ctx, this.selectedBody, cx, cy - 10, {
        fill: Colors.text,
        font: 'bold 12px "Segoe UI"',
        align: 'center'
      });

      // Rocket Probe Position
      const normAlt = (this.simRadius - this.planetRadius) / this.planetRadius;
      const rocketY = (cy - pRadiusPix) - normAlt * (this.simRect.height * 0.45);

      if (rocketY >= this.simRect.y + 10) {
        Renderer.drawCircle(ctx, cx, rocketY, 7, {
          fill: Colors.yellow,
          stroke: '#FFFFFF',
          lineWidth: 2,
          glowColor: Colors.yellow,
          glowBlur: 10
        });

        if (this.controlBar.showVectors && Math.abs(this.simSpeed) > 10) {
          VectorRenderer.drawVector(ctx, cx, rocketY, 0, -this.simSpeed * 0.005, 1.0, {
            color: this.simSpeed > 0 ? Colors.green : '#EF4444',
            label: `v = ${this.simSpeed.toFixed(0)} m/s`
          });
        }
      }
    }

    this.modal.render(ctx, width, height);
  }
}
