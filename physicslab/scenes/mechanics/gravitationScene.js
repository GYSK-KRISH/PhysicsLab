// Universal Gravitation Laboratory Scene for PhysicsLab
// Pure Canvas Layout & Rendering — ZERO DOM / HTML created

import { Colors, Renderer } from '../../engine/renderer.js';
import { Button, Slider } from '../../engine/ui.js';
import { GravitationPhysics, GRAVITATIONAL_CONSTANT } from '../../physics/mechanics/gravitation.js';
import { VectorRenderer } from '../../engine/vectorRenderer.js';
import { MechanicsControlBar, MechanicsDataPanel, MechanicsModalOverlay } from '../../engine/mechanicsUI.js';
import { LayoutEngine } from '../../engine/layout.js';

export class GravitationScene {
  constructor() {
    this.selectedPreset = 'EARTH_MOON';
    this.m1 = 5.972e24; // kg (Earth)
    this.m2 = 7.342e22; // kg (Moon)
    this.distance = 3.844e8; // m (Earth-Moon distance)
    this.customG = 6.6743e-11;

    this.controlBar = new MechanicsControlBar({
      onPlay: () => {},
      onPause: () => {},
      onReset: () => this.setPreset(this.selectedPreset),
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
    this.presetButtons = [];
    this.sliders = [];
    this.lastWidth = 0;
    this.lastHeight = 0;
  }

  init() {
    this.rebuildUI();
  }

  setPreset(preset) {
    this.selectedPreset = preset;
    if (preset === 'EARTH_MOON') {
      this.m1 = 5.972e24; // Earth
      this.m2 = 7.342e22; // Moon
      this.distance = 3.844e8; // 384,400 km
    } else if (preset === 'EARTH_MARS') {
      this.m1 = 5.972e24; // Earth
      this.m2 = 6.417e23; // Mars
      this.distance = 5.46e10; // Closest approach
    } else if (preset === 'SUN_EARTH') {
      this.m1 = 1.989e30; // Sun
      this.m2 = 5.972e24; // Earth
      this.distance = 1.496e11; // 1 AU
    } else if (preset === 'LAB_MASSES') {
      this.m1 = 5.0e11;
      this.m2 = 2.0e11;
      this.distance = 50.0;
    }
    this.rebuildUI();
  }

  rebuildUI() {
    const { width, height } = this.canvasEngine.getBounds();
    const layout = LayoutEngine.calculateExperimentLayout(width, height);

    this.controlBar.setBounds(layout.toolbarRect.x, layout.toolbarRect.y, layout.toolbarRect.width);

    this.simRect = layout.simRect;
    this.controlRect = layout.controlRect;
    this.dataRect = layout.dataRect;

    // Preset selection buttons
    this.presetButtons = [];
    const presets = [
      { id: 'EARTH_MOON', label: 'EARTH-MOON' },
      { id: 'EARTH_MARS', label: 'EARTH-MARS' },
      { id: 'SUN_EARTH', label: 'SUN-EARTH' },
      { id: 'LAB_MASSES', label: 'LAB SCALED' }
    ];

    const pCount = presets.length;
    const pW = Math.max(50, Math.floor((this.controlRect.width - 24 - (pCount - 1) * 4) / pCount));

    for (let i = 0; i < pCount; i++) {
      const p = presets[i];
      const isSel = this.selectedPreset === p.id;
      this.presetButtons.push(new Button({
        x: this.controlRect.x + 12 + i * (pW + 4),
        y: this.controlRect.y + 12,
        width: pW,
        height: 26,
        text: p.label,
        fontSize: 9,
        active: isSel,
        accentColor: isSel ? Colors.cyan : Colors.panelBorder,
        callback: () => this.setPreset(p.id)
      }));
    }

    // Sliders
    this.sliders = [];
    let sY = this.controlRect.y + 44;
    const sW = this.controlRect.width - 24;
    const sliderH = 38;

    this.sliders.push(new Slider({
      x: this.controlRect.x + 12,
      y: sY,
      width: sW,
      height: sliderH,
      min: 0.2,
      max: 5.0,
      value: 1.0,
      step: 0.1,
      label: 'DISTANCE SCALE FACTOR',
      unit: '×',
      accentColor: Colors.yellow,
      callback: (val) => {
        if (this.selectedPreset === 'EARTH_MOON') this.distance = 3.844e8 * val;
        else if (this.selectedPreset === 'EARTH_MARS') this.distance = 5.46e10 * val;
        else if (this.selectedPreset === 'SUN_EARTH') this.distance = 1.496e11 * val;
        else this.distance = 50.0 * val;
      }
    }));

    sY += sliderH + 6;
    this.sliders.push(new Slider({
      x: this.controlRect.x + 12,
      y: sY,
      width: sW,
      height: sliderH,
      min: 0.1,
      max: 5.0,
      value: 1.0,
      step: 0.1,
      label: 'M1 MASS MULTIPLIER',
      unit: '×',
      accentColor: Colors.cyan,
      callback: (val) => {
        if (this.selectedPreset === 'EARTH_MOON') this.m1 = 5.972e24 * val;
        else if (this.selectedPreset === 'EARTH_MARS') this.m1 = 5.972e24 * val;
        else if (this.selectedPreset === 'SUN_EARTH') this.m1 = 1.989e30 * val;
        else this.m1 = 5.0e11 * val;
      }
    }));

    sY += sliderH + 6;
    this.sliders.push(new Slider({
      x: this.controlRect.x + 12,
      y: sY,
      width: sW,
      height: sliderH,
      min: 0.1,
      max: 5.0,
      value: 1.0,
      step: 0.1,
      label: 'M2 MASS MULTIPLIER',
      unit: '×',
      accentColor: Colors.purple,
      callback: (val) => {
        if (this.selectedPreset === 'EARTH_MOON') this.m2 = 7.342e22 * val;
        else if (this.selectedPreset === 'EARTH_MARS') this.m2 = 6.417e23 * val;
        else if (this.selectedPreset === 'SUN_EARTH') this.m2 = 5.972e24 * val;
        else this.m2 = 2.0e11 * val;
      }
    }));

    this.dataPanel.setRect(this.dataRect.x, this.dataRect.y, this.dataRect.width, this.dataRect.height);
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
    for (const b of this.presetButtons) b.update(dt, this.inputManager);
    for (const s of this.sliders) s.update(dt, this.inputManager);

    const calc = GravitationPhysics.calculateForce(this.m1, this.m2, this.distance, GRAVITATIONAL_CONSTANT);

    this.dataPanel.setItems([
      { label: 'System Preset', value: this.selectedPreset.replace('_', ' '), unit: '', color: Colors.cyan },
      { label: 'Primary Mass (m1)', value: this.m1.toExponential(2), unit: 'kg', color: Colors.cyan },
      { label: 'Secondary Mass (m2)', value: this.m2.toExponential(2), unit: 'kg', color: Colors.purple },
      { label: 'Separation (r)', value: this.distance.toExponential(2), unit: 'm', color: Colors.yellow },
      { label: 'Mutual Force (F)', value: calc.force.toExponential(3), unit: 'N', color: '#EF4444' },
      { label: 'Field at m2 (g2)', value: calc.fieldAt2.toExponential(3), unit: 'm/s²', color: Colors.green },
      { label: 'Potential Energy (U)', value: calc.potentialEnergy.toExponential(3), unit: 'J', color: Colors.textMuted }
    ]);
  }

  render(ctx) {
    const { width, height } = this.canvasEngine.getBounds();

    Renderer.drawRect(ctx, 0, 0, width, height, { fill: Colors.background });
    Renderer.drawGrid(ctx, width, height, 40);

    this.controlBar.render(ctx);

    // Control Panel
    if (this.controlRect) {
      Renderer.drawPanel(ctx, this.controlRect.x, this.controlRect.y, this.controlRect.width, this.controlRect.height, {
        fill: Colors.panel,
        stroke: Colors.panelBorder,
        radius: 8
      });
      for (const b of this.presetButtons) b.render(ctx);
      for (const s of this.sliders) s.render(ctx);
    }

    this.dataPanel.render(ctx);

    if (this.simRect) {
      Renderer.drawPanel(ctx, this.simRect.x, this.simRect.y, this.simRect.width, this.simRect.height, {
        fill: '#080D18',
        stroke: Colors.panelBorder,
        radius: 8
      });

      ctx.save();
      ctx.beginPath();
      ctx.rect(this.simRect.x + 2, this.simRect.y + 2, this.simRect.width - 4, this.simRect.height - 4);
      ctx.clip();

      const cx = this.simRect.x + this.simRect.width / 2;
      const cy = this.simRect.y + this.simRect.height / 2;
      const rPix = Math.min(this.simRect.width * 0.45, 140);

      const m1X = cx - rPix / 2;
      const m2X = cx + rPix / 2;

      // Distance Ruler
      VectorRenderer.drawRuler(ctx, m1X, cy + 50, m2X, cy + 50, this.distance, 'm', { color: Colors.yellow });

      // Mass 1 (Cyan Body)
      const r1 = 24;
      Renderer.drawCircle(ctx, m1X, cy, r1, {
        fill: '#15243B',
        stroke: Colors.cyan,
        lineWidth: 3,
        glowColor: Colors.cyan,
        glowBlur: 14
      });
      Renderer.drawText(ctx, 'm1', m1X, cy, { fill: Colors.text, font: 'bold 12px "Segoe UI"', align: 'center', baseline: 'middle' });

      // Mass 2 (Purple Body)
      const r2 = 18;
      Renderer.drawCircle(ctx, m2X, cy, r2, {
        fill: '#2B1A3D',
        stroke: Colors.purple,
        lineWidth: 3,
        glowColor: Colors.purple,
        glowBlur: 14
      });
      Renderer.drawText(ctx, 'm2', m2X, cy, { fill: Colors.text, font: 'bold 12px "Segoe UI"', align: 'center', baseline: 'middle' });

      // Mutual Attraction Force Arrows
      if (this.controlBar.showVectors) {
        // Force on 1 toward 2 (Right)
        VectorRenderer.drawVector(ctx, m1X + r1 + 2, cy, 60, 0, 1.0, {
          color: '#EF4444',
          label: 'F12',
          glow: true
        });

        // Force on 2 toward 1 (Left)
        VectorRenderer.drawVector(ctx, m2X - r2 - 2, cy, -60, 0, 1.0, {
          color: '#EF4444',
          label: 'F21',
          glow: true
        });
      }

      ctx.restore();
    }

    this.modal.render(ctx, width, height);
  }
}
