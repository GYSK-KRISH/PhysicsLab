// Relative Motion Laboratory Scene for PhysicsLab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Button, Slider } from '../../engine/ui.js';
import { RelativeMotionPhysics } from '../../physics/mechanics/relativeMotion.js';
import { VectorRenderer } from '../../engine/vectorRenderer.js';
import { MechanicsControlBar, MechanicsDataPanel, MechanicsModalOverlay } from '../../engine/mechanicsUI.js';

export class RelativeMotionScene {
  constructor() {
    this.physics = new RelativeMotionPhysics({ mode: 'RIVER_BOAT' });
    this.controlBar = new MechanicsControlBar({
      onPlay: () => this.physics.start(),
      onPause: () => this.physics.pause(),
      onReset: () => this.physics.reset(),
      onStepForward: () => this.physics.update(0.1),
      onToggleSlowMo: () => {
        this.isSlowMo = !this.isSlowMo;
        this.controlBar.setSlowMo(this.isSlowMo);
      },
      onOpenFormula: () => this.modal.openFormula('RELATIVE MOTION', [
        { name: 'Relative Velocity Formula', formula: 'v_AB = v_A - v_B', desc: 'Velocity of body A with respect to frame B' },
        { name: 'River Boat Resultant', formula: 'v_boat,ground = v_boat,water + v_river', desc: 'Vector sum of engine velocity and water current' },
        { name: 'Rain-Umbrella Angle', formula: 'tan θ = |v_person| / |v_rain|', desc: 'Umbrella tilt angle from vertical to block rain' }
      ]),
      onOpenConcept: () => this.modal.openConcept('RELATIVE MOTION', {
        what: 'Relative motion examines particle kinematics from a moving frame of reference rather than the stationary ground.',
        how: 'The velocity observed by reference frame B is found by vector subtraction: V_AB = V_A - V_B.',
        keyIdea: 'Vector addition and subtraction accurately predict navigation headings, drift distances, and rain angles.'
      }),
      onOpenProblem: () => this.modal.openProblem('KINEMATICS_1D_STOPPING'),
      onBack: () => {
        import('./mechanicsMenuScene.js').then(m => this.sceneManager.changeScene(new m.MechanicsMenuScene()));
      }
    });

    this.dataPanel = new MechanicsDataPanel({ title: 'RELATIVE VELOCITIES' });
    this.modal = new MechanicsModalOverlay();
    this.modeButtons = [];
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

    // Mode Selector Buttons
    this.modeButtons = [];
    const modes = [
      { id: 'RIVER_BOAT', label: 'RIVER & BOAT' },
      { id: 'RAIN_PERSON', label: 'RAIN & UMBRELLA' },
      { id: 'CARS', label: 'TWO VEHICLES' }
    ];

    const mbW = (sidebarW - 40) / 3;
    for (let i = 0; i < modes.length; i++) {
      const m = modes[i];
      const isSel = this.physics.mode === m.id;
      this.modeButtons.push(new Button({
        x: sidebarX + 20 + i * mbW,
        y: contentY + 20,
        width: mbW - 4,
        height: 30,
        text: m.label.split(' ')[0],
        accentColor: isSel ? Colors.cyan : Colors.panelBorder,
        callback: () => {
          this.physics.setMode(m.id);
          this.rebuildUI();
        }
      }));
    }

    // Sliders
    this.sliders = [];
    let sY = contentY + 70;
    const sW = sidebarW - 40;

    if (this.physics.mode === 'RIVER_BOAT') {
      this.sliders.push(new Slider({
        x: sidebarX + 20,
        y: sY,
        width: sW,
        min: 1,
        max: 15,
        value: this.physics.boatSpeedStill,
        step: 0.5,
        label: 'BOAT SPEED (v_bw)',
        unit: ' m/s',
        accentColor: Colors.cyan,
        callback: (val) => { this.physics.boatSpeedStill = val; }
      }));

      sY += 55;
      this.sliders.push(new Slider({
        x: sidebarX + 20,
        y: sY,
        width: sW,
        min: 0,
        max: 180,
        value: this.physics.boatHeadingDeg,
        step: 5,
        label: 'BOAT HEADING (θ)',
        unit: '°',
        accentColor: Colors.yellow,
        callback: (val) => { this.physics.boatHeadingDeg = val; }
      }));

      sY += 55;
      this.sliders.push(new Slider({
        x: sidebarX + 20,
        y: sY,
        width: sW,
        min: 0,
        max: 10,
        value: this.physics.riverCurrent.x,
        step: 0.5,
        label: 'RIVER CURRENT (v_r)',
        unit: ' m/s',
        accentColor: Colors.purple,
        callback: (val) => { this.physics.riverCurrent.x = val; }
      }));
    } else if (this.physics.mode === 'RAIN_PERSON') {
      this.sliders.push(new Slider({
        x: sidebarX + 20,
        y: sY,
        width: sW,
        min: 0,
        max: 20,
        value: this.physics.personSpeed,
        step: 0.5,
        label: 'PERSON SPEED',
        unit: ' m/s',
        accentColor: Colors.cyan,
        callback: (val) => { this.physics.personSpeed = val; }
      }));

      sY += 55;
      this.sliders.push(new Slider({
        x: sidebarX + 20,
        y: sY,
        width: sW,
        min: 5,
        max: 25,
        value: Math.abs(this.physics.rainVel.y),
        step: 1,
        label: 'RAIN SPEED (DOWN)',
        unit: ' m/s',
        accentColor: Colors.purple,
        callback: (val) => { this.physics.rainVel.y = -val; }
      }));
    } else {
      this.sliders.push(new Slider({
        x: sidebarX + 20,
        y: sY,
        width: sW,
        min: 5,
        max: 35,
        value: this.physics.carA_vel.x,
        step: 1,
        label: 'CAR A SPEED (v_A)',
        unit: ' m/s',
        accentColor: Colors.cyan,
        callback: (val) => { this.physics.carA_vel.x = val; }
      }));

      sY += 55;
      this.sliders.push(new Slider({
        x: sidebarX + 20,
        y: sY,
        width: sW,
        min: 5,
        max: 35,
        value: this.physics.carB_vel.x,
        step: 1,
        label: 'CAR B SPEED (v_B)',
        unit: ' m/s',
        accentColor: Colors.yellow,
        callback: (val) => { this.physics.carB_vel.x = val; }
      }));
    }

    this.sidebarRect = { x: sidebarX, y: contentY, w: sidebarW, h: contentH };
    this.dataPanel.setRect(sidebarX, contentY + 240, sidebarW, contentH - 240);

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
    for (const b of this.modeButtons) b.update(dt, this.inputManager);
    for (const s of this.sliders) s.update(dt, this.inputManager);

    if (this.physics.mode === 'RIVER_BOAT') {
      const vRes = this.physics.getRiverBoatResultantVelocity();
      this.dataPanel.setItems([
        { label: 'Boat Speed (still)', value: this.physics.boatSpeedStill.toFixed(1), unit: 'm/s', color: Colors.cyan },
        { label: 'River Speed', value: this.physics.riverCurrent.x.toFixed(1), unit: 'm/s', color: Colors.purple },
        { label: 'Resultant Speed', value: vRes.magnitude().toFixed(2), unit: 'm/s', color: Colors.green },
        { label: 'Resultant Angle', value: `${((vRes.angle() * 180) / Math.PI).toFixed(1)}°`, unit: '', color: Colors.yellow },
        { label: 'Drift Distance', value: this.physics.boatPos.x.toFixed(1), unit: 'm', color: Colors.text }
      ]);
    } else if (this.physics.mode === 'RAIN_PERSON') {
      const rainInfo = this.physics.getRainRelativeVelocity();
      this.dataPanel.setItems([
        { label: 'Person Speed', value: this.physics.personSpeed.toFixed(1), unit: 'm/s', color: Colors.cyan },
        { label: 'Rain Speed (down)', value: Math.abs(this.physics.rainVel.y).toFixed(1), unit: 'm/s', color: Colors.purple },
        { label: 'Relative Rain Speed', value: rainInfo.vRel.magnitude().toFixed(2), unit: 'm/s', color: Colors.green },
        { label: 'Umbrella Tilt Angle', value: `${rainInfo.umbrellaAngleDeg.toFixed(1)}°`, unit: 'from vertical', color: Colors.yellow }
      ]);
    } else {
      const vRel = this.physics.getRelativeCarVelocity();
      this.dataPanel.setItems([
        { label: 'Car A Velocity', value: this.physics.carA_vel.x.toFixed(1), unit: 'm/s', color: Colors.cyan },
        { label: 'Car B Velocity', value: this.physics.carB_vel.x.toFixed(1), unit: 'm/s', color: Colors.yellow },
        { label: 'Relative V_AB', value: vRel.x.toFixed(1), unit: 'm/s', color: Colors.green },
        { label: 'Separation', value: Math.abs(this.physics.carA_pos.x - this.physics.carB_pos.x).toFixed(1), unit: 'm', color: Colors.text }
      ]);
    }
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
      for (const b of this.modeButtons) b.render(ctx);
      for (const s of this.sliders) s.render(ctx);
      this.dataPanel.render(ctx);
    }

