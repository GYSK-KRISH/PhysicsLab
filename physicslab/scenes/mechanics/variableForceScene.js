// Variable Force & Work Integral Laboratory Scene for PhysicsLab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Button } from '../../engine/ui.js';
import { WorkEnergyPhysics } from '../../physics/mechanics/workEnergy.js';
import { GraphRenderer } from '../../engine/graphRenderer.js';
import { MechanicsControlBar, MechanicsDataPanel, MechanicsModalOverlay } from '../../engine/mechanicsUI.js';

export class VariableForceScene {
  constructor() {
    // Control points for F(x) graph: [{x, y}] where y is Force in N
    this.controlPoints = [
      { x: 0, y: 10 },
      { x: 2, y: 25 },
      { x: 5, y: 15 },
      { x: 8, y: -10 },
      { x: 10, y: -5 }
    ];

    this.selectedPointIndex = null;
    this.presetButtons = [];

    this.controlBar = new MechanicsControlBar({
      onPlay: () => {},
      onPause: () => {},
      onReset: () => this.applyPreset('LINEAR_SPRING'),
      onOpenFormula: () => this.modal.openFormula('VARIABLE FORCE INTEGRAL', [
        { name: 'Definite Work Integral', formula: 'W = ∫_{x₁}^{x₂} F(x) dx', desc: 'Work done by position-dependent variable force' },
        { name: 'Numerical Trapezoidal Area', formula: 'W ≈ Σ ½·(F_i + F_{i+1})·Δx_i', desc: 'Real numerical quadrature of area under curve' },
        { name: 'Hooke\'s Spring Work', formula: 'W = ½·k·x²', desc: 'Quadratic potential work stored in an ideal spring' }
      ]),
      onOpenConcept: () => this.modal.openConcept('VARIABLE FORCE WORK', {
        what: 'When applied force changes with position, work cannot be found with simple multiplication W = F·d.',
        how: 'Instead, we integrate F(x) dx across displacement. On the graph, positive area above the axis adds work; negative area below subtracts work.',
        keyIdea: 'The graphical area under the F-x curve strictly equals the physical work done on the particle.'
      }),
      onOpenProblem: () => this.modal.openProblem('WORK_DONE'),
      onBack: () => {
        import('./mechanicsMenuScene.js').then(m => this.sceneManager.changeScene(new m.MechanicsMenuScene()));
      }
    });

    this.dataPanel = new MechanicsDataPanel({ title: 'INTEGRAL VALUES' });
    this.modal = new MechanicsModalOverlay();
    this.graph = new GraphRenderer({
      title: 'Interactive F(x) vs x Curve (Drag Points)',
      xLabel: 'Position x',
      xUnit: 'm',
      yLabel: 'Force F(x)',
      yUnit: 'N',
      minX: 0,
      maxX: 10,
      minY: -20,
      maxY: 35,
      autoScale: false
    });

    this.lastWidth = 0;
    this.lastHeight = 0;
  }

  init() {
    this.rebuildUI();
  }

  applyPreset(preset) {
    if (preset === 'LINEAR_SPRING') {
      this.controlPoints = [
        { x: 0, y: 0 },
        { x: 2.5, y: 10 },
        { x: 5, y: 20 },
        { x: 7.5, y: 30 },
        { x: 10, y: 40 }
      ];
    } else if (preset === 'SINE_WAVE') {
      this.controlPoints = [
        { x: 0, y: 0 },
        { x: 2.5, y: 20 },
        { x: 5, y: 0 },
        { x: 7.5, y: -20 },
        { x: 10, y: 0 }
      ];
    } else if (preset === 'STEP_FUNCTION') {
      this.controlPoints = [
        { x: 0, y: 20 },
        { x: 4, y: 20 },
        { x: 4.01, y: -15 },
        { x: 10, y: -15 }
      ];
    }
    this.rebuildUI();
  }

  rebuildUI() {
    const { width, height } = this.canvasEngine.getBounds();
    this.controlBar.setBounds(20, 12, width - 40);

    const sidebarW = Math.max(260, Math.min(320, width * 0.28));
    const sidebarX = width - sidebarW - 20;
    const contentY = 64;
    const contentH = height - contentY - 20;

    // Presets
    this.presetButtons = [];
    const presets = [
      { id: 'LINEAR_SPRING', label: 'SPRING (F=kx)' },
      { id: 'SINE_WAVE', label: 'SINE WAVE' },
      { id: 'STEP_FUNCTION', label: 'STEP FUNCTION' }
    ];

    let pY = contentY + 20;
    for (const p of presets) {
      this.presetButtons.push(new Button({
        x: sidebarX + 20,
        y: pY,
        width: sidebarW - 40,
        height: 34,
        text: p.label,
        accentColor: Colors.cyan,
        callback: () => this.applyPreset(p.id)
      }));
      pY += 44;
    }

    this.sidebarRect = { x: sidebarX, y: contentY, w: sidebarW, h: contentH };
    this.dataPanel.setRect(sidebarX, contentY + 160, sidebarW, contentH - 160);

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
      return;
    }

