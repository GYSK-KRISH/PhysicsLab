// Gravitational Field Grid Laboratory Scene for PhysicsLab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Button } from '../../engine/ui.js';
import { GravitationPhysics } from '../../physics/mechanics/gravitation.js';
import { VectorRenderer } from '../../engine/vectorRenderer.js';
import { Vector2D } from '../../physics/mechanics/vector2d.js';
import { MechanicsControlBar, MechanicsDataPanel, MechanicsModalOverlay } from '../../engine/mechanicsUI.js';

export class GravitationalFieldScene {
  constructor() {
    this.sources = [
      { mass: 800, pos: new Vector2D(-80, 0), color: Colors.cyan },
      { mass: 500, pos: new Vector2D(80, 0), color: Colors.purple }
    ];

    this.draggedIndex = null;

    this.controlBar = new MechanicsControlBar({
      onPlay: () => {},
      onPause: () => {},
      onReset: () => {
        this.sources = [
          { mass: 800, pos: new Vector2D(-80, 0), color: Colors.cyan },
          { mass: 500, pos: new Vector2D(80, 0), color: Colors.purple }
        ];
      },
      onOpenFormula: () => this.modal.openFormula('GRAVITATIONAL FIELD', [
        { name: 'Field Strength Definition', formula: 'g = F / m_test = (G·M) / r²', desc: 'Gravitational acceleration vector produced by point mass M' },
        { name: 'Superposition Principle', formula: 'g_net = Σ g_i = -G·Σ (M_i / r_i²) · r̂_i', desc: 'Vector sum of gravitational field contributions from all masses' }
      ]),
      onOpenConcept: () => this.modal.openConcept('GRAVITATIONAL FIELD', {
        what: 'A gravitational field is the vector force per unit mass exerted at every point in space surrounding mass distributions.',
        how: 'Arrows indicate the direction a test mass would accelerate; vector density and length correspond to field intensity.',
        keyIdea: 'Multiple masses create complex gravitational topologies with neutral points (Lagrange / null points) where vector fields cancel to zero.'
      }),
      onOpenProblem: () => this.modal.openProblem('GRAVITY_FORCE'),
      onBack: () => {
        import('./mechanicsMenuScene.js').then(m => this.sceneManager.changeScene(new m.MechanicsMenuScene()));
      }
    });

    this.dataPanel = new MechanicsDataPanel({ title: 'FIELD PROPERTIES' });
    this.modal = new MechanicsModalOverlay();
    this.actionButtons = [];
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

    this.actionButtons = [];
    this.actionButtons.push(new Button({
      x: sidebarX + 20,
      y: contentY + 20,
      width: sidebarW - 40,
      height: 38,
      text: '+ ADD SOURCE MASS',
      accentColor: Colors.green,
      callback: () => {
        if (this.sources.length < 5) {
          const rx = (Math.random() - 0.5) * 120;
          const ry = (Math.random() - 0.5) * 100;
          this.sources.push({ mass: 600, pos: new Vector2D(rx, ry), color: Colors.yellow });
        }
      }
    }));

    this.actionButtons.push(new Button({
      x: sidebarX + 20,
      y: contentY + 68,
      width: sidebarW - 40,
      height: 38,
      text: '- REMOVE SOURCE',
      accentColor: '#EF4444',
      callback: () => {
        if (this.sources.length > 1) this.sources.pop();
      }
    }));

    this.sidebarRect = { x: sidebarX, y: contentY, w: sidebarW, h: contentH };
    this.dataPanel.setRect(sidebarX, contentY + 130, sidebarW, contentH - 130);

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
      return;
    }

    const pointer = inputManager.pointer;
    const centerX = this.simRect.x + this.simRect.w / 2;
    const centerY = this.simRect.y + this.simRect.h / 2;

    if (pointer.justPressed) {
      for (let i = 0; i < this.sources.length; i++) {
        const s = this.sources[i];
        const sx = centerX + s.pos.x;
        const sy = centerY + s.pos.y;
        if (Math.hypot(pointer.x - sx, pointer.y - sy) <= 22) {
          this.draggedIndex = i;
          break;
        }
      }
    }

    if (this.draggedIndex !== null) {
      if (!pointer.isDown) {
        this.draggedIndex = null;
      } else {
        this.sources[this.draggedIndex].pos.set(pointer.x - centerX, pointer.y - centerY);
      }
    }
  }

  update(dt) {
    if (this.modal.isOpen) {
      this.modal.update(dt, this.inputManager);
      return;
    }

    this.controlBar.update(dt, this.inputManager);
    for (const b of this.actionButtons) b.update(dt, this.inputManager);

    let totalM = 0;
    for (const s of this.sources) totalM += s.mass;

    this.dataPanel.setItems([
      { label: 'Active Masses', value: this.sources.length, unit: 'sources', color: Colors.text },
      { label: 'Total Source Mass', value: totalM.toFixed(0), unit: 'units', color: Colors.cyan },
      { label: 'Superposition Field', value: 'VECTOR SUM', unit: 'active', color: Colors.green },
      { label: 'Grid Field Vectors', value: 'CALCULATED', unit: 'real 1/r²', color: Colors.yellow }
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
      for (const b of this.actionButtons) b.render(ctx);
      this.dataPanel.render(ctx);
    }

    if (this.simRect) {
      Renderer.drawPanel(ctx, this.simRect.x, this.simRect.y, this.simRect.w, this.simRect.h, {
        fill: '#080D18',
        stroke: Colors.panelBorder
      });

      const centerX = this.simRect.x + this.simRect.w / 2;
      const centerY = this.simRect.y + this.simRect.h / 2;

      // Render Field Grid Vectors
      const gridSpacing = 32;
      for (let gx = this.simRect.x + 30; gx <= this.simRect.x + this.simRect.w - 30; gx += gridSpacing) {
        for (let gy = this.simRect.y + 30; gy <= this.simRect.y + this.simRect.h - 30; gy += gridSpacing) {
          const pt = new Vector2D(gx - centerX, gy - centerY);
          const gVec = GravitationPhysics.calculateFieldAt(pt, this.sources, 1.0);
          const gMag = gVec.magnitude();

          if (gMag > 0.005) {
            const arrowLen = Math.min(22, Math.max(4, gMag * 15));
            const angle = gVec.angle();
            const tox = gx + Math.cos(angle) * arrowLen;
            const toy = gy + Math.sin(angle) * arrowLen;

            const alpha = Math.min(0.9, Math.max(0.15, gMag * 0.8));
            ctx.save();
            ctx.strokeStyle = `rgba(94, 231, 255, ${alpha})`;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(gx, gy);
            ctx.lineTo(tox, toy);
            ctx.stroke();

            // Tiny arrowhead
            ctx.fillStyle = `rgba(94, 231, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(tox, toy, 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }
      }

      // Render Source Masses (Draggable)
      for (let i = 0; i < this.sources.length; i++) {
        const s = this.sources[i];
        const sx = centerX + s.pos.x;
        const sy = centerY + s.pos.y;
        const isDragged = this.draggedIndex === i;

        Renderer.drawCircle(ctx, sx, sy, 18, {
          fill: '#152136',
          stroke: s.color,
          lineWidth: isDragged ? 3.5 : 2.5,
          glowColor: s.color,
          glowBlur: isDragged ? 16 : 10
        });

        Renderer.drawText(ctx, `M${i + 1}`, sx, sy, {
          fill: Colors.text,
          font: 'bold 11px "Segoe UI"',
          align: 'center',
          baseline: 'middle'
        });
      }
    }

    this.modal.render(ctx, width, height);
  }
}
