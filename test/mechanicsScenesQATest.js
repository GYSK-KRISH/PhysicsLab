// Forensic QA Smoke Test for all Mechanics Laboratory Scenes in PhysicsLab
// Pure Node.js DOM mock — no external dependencies

global.window = {
  innerWidth: 1280,
  innerHeight: 720,
  devicePixelRatio: 1,
  addEventListener: () => {},
  removeEventListener: () => {}
};

global.document = {
  body: {
    style: {},
    appendChild: () => {}
  },
  createElement: (type) => {
    return {
      style: {},
      getContext: () => mockCtx,
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }),
      addEventListener: () => {},
      removeEventListener: () => {}
    };
  }
};

try {
  Object.defineProperty(globalThis, 'navigator', {
    value: { userAgent: 'NodeJS' },
    writable: true,
    configurable: true
  });
} catch (e) {}

class MockContext2D {
  save() {}
  restore() {}
  beginPath() {}
  closePath() {}
  moveTo() {}
  lineTo() {}
  stroke() {}
  fill() {}
  rect() {}
  arc() {}
  ellipse() {}
  clip() {}
  clearRect() {}
  fillRect() {}
  fillText() {}
  strokeText() {}
  measureText(txt) { return { width: (txt || '').length * 7 }; }
  setTransform() {}
  scale() {}
  translate() {}
  rotate() {}
  quadraticCurveTo() {}
  bezierCurveTo() {}
  setLineDash() {}
  getLineDash() { return []; }
  createLinearGradient() { return { addColorStop: () => {} }; }
  createRadialGradient() { return { addColorStop: () => {} }; }
}

const mockCtx = new MockContext2D();

class MockCanvasEngine {
  constructor(w = 1280, h = 720) {
    this.width = w;
    this.height = h;
    this.dpr = 1;
    this.ctx = mockCtx;
  }
  getBounds() {
    return { width: this.width, height: this.height, dpr: this.dpr };
  }
  screenToCanvas(x, y) { return { x, y }; }
}

