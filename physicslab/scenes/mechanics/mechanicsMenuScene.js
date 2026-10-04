// Mechanics Laboratory Main Hub & Navigation Menu for PhysicsLab
import { Colors, Renderer } from '../../engine/renderer.js';
import { Button } from '../../engine/ui.js';

export class MechanicsMenuScene {
  constructor() {
    this.buttons = [];
    this.particles = [];
    this.lastWidth = 0;
    this.lastHeight = 0;
    this.time = 0;
    this.activeTab = 'CLASS11'; // 'CLASS11' | 'ADVANCED' | 'CHALLENGES' | 'FORMULAS' | 'PROBLEMS'
  }

  init() {
    this.initParticles();
    this.rebuildUI();
  }

  initParticles() {
    const count = 40;
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * (window.innerWidth || 1000),
        y: Math.random() * (window.innerHeight || 800),
        vx: (Math.random() - 0.5) * 20,
        vy: (Math.random() - 0.5) * 20,
        radius: Math.random() * 2.5 + 1,
        alpha: Math.random() * 0.4 + 0.1,
        color: Math.random() > 0.5 ? Colors.cyan : Colors.yellow
      });
    }
  }

  rebuildUI() {
    const { width, height } = this.canvasEngine.getBounds();
    this.buttons = [];

    // Header & Navigation Buttons
    const backBtn = new Button({
      x: 20,
      y: 16,
      width: 150,
      height: 38,
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

    // Mode / Tab Selection Buttons
    const tabs = [
      { id: 'CLASS11', text: 'CLASS 11 MECHANICS (01-33)', color: Colors.cyan },
      { id: 'ADVANCED', text: 'ADVANCED MECHANICS (34-40)', color: Colors.yellow },
      { id: 'CHALLENGES', text: 'CHALLENGES (35+)', color: Colors.green },
      { id: 'FORMULAS', text: 'FORMULA LIBRARY', color: Colors.purple },
      { id: 'PROBLEMS', text: 'NUMERICAL PROBLEMS', color: Colors.cyan }
    ];

    const tabY = 70;
    const tabCount = tabs.length;
    const tabGap = 8;
    const tabTotalW = width - 40;
    const tabW = Math.max(140, Math.min(200, (tabTotalW - (tabCount - 1) * tabGap) / tabCount));

    let tabX = 20;
    for (const tab of tabs) {
      const isSelected = this.activeTab === tab.id;
      const tBtn = new Button({
        x: tabX,
        y: tabY,
        width: tabW,
        height: 36,
        text: tab.text,
        accentColor: isSelected ? tab.color : Colors.panelBorder,
        callback: () => {
          this.activeTab = tab.id;
          if (tab.id === 'FORMULAS') {
            import('./formulaLibraryScene.js').then(m => this.sceneManager.changeScene(new m.FormulaLibraryScene()));
          } else if (tab.id === 'CHALLENGES') {
            import('./challengesScene.js').then(m => this.sceneManager.changeScene(new m.ChallengesScene()));
          } else if (tab.id === 'PROBLEMS') {
            import('./numericalProblemsScene.js').then(m => this.sceneManager.changeScene(new m.NumericalProblemsScene()));
          } else {
            this.rebuildUI();
          }
        }
      });
      this.buttons.push(tBtn);
      tabX += tabW + tabGap;
    }

    // Grid of Lab Modules based on activeTab
    const modules = this.getModulesForActiveTab();
    const isMobile = width < 768;
    const columns = isMobile ? 1 : (width < 1200 ? 2 : 3);
    const cardWidth = Math.max(260, Math.floor((width - 40 - (columns - 1) * 16) / columns));
    const startY = tabY + 54;

    let colIndex = 0;
    let rowIndex = 0;

    for (const mod of modules) {
      const cardHeight = 72;
      const cardX = 20 + colIndex * (cardWidth + 16);
      const cardY = startY + rowIndex * (cardHeight + 12);

      const btn = new Button({
        x: cardX,
        y: cardY,
        width: cardWidth,
        height: cardHeight,
        text: mod.title,
        subtext: mod.desc,
        badgeText: 'ACTIVE',
        badgeColor: Colors.green,
        accentColor: mod.color || Colors.cyan,
        callback: () => {
          if (this.sceneManager && mod.scene) {
            mod.scene().then(scene => this.sceneManager.changeScene(scene));
          }
        }
      });
      this.buttons.push(btn);

      colIndex++;
      if (colIndex >= columns) {
        colIndex = 0;
        rowIndex++;
      }
    }
  }

  getModulesForActiveTab() {
    if (this.activeTab === 'CLASS11') {
      return [
        { title: '01 Motion in 1D', desc: 'Uniform motion, acceleration, free fall & x-t, v-t graphs', color: Colors.cyan, scene: () => import('./kinematics1DScene.js').then(m => new m.Kinematics1DScene()) },
        { title: '02 Motion in 2D', desc: '2D vector decomposition, vx, vy, ax, ay components', color: Colors.cyan, scene: () => import('./kinematics2DScene.js').then(m => new m.Kinematics2DScene()) },
        { title: '03 Projectile Motion', desc: 'Launch angles, max height, range & air resistance integration', color: Colors.cyan, scene: () => import('./projectileLabScene.js').then(m => new m.ProjectileLabScene()) },
        { title: '04 Relative Motion', desc: 'V_AB = V_A - V_B, river-boat drift & rain-umbrella vectors', color: Colors.cyan, scene: () => import('./relativeMotionScene.js').then(m => new m.RelativeMotionScene()) },
        { title: '05 Newton\'s Laws', desc: 'Forces, acceleration & Free Body Diagram (FBD)', color: Colors.yellow, scene: () => import('./newtonLawsScene.js').then(m => new m.NewtonLawsScene()) },
        { title: '06 Friction Lab', desc: 'Static vs kinetic friction & breakaway threshold', color: Colors.yellow, scene: () => import('./frictionScene.js').then(m => new m.FrictionScene()) },
        { title: '07 Inclined Plane', desc: 'mg sin θ, mg cos θ, normal force & sliding acceleration', color: Colors.yellow, scene: () => import('./inclinedPlaneScene.js').then(m => new m.InclinedPlaneScene()) },
        { title: '08 Circular Motion', desc: 'Centripetal acceleration a_c = v²/r & centripetal force', color: Colors.green, scene: () => import('./circularMotionScene.js').then(m => new m.CircularMotionScene()) },
        { title: '09 Banked Road', desc: 'tan θ = v²/(rg), friction limits & safe speed margins', color: Colors.green, scene: () => import('./bankedRoadScene.js').then(m => new m.BankedRoadScene()) },
        { title: '10 Work Laboratory', desc: 'W = F·d·cos θ, positive, negative & zero work presets', color: Colors.purple, scene: () => import('./workLabScene.js').then(m => new m.WorkLabScene()) },
        { title: '11 Variable Force', desc: 'Interactive F-x curve & numerical integral W = ∫F dx', color: Colors.purple, scene: () => import('./variableForceScene.js').then(m => new m.VariableForceScene()) },
        { title: '12 Work-Energy Theorem', desc: 'W_net = ΔK kinetic energy verification & difference tracking', color: Colors.purple, scene: () => import('./workEnergyScene.js').then(m => new m.WorkEnergyScene()) },
        { title: '13 Power Lab', desc: 'P = W/t, P = F·v, instantaneous & average power', color: Colors.purple, scene: () => import('./powerLabScene.js').then(m => new m.PowerLabScene()) },
        { title: '14 Collision Lab', desc: '1D elastic, inelastic & perfectly inelastic collisions', color: Colors.cyan, scene: () => import('./collision1DScene.js').then(m => new m.Collision1DScene()) },
        { title: '15 Centre of Mass', desc: 'Multi-particle system, draggable masses & live COM marker', color: Colors.cyan, scene: () => import('./centerOfMassScene.js').then(m => new m.CenterOfMassScene()) },
        { title: '16 Rotational Dynamics', desc: 'τ = I·α, angular acceleration & rotational KE', color: Colors.yellow, scene: () => import('./rotationScene.js').then(m => new m.RotationScene()) },
        { title: '17 Moment of Inertia', desc: 'Ring, disc, solid sphere, hollow sphere & rod formulas', color: Colors.yellow, scene: () => import('./momentOfInertiaScene.js').then(m => new m.MomentOfInertiaScene()) },
        { title: '18 Rolling Motion', desc: 'Incline race between bodies with v = ωR & energy breakdown', color: Colors.yellow, scene: () => import('./rollingMotionScene.js').then(m => new m.RollingMotionScene()) },
        { title: '19 Torque Lab', desc: 'Lever mechanics τ = r·F·sin θ & clockwise/counterclockwise torque', color: Colors.yellow, scene: () => import('./torqueLabScene.js').then(m => new m.TorqueLabScene()) },
        { title: '20 Angular Momentum', desc: 'L = I·ω conservation & contracting radius skater effect', color: Colors.yellow, scene: () => import('./angularMomentumScene.js').then(m => new m.AngularMomentumScene()) },
        { title: '21 Gravitation', desc: 'Universal law F = Gm₁m₂/r², attractive vectors & PE', color: Colors.green, scene: () => import('./gravitationScene.js').then(m => new m.GravitationScene()) },
        { title: '22 Gravitational Field', desc: 'Multi-mass vector field grid with true vector summation', color: Colors.green, scene: () => import('./gravitationalFieldScene.js').then(m => new m.GravitationalFieldScene()) },
        { title: '23 Gravitational Potential', desc: 'V = -GM/r potential well with safe r→0 handling', color: Colors.green, scene: () => import('./gravitationalPotentialScene.js').then(m => new m.GravitationalPotentialScene()) },
        { title: '24 Escape Velocity', desc: 'v_e = √(2GM/R), Earth, Moon, Mars & Custom presets', color: Colors.green, scene: () => import('./escapeVelocityScene.js').then(m => new m.EscapeVelocityScene()) },
        { title: '25 Satellite Orbit', desc: 'v = √(GM/r), T = 2π√(r³/GM) circular & elliptical paths', color: Colors.green, scene: () => import('./satelliteOrbitScene.js').then(m => new m.SatelliteOrbitScene()) },
        { title: '26 Geostationary Orbit', desc: 'Earth synchronized rotation, equatorial orbit & altitude', color: Colors.green, scene: () => import('./geostationaryOrbitScene.js').then(m => new m.GeostationaryOrbitScene()) },
        { title: '27 Simple Harmonic Motion', desc: 'x = A·cos(ωt + φ), spring-mass displacement, vel & acc', color: Colors.cyan, scene: () => import('./shmScene.js').then(m => new m.SHMScene()) },
        { title: '28 SHM Energy', desc: 'KE + PE = ½kA² constant total energy live time curves', color: Colors.cyan, scene: () => import('./shmEnergyScene.js').then(m => new m.SHMEnergyScene()) },
        { title: '29 Spring Laboratory', desc: 'Single, series (1/k) & parallel (k1+k2) spring combinations', color: Colors.cyan, scene: () => import('./springLabScene.js').then(m => new m.SpringLabScene()) },
        { title: '30 Wave Laboratory', desc: 'v = f·λ transverse & longitudinal wave propagation', color: Colors.purple, scene: () => import('./waveLabScene.js').then(m => new m.WaveLabScene()) },
        { title: '31 Superposition', desc: 'Wave 1 + Wave 2 = Resultant constructive/destructive interference', color: Colors.purple, scene: () => import('./superpositionScene.js').then(m => new m.SuperpositionScene()) },
        { title: '32 Standing Waves', desc: 'Nodes & antinodes on string with tension T & harmonics n=1..5', color: Colors.purple, scene: () => import('./standingWaveScene.js').then(m => new m.StandingWaveScene()) },
        { title: '33 Beats', desc: 'f_b = |f1 - f2| acoustic beats with amplitude modulation envelope', color: Colors.purple, scene: () => import('./beatsScene.js').then(m => new m.BeatsScene()) }
      ];
    } else {
      // ADVANCED TABS (34 - 40)
      return [
        { title: '34 COM Frame Collision', desc: 'Simultaneous Lab Frame and Centre-of-Mass Frame viewports', color: Colors.cyan, scene: () => import('./comCollisionScene.js').then(m => new m.COMCollisionScene()) },
        { title: '35 Advanced 2D Collision', desc: 'Oblique impact geometry & 2D vector momentum conservation', color: Colors.cyan, scene: () => import('./collision2DScene.js').then(m => new m.Collision2DScene()) },
        { title: '36 Damped Oscillation', desc: 'Underdamped, critical, overdamped (c² vs 4mk) & decay envelope', color: Colors.yellow, scene: () => import('./dampedOscillationScene.js').then(m => new m.DampedOscillationScene()) },
        { title: '37 Forced Oscillation', desc: 'm·x\'\' + c·x\' + k·x = F0·cos(ωt) driven oscillator physics', color: Colors.yellow, scene: () => import('./forcedOscillationScene.js').then(m => new m.ForcedOscillationScene()) },
        { title: '38 Resonance', desc: 'Dynamic resonance peak & amplitude-frequency response curve', color: Colors.yellow, scene: () => import('./resonanceScene.js').then(m => new m.ResonanceScene()) },
        { title: '39 Advanced Orbital Mechanics', desc: 'Vis-viva equation v² = GM(2/r - 1/a) & Keplerian orbits', color: Colors.green, scene: () => import('./satelliteOrbitScene.js').then(m => new m.SatelliteOrbitScene()) },
        { title: '40 Conservation Laws', desc: 'Unified Momentum, Energy, and Angular Momentum monitor', color: Colors.purple, scene: () => import('./conservationLawsScene.js').then(m => new m.ConservationLawsScene()) }
      ];
    }
  }

  handleInput(inputManager) {
    const { width, height } = this.canvasEngine.getBounds();
    if (this.lastWidth !== width || this.lastHeight !== height) {
      this.lastWidth = width;
      this.lastHeight = height;
      this.rebuildUI();
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

    Renderer.drawText(ctx, 'Class 11 & Advanced Interactive Physics Simulation Suite', centerX, 48, {
      fill: Colors.textMuted,
      font: '600 13px "Segoe UI", Roboto, sans-serif',
      align: 'center',
      baseline: 'middle'
    });

    for (const btn of this.buttons) {
      btn.render(ctx);
    }
  }

  destroy() {
    this.buttons = [];
    this.particles = [];
  }
}
