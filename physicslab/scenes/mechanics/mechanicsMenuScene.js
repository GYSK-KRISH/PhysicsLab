// Mechanics Laboratory Main Hub & Navigation Dashboard for PhysicsLab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Button } from '../../engine/ui.js';

export class MechanicsMenuScene {
  constructor() {
    this.buttons = [];
    this.particles = [];
    this.lastWidth = 0;
    this.lastHeight = 0;
    this.time = 0;
    this.activeCategory = 'ALL'; 
    this.scrollY = 0;
    this.maxScrollY = 0;
  }

  init() {
    this.initParticles();
    this.rebuildUI();
  }

  initParticles() {
    const count = 35;
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * (window.innerWidth || 1000),
        y: Math.random() * (window.innerHeight || 800),
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 0.5) * 15,
        radius: Math.random() * 2 + 1,
        alpha: Math.random() * 0.35 + 0.1,
        color: Math.random() > 0.5 ? Colors.cyan : Colors.yellow
      });
    }
  }

  rebuildUI() {
    const { width, height } = this.canvasEngine.getBounds();
    this.buttons = [];

    // 1. Top Navigation & Hero Section
    const backBtn = new Button({
      x: 20,
      y: 16,
      width: 130,
      height: 34,
      text: '← MAIN MENU',
      accentColor: Colors.purple,
      callback: () => {
        if (this.sceneManager) {
          import('../menuScene.js').then((module) => {
            this.sceneManager.changeScene(new module.MenuScene());
          });
        }
      }
    });
    this.buttons.push(backBtn);

    // Featured Lab Button
    const featuredBtn = new Button({
      x: width - 180,
      y: 16,
      width: 160,
      height: 34,
      text: '★ PROJECTILE LAB',
      accentColor: Colors.green,
      badgeText: 'FEATURED',
      badgeColor: Colors.green,
      callback: () => {
        import('./projectileLabScene.js').then(m => this.sceneManager.changeScene(new m.ProjectileLabScene()));
      }
    });
    this.buttons.push(featuredBtn);

    // 2. Category Filter Bar
    const categories = [
      { id: 'ALL', name: 'ALL LABS (40)', color: Colors.cyan },
      { id: 'KINEMATICS', name: 'KINEMATICS', color: Colors.cyan },
      { id: 'FORCES', name: 'FORCES & LAWS', color: Colors.yellow },
      { id: 'ENERGY', name: 'WORK & ENERGY', color: Colors.purple },
      { id: 'ROTATION', name: 'ROTATION', color: Colors.yellow },
      { id: 'GRAVITATION', name: 'GRAVITATION', color: Colors.green },
      { id: 'SHM_WAVES', name: 'SHM & WAVES', color: Colors.cyan },
      { id: 'ADVANCED', name: 'ADVANCED', color: Colors.purple },
      { id: 'FORMULAS', name: 'FORMULAS', color: Colors.purple },
      { id: 'PROBLEMS', name: 'PROBLEMS', color: Colors.yellow }
    ];

    const isMobile = width < 768;
    const isMedium = width >= 768 && width < 1100;
    const catY = 110;
    const catGap = 6;
    const colsPerCatRow = isMobile ? 3 : (isMedium ? 5 : 10);
    const catW = Math.max(80, Math.floor((width - 40 - (colsPerCatRow - 1) * catGap) / colsPerCatRow));

    let cIndex = 0;
    for (const cat of categories) {
      const col = cIndex % colsPerCatRow;
      const row = Math.floor(cIndex / colsPerCatRow);
      const cx = 20 + col * (catW + catGap);
      const cy = catY + row * (32 + catGap);

      const isSel = this.activeCategory === cat.id;
      const cBtn = new Button({
        x: cx,
        y: cy,
        width: catW,
        height: 30,
        text: cat.name,
        accentColor: isSel ? cat.color : Colors.panelBorder,
        callback: () => {
          this.activeCategory = cat.id;
          this.scrollY = 0;
          if (cat.id === 'FORMULAS') {
            import('./formulaLibraryScene.js').then(m => this.sceneManager.changeScene(new m.FormulaLibraryScene()));
          } else if (cat.id === 'PROBLEMS') {
            import('./numericalProblemsScene.js').then(m => this.sceneManager.changeScene(new m.NumericalProblemsScene()));
          } else {
            this.rebuildUI();
          }
        }
      });
      this.buttons.push(cBtn);
      cIndex++;
    }

    const catRows = Math.ceil(categories.length / colsPerCatRow);
    const gridStartY = catY + catRows * 38 + 12;

    // 3. Modules Grid
    const modules = this.getModulesForCategory(this.activeCategory);
    const cardCols = isMobile ? 1 : (isMedium ? 2 : 4);
    const cardGap = 12;
    const cardWidth = Math.max(220, Math.floor((width - 40 - (cardCols - 1) * cardGap) / cardCols));
    const cardHeight = 84;

    this.cardButtons = [];
    let mIndex = 0;

    for (const mod of modules) {
      const col = mIndex % cardCols;
      const row = Math.floor(mIndex / cardCols);
      const mx = 20 + col * (cardWidth + cardGap);
      const my = gridStartY + row * (cardHeight + cardGap);

      const btn = new Button({
        x: mx,
        y: my,
        width: cardWidth,
        height: cardHeight,
        text: mod.title,
        subtext: mod.desc,
        badgeText: mod.catCode || 'LAB',
        badgeColor: mod.color || Colors.cyan,
        accentColor: mod.color || Colors.cyan,
        callback: () => {
          if (this.sceneManager && mod.scene) {
            mod.scene().then(scene => this.sceneManager.changeScene(scene));
          }
        }
      });

      this.cardButtons.push({ btn, origY: my, mod });
      mIndex++;
    }

    const totalGridH = Math.ceil(modules.length / cardCols) * (cardHeight + cardGap);
    this.gridAreaY = gridStartY;
    this.maxScrollY = Math.max(0, (gridStartY + totalGridH + 30) - height);
  }

  getModulesForCategory(catId) {
    const all = [
      { title: '01 Motion in 1D', catId: 'KINEMATICS', catCode: '1D', desc: 'Uniform motion, acceleration, free fall & x-t, v-t graphs', color: Colors.cyan, scene: () => import('./kinematics1DScene.js').then(m => new m.Kinematics1DScene()) },
      { title: '02 Motion in 2D', catId: 'KINEMATICS', catCode: '2D', desc: '2D vector decomposition, vx, vy, ax, ay components', color: Colors.cyan, scene: () => import('./kinematics2DScene.js').then(m => new m.Kinematics2DScene()) },
      { title: '03 Projectile Motion', catId: 'KINEMATICS', catCode: '2D', desc: 'Launch angles, max height, range & air resistance integration', color: Colors.cyan, scene: () => import('./projectileLabScene.js').then(m => new m.ProjectileLabScene()) },
      { title: '04 Relative Motion', catId: 'KINEMATICS', catCode: 'REL', desc: 'V_AB = V_A - V_B, river-boat drift & rain-umbrella vectors', color: Colors.cyan, scene: () => import('./relativeMotionScene.js').then(m => new m.RelativeMotionScene()) },
      { title: '05 Newton\'s Laws', catId: 'FORCES', catCode: 'FBD', desc: 'Forces, acceleration & Free Body Diagram (FBD)', color: Colors.yellow, scene: () => import('./newtonLawsScene.js').then(m => new m.NewtonLawsScene()) },
      { title: '06 Friction Lab', catId: 'FORCES', catCode: 'FRIC', desc: 'Static vs kinetic friction & breakaway threshold', color: Colors.yellow, scene: () => import('./frictionScene.js').then(m => new m.FrictionScene()) },
      { title: '07 Inclined Plane', catId: 'FORCES', catCode: 'INC', desc: 'mg sin θ, mg cos θ, normal force & sliding acceleration', color: Colors.yellow, scene: () => import('./inclinedPlaneScene.js').then(m => new m.InclinedPlaneScene()) },
      { title: '08 Circular Motion', catId: 'FORCES', catCode: 'CIRC', desc: 'Centripetal acceleration a_c = v²/r & centripetal force', color: Colors.yellow, scene: () => import('./circularMotionScene.js').then(m => new m.CircularMotionScene()) },
      { title: '09 Banked Road', catId: 'FORCES', catCode: 'ROAD', desc: 'tan θ = v²/(rg), friction limits & safe speed margins', color: Colors.yellow, scene: () => import('./bankedRoadScene.js').then(m => new m.BankedRoadScene()) },
      { title: '10 Work Laboratory', catId: 'ENERGY', catCode: 'WORK', desc: 'W = F·d·cos θ, positive, negative & zero work presets', color: Colors.purple, scene: () => import('./workLabScene.js').then(m => new m.WorkLabScene()) },
      { title: '11 Variable Force', catId: 'ENERGY', catCode: 'INT', desc: 'Interactive F-x curve & numerical integral W = ∫F dx', color: Colors.purple, scene: () => import('./variableForceScene.js').then(m => new m.VariableForceScene()) },
      { title: '12 Work-Energy Theorem', catId: 'ENERGY', catCode: 'W-E', desc: 'W_net = ΔK kinetic energy verification & difference tracking', color: Colors.purple, scene: () => import('./workEnergyScene.js').then(m => new m.WorkEnergyScene()) },
      { title: '13 Power Lab', catId: 'ENERGY', catCode: 'POW', desc: 'P = W/t, P = F·v, instantaneous & average power', color: Colors.purple, scene: () => import('./powerLabScene.js').then(m => new m.PowerLabScene()) },
      { title: '14 Collision Lab', catId: 'ROTATION', catCode: 'COLL', desc: '1D elastic, inelastic & perfectly inelastic collisions', color: Colors.yellow, scene: () => import('./collision1DScene.js').then(m => new m.Collision1DScene()) },
      { title: '15 Centre of Mass', catId: 'ROTATION', catCode: 'COM', desc: 'Multi-particle system, draggable masses & live COM marker', color: Colors.yellow, scene: () => import('./centerOfMassScene.js').then(m => new m.CenterOfMassScene()) },
      { title: '16 Rotational Dynamics', catId: 'ROTATION', catCode: 'ROT', desc: 'τ = I·α, angular acceleration & rotational KE', color: Colors.yellow, scene: () => import('./rotationScene.js').then(m => new m.RotationScene()) },
      { title: '17 Moment of Inertia', catId: 'ROTATION', catCode: 'MOI', desc: 'Ring, disc, solid sphere, hollow sphere & rod formulas', color: Colors.yellow, scene: () => import('./momentOfInertiaScene.js').then(m => new m.MomentOfInertiaScene()) },
      { title: '18 Rolling Motion', catId: 'ROTATION', catCode: 'ROLL', desc: 'Incline race between bodies with v = ωR & energy breakdown', color: Colors.yellow, scene: () => import('./rollingMotionScene.js').then(m => new m.RollingMotionScene()) },
      { title: '19 Torque Lab', catId: 'ROTATION', catCode: 'TORQ', desc: 'Lever mechanics τ = r·F·sin θ & clockwise/counterclockwise torque', color: Colors.yellow, scene: () => import('./torqueLabScene.js').then(m => new m.TorqueLabScene()) },
      { title: '20 Angular Momentum', catId: 'ROTATION', catCode: 'L-MOM', desc: 'L = I·ω conservation & contracting radius skater effect', color: Colors.yellow, scene: () => import('./angularMomentumScene.js').then(m => new m.AngularMomentumScene()) },
      { title: '21 Gravitation', catId: 'GRAVITATION', catCode: 'GRAV', desc: 'Universal law F = Gm₁m₂/r², attractive vectors & PE', color: Colors.green, scene: () => import('./gravitationScene.js').then(m => new m.GravitationScene()) },
      { title: '22 Gravitational Field', catId: 'GRAVITATION', catCode: 'FIELD', desc: 'Multi-mass vector field grid with true vector summation', color: Colors.green, scene: () => import('./gravitationalFieldScene.js').then(m => new m.GravitationalFieldScene()) },
      { title: '23 Gravitational Potential', catId: 'GRAVITATION', catCode: 'POT', desc: 'V = -GM/r potential well with safe r→0 handling', color: Colors.green, scene: () => import('./gravitationalPotentialScene.js').then(m => new m.GravitationalPotentialScene()) },
      { title: '24 Escape Velocity', catId: 'GRAVITATION', catCode: 'VESC', desc: 'v_e = √(2GM/R), Earth, Moon, Mars & Custom presets', color: Colors.green, scene: () => import('./escapeVelocityScene.js').then(m => new m.EscapeVelocityScene()) },
      { title: '25 Satellite Orbit', catId: 'GRAVITATION', catCode: 'ORB', desc: 'v = √(GM/r), T = 2π√(r³/GM) circular & elliptical paths', color: Colors.green, scene: () => import('./satelliteOrbitScene.js').then(m => new m.SatelliteOrbitScene()) },
      { title: '26 Geostationary Orbit', catId: 'GRAVITATION', catCode: 'GEO', desc: 'Earth synchronized rotation, equatorial orbit & altitude', color: Colors.green, scene: () => import('./geostationaryOrbitScene.js').then(m => new m.GeostationaryOrbitScene()) },
      { title: '27 Simple Harmonic Motion', catId: 'SHM_WAVES', catCode: 'SHM', desc: 'x = A·cos(ωt + φ), spring-mass displacement, vel & acc', color: Colors.cyan, scene: () => import('./shmScene.js').then(m => new m.SHMScene()) },
      { title: '28 SHM Energy', catId: 'SHM_WAVES', catCode: 'E-SHM', desc: 'KE + PE = ½kA² constant total energy live time curves', color: Colors.cyan, scene: () => import('./shmEnergyScene.js').then(m => new m.SHMEnergyScene()) },
      { title: '29 Spring Laboratory', catId: 'SHM_WAVES', catCode: 'SPRG', desc: 'Single, series (1/k) & parallel (k1+k2) spring combinations', color: Colors.cyan, scene: () => import('./springLabScene.js').then(m => new m.SpringLabScene()) },
      { title: '30 Wave Laboratory', catId: 'SHM_WAVES', catCode: 'WAVE', desc: 'v = f·λ transverse & longitudinal wave propagation', color: Colors.cyan, scene: () => import('./waveLabScene.js').then(m => new m.WaveLabScene()) },
      { title: '31 Superposition', catId: 'SHM_WAVES', catCode: 'SUP', desc: 'Wave 1 + Wave 2 = Resultant constructive/destructive interference', color: Colors.cyan, scene: () => import('./superpositionScene.js').then(m => new m.SuperpositionScene()) },
      { title: '32 Standing Waves', catId: 'SHM_WAVES', catCode: 'NODE', desc: 'Nodes & antinodes on string with tension T & harmonics n=1..5', color: Colors.cyan, scene: () => import('./standingWaveScene.js').then(m => new m.StandingWaveScene()) },
      { title: '33 Beats', catId: 'SHM_WAVES', catCode: 'BEAT', desc: 'f_b = |f1 - f2| acoustic beats with amplitude modulation envelope', color: Colors.cyan, scene: () => import('./beatsScene.js').then(m => new m.BeatsScene()) },
      { title: '34 COM Frame Collision', catId: 'ADVANCED', catCode: 'ADV', desc: 'Simultaneous Lab Frame and Centre-of-Mass Frame viewports', color: Colors.purple, scene: () => import('./comCollisionScene.js').then(m => new m.COMCollisionScene()) },
      { title: '35 Advanced 2D Collision', catId: 'ADVANCED', catCode: 'ADV', desc: 'Oblique impact geometry & 2D vector momentum conservation', color: Colors.purple, scene: () => import('./collision2DScene.js').then(m => new m.Collision2DScene()) },
      { title: '36 Damped Oscillation', catId: 'ADVANCED', catCode: 'ADV', desc: 'Underdamped, critical, overdamped (c² vs 4mk) & decay envelope', color: Colors.purple, scene: () => import('./dampedOscillationScene.js').then(m => new m.DampedOscillationScene()) },
      { title: '37 Forced Oscillation', catId: 'ADVANCED', catCode: 'ADV', desc: 'm·x\'\' + c·x\' + k·x = F0·cos(ωt) driven oscillator physics', color: Colors.purple, scene: () => import('./forcedOscillationScene.js').then(m => new m.ForcedOscillationScene()) },
      { title: '38 Resonance', catId: 'ADVANCED', catCode: 'ADV', desc: 'Dynamic resonance peak & amplitude-frequency response curve', color: Colors.purple, scene: () => import('./resonanceScene.js').then(m => new m.ResonanceScene()) },
      { title: '39 Advanced Orbital Mechanics', catId: 'ADVANCED', catCode: 'ADV', desc: 'Vis-viva equation v² = GM(2/r - 1/a) & Keplerian orbits', color: Colors.purple, scene: () => import('./satelliteOrbitScene.js').then(m => new m.SatelliteOrbitScene()) },
      { title: '40 Conservation Laws', catId: 'ADVANCED', catCode: 'ADV', desc: 'Unified Momentum, Energy, and Angular Momentum monitor', color: Colors.purple, scene: () => import('./conservationLawsScene.js').then(m => new m.ConservationLawsScene()) }
    ];

    if (catId === 'ALL') return all;
    return all.filter(m => m.catId === catId);
  }

  handleInput(inputManager) {
    const { width, height } = this.canvasEngine.getBounds();
    if (this.lastWidth !== width || this.lastHeight !== height) {
      this.lastWidth = width;
      this.lastHeight = height;
      this.rebuildUI();
    }

    if (inputManager.wheelDelta !== 0) {
      this.scrollY = Math.max(0, Math.min(this.maxScrollY, this.scrollY + inputManager.wheelDelta * 0.5));
    }
  }

  update(dt) {
    this.time += dt;
    const { width, height } = this.canvasEngine.getBounds();

    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;
    }

    for (const btn of this.buttons) {
      btn.update(dt, this.inputManager);
    }

    for (const item of this.cardButtons) {
      item.btn.y = item.origY - this.scrollY;
      item.btn.update(dt, this.inputManager);
    }
  }

  drawScientificIcon(ctx, x, y, catId, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 1.5;

    if (catId === 'KINEMATICS') {
      // Parabolic trajectory icon
      ctx.beginPath();
      ctx.moveTo(x - 12, y + 8);
      ctx.quadraticCurveTo(x, y - 12, x + 12, y + 8);
      ctx.stroke();
      Renderer.drawCircle(ctx, x, y - 6, 2.5, { fill: color });
    } else if (catId === 'FORCES') {
      // Force vector arrows icon
      Renderer.drawLine(ctx, x - 10, y, x + 10, y, { stroke: color, lineWidth: 2 });
      Renderer.drawLine(ctx, x + 6, y - 4, x + 10, y, { stroke: color, lineWidth: 2 });
      Renderer.drawLine(ctx, x + 6, y + 4, x + 10, y, { stroke: color, lineWidth: 2 });
    } else if (catId === 'ENERGY') {
      // Energy bar chart icon
      Renderer.drawRect(ctx, x - 10, y - 4, 5, 12, { fill: Colors.cyan });
      Renderer.drawRect(ctx, x - 2, y - 10, 5, 18, { fill: Colors.green });
      Renderer.drawRect(ctx, x + 6, y - 14, 5, 22, { fill: Colors.yellow });
    } else if (catId === 'ROTATION') {
      // Spinning disc icon
      Renderer.drawCircle(ctx, x, y, 10, { stroke: color, lineWidth: 1.5 });
      Renderer.drawCircle(ctx, x, y, 3, { fill: color });
    } else if (catId === 'GRAVITATION') {
      // Planet orbit ring icon
      Renderer.drawCircle(ctx, x, y, 5, { fill: color });
      ctx.beginPath();
      ctx.ellipse(x, y, 12, 5, Math.PI / 6, 0, Math.PI * 2);
      ctx.stroke();
    } else if (catId === 'SHM_WAVES') {
      // Sine wave icon
      ctx.beginPath();
      for (let i = -12; i <= 12; i += 2) {
        const wy = y + Math.sin(i * 0.3) * 6;
        if (i === -12) ctx.moveTo(x + i, wy);
        else ctx.lineTo(x + i, wy);
      }
      ctx.stroke();
    } else {
      // Advanced atom/particle icon
      Renderer.drawCircle(ctx, x, y, 4, { fill: color });
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  render(ctx) {
    const { width, height } = this.canvasEngine.getBounds();

    Renderer.drawRect(ctx, 0, 0, width, height, { fill: Colors.background });
    Renderer.drawGrid(ctx, width, height, 40);

    for (const p of this.particles) {
      Renderer.drawCircle(ctx, p.x, p.y, p.radius, {
        fill: p.color,
        opacity: p.alpha
      });
    }

    const centerX = width / 2;

    // Header Title
    Renderer.drawText(ctx, 'MECHANICS LABORATORY', centerX, 24, {
      fill: Colors.cyan,
      font: '900 24px "Segoe UI", Roboto, sans-serif',
      align: 'center',
      baseline: 'middle',
      glowColor: Colors.cyan,
      glowBlur: 12
    });

    Renderer.drawText(ctx, 'Class 11 & Advanced Interactive Physics Engine • Real-Time Graphs & Calculus', centerX, 48, {
      fill: Colors.textMuted,
      font: '600 12px "Segoe UI", Roboto, sans-serif',
      align: 'center',
      baseline: 'middle',
      maxWidth: width - 360
    });

    // Stats bar
    Renderer.drawText(ctx, '40 EXPERIMENTS  •  20+ CHALLENGES  •  REAL-TIME GRAPHS  •  PHYSICS CALCULATIONS', centerX, 70, {
      fill: Colors.yellow,
      font: '700 10px "Segoe UI", Roboto, sans-serif',
      align: 'center',
      baseline: 'middle'
    });

    // Render fixed header buttons (back, featured, filter tabs)
    for (const btn of this.buttons) {
      btn.render(ctx);
    }

    // Scrollable Grid Cards with strict Canvas Clipping
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, this.gridAreaY - 4, width, height - this.gridAreaY + 4);
    ctx.clip();

    for (const item of this.cardButtons) {
      if (item.btn.y + item.btn.height >= this.gridAreaY - 10 && item.btn.y <= height + 20) {
        item.btn.render(ctx);
        this.drawScientificIcon(ctx, item.btn.x + item.btn.width - 24, item.btn.y + 22, item.mod.catId, item.mod.color || Colors.cyan);
      }
    }

    ctx.restore();

    // Custom Canvas Scrollbar Indicator
    if (this.maxScrollY > 0) {
      const scrollbarW = 6;
      const scrollbarTrackH = height - this.gridAreaY - 20;
      const thumbH = Math.max(30, (scrollbarTrackH / (scrollbarTrackH + this.maxScrollY)) * scrollbarTrackH);
      const thumbY = this.gridAreaY + (this.scrollY / this.maxScrollY) * (scrollbarTrackH - thumbH);

      Renderer.drawRoundedRect(ctx, width - 10, thumbY, scrollbarW, thumbH, 3, {
        fill: Colors.cyan,
        glowColor: Colors.cyan,
        glowBlur: 4
      });
    }
  }

  destroy() {
    this.buttons = [];
    this.cardButtons = [];
    this.particles = [];
  }
}
