// Centre of Mass Laboratory Scene for PhysicsLab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Button } from '../../engine/ui.js';
import { CenterOfMassPhysics } from '../../physics/mechanics/centerOfMass.js';
import { VectorRenderer } from '../../engine/vectorRenderer.js';
import { MechanicsControlBar, MechanicsDataPanel, MechanicsModalOverlay } from '../../engine/mechanicsUI.js';

export class CenterOfMassScene {
  constructor() {
    this.physics = new CenterOfMassPhysics();
    this.draggedParticleIndex = null;

    this.controlBar = new MechanicsControlBar({
      onPlay: () => {},
      onPause: () => {},
      onReset: () => {
        this.physics = new CenterOfMassPhysics();
      },
      onOpenFormula: () => this.modal.openFormula('CENTRE OF MASS', [
        { name: 'Center of Mass X-Coordinate', formula: 'x_cm = (Σ m_i · x_i) / (Σ m_i)', desc: 'Mass-weighted average horizontal coordinate' },
        { name: 'Center of Mass Y-Coordinate', formula: 'y_cm = (Σ m_i · y_i) / (Σ m_i)', desc: 'Mass-weighted average vertical coordinate' },
        { name: 'Velocity of COM', formula: 'v_cm = (Σ m_i · v_i) / M_total = P_total / M_total', desc: 'System velocity vector from total momentum' }
      ]),
      onOpenConcept: () => this.modal.openConcept('CENTRE OF MASS', {
        what: 'The Centre of Mass (COM) is the unique point at which the entire distributed mass of a system may be considered concentrated.',
        how: 'Moving heavier masses shifts the COM closer to them proportionally. External forces accelerate the COM according to F_net = M·a_cm.',
        keyIdea: 'In the absence of external forces, the centre of mass moves at constant velocity regardless of violent internal collisions or explosions.'
      }),
      onOpenProblem: () => this.modal.openProblem('MOMENTUM_ELASTIC_COLLISION'),
      onBack: () => {
        import('./mechanicsMenuScene.js').then(m => this.sceneManager.changeScene(new m.MechanicsMenuScene()));
      }
    });

    this.dataPanel = new MechanicsDataPanel({ title: 'CENTRE OF MASS' });
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
      text: '+ ADD MASS (2.0 kg)',
      accentColor: Colors.green,
      callback: () => {
        if (this.physics.particles.length < 8) {
          const colors = [Colors.cyan, Colors.purple, Colors.yellow, Colors.green, '#EF4444', '#EC4899'];
          const col = colors[this.physics.particles.length % colors.length];
          const rx = (Math.random() - 0.5) * 80;
          const ry = (Math.random() - 0.5) * 60;
          this.physics.addParticle(2.0, rx, ry, col);
        }
      }
    }));

    this.actionButtons.push(new Button({
      x: sidebarX + 20,
      y: contentY + 68,
      width: sidebarW - 40,
      height: 38,
      text: '- REMOVE LAST MASS',
      accentColor: '#EF4444',
      callback: () => {
        this.physics.removeParticle(this.physics.particles.length - 1);
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

    // Dragging particles
    const pointer = inputManager.pointer;
    const centerX = this.simRect.x + this.simRect.w / 2;
    const centerY = this.simRect.y + this.simRect.h / 2;
    const scale = 3.0;

    if (pointer.justPressed) {
      for (let i = 0; i < this.physics.particles.length; i++) {
        const p = this.physics.particles[i];
        const px = centerX + p.pos.x * scale;
        const py = centerY - p.pos.y * scale;
        const radius = Math.max(16, p.mass * 6);

        if (Math.hypot(pointer.x - px, pointer.y - py) <= radius) {
          this.draggedParticleIndex = i;
          break;
        }
      }
    }

    if (this.draggedParticleIndex !== null) {
      if (!pointer.isDown) {
        this.draggedParticleIndex = null;
      } else {
        const newX = (pointer.x - centerX) / scale;
        const newY = -(pointer.y - centerY) / scale;
        this.physics.setParticlePos(this.draggedParticleIndex, newX, newY);
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

    this.dataPanel.setItems([
      { label: 'Total Particle Count', value: this.physics.particles.length, unit: '', color: Colors.text },
      { label: 'Total Mass (M_total)', value: this.physics.totalMass.toFixed(1), unit: 'kg', color: Colors.cyan },
      { label: 'COM X-Position', value: this.physics.comPos.x.toFixed(2), unit: 'm', color: Colors.yellow },
      { label: 'COM Y-Position', value: this.physics.comPos.y.toFixed(2), unit: 'm', color: Colors.yellow },
      { label: 'Distance from Origin', value: this.physics.comPos.magnitude().toFixed(2), unit: 'm', color: Colors.green }
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
        fill: '#090E1A',
        stroke: Colors.panelBorder
      });

      const centerX = this.simRect.x + this.simRect.w / 2;
      const centerY = this.simRect.y + this.simRect.h / 2;
      const scale = 3.0;

      // Coordinate Axes through origin
      Renderer.drawLine(ctx, this.simRect.x + 20, centerY, this.simRect.x + this.simRect.w - 20, centerY, {
        stroke: 'rgba(255, 255, 255, 0.1)',
        lineWidth: 1.5
      });
      Renderer.drawLine(ctx, centerX, this.simRect.y + 20, centerX, this.simRect.y + this.simRect.h - 20, {
        stroke: 'rgba(255, 255, 255, 0.1)',
        lineWidth: 1.5
      });

      // Connecting lines between masses to COM
      const comPixX = centerX + this.physics.comPos.x * scale;
      const comPixY = centerY - this.physics.comPos.y * scale;

      for (const p of this.physics.particles) {
        const px = centerX + p.pos.x * scale;
        const py = centerY - p.pos.y * scale;

        Renderer.drawLine(ctx, px, py, comPixX, comPixY, {
          stroke: 'rgba(250, 204, 21, 0.15)',
          lineWidth: 1,
          lineDash: [3, 3]
        });
      }

      // Draw Individual Particles
      for (let i = 0; i < this.physics.particles.length; i++) {
        const p = this.physics.particles[i];
        const px = centerX + p.pos.x * scale;
        const py = centerY - p.pos.y * scale;
        const radius = Math.max(14, p.mass * 5);
        const isDragged = this.draggedParticleIndex === i;

        Renderer.drawCircle(ctx, px, py, radius, {
          fill: '#151F30',
          stroke: p.color,
          lineWidth: isDragged ? 3.5 : 2,
          glowColor: p.color,
          glowBlur: isDragged ? 14 : 8
        });

        Renderer.drawText(ctx, `${p.mass}kg`, px, py, {
          fill: Colors.text,
          font: 'bold 11px "Segoe UI"',
          align: 'center',
          baseline: 'middle'
        });
      }

      // Draw Centre of Mass Marker (Crosshair & Diamond in Yellow)
      Renderer.drawCircle(ctx, comPixX, comPixY, 9, {
        fill: Colors.yellow,
        stroke: '#FFFFFF',
        lineWidth: 2,
        glowColor: Colors.yellow,
        glowBlur: 14
      });

      // Crosshair
      Renderer.drawLine(ctx, comPixX - 16, comPixY, comPixX + 16, comPixY, { stroke: '#FFFFFF', lineWidth: 2 });
      Renderer.drawLine(ctx, comPixX, comPixY - 16, comPixX, comPixY + 16, { stroke: '#FFFFFF', lineWidth: 2 });

      Renderer.drawText(ctx, '★ CENTRE OF MASS (COM)', comPixX, comPixY - 24, {
        fill: Colors.yellow,
        font: '900 12px "Segoe UI"',
        align: 'center',
        glowColor: Colors.yellow,
        glowBlur: 8
      });
    }

    this.modal.render(ctx, width, height);
  }
}
