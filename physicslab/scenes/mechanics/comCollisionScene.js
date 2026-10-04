// Centre-of-Mass Frame vs Lab Frame Collision Scene for PhysicsLab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Slider } from '../../engine/ui.js';
import { Collision1DPhysics } from '../../physics/mechanics/collision.js';
import { VectorRenderer } from '../../engine/vectorRenderer.js';
import { MechanicsControlBar, MechanicsDataPanel, MechanicsModalOverlay } from '../../engine/mechanicsUI.js';

export class COMCollisionScene {
  constructor() {
    this.physics = new Collision1DPhysics({ m1: 3, u1: 6, m2: 2, u2: -4, e: 1.0 });
    this.controlBar = new MechanicsControlBar({
      onPlay: () => this.physics.start(),
      onPause: () => this.physics.pause(),
      onReset: () => this.physics.reset(),
      onStepForward: () => this.physics.update(0.05),
      onToggleSlowMo: () => {
        this.isSlowMo = !this.isSlowMo;
        this.controlBar.setSlowMo(this.isSlowMo);
      },
      onOpenFormula: () => this.modal.openFormula('COM FRAME COLLISION', [
        { name: 'Centre of Mass Velocity', formula: 'v_cm = (m₁·u₁ + m₂·u₂) / (m₁ + m₂)', desc: 'Constant drift velocity of center of mass in lab frame' },
        { name: 'Velocity in COM Frame', formula: 'u_i,com = u_i - v_cm', desc: 'Galilean transformation to center of mass frame' },
        { name: 'COM Frame Total Momentum', formula: 'P_com = m₁·u₁,com + m₂·u₂,com ≡ 0', desc: 'Total linear momentum is identically ZERO in COM frame' },
        { name: 'Elastic Collision in COM Frame', formula: 'v_i,com = -u_i,com', desc: 'Bodies simply rebound with exact reversal of COM velocities' }
      ]),
      onOpenConcept: () => this.modal.openConcept('LAB FRAME vs COM FRAME', {
        what: 'The Center of Mass (COM) frame is the inertial reference frame in which total system linear momentum equals zero.',
        how: 'In the COM frame, an elastic collision is symmetrical: the particles simply reverse their velocity directions without changing magnitude.',
        keyIdea: 'Transforming between Lab and COM frames dramatically simplifies collision mathematics and reveals underlying conservation symmetries.'
      }),
      onOpenProblem: () => this.modal.openProblem('MOMENTUM_ELASTIC_COLLISION'),
      onBack: () => {
        import('./mechanicsMenuScene.js').then(m => this.sceneManager.changeScene(new m.MechanicsMenuScene()));
      }
    });

    this.dataPanel = new MechanicsDataPanel({ title: 'DUAL FRAME KINEMATICS' });
    this.modal = new MechanicsModalOverlay();
    this.sliders = [];
    this.isSlowMo = false;
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
      max: 8,
      value: this.physics.m1,
      step: 0.5,
      label: 'MASS 1 (m1)',
      unit: ' kg',
      accentColor: Colors.cyan,
      callback: (val) => this.physics.setParameters(val, this.physics.u1, this.physics.m2, this.physics.u2, this.physics.e)
    }));

    sY += 55;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: -10,
      max: 10,
      value: this.physics.u1,
      step: 1,
      label: 'INITIAL u1 (LAB)',
      unit: ' m/s',
      accentColor: Colors.cyan,
      callback: (val) => this.physics.setParameters(this.physics.m1, val, this.physics.m2, this.physics.u2, this.physics.e)
    }));

    sY += 55;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: 1,
      max: 8,
      value: this.physics.m2,
      step: 0.5,
      label: 'MASS 2 (m2)',
      unit: ' kg',
      accentColor: Colors.purple,
      callback: (val) => this.physics.setParameters(this.physics.m1, this.physics.u1, val, this.physics.u2, this.physics.e)
    }));

    sY += 55;
    this.sliders.push(new Slider({
      x: sidebarX + 20,
      y: sY,
      width: sW,
      min: -10,
      max: 10,
      value: this.physics.u2,
      step: 1,
      label: 'INITIAL u2 (LAB)',
      unit: ' m/s',
      accentColor: Colors.purple,
      callback: (val) => this.physics.setParameters(this.physics.m1, this.physics.u1, this.physics.m2, val, this.physics.e)
    }));

    this.sidebarRect = { x: sidebarX, y: contentY, w: sidebarW, h: contentH };
    this.dataPanel.setRect(sidebarX, contentY + 250, sidebarW, contentH - 250);

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
    const effectiveDt = this.isSlowMo ? dt * 0.25 : dt;
    this.physics.update(effectiveDt);
    this.controlBar.setRunning(this.physics.isRunning);

    if (this.modal.isOpen) {
      this.modal.update(dt, this.inputManager);
      return;
    }

    this.controlBar.update(dt, this.inputManager);
    for (const s of this.sliders) s.update(dt, this.inputManager);

    const comState = this.physics.getCOMFrameState();
    this.dataPanel.setItems([
      { label: 'COM Velocity (v_cm)', value: comState.v_cm.toFixed(2), unit: 'm/s', color: Colors.yellow },
      { label: 'LAB Frame P_total', value: this.physics.p_total_initial.toFixed(1), unit: 'kg·m/s', color: Colors.cyan },
      { label: 'COM Frame P_total', value: '0.00', unit: 'kg·m/s (Identically 0)', color: Colors.green },
      { label: 'u1 in COM Frame', value: comState.u1_com.toFixed(2), unit: 'm/s', color: Colors.cyan },
      { label: 'u2 in COM Frame', value: comState.u2_com.toFixed(2), unit: 'm/s', color: Colors.purple },
      { label: 'v1 in COM Frame', value: comState.v1_com.toFixed(2), unit: 'm/s', color: Colors.cyan },
      { label: 'v2 in COM Frame', value: comState.v2_com.toFixed(2), unit: 'm/s', color: Colors.purple }
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
      const halfH = (this.simRect.h - 15) / 2;

      // Viewport 1: LAB FRAME (Top)
      const labY = this.simRect.y;
      Renderer.drawPanel(ctx, this.simRect.x, labY, this.simRect.w, halfH, {
        fill: '#090E1A',
        stroke: Colors.panelBorder
      });

      Renderer.drawText(ctx, 'LABORATORY REFERENCE FRAME (Ground at rest)', this.simRect.x + 16, labY + 20, {
        fill: Colors.cyan,
        font: 'bold 12px "Segoe UI"'
      });

      const labGround = labY + halfH - 25;
      const originX = this.simRect.x + this.simRect.w / 2;
      const scale = 5.0;

      Renderer.drawLine(ctx, this.simRect.x + 20, labGround, this.simRect.x + this.simRect.w - 20, labGround, {
        stroke: Colors.panelBorder,
        lineWidth: 2
      });

      // Lab Frame Bodies
      const lab1X = originX + this.physics.pos1 * scale;
      const lab2X = originX + this.physics.pos2 * scale;
      const comX = originX + ((this.physics.m1 * this.physics.pos1 + this.physics.m2 * this.physics.pos2) / (this.physics.m1 + this.physics.m2)) * scale;

      Renderer.drawCircle(ctx, lab1X, labGround - 18, 16, { fill: '#152238', stroke: Colors.cyan, lineWidth: 2 });
      Renderer.drawCircle(ctx, lab2X, labGround - 18, 16, { fill: '#241738', stroke: Colors.purple, lineWidth: 2 });
      Renderer.drawCircle(ctx, comX, labGround, 5, { fill: Colors.yellow });

      VectorRenderer.drawVector(ctx, lab1X, labGround - 18, this.physics.v1 * 4.0, 0, 1.0, { color: Colors.cyan, label: `v1=${this.physics.v1.toFixed(1)}` });
      VectorRenderer.drawVector(ctx, lab2X, labGround - 18, this.physics.v2 * 4.0, 0, 1.0, { color: Colors.purple, label: `v2=${this.physics.v2.toFixed(1)}` });

      // Viewport 2: CENTRE OF MASS FRAME (Bottom)
      const comFrameY = labY + halfH + 15;
      Renderer.drawPanel(ctx, this.simRect.x, comFrameY, this.simRect.w, halfH, {
        fill: '#08101E',
        stroke: Colors.panelBorder
      });

      Renderer.drawText(ctx, 'CENTRE-OF-MASS REFERENCE FRAME (COM fixed at center)', this.simRect.x + 16, comFrameY + 20, {
        fill: Colors.yellow,
        font: 'bold 12px "Segoe UI"'
      });

      const comGround = comFrameY + halfH - 25;
      Renderer.drawLine(ctx, this.simRect.x + 20, comGround, this.simRect.x + this.simRect.w - 20, comGround, {
        stroke: Colors.panelBorder,
        lineWidth: 2
      });

      // COM frame bodies relative to COM
      const com1X = originX + (this.physics.pos1 - (comX - originX) / scale) * scale;
      const com2X = originX + (this.physics.pos2 - (comX - originX) / scale) * scale;
      const comV1 = this.physics.v1 - this.physics.v_cm;
      const comV2 = this.physics.v2 - this.physics.v_cm;

      Renderer.drawCircle(ctx, com1X, comGround - 18, 16, { fill: '#152238', stroke: Colors.cyan, lineWidth: 2 });
      Renderer.drawCircle(ctx, com2X, comGround - 18, 16, { fill: '#241738', stroke: Colors.purple, lineWidth: 2 });
      Renderer.drawCircle(ctx, originX, comGround, 6, { fill: Colors.yellow });

      VectorRenderer.drawVector(ctx, com1X, comGround - 18, comV1 * 4.0, 0, 1.0, { color: Colors.cyan, label: `u1,com=${comV1.toFixed(1)}` });
      VectorRenderer.drawVector(ctx, com2X, comGround - 18, comV2 * 4.0, 0, 1.0, { color: Colors.purple, label: `u2,com=${comV2.toFixed(1)}` });
    }

    this.modal.render(ctx, width, height);
  }
}
