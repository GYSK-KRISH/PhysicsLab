// Geostationary Orbit Educational Laboratory Scene for PhysicsLab
import { Colors, Renderer } from '../../engine/renderer.js';
import { GravitationPhysics } from '../../physics/mechanics/gravitation.js';
import { VectorRenderer } from '../../engine/vectorRenderer.js';
import { MechanicsControlBar, MechanicsDataPanel, MechanicsModalOverlay } from '../../engine/mechanicsUI.js';

export class GeostationaryOrbitScene {
  constructor() {
    this.orbitData = GravitationPhysics.calculateGeostationaryOrbit();
    this.rotAngle = 0;
    this.time = 0;
    this.isRunning = true;

    this.controlBar = new MechanicsControlBar({
      onPlay: () => { this.isRunning = true; },
      onPause: () => { this.isRunning = false; },
      onReset: () => { this.rotAngle = 0; },
      onOpenFormula: () => this.modal.openFormula('GEOSTATIONARY ORBIT', [
        { name: 'Geostationary Radius Formula', formula: 'r_geo = ( (G·M·T²) / (4π²) )^{⅓}', desc: 'Derived by equating orbital period to sidereal day T = 86,164 s' },
        { name: 'Altitude Above Surface', formula: 'h = r_geo - R_earth ≈ 35,786 km', desc: 'Exact altitude required for zero relative ground motion' },
        { name: 'Orbital Speed', formula: 'v_geo = √( (G·M) / r_geo ) ≈ 3.07 km/s', desc: 'Constant circular equatorial speed matching Earth\'s spin' }
      ]),
      onOpenConcept: () => this.modal.openConcept('GEOSTATIONARY ORBIT', {
        what: 'A geostationary orbit (GEO) is a circular geosynchronous orbit situated directly above Earth\'s equator at an altitude of approximately 35,786 km.',
        how: 'The satellite orbits in the exact same direction (prograde West to East) and with the exact same angular velocity as Earth\'s rotation.',
        keyIdea: 'Because the satellite and ground rotate synchronously, the satellite appears permanently fixed at a stationary position in the sky!'
      }),
      onOpenProblem: () => this.modal.openProblem('ESCAPE_VELOCITY'),
      onBack: () => {
        import('./mechanicsMenuScene.js').then(m => this.sceneManager.changeScene(new m.MechanicsMenuScene()));
      }
    });

    this.dataPanel = new MechanicsDataPanel({ title: 'GEOSTATIONARY PARAMETERS' });
    this.modal = new MechanicsModalOverlay();
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

    this.sidebarRect = { x: sidebarX, y: contentY, w: sidebarW, h: contentH };
    this.dataPanel.setRect(sidebarX, contentY, sidebarW, contentH);

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
    if (this.isRunning) {
      this.time += dt;
      this.rotAngle += dt * 0.6; // Synchronized rotation rate
    }

    if (this.modal.isOpen) {
      this.modal.update(dt, this.inputManager);
      return;
    }

    this.controlBar.update(dt, this.inputManager);

    this.dataPanel.setItems([
      { label: 'Earth Radius (R_E)', value: '6,371', unit: 'km', color: Colors.text },
      { label: 'Orbital Radius (r_geo)', value: (this.orbitData.r_geo / 1e3).toFixed(0), unit: 'km', color: Colors.yellow },
      { label: 'GEO Altitude (h)', value: (this.orbitData.altitude / 1e3).toFixed(0), unit: 'km', color: Colors.green },
      { label: 'Orbital Velocity (v)', value: (this.orbitData.speed / 1e3).toFixed(2), unit: 'km/s', color: Colors.cyan },
      { label: 'Period (T)', value: '23h 56m 04s', unit: '(86,164 s)', color: Colors.purple },
      { label: 'Relative Ground Motion', value: '0.00', unit: 'km/h (STATIONARY)', color: Colors.green }
    ]);
  }

  render(ctx) {
    const { width, height } = this.canvasEngine.getBounds();

    Renderer.drawRect(ctx, 0, 0, width, height, { fill: Colors.background });
    Renderer.drawGrid(ctx, width, height, 40);

    this.controlBar.render(ctx);

    if (this.sidebarRect) {
      this.dataPanel.render(ctx);
    }

    if (this.simRect) {
      Renderer.drawPanel(ctx, this.simRect.x, this.simRect.y, this.simRect.w, this.simRect.h, {
        fill: '#060912',
        stroke: Colors.panelBorder
      });

      const cx = this.simRect.x + this.simRect.w / 2;
      const cy = this.simRect.y + this.simRect.h / 2;

      const earthPixR = 45;
      const geoPixR = 150; // Scaled visual orbit radius

      // Geostationary Orbit Track
      ctx.save();
      ctx.strokeStyle = 'rgba(74, 222, 128, 0.3)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(cx, cy, geoPixR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Earth Body with Rotating Continent Marker
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(this.rotAngle);

      Renderer.drawCircle(ctx, 0, 0, earthPixR, {
        fill: '#15243B',
        stroke: Colors.cyan,
        lineWidth: 3,
        glowColor: Colors.cyan,
        glowBlur: 14
      });

      // Ground Station antenna on Earth surface
      Renderer.drawCircle(ctx, earthPixR - 8, 0, 5, { fill: Colors.green });
      Renderer.drawText(ctx, '📡', earthPixR + 10, 0, { align: 'center', baseline: 'middle' });

      ctx.restore();

      // Geostationary Satellite (Locked synchronously to the same angle)
      const satX = cx + geoPixR * Math.cos(this.rotAngle);
      const satY = cy + geoPixR * Math.sin(this.rotAngle);

      // Line of Sight beam from Ground Station to Satellite
      const groundX = cx + earthPixR * Math.cos(this.rotAngle);
      const groundY = cy + earthPixR * Math.sin(this.rotAngle);

      Renderer.drawLine(ctx, groundX, groundY, satX, satY, {
        stroke: 'rgba(74, 222, 128, 0.4)',
        lineWidth: 1.5,
        lineDash: [3, 3]
      });

      // Satellite Body
      Renderer.drawCircle(ctx, satX, satY, 9, {
        fill: Colors.yellow,
        stroke: '#FFFFFF',
        lineWidth: 2,
        glowColor: Colors.yellow,
        glowBlur: 12
      });

      // Solar panels
      Renderer.drawRect(ctx, satX - 18, satY - 4, 8, 8, { fill: Colors.cyan });
      Renderer.drawRect(ctx, satX + 10, satY - 4, 8, 8, { fill: Colors.cyan });

      Renderer.drawText(ctx, 'GEO SATELLITE (Stationary above ground)', satX, satY - 18, {
        fill: Colors.green,
        font: 'bold 11px "Segoe UI"',
        align: 'center'
      });
    }

    this.modal.render(ctx, width, height);
  }
}