    if (this.simRect) {
      Renderer.drawPanel(ctx, this.simRect.x, this.simRect.y, this.simRect.w, this.simRect.h, {
        fill: '#090E1A',
        stroke: Colors.panelBorder
      });

      if (this.physics.mode === 'RIVER_BOAT') {
        const bankY1 = this.simRect.y + this.simRect.h - 80;
        const bankY2 = this.simRect.y + 80;
        const riverScale = (bankY1 - bankY2) / this.physics.riverWidth;

        // River water area
        Renderer.drawRect(ctx, this.simRect.x + 20, bankY2, this.simRect.w - 40, bankY1 - bankY2, {
          fill: '#0A1A2F'
        });

        // Current flow arrows
        for (let y = bankY2 + 30; y < bankY1; y += 40) {
          for (let x = this.simRect.x + 60; x < this.simRect.x + this.simRect.w - 60; x += 120) {
            VectorRenderer.drawArrow(ctx, x, y, x + 35, y, {
              stroke: 'rgba(94, 231, 255, 0.25)',
              lineWidth: 1.5,
              headLength: 6
            });
          }
        }

        // River Banks
        Renderer.drawLine(ctx, this.simRect.x + 20, bankY1, this.simRect.x + this.simRect.w - 20, bankY1, { stroke: Colors.panelBorder, lineWidth: 3 });
        Renderer.drawLine(ctx, this.simRect.x + 20, bankY2, this.simRect.x + this.simRect.w - 20, bankY2, { stroke: Colors.panelBorder, lineWidth: 3 });

        // Boat
        const bx = this.simRect.x + 100 + this.physics.boatPos.x * riverScale;
        const by = bankY1 - this.physics.boatPos.y * riverScale;

        Renderer.drawCircle(ctx, bx, by, 10, {
          fill: Colors.yellow,
          stroke: '#FFFFFF',
          lineWidth: 2,
          glowColor: Colors.yellow,
          glowBlur: 8
        });

        if (this.controlBar.showVectors) {
          const vRes = this.physics.getRiverBoatResultantVelocity();
          VectorRenderer.drawVector(ctx, bx, by, vRes.x * 6.0, -vRes.y * 6.0, 1.0, {
            color: Colors.green,
            label: 'v_resultant',
            glow: true
          });
        }
      } else if (this.physics.mode === 'RAIN_PERSON') {
        const groundY = this.simRect.y + this.simRect.h - 60;
        const px = this.simRect.x + this.simRect.w / 2;
        const py = groundY - 30;

        Renderer.drawLine(ctx, this.simRect.x + 20, groundY, this.simRect.x + this.simRect.w - 20, groundY, { stroke: Colors.panelBorder, lineWidth: 3 });

        // Falling rain drops
        ctx.strokeStyle = 'rgba(94, 231, 255, 0.4)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 30; i++) {
          const rx = this.simRect.x + 40 + (i * 27) % (this.simRect.w - 80);
          const ry = this.simRect.y + 40 + ((i * 37 + this.physics.time * 200) % (this.simRect.h - 120));
          ctx.beginPath();
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx, ry + 15);
          ctx.stroke();
        }