    // Interactive Dragging of control points on graph
    const pointer = inputManager.pointer;
    if (pointer.justPressed) {
      // Find closest control point within graph coordinates
      const plotX = this.graph.x + 48;
      const plotY = this.graph.y + 28;
      const plotW = this.graph.width - 64;
      const plotH = this.graph.height - 56;

      for (let i = 0; i < this.controlPoints.length; i++) {
        const cp = this.controlPoints[i];
        const cx = plotX + (cp.x / 10) * plotW;
        const cy = plotY + plotH - ((cp.y - this.graph.minY) / (this.graph.maxY - this.graph.minY)) * plotH;

        const dist = Math.hypot(pointer.x - cx, pointer.y - cy);
        if (dist < 18) {
          this.selectedPointIndex = i;
          break;
        }
      }
    }

    if (this.selectedPointIndex !== null) {
      if (!pointer.isDown) {
        this.selectedPointIndex = null;
      } else {
        const plotY = this.graph.y + 28;
        const plotH = this.graph.height - 56;
        const normY = (plotY + plotH - pointer.y) / plotH;
        const newY = this.graph.minY + normY * (this.graph.maxY - this.graph.minY);
        this.controlPoints[this.selectedPointIndex].y = Math.max(-20, Math.min(35, newY));
      }
    }
  }

  update(dt) {
    if (this.modal.isOpen) {
      this.modal.update(dt, this.inputManager);
      return;
    }

    this.controlBar.update(dt, this.inputManager);
    for (const b of this.presetButtons) b.update(dt, this.inputManager);

    // Calculate Real Trapezoidal Numerical Integral W = ∫ F dx
    const integral = WorkEnergyPhysics.integrateVariableWork(this.controlPoints);

    this.dataPanel.setItems([
      { label: 'Integration Range', value: `0.0 to 10.0`, unit: 'm', color: Colors.text },
      { label: 'Positive Work (+)', value: integral.positive.toFixed(2), unit: 'J', color: Colors.green },
      { label: 'Negative Work (-)', value: integral.negative.toFixed(2), unit: 'J', color: '#EF4444' },
      { label: 'Net Work Done (W_net)', value: integral.net.toFixed(2), unit: 'J', color: integral.net >= 0 ? Colors.cyan : '#EF4444' }
    ]);

    // Interpolate control points into high-resolution curve for graphing and shaded area
    const curvePoints = [];
    const steps = 80;
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * 10;
      let y = 0;
      for (let j = 0; j < this.controlPoints.length - 1; j++) {
        const p1 = this.controlPoints[j];
        const p2 = this.controlPoints[j + 1];
        if (x >= p1.x && x <= p2.x) {
          const t = (x - p1.x) / (p2.x - p1.x || 1);
          y = p1.y + t * (p2.y - p1.y);
          break;
        }
      }
      curvePoints.push({ x, y });
    }

    this.graph.clearDatasets();
    this.graph.addDataset({
      label: 'Force F(x)',
      color: Colors.cyan,
      points: curvePoints,
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
      Renderer.drawText(ctx, 'PRESET FORCE FUNCTIONS', this.sidebarRect.x + 16, this.sidebarRect.y + 16, {
        fill: Colors.textMuted,
        font: 'bold 11px "Segoe UI"'
      });
      for (const b of this.presetButtons) b.render(ctx);
      this.dataPanel.render(ctx);
    }

    this.graph.render(ctx);

    // Draw Interactive Drag Handles on Graph
    const plotX = this.graph.x + 48;
    const plotY = this.graph.y + 28;
    const plotW = this.graph.width - 64;
    const plotH = this.graph.height - 56;

    for (let i = 0; i < this.controlPoints.length; i++) {
      const cp = this.controlPoints[i];
      const cx = plotX + (cp.x / 10) * plotW;
      const cy = plotY + plotH - ((cp.y - this.graph.minY) / (this.graph.maxY - this.graph.minY)) * plotH;

      const isSel = this.selectedPointIndex === i;
      Renderer.drawCircle(ctx, cx, cy, isSel ? 8 : 6, {
        fill: isSel ? '#FFFFFF' : Colors.yellow,
        stroke: Colors.cyan,
        lineWidth: 2,
        glowColor: Colors.yellow,
        glowBlur: isSel ? 12 : 6
      });

      Renderer.drawText(ctx, `${cp.y.toFixed(0)}N`, cx, cy - 14, {
        fill: Colors.yellow,
        font: 'bold 10px "Segoe UI"',
        align: 'center'
      });
    }

    this.modal.render(ctx, width, height);
  }
}
