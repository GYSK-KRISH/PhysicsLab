// Universal Gravitation Laboratory Scene for PhysicsLab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Slider } from '../../engine/ui.js';
import { GravitationPhysics, GRAVITATIONAL_CONSTANT } from '../../physics/mechanics/gravitation.js';
import { VectorRenderer } from '../../engine/vectorRenderer.js';
import { MechanicsControlBar, MechanicsDataPanel, MechanicsModalOverlay } from '../../engine/mechanicsUI.js';

export class GravitationScene {
  constructor() {
    this.m1 = 5.0e11; // kg
    this.m2 = 2.0e11; // kg
    this.distance = 50.0; // m

    this.controlBar = new MechanicsControlBar({
      onPlay: () => {},
      onPause: () => {},
      onReset: () => {
        this.m1 = 5.0e11;
        this.m2 = 2.0e11;
        this.distance = 50.0;
      },
      onOpenFormula: () => this.modal.openFormula('UNIVERSAL GRAVITATION', [
        { name: 'Newton\'s Gravitational Law', formula: 'F = (G·m₁·m₂) / r²', desc: 'Attractive mutual gravitational force between two point masses' },
        { name: 'Gravitational Constant', formula: 'G = 6.6743 × 10⁻¹¹ N·m²/kg²', desc: 'Universal fundamental physical constant' },
        { name: 'Gravitational Potential Energy', formula: 'U = -(G·m₁·m₂) / r', desc: 'Negative bound state gravitational potential energy' }
      ]),
      onOpenConcept: () => this.modal.openConcept('UNIVERSAL GRAVITATION', {
        what: 'Every mass in the universe attracts every other mass with a force proportional to their mass product and inversely proportional to distance squared.',
        how: 'The gravitational force acts strictly along the line joining the centers of mass and forms an action-reaction pair (Newton\'s Third Law).',
        keyIdea: 'Doubling the distance reduces gravitational attraction to one-fourth (1/r² inverse-square law).'
      }),
      onOpenProblem: () => this.modal.openProblem('ESCAPE_VELOCITY'),
      onBack: () => {
        import('./mechanicsMenuScene.js').then(m => this.sceneManager.changeScene(new m.MechanicsMenuScene()));
      }
    });

    this.dataPanel = new MechanicsDataPanel({ title: 'GRAVITATIONAL METRICS' });
    this.modal = new MechanicsModalOverlay();
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
      value: this.m1 / 1e11,
      step: 0.5,
      label: 'MASS 1 (×10¹¹ kg)',
      unit: '',
      accentColor: Colors.cyan,
      callback: (val) => { this.m1 = val * 1e11; }
    }));

    sY += 55;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: 1,
      max: 10,
      value: this.m2 / 1e11,
      step: 0.5,
      label: 'MASS 2 (×10¹¹ kg)',
      unit: '',
      accentColor: Colors.purple,
      callback: (val) => { this.m2 = val * 1e11; }
    }));

    sY += 55;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: 15,
      max: 120,
      value: this.distance,
      step: 1,
      label: 'DISTANCE (r)',
      unit: ' m',
      accentColor: Colors.yellow,
      callback: (val) => { this.distance = val; }
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
    if (this.modal.isOpen) {
      this.modal.update(dt, this.inputManager);
      return;
    }

    this.controlBar.update(dt, this.inputManager);
    for (const s of this.sliders) s.update(dt, this.inputManager);

    const calc = GravitationPhysics.calculateForce(this.m1, this.m2, this.distance, GRAVITATIONAL_CONSTANT);

    this.dataPanel.setItems([
      { label: 'Mass 1 (m1)', value: (this.m1 / 1e11).toFixed(1), unit: '×10¹¹ kg', color: Colors.cyan },
      { label: 'Mass 2 (m2)', value: (this.m2 / 1e11).toFixed(1), unit: '×10¹¹ kg', color: Colors.purple },
      { label: 'Separation (r)', value: this.distance.toFixed(1), unit: 'm', color: Colors.yellow },
      { label: 'Gravitational Force', value: calc.force.toFixed(2), unit: 'N', color: '#EF4444' },
      { label: 'Field at m2', value: calc.fieldAt2.toFixed(3), unit: 'm/s²', color: Colors.green },
      { label: 'Potential Energy (U)', value: calc.potentialEnergy.toFixed(1), unit: 'J', color: Colors.textMuted }
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

      const cx = this.simRect.x + this.simRect.w / 2;
      const cy = this.simRect.y + this.simRect.h / 2;
      const scale = 3.5;
      const rPix = this.distance * scale;

      const m1X = cx - rPix / 2;
      const m2X = cx + rPix / 2;

      // Distance Ruler
      VectorRenderer.drawRuler(ctx, m1X, cy + 45, m2X, cy + 45, this.distance, 'm', { color: Colors.yellow });

      // Mass 1 (Cyan)
      const r1 = Math.max(16, (this.m1 / 1e11) * 3 + 12);
      Renderer.drawCircle(ctx, m1X, cy, r1, {
        fill: '#152238',
        stroke: Colors.cyan,
        lineWidth: 3,
        glowColor: Colors.cyan,
        glowBlur: 12
      });
      Renderer.drawText(ctx, 'm1', m1X, cy, { fill: Colors.text, font: 'bold 12px "Segoe UI"', align: 'center', baseline: 'middle' });

      // Mass 2 (Purple)
      const r2 = Math.max(16, (this.m2 / 1e11) * 3 + 12);
      Renderer.drawCircle(ctx, m2X, cy, r2, {
        fill: '#241738',
        stroke: Colors.purple,
        lineWidth: 3,
        glowColor: Colors.purple,
        glowBlur: 12
      });
      Renderer.drawText(ctx, 'm2', m2X, cy, { fill: Colors.text, font: 'bold 12px "Segoe UI"', align: 'center', baseline: 'middle' });

      // Mutual Attraction Force Arrows
      if (this.controlBar.showVectors) {
        // Force on 1 toward 2 (Right)
        VectorRenderer.drawVector(ctx, m1X, cy, 65, 0, 1.0, {
          color: '#EF4444',
          label: 'F12 (attract)',
          glow: true
        });

        // Force on 2 toward 1 (Left)
        VectorRenderer.drawVector(ctx, m2X, cy, -65, 0, 1.0, {
          color: '#EF4444',
          label: 'F21 (attract)',
          glow: true
        });
      }
    }

    this.modal.render(ctx, width, height);
  }
}
