// Satellite Orbit & Keplerian Mechanics Laboratory Scene for PhysicsLab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Slider } from '../../engine/ui.js';
import { OrbitSimulator } from '../../physics/mechanics/gravitation.js';
import { VectorRenderer } from '../../engine/vectorRenderer.js';
import { MechanicsControlBar, MechanicsDataPanel, MechanicsModalOverlay } from '../../engine/mechanicsUI.js';

export class SatelliteOrbitScene {
  constructor() {
    this.simulator = new OrbitSimulator();
    this.orbitRadius = 120.0;
    this.initialVy = Math.sqrt((this.simulator.G * this.simulator.planetMass) / this.orbitRadius);

    this.controlBar = new MechanicsControlBar({
      onPlay: () => this.simulator.start(),
      onPause: () => this.simulator.pause(),
      onReset: () => this.reset(),
      onStepForward: () => this.simulator.update(0.05),
      onToggleSlowMo: () => {
        this.isSlowMo = !this.isSlowMo;
        this.controlBar.setSlowMo(this.isSlowMo);
      },
      onOpenFormula: () => this.modal.openFormula('ORBITAL MECHANICS & KEPLER', [
        { name: 'Circular Orbital Speed', formula: 'v_o = √( (G·M) / r )', desc: 'Velocity necessary to sustain steady circular path at radius r' },
        { name: 'Kepler\'s Third Law', formula: 'T² = (4π² / GM) · r³', desc: 'Square of orbital period proportional to cube of radius' },
        { name: 'Vis-Viva Orbital Equation', formula: 'v² = G·M·(2/r - 1/a)', desc: 'General elliptical speed equation where a is semi-major axis' }
      ]),
      onOpenConcept: () => this.modal.openConcept('SATELLITE ORBIT', {
        what: 'A satellite in orbit is in continuous free-fall around the central planet, constantly missing the surface due to high tangential speed.',
        how: 'Gravity acts as the centripetal force holding the satellite in circular or elliptical orbit.',
        keyIdea: 'Increasing launch speed transforms circular orbits into ellipses, parabolas (at escape velocity), or open hyperbolas.'
      }),
      onOpenProblem: () => this.modal.openProblem('ESCAPE_VELOCITY'),
      onBack: () => {
        import('./mechanicsMenuScene.js').then(m => this.sceneManager.changeScene(new m.MechanicsMenuScene()));
      }
    });

    this.dataPanel = new MechanicsDataPanel({ title: 'ORBITAL PARAMETERS' });
    this.modal = new MechanicsModalOverlay();
    this.sliders = [];
    this.isSlowMo = false;
    this.lastWidth = 0;
    this.lastHeight = 0;

    this.reset();
  }

  reset() {
    this.initialVy = Math.sqrt((this.simulator.G * this.simulator.planetMass) / this.orbitRadius);
    this.simulator.setInitialState(this.orbitRadius, this.initialVy);
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
      min: 60,
      max: 200,
      value: this.orbitRadius,
      step: 5,
      label: 'INITIAL RADIUS (r₀)',
      unit: ' km',
      accentColor: Colors.yellow,
      callback: (val) => {
        this.orbitRadius = val;
        this.reset();
      }
    }));

    sY += 55;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: 4,
      max: 18,
      value: this.initialVy,
      step: 0.2,
      label: 'TANGENTIAL SPEED (v₀)',
      unit: ' km/s',
      accentColor: Colors.cyan,
      callback: (val) => {
        this.initialVy = val;
        this.simulator.setInitialState(this.orbitRadius, this.initialVy);
      }
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
    const effectiveDt = (this.isSlowMo ? dt * 0.25 : dt) * 1.5;
    this.simulator.update(effectiveDt);
    this.controlBar.setRunning(this.simulator.isRunning);

    if (this.modal.isOpen) {
      this.modal.update(dt, this.inputManager);
      return;
    }

    this.controlBar.update(dt, this.inputManager);
    for (const s of this.sliders) s.update(dt, this.inputManager);

    const params = this.simulator.getOrbitalParameters();
    this.dataPanel.setItems([
      { label: 'Current Radius (r)', value: params.r.toFixed(1), unit: 'km', color: Colors.yellow },
      { label: 'Current Speed (v)', value: params.v.toFixed(2), unit: 'km/s', color: Colors.cyan },
      { label: 'Kinetic Energy (K)', value: params.ke.toFixed(1), unit: 'MJ', color: Colors.green },
      { label: 'Potential Energy (U)', value: params.pe.toFixed(1), unit: 'MJ', color: Colors.textMuted },
      { label: 'Total Energy (E)', value: params.totalEnergy.toFixed(1), unit: 'MJ', color: params.isBound ? Colors.cyan : '#EF4444' },
      { label: 'Orbit Type', value: params.isBound ? 'BOUND ELLIPSE / CIRCLE' : 'UNBOUND ESCAPE', unit: '', color: params.isBound ? Colors.green : '#EF4444' }
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
        fill: '#060A13',
        stroke: Colors.panelBorder
      });

      const cx = this.simRect.x + this.simRect.w / 2;
      const cy = this.simRect.y + this.simRect.h / 2;

      // Central Planet
      Renderer.drawCircle(ctx, cx, cy, this.simulator.planetRadius, {
        fill: '#15243B',
        stroke: Colors.cyan,
        lineWidth: 3,
        glowColor: Colors.cyan,
        glowBlur: 14
      });
      Renderer.drawText(ctx, 'PLANET', cx, cy, { fill: Colors.text, font: 'bold 11px "Segoe UI"', align: 'center', baseline: 'middle' });

      // Orbit Path Trail
      if (this.simulator.trajectory.length > 1) {
        ctx.save();
        ctx.strokeStyle = 'rgba(94, 231, 255, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i < this.simulator.trajectory.length; i++) {
          const pt = this.simulator.trajectory[i];
          const px = cx + pt.x;
          const py = cy + pt.y;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.restore();
      }

      // Satellite Position
      const satX = cx + this.simulator.satellitePos.x;
      const satY = cy + this.simulator.satellitePos.y;

      Renderer.drawCircle(ctx, satX, satY, 7, {
        fill: Colors.yellow,
        stroke: '#FFFFFF',
        lineWidth: 2,
        glowColor: Colors.yellow,
        glowBlur: 10
      });

      // Vectors (Velocity in Cyan, Gravity in Red towards planet)
      if (this.controlBar.showVectors) {
        // Tangential Velocity
        VectorRenderer.drawVector(ctx, satX, satY, this.simulator.satelliteVel.x * 5.0, this.simulator.satelliteVel.y * 5.0, 1.0, {
          color: Colors.cyan,
          label: 'v',
          glow: true
        });

        // Gravity attraction vector
        const toCenterX = cx - satX;
        const toCenterY = cy - satY;
        const dist = Math.hypot(toCenterX, toCenterY);
        if (dist > 5) {
          VectorRenderer.drawVector(ctx, satX, satY, (toCenterX / dist) * 45, (toCenterY / dist) * 45, 1.0, {
            color: '#EF4444',
            label: 'F_g'
          });
        }
      }
    }

    this.modal.render(ctx, width, height);
  }
}