        // Person
        Renderer.drawCircle(ctx, px, py - 20, 12, { fill: Colors.cyan });
        Renderer.drawLine(ctx, px, py - 8, px, py + 20, { stroke: Colors.cyan, lineWidth: 3 });

        // Umbrella tilted at angle
        const rainInfo = this.physics.getRainRelativeVelocity();
        const tiltRad = (rainInfo.umbrellaAngleDeg * Math.PI) / 180;
        const umbLen = 35;
        const ux = px - Math.sin(tiltRad) * umbLen;
        const uy = (py - 30) - Math.cos(tiltRad) * umbLen;

        VectorRenderer.drawArrow(ctx, px, py - 25, ux, uy, {
          stroke: Colors.yellow,
          lineWidth: 4,
          label: `Umbrella ${rainInfo.umbrellaAngleDeg.toFixed(1)}°`
        });
      } else {
        // Cars Mode
        const lane1Y = this.simRect.y + this.simRect.h * 0.4;
        const lane2Y = this.simRect.y + this.simRect.h * 0.65;

        Renderer.drawLine(ctx, this.simRect.x + 20, lane1Y + 20, this.simRect.x + this.simRect.w - 20, lane1Y + 20, { stroke: Colors.panelBorder, lineWidth: 2 });
        Renderer.drawLine(ctx, this.simRect.x + 20, lane2Y + 20, this.simRect.x + this.simRect.w - 20, lane2Y + 20, { stroke: Colors.panelBorder, lineWidth: 2 });

        const c1X = (this.simRect.x + 40 + (this.physics.carA_pos.x * 3.0)) % (this.simRect.w - 80);
        const c2X = (this.simRect.x + 40 + (this.physics.carB_pos.x * 3.0)) % (this.simRect.w - 80);

        // Car A (Cyan)
        Renderer.drawRoundedRect(ctx, c1X, lane1Y - 14, 40, 24, 4, { fill: Colors.cyan });
        Renderer.drawText(ctx, 'CAR A', c1X + 20, lane1Y - 24, { fill: Colors.cyan, font: 'bold 11px "Segoe UI"', align: 'center' });

        // Car B (Yellow)
        Renderer.drawRoundedRect(ctx, c2X, lane2Y - 14, 40, 24, 4, { fill: Colors.yellow });
        Renderer.drawText(ctx, 'CAR B', c2X + 20, lane2Y - 24, { fill: Colors.yellow, font: 'bold 11px "Segoe UI"', align: 'center' });
      }
    }

    this.modal.render(ctx, width, height);
  }
}
