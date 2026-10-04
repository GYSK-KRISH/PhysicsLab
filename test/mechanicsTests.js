// Comprehensive Mechanics Mathematical Engine & Conservation Tests
import { Vector2D } from '../physicslab/physics/mechanics/vector2d.js';
import { MechanicsMath } from '../physicslab/physics/mechanics/mechanicsMath.js';
import { Kinematics1DPhysics, Kinematics2DPhysics } from '../physicslab/physics/mechanics/kinematics.js';
import { AdvancedProjectilePhysics } from '../physicslab/physics/mechanics/projectile.js';
import { CircularMotionPhysics } from '../physicslab/physics/mechanics/circularMotion.js';
import { WorkEnergyPhysics } from '../physicslab/physics/mechanics/workEnergy.js';
import { TorquePhysics } from '../physicslab/physics/mechanics/torque.js';
import { GravitationPhysics } from '../physicslab/physics/mechanics/gravitation.js';
import { SHMPhysics, SpringCombinationsPhysics, DampedOscillationPhysics } from '../physicslab/physics/mechanics/shm.js';
import { WaveLabPhysics, BeatsPhysics, StandingWavePhysics } from '../physicslab/physics/mechanics/waves.js';
import { Collision1DPhysics, Collision2DPhysics } from '../physicslab/physics/mechanics/collision.js';
import { AngularMomentumPhysics } from '../physicslab/physics/mechanics/angularMomentum.js';
import { MomentOfInertiaCalculator } from '../physicslab/physics/mechanics/rotation.js';
import { MechanicsProblemGenerator } from '../physicslab/physics/mechanics/problems.js';
import { ChallengesBank } from '../physicslab/physics/mechanics/challenges.js';
import { FormulaLibraryData } from '../physicslab/physics/mechanics/formulaLibraryData.js';

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${message}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] ${message}`);
  }
}

function assertClose(actual, expected, tolerance = 1e-3, message = '') {
  const diff = Math.abs(actual - expected);
  const ok = diff <= tolerance;
  if (ok) {
    passedTests++;
    console.log(`  [PASS] ${message} (Expected ${expected.toFixed(4)}, Got ${actual.toFixed(4)})`);
  } else {
    failedTests++;
    console.error(`  [FAIL] ${message} (Expected ${expected.toFixed(4)}, Got ${actual.toFixed(4)}, Diff ${diff.toFixed(4)})`);
  }
}

console.log('====================================================');
console.log('PHYSICSLAB MECHANICS LABORATORY TEST SUITE');
console.log('====================================================\n');

// 1. Vector Engine Tests
console.log('1. Vector2D Engine Tests:');
{
  const v1 = new Vector2D(3, 4);
  assertClose(v1.magnitude(), 5, 1e-4, 'Vector magnitude (3, 4) -> 5');
  const vNorm = v1.unit();
  assertClose(vNorm.magnitude(), 1, 1e-4, 'Vector unit magnitude -> 1');
  const v2 = new Vector2D(1, 2);
  const vAdd = Vector2D.add(v1, v2);
  assert(vAdd.x === 4 && vAdd.y === 6, 'Vector addition (3,4) + (1,2) -> (4,6)');
  assertClose(v1.dot(v2), 11, 1e-4, 'Vector dot product (3,4) . (1,2) -> 11');
  assertClose(v1.cross(v2), 2, 1e-4, 'Vector 2D cross product -> 2');
}

// 2. Kinematics Tests (Section 64)
console.log('\n2. Kinematics 1D & 2D Tests:');
{
  // u = 10, a = 2, t = 5 => v = 20, s = 75
  const k1d = new Kinematics1DPhysics({ x0: 0, v0: 10, a: 2 });
  const state = k1d.getStateAt(5);
  assertClose(state.v, 20, 1e-4, 'Kinematics 1D v = u + at (10 + 2*5 -> 20 m/s)');
  assertClose(state.displacement, 75, 1e-4, 'Kinematics 1D s = ut + 0.5*a*t^2 (10*5 + 0.5*2*25 -> 75 m)');

  const k2d = new Kinematics2DPhysics({ x0: 0, y0: 0, vx0: 10, vy0: 20, ax: 0, ay: -9.81 });
  const k2dState = k2d.getStateAt(2);
  assertClose(k2dState.x, 20, 1e-4, 'Kinematics 2D x at t=2s');
  assertClose(k2dState.y, 20 * 2 - 0.5 * 9.81 * 4, 1e-3, 'Kinematics 2D y at t=2s');
}

// 3. Projectile Motion Tests (Section 64)
console.log('\n3. Projectile Motion Tests:');
{
  // u = 20, theta = 45 deg, g = 9.81
  const proj = new AdvancedProjectilePhysics({ velocity: 20, angle: 45, gravity: 9.81, launchHeight: 0 });
  const expectedRange = (20 * 20 * Math.sin(MechanicsMath.toRadians(90))) / 9.81;
  const expectedHMax = (20 * 20 * Math.pow(Math.sin(MechanicsMath.toRadians(45)), 2)) / (2 * 9.81);
  const expectedTof = (2 * 20 * Math.sin(MechanicsMath.toRadians(45))) / 9.81;

  assertClose(proj.rangeIdeal, expectedRange, 1e-3, 'Projectile Analytical Range (40.77 m)');
  assertClose(proj.maxHeightIdeal, expectedHMax, 1e-3, 'Projectile Max Height (10.19 m)');
  assertClose(proj.timeOfFlightIdeal, expectedTof, 1e-3, 'Projectile Time of Flight (2.88 s)');
}

// 4. Circular Motion Tests (Section 64)
console.log('\n4. Circular Motion Tests:');
{
  // v = 10, r = 5 => ac = 20 m/s^2
  const circ = new CircularMotionPhysics({ radius: 5, speed: 10, mass: 2 });
  assertClose(circ.centripetalAcc, 20, 1e-4, 'Centripetal acceleration ac = v^2 / r (100 / 5 -> 20 m/s^2)');
  assertClose(circ.centripetalForce, 40, 1e-4, 'Centripetal force Fc = m * ac (2 * 20 -> 40 N)');
  assertClose(circ.period, (2 * Math.PI * 5) / 10, 1e-4, 'Circular period T = 2*pi*r / v');
}

// 5. Work, Energy & Power Tests (Section 64)
console.log('\n5. Work, Energy & Power Tests:');
{
  // F = 10, d = 5, theta = 0 => W = 50 J
  const w1 = WorkEnergyPhysics.calculateWork(10, 5, 0);
  assertClose(w1.work, 50, 1e-4, 'Work W = F * d * cos(0) (10 * 5 -> 50 J)');

  const wNeg = WorkEnergyPhysics.calculateWork(10, 5, 180);
  assertClose(wNeg.work, -50, 1e-4, 'Work W = F * d * cos(180) -> -50 J');

  // Work-Energy theorem: mass=2, u=5, F=10, d=5 => a=5 => v^2 = 25 + 2*5*5 = 75 => v = sqrt(75)
  // W_net = 50 J, Delta_KE = 0.5*2*(75 - 25) = 50 J
  const vFinal = Math.sqrt(25 + 2 * (10 / 2) * 5);
  const we = WorkEnergyPhysics.checkWorkEnergyTheorem(2, 5, vFinal, 50);
  assertClose(we.initialKE, 25, 1e-4, 'Initial KE = 0.5 * 2 * 5^2 -> 25 J');
  assertClose(we.finalKE, 75, 1e-4, 'Final KE -> 75 J');
  assert(we.isConsistent, 'Work-Energy theorem verified (W_net == delta_KE)');
}

// 6. Torque Tests (Section 64)
console.log('\n6. Torque & Lever Tests:');
{
  // r = 2, F = 10, theta = 90 deg => tau = 20 N*m
  const tq = new TorquePhysics({ distance: 2, force: 10, angleDeg: 90 });
  assertClose(tq.torqueMagnitude, 20, 1e-4, 'Torque tau = r * F * sin(90) (2 * 10 -> 20 N*m)');
}

// 7. Moment of Inertia Tests (Section 28)
console.log('\n7. Moment of Inertia Tests:');
{
  const m = 3, r = 2, l = 4;
  assertClose(MomentOfInertiaCalculator.ring(m, r).I, 12, 1e-4, 'Ring I = M * R^2 (3 * 4 -> 12 kg*m^2)');
  assertClose(MomentOfInertiaCalculator.disc(m, r).I, 6, 1e-4, 'Disc I = 0.5 * M * R^2 -> 6 kg*m^2');
  assertClose(MomentOfInertiaCalculator.solidSphere(m, r).I, (2 / 5) * 3 * 4, 1e-4, 'Solid Sphere I = (2/5) * M * R^2 -> 4.8 kg*m^2');
  assertClose(MomentOfInertiaCalculator.rodCenter(m, l).I, (1 / 12) * 3 * 16, 1e-4, 'Rod about center I = (1/12) * M * L^2 -> 4 kg*m^2');
}

// 8. Gravitation & Keplerian Orbits Tests (Section 64)
console.log('\n8. Gravitation & Escape Velocity Tests:');
{
  const m1 = 100, m2 = 200, r = 10;
  const gForce1 = GravitationPhysics.calculateForce(m1, m2, r);
  const gForce2 = GravitationPhysics.calculateForce(m1, m2, r * 2);
  assertClose(gForce1.force / gForce2.force, 4.0, 1e-4, 'Gravitation inverse-square law F(r) / F(2r) = 4.0');

  // Escape velocity on Earth (M=5.972e24 kg, R=6.371e6 m)
  const veEarth = GravitationPhysics.calculateEscapeVelocity(5.972e24, 6.371e6);
  assertClose(veEarth.v_escape / 1000, 11.186, 0.05, 'Earth escape velocity ~ 11.2 km/s');
}

// 9. SHM & Spring System Tests (Section 64 & 65)
console.log('\n9. SHM & Spring System Tests:');
{
  const m = 2, k = 50, A = 4;
  const shm = new SHMPhysics({ mass: m, springConstant: k, amplitude: A });
  assertClose(shm.omega, Math.sqrt(50 / 2), 1e-4, 'SHM omega = sqrt(k/m) -> 5 rad/s');
  assertClose(shm.totalEnergy, 0.5 * 50 * 16, 1e-4, 'SHM Total Energy E = 0.5 * k * A^2 -> 400 J');

  // Verify Energy Conservation across cycle: KE + PE = E_total
  for (let t = 0; t <= 2 * Math.PI; t += 0.5) {
    const st = shm.getStateAt(t);
    assertClose(st.totalE, 400, 1e-4, `SHM energy conservation at t=${t.toFixed(1)}s (KE + PE = 400 J)`);
  }

  // Springs series & parallel
  const sSeries = SpringCombinationsPhysics.calculateSeries(100, 100);
  assertClose(sSeries.k_eff, 50, 1e-4, 'Springs in Series (100, 100) -> 50 N/m');
  const sParallel = SpringCombinationsPhysics.calculateParallel(100, 100);
  assertClose(sParallel.k_eff, 200, 1e-4, 'Springs in Parallel (100, 100) -> 200 N/m');
}

// 10. Wave Physics & Beats Tests (Section 64)
console.log('\n10. Wave Physics, Standing Waves & Beats Tests:');
{
  // v = f * lambda
  const wave = new WaveLabPhysics({ amplitude: 2, frequency: 5, wavelength: 4 });
  assertClose(wave.waveSpeed, 20, 1e-4, 'Wave speed v = f * lambda (5 * 4 -> 20 m/s)');

  // Standing wave harmonics
  const stWave = new StandingWavePhysics({ length: 10, tension: 100, linearDensity: 0.01, harmonicN: 2 });
  assertClose(stWave.waveSpeed, 100, 1e-4, 'String wave speed v = sqrt(T / mu) (sqrt(100 / 0.01) -> 100 m/s)');
  assertClose(stWave.wavelength, 10, 1e-4, 'Standing wave harmonic lambda_2 = 2L / 2 -> 10 m');
  assertClose(stWave.frequency, 10, 1e-4, 'Standing wave harmonic frequency f_2 = 10 Hz');

  // Beats: fb = |f1 - f2|
  const beats = new BeatsPhysics({ f1: 256, f2: 260, amplitude: 2 });
  assertClose(beats.beatFrequency, 4, 1e-4, 'Beat frequency fb = |256 - 260| -> 4 Hz');
}

// 11. Conservation of Momentum & Energy in Collisions (Section 65)
console.log('\n11. Collision & Angular Momentum Conservation Tests:');
{
  // 1D Elastic Collision: m1=3, u1=6, m2=2, u2=-4
  const c1d = new Collision1DPhysics({ m1: 3, u1: 6, m2: 2, u2: -4, restitution: 1.0 });
  const pInitial = 3 * 6 + 2 * (-4); // 18 - 8 = 10
  const keInitial = 0.5 * 3 * 36 + 0.5 * 2 * 16; // 54 + 16 = 70
  const pFinal = 3 * c1d.v1 + 2 * c1d.v2;
  const keFinal = 0.5 * 3 * c1d.v1 * c1d.v1 + 0.5 * 2 * c1d.v2 * c1d.v2;

  assertClose(pFinal, pInitial, 1e-4, '1D Elastic Collision Momentum Conservation (p = 10 kg*m/s)');
  assertClose(keFinal, keInitial, 1e-4, '1D Elastic Collision Kinetic Energy Conservation (KE = 70 J)');

  // Angular Momentum Conservation
  const am = new AngularMomentumPhysics({ mass: 2, initialRadius: 4, initialOmega: 3 });
  assertClose(am.initialL, 2 * 16 * 3, 1e-4, 'Initial Angular Momentum L = m * r^2 * omega (96 kg*m^2/s)');
  am.setRadius(2); // r halves => I = 0.25 => omega must quadruple
  assertClose(am.currentL, am.initialL, 1e-4, 'Angular Momentum Conservation on Radius Contraction');
  assertClose(am.currentOmega, 12, 1e-4, 'Contracted Angular Velocity omega -> 12 rad/s');
}

// 12. Problem Generator & Challenges Bank Tests
console.log('\n12. Educational Database & Problem Generator Tests:');
{
  const prob1 = MechanicsProblemGenerator.generateRandomProblem('PROJECTILE_RANGE');
  assert(prob1 && prob1.correctAnswer > 0, 'MechanicsProblemGenerator generated valid projectile problem');
  const validCheck = MechanicsProblemGenerator.checkAnswer(prob1, prob1.correctAnswer.toString());
  assert(validCheck.isCorrect, 'MechanicsProblemGenerator verified correct answer within tolerance');

  const c11List = ChallengesBank.getByCategory('CLASS11');
  assert(c11List.length >= 20, `Class 11 Challenges count (${c11List.length} >= 20)`);
  const advList = ChallengesBank.getByCategory('ADVANCED');
  assert(advList.length >= 15, `Advanced Challenges count (${advList.length} >= 15)`);

  const formulaCats = FormulaLibraryData.getCategories();
  assert(formulaCats.length >= 12, `Formula Library categories count (${formulaCats.length} >= 12)`);
}

console.log('\n====================================================');
console.log(`TOTAL TESTS: ${passedTests + failedTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
console.log('====================================================');

if (failedTests > 0) {
  process.exit(1);
}
