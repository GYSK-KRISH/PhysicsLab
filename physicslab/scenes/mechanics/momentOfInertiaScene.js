// Moment of Inertia Laboratory Scene for PhysicsLab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Button, Slider } from '../../engine/ui.js';
import { MomentOfInertiaCalculator } from '../../physics/mechanics/rotation.js';
import { MechanicsControlBar, MechanicsDataPanel, MechanicsModalOverlay } from '../../engine/mechanicsUI.js';

export class MomentOfInertiaScene {
  constructor() {
    this.mass = 4.0; // kg
    this.dimension = 1.5; // m (Radius R or Length L)
    this.selectedBody = 'DISC'; // 'POINT_MASS' | 'RING' | 'DISC' | 'SOLID_SPHERE' | 'HOLLOW_SPHERE' | 'ROD'

    this.rotAngle = 0;
    this.time = 0;

    this.controlBar = new MechanicsControlBar({
      onPlay: () => {},
      onPause: () => {},
      onReset: () => { this.rotAngle = 0; },
      onOpenFormula: () => this.modal.openFormula('MOMENT OF INERTIA FORMULAS', [
        { name: 'Thin Ring / Hoop', formula: 'I = M·R²', desc: 'All mass concentrated at outer radius R' },
        { name: 'Solid Disc / Cylinder', formula: 'I = ½·M·R²', desc: 'Uniform continuous circular mass distribution' },
        { name: 'Solid Sphere', formula: 'I = ⅖·M·R² (0.4 M·R²)', desc: 'Mass distributed throughout spherical volume' },
        { name: 'Hollow Spherical Shell', formula: 'I = ⅔·M·R² (0.67 M·R²)', desc: 'Thin shell surface distribution' },
        { name: 'Thin Rod (Center Axis)', formula: 'I = ¹/₁₂·M·L²', desc: 'Axis perpendicular to length through midpoint' }
      ]),
      onOpenConcept: () => this.modal.openConcept('MOMENT OF INERTIA', {
        what: 'Moment of inertia I is the quantitative measure of rotational inertia: a body\'s resistance to angular acceleration about an axis.',
        how: 'Mass further from the rotational axis contributes quadratically to inertia according to I = ∫ r² dm.',
        keyIdea: 'Objects with mass concentrated far from the axis (like rings) have significantly higher inertia than centralized masses (like spheres).'
      }),
      onOpenProblem: () => this.modal.openProblem('TORQUE_LEVER'),
      onBack: () => {
        import('./mechanicsMenuScene.js').then(m => this.sceneManager.changeScene(new m.MechanicsMenuScene()));
      }
    });

    this.dataPanel = new MechanicsDataPanel({ title: 'INERTIA SPECIFICATION' });
    this.modal = new MechanicsModalOverlay();
    this.bodyButtons = [];
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

    // Body Selection Buttons
    this.bodyButtons = [];
    const bodies = [
      { id: 'RING', label: 'THIN RING (MR²)' },
      { id: 'DISC', label: 'SOLID DISC (½MR²)' },
      { id: 'SOLID_SPHERE', label: 'SOLID SPHERE (⅖MR²)' },
      { id: 'HOLLOW_SPHERE', label: 'HOLLOW SPHERE (⅔MR²)' },
      { id: 'ROD', label: 'THIN ROD (¹/₁₂ML²)' }
    ];

    let bY = contentY + 20;
    for (const b of bodies) {
      const isSel = this.selectedBody === b.id;
      this.bodyButtons.push(new Button({
        x: sidebarX + 20,
        y: bY,
        width: sidebarW - 40,
        height: 32,
        text: b.label,
        accentColor: isSel ? Colors.cyan : Colors.panelBorder,
        callback: () => {
          this.selectedBody = b.id;
          this.rebuildUI();
        }
      }));
      bY += 38;
    }

    this.sliders = [];
    let sY = bY + 10;
    const sW = sidebarW - 40;

    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: 0.5,
      max: 15,
      value: this.mass,
      step: 0.5,
      label: 'BODY MASS (M)',
      unit: ' kg',
      accentColor: Colors.yellow,
      callback: (val) => { this.mass = val; }
    }));

    sY += 55;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: 0.2,
      max: 3.0,
      value: this.dimension,
      step: 0.1,
      label: this.selectedBody === 'ROD' ? 'LENGTH (L)' : 'RADIUS (R)',
      unit: ' m',
      accentColor: Colors.purple,
      callback: (val) => { this.dimension = val; }
    }));

    this.sidebarRect = { x: sidebarX, y: contentY, w: sidebarW, h: contentH };
    this.dataPanel.setRect(sidebarX, sY + 55, sidebarW, contentH - (sY + 55 - contentY));

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
    this.time += dt;
    this.rotAngle += dt * 2.0;

    if (this.modal.isOpen) {
      this.modal.update(dt, this.inputManager);
      return;
    }

    this.controlBar.update(dt, this.inputManager);
    for (const b of this.bodyButtons) b.update(dt, this.inputManager);
    for (const s of this.sliders) s.update(dt, this.inputManager);

    let res;
    if (this.selectedBody === 'RING') res = MomentOfInertiaCalculator.ring(this.mass, this.dimension);
    else if (this.selectedBody === 'DISC') res = MomentOfInertiaCalculator.disc(this.mass, this.dimension);
    else if (this.selectedBody === 'SOLID_SPHERE') res = MomentOfInertiaCalculator.solidSphere(this.mass, this.dimension);
    else if (this.selectedBody === 'HOLLOW_SPHERE') res = MomentOfInertiaCalculator.hollowSphere(this.mass, this.dimension);
    else res = MomentOfInertiaCalculator.rodCenter(this.mass, this.dimension);

    this.dataPanel.setItems([
      { label: 'Selected Body', value: res.name, unit: '', color: Colors.cyan },
      { label: 'Formula', value: res.formula, unit: '', color: Colors.yellow },
      { label: 'Mass (M)', value: this.mass.toFixed(1), unit: 'kg', color: Colors.text },
      { label: 'Radius / Length', value: this.dimension.toFixed(2), unit: 'm', color: Colors.purple },
      { label: 'Inertia Constant c', value: res.c.toFixed(3), unit: '', color: Colors.textMuted },
      { label: 'Moment of Inertia (I)', value: res.I.toFixed(3), unit: 'kg·m²', color: Colors.green }
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
      for (const b of this.bodyButtons) b.render(ctx);
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
      const rPix = Math.min(130, this.dimension * 60);

      ctx.save();
      ctx.translate(cx, cy);

      // Draw Rotating 3D representation
      if (this.selectedBody === 'RING') {
        ctx.rotate(this.rotAngle);
        Renderer.drawCircle(ctx, 0, 0, rPix, {
          fill: 'transparent',
          stroke: Colors.cyan,
          lineWidth: 16,
          glowColor: Colors.cyan,
          glowBlur: 14
        });
      } else if (this.selectedBody === 'DISC') {
        ctx.rotate(this.rotAngle);
        Renderer.drawCircle(ctx, 0, 0, rPix, {
          fill: '#152136',
          stroke: Colors.cyan,
          lineWidth: 4,
          glowColor: Colors.cyan,
          glowBlur: 10
        });
        for (let i = 0; i < 4; i++) {
          const a = (i * Math.PI) / 2;
          Renderer.drawLine(ctx, 0, 0, rPix * Math.cos(a), rPix * Math.sin(a), { stroke: 'rgba(94,231,255,0.4)', lineWidth: 2 });
        }
      } else if (this.selectedBody === 'SOLID_SPHERE') {
        Renderer.drawCircle(ctx, 0, 0, rPix, {
          fill: '#13283E',
          stroke: Colors.yellow,
          lineWidth: 3,
          glowColor: Colors.yellow,
          glowBlur: 14
        });
        // 3D latitude lines
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, rPix, rPix * Math.abs(Math.sin(this.rotAngle)), 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (this.selectedBody === 'HOLLOW_SPHERE') {
        Renderer.drawCircle(ctx, 0, 0, rPix, {
          fill: 'transparent',
          stroke: Colors.purple,
          lineWidth: 6,
          glowColor: Colors.purple,
          glowBlur: 12
        });
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, rPix, rPix * Math.abs(Math.sin(this.rotAngle)), 0, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // Thin Rod
        ctx.rotate(this.rotAngle);
        Renderer.drawRoundedRect(ctx, -rPix, -8, rPix * 2, 16, 4, {
          fill: Colors.green,
          glowColor: Colors.green,
          glowBlur: 10
        });
      }

      // Central Axis indicator
      Renderer.drawCircle(ctx, 0, 0, 8, { fill: '#FFFFFF', stroke: Colors.panelBorder, lineWidth: 2 });
      ctx.restore();
    }

    this.modal.render(ctx, width, height);
  }
}