const sceneModules = [
  { name: '01 Motion in 1D', path: '../physicslab/scenes/mechanics/kinematics1DScene.js', className: 'Kinematics1DScene' },
  { name: '02 Motion in 2D', path: '../physicslab/scenes/mechanics/kinematics2DScene.js', className: 'Kinematics2DScene' },
  { name: '03 Projectile Motion', path: '../physicslab/scenes/mechanics/projectileLabScene.js', className: 'ProjectileLabScene' },
  { name: '04 Relative Motion', path: '../physicslab/scenes/mechanics/relativeMotionScene.js', className: 'RelativeMotionScene' },
  { name: '05 Newton\'s Laws', path: '../physicslab/scenes/mechanics/newtonLawsScene.js', className: 'NewtonLawsScene' },
  { name: '06 Friction Lab', path: '../physicslab/scenes/mechanics/frictionScene.js', className: 'FrictionScene' },
  { name: '07 Inclined Plane', path: '../physicslab/scenes/mechanics/inclinedPlaneScene.js', className: 'InclinedPlaneScene' },
  { name: '08 Circular Motion', path: '../physicslab/scenes/mechanics/circularMotionScene.js', className: 'CircularMotionScene' },
  { name: '09 Banked Road', path: '../physicslab/scenes/mechanics/bankedRoadScene.js', className: 'BankedRoadScene' },
  { name: '10 Work Laboratory', path: '../physicslab/scenes/mechanics/workLabScene.js', className: 'WorkLabScene' },
  { name: '11 Variable Force', path: '../physicslab/scenes/mechanics/variableForceScene.js', className: 'VariableForceScene' },
  { name: '12 Work-Energy Theorem', path: '../physicslab/scenes/mechanics/workEnergyScene.js', className: 'WorkEnergyScene' },
  { name: '13 Power Lab', path: '../physicslab/scenes/mechanics/powerLabScene.js', className: 'PowerLabScene' },
  { name: '14 Collision Lab 1D', path: '../physicslab/scenes/mechanics/collision1DScene.js', className: 'Collision1DScene' },
  { name: '15 Centre of Mass', path: '../physicslab/scenes/mechanics/centerOfMassScene.js', className: 'CenterOfMassScene' },
  { name: '16 Rotational Dynamics', path: '../physicslab/scenes/mechanics/rotationScene.js', className: 'RotationScene' },
  { name: '17 Moment of Inertia', path: '../physicslab/scenes/mechanics/momentOfInertiaScene.js', className: 'MomentOfInertiaScene' },
  { name: '18 Rolling Motion', path: '../physicslab/scenes/mechanics/rollingMotionScene.js', className: 'RollingMotionScene' },
  { name: '19 Torque Lab', path: '../physicslab/scenes/mechanics/torqueLabScene.js', className: 'TorqueLabScene' },
  { name: '20 Angular Momentum', path: '../physicslab/scenes/mechanics/angularMomentumScene.js', className: 'AngularMomentumScene' },
  { name: '21 Gravitation', path: '../physicslab/scenes/mechanics/gravitationScene.js', className: 'GravitationScene' },
  { name: '22 Gravitational Field', path: '../physicslab/scenes/mechanics/gravitationalFieldScene.js', className: 'GravitationalFieldScene' },
  { name: '23 Gravitational Potential', path: '../physicslab/scenes/mechanics/gravitationalPotentialScene.js', className: 'GravitationalPotentialScene' },
  { name: '24 Escape Velocity', path: '../physicslab/scenes/mechanics/escapeVelocityScene.js', className: 'EscapeVelocityScene' },
  { name: '25 Satellite Orbit', path: '../physicslab/scenes/mechanics/satelliteOrbitScene.js', className: 'SatelliteOrbitScene' },
  { name: '26 Geostationary Orbit', path: '../physicslab/scenes/mechanics/geostationaryOrbitScene.js', className: 'GeostationaryOrbitScene' },
  { name: '27 Simple Harmonic Motion', path: '../physicslab/scenes/mechanics/shmScene.js', className: 'SHMScene' },
  { name: '28 SHM Energy', path: '../physicslab/scenes/mechanics/shmEnergyScene.js', className: 'SHMEnergyScene' },
  { name: '29 Spring Laboratory', path: '../physicslab/scenes/mechanics/springLabScene.js', className: 'SpringLabScene' },
  { name: '30 Wave Laboratory', path: '../physicslab/scenes/mechanics/waveLabScene.js', className: 'WaveLabScene' },
  { name: '31 Superposition', path: '../physicslab/scenes/mechanics/superpositionScene.js', className: 'SuperpositionScene' },
  { name: '32 Standing Waves', path: '../physicslab/scenes/mechanics/standingWaveScene.js', className: 'StandingWaveScene' },
  { name: '33 Beats', path: '../physicslab/scenes/mechanics/beatsScene.js', className: 'BeatsScene' },
  { name: '34 COM Frame Collision', path: '../physicslab/scenes/mechanics/comCollisionScene.js', className: 'COMCollisionScene' },
  { name: '35 Advanced 2D Collision', path: '../physicslab/scenes/mechanics/collision2DScene.js', className: 'Collision2DScene' },
  { name: '36 Damped Oscillation', path: '../physicslab/scenes/mechanics/dampedOscillationScene.js', className: 'DampedOscillationScene' },
  { name: '37 Forced Oscillation', path: '../physicslab/scenes/mechanics/forcedOscillationScene.js', className: 'ForcedOscillationScene' },
  { name: '38 Resonance', path: '../physicslab/scenes/mechanics/resonanceScene.js', className: 'ResonanceScene' },
  { name: '39 Conservation Laws', path: '../physicslab/scenes/mechanics/conservationLawsScene.js', className: 'ConservationLawsScene' },
  { name: '40 Formula Library', path: '../physicslab/scenes/mechanics/formulaLibraryScene.js', className: 'FormulaLibraryScene' },
  { name: '41 Numerical Problems', path: '../physicslab/scenes/mechanics/numericalProblemsScene.js', className: 'NumericalProblemsScene' },
  { name: '42 Challenges Bank', path: '../physicslab/scenes/mechanics/challengesScene.js', className: 'ChallengesScene' },
  { name: '43 Mechanics Dashboard Hub', path: '../physicslab/scenes/mechanics/mechanicsMenuScene.js', className: 'MechanicsMenuScene' }
];

async function runQA() {
  console.log('====================================================');
  console.log('PHYSICSLAB MECHANICS FORENSIC QA & SMOKE TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  for (const s of sceneModules) {
    try {
      const mod = await import(s.path);
      const SceneClass = mod[s.className];

      if (!SceneClass) {
        throw new Error(`Export ${s.className} not found in ${s.path}`);
      }

      const instance = new SceneClass();
      const canvasEngine = new MockCanvasEngine(1280, 720);
      instance.canvasEngine = canvasEngine;

      if (typeof instance.init === 'function') {
        instance.init();
      } else if (typeof instance.rebuildUI === 'function') {
        instance.rebuildUI();
      }

      // Verify update loop at 60 FPS (dt = 0.016)
      if (typeof instance.update === 'function') {
        instance.update(0.016);
      }

      // Verify rendering
      if (typeof instance.render === 'function') {
        instance.render(mockCtx);
      }

      // Test mobile viewport resize without reload
      canvasEngine.width = 390;
      canvasEngine.height = 844;
      if (typeof instance.rebuildUI === 'function') {
        instance.rebuildUI();
      }
      if (typeof instance.update === 'function') {
        instance.update(0.016);
      }
      if (typeof instance.render === 'function') {
        instance.render(mockCtx);
      }

      console.log(`  [PASS] ${s.name} initialized, rendered & resized cleanly.`);
      passed++;
    } catch (err) {
      console.error(`  [FAIL] ${s.name}: ${err.message}`);
      failed++;
    }
  }

  console.log('\n====================================================');
  console.log(`TOTAL SCENES TESTED: ${sceneModules.length} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runQA();
