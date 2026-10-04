// Gravitational Potential Laboratory Scene for PhysicsLab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Slider } from '../../engine/ui.js';
import { GravitationPhysics, GRAVITATIONAL_CONSTANT } from '../../physics/mechanics/gravitation.js';
import { GraphRenderer } from '../../engine/graphRenderer.js';
import { MechanicsControlBar, MechanicsDataPanel, MechanicsModalOverlay } from '../../engine/mechanicsUI.js';

export class GravitationalPotentialScene {
  constructor() {
    this.planetMass = 6.0e24; // Earth mass (kg)
    this.planetRadius = 6.37e6; // Earth radius (m)
    this.testRadius = 1.5 * this.planetRadius; // m

    this.controlBar = new MechanicsControlBar({
      onPlay: () => {},
      onPause: () => {},
      onReset: () => {
        this.testRadius = 1.5 * this.planetRadius;
      },
      onOpenFormula: () => this.modal.openFormula('GRAVITATIONAL POTENTIAL', [
        { name: 'Gravitational Potential Formula', formula: 'V(r) = -(G·M) / r', desc: 'Gravitational potential energy per unit mass at distance r' },
        { name: 'Potential Energy Relation', formula: 'U(r) = m·V(r) = -(G·M·m) / r', desc: 'Total bound state potential energy' },
        { name: 'Reference Zero at Infinity', formula: 'V(∞) = 0', desc: 'Potential increases towards zero as distance approaches infinity' }
      ]),
      onOpenConcept: () => this.modal.openConcept('GRAVITATIONAL POTENTIAL', {
        what: 'Gravitational potential V(r) is the work required to move a unit mass from infinity to distance r in a gravitational field.',
        how: 'Because gravity is purely attractive, the potential is always negative, forming a potential well surrounding the mass.',
        keyIdea: 'Objects naturally roll down the potential well towards the center of gravity, converting potential into kinetic energy.'
      }),
      onOpenProblem: () => this.modal.openProblem('GRAVITY_FORCE'),
      onBack: () => {
        import('./mechanicsMenuScene.js').then(m => this.sceneManager.changeScene(new m.MechanicsMenuScene()));
      }
    });

    this.dataPanel = new MechanicsDataPanel({ title: 'POTENTIAL WELL' });
    this.modal = new MechanicsModalOverlay();
    this.graph = new GraphRenderer({
      title: 'Gravitational Potential V(r) vs Distance r',
      xLabel: 'Distance r',
      xUnit: '×10⁶ m',
      yLabel: 'Potential V(r)',
      yUnit: 'MJ/kg',
      minX: 6.0,
      maxX: 40.0,
      minY: -70,
      maxY: 0,
      autoScale: false
    });

    this.sliders = [];
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
      max: 10,
      value: this.planetMass / 1e24,
      step: 0.5,
      label: 'PLANET MASS (×10²⁴ kg)',
      unit: '',
      accentColor: Colors.cyan,
      callback: (val) => { this.planetMass = val * 1e24; }
    }));

    sY += 60;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: 6.37,
      max: 35.0,
      value: this.testRadius / 1e6,
      step: 0.5,
      label: 'PROBE DISTANCE (r)',
      unit: ' ×10⁶ m',
      accentColor: Colors.yellow,
      callback: (val) => { this.testRadius = val * 1e6; }
    }));

    this.sidebarRect = { x: sidebarX, y: contentY, w: sidebarW, h: contentH };
    this.dataPanel.setRect(sidebarX, contentY + 180, sidebarW, contentH - 180);

    const mainW = sidebarX - 40;
    this.simRect = { x: 20, y: contentY, w: mainW, h: contentH };
    this.graph.setRect(20, contentY, mainW, contentH);
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
    if (this.modal.isOpen) {
      this.modal.update(dt, this.inputManager);
      return;
    }

    this.controlBar.update(dt, this.inputManager);
    for (const s of this.sliders) s.update(dt, this.inputManager);

    const calc = GravitationPhysics.calculatePotential(this.planetMass, this.testRadius, GRAVITATIONAL_CONSTANT);
    const surfaceCalc = GravitationPhysics.calculatePotential(this.planetMass, this.planetRadius, GRAVITATIONAL_CONSTANT);

    this.dataPanel.setItems([
      { label: 'Surface Radius R', value: (this.planetRadius / 1e6).toFixed(2), unit: '×10⁶ m', color: Colors.text },
      { label: 'Current Distance r', value: (this.testRadius / 1e6).toFixed(2), unit: '×10⁶ m', color: Colors.yellow },
      { label: 'Surface Potential V(R)', value: (surfaceCalc.potential / 1e6).toFixed(1), unit: 'MJ/kg', color: Colors.purple },
      { label: 'Potential V(r)', value: (calc.potential / 1e6).toFixed(1), unit: 'MJ/kg', color: Colors.cyan },
      { label: 'Potential Well Depth', value: (Math.abs(calc.potential) / 1e6).toFixed(1), unit: 'MJ/kg', color: Colors.green }
    ]);

    // Generate potential curve points V(r) vs r
    const curve = [];
    const steps = 60;
    for (let i = 0; i <= steps; i++) {
      const r_val = 6.0e6 + (i / steps) * (35.0e6 - 6.0e6);
      const v_val = -(GRAVITATIONAL_CONSTANT * this.planetMass) / r_val;
      curve.push({ x: r_val / 1e6, y: v_val / 1e6 });
    }

    this.graph.clearDatasets();
    this.graph.addDataset({
      label: 'V(r) = -GM/r',
      color: Colors.cyan,
      points: curve,
      fillArea: true
    });
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

    this.graph.render(ctx);
    this.modal.render(ctx, width, height);
  }
}
