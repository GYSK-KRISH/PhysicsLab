// Numerical Physics Problem Generator for PhysicsLab Mechanics
import { MechanicsMath } from './mechanicsMath.js';

export class MechanicsProblemGenerator {
  static problemTypes = [
    'KINEMATICS_1D_STOPPING',
    'PROJECTILE_RANGE',
    'PROJECTILE_MAX_HEIGHT',
    'CIRCULAR_CENTRIPETAL_FORCE',
    'WORK_DONE',
    'MOMENTUM_ELASTIC_COLLISION',
    'TORQUE_LEVER',
    'GRAVITY_FORCE',
    'ESCAPE_VELOCITY',
    'SHM_TIME_PERIOD',
    'WAVE_SPEED',
    'BEAT_FREQUENCY'
  ];

  static generateRandomProblem(type = null) {
    const chosenType = type || this.problemTypes[Math.floor(Math.random() * this.problemTypes.length)];

    switch (chosenType) {
      case 'KINEMATICS_1D_STOPPING': {
        const v0 = Math.floor(Math.random() * 20 + 10); // 10 to 30 m/s
        const a = -(Math.floor(Math.random() * 4 + 2)); // -2 to -5 m/s^2
        // v^2 = u^2 + 2*a*s => s = -u^2 / (2*a)
        const s = -(v0 * v0) / (2 * a);
        return {
          id: 'KIN_1',
          category: 'Kinematics',
          question: `A car travelling at ${v0} m/s applies brakes with deceleration ${Math.abs(a)} m/s². What is the stopping distance?`,
          unit: 'm',
          correctAnswer: s,
          formula: 's = u² / (2a)',
          solution: `Given u = ${v0} m/s, a = ${a} m/s², v = 0 m/s.\nUsing v² = u² + 2as:\n0 = ${v0}² + 2(${a})s\ns = ${s.toFixed(2)} m.`,
          tolerancePct: 3.0
        };
      }

      case 'PROJECTILE_RANGE': {
        const u = Math.floor(Math.random() * 20 + 15); // 15 to 35 m/s
        const angles = [30, 45, 60];
        const theta = angles[Math.floor(Math.random() * angles.length)];
        const g = 9.81;
        const rad = MechanicsMath.toRadians(theta);
        const R = (u * u * Math.sin(2 * rad)) / g;
        return {
          id: 'PROJ_1',
          category: 'Projectile Motion',
          question: `A ball is projected with speed ${u} m/s at an angle of ${theta}° to the horizontal (g = 9.81 m/s²). Calculate the horizontal range.`,
          unit: 'm',
          correctAnswer: R,
          formula: 'R = (u²·sin 2θ) / g',
          solution: `R = (${u}² × sin(${2 * theta}°)) / 9.81 = ${R.toFixed(2)} m.`,
          tolerancePct: 3.0
        };
      }

      case 'PROJECTILE_MAX_HEIGHT': {
        const u = Math.floor(Math.random() * 25 + 15);
        const theta = 45;
        const g = 9.81;
        const rad = MechanicsMath.toRadians(theta);
        const H = (u * u * Math.sin(rad) * Math.sin(rad)) / (2 * g);
        return {
          id: 'PROJ_2',
          category: 'Projectile Motion',
          question: `A projectile is launched at ${u} m/s at an angle of ${theta}° (g = 9.81 m/s²). What is the maximum height reached?`,
          unit: 'm',
          correctAnswer: H,
          formula: 'H = (u²·sin²θ) / (2g)',
          solution: `H = (${u}² × sin²(${theta}°)) / (2 × 9.81) = ${H.toFixed(2)} m.`,
          tolerancePct: 3.0
        };
      }

      case 'CIRCULAR_CENTRIPETAL_FORCE': {
        const m = Math.floor(Math.random() * 5 + 1); // 1 to 5 kg
        const v = Math.floor(Math.random() * 10 + 5); // 5 to 15 m/s
        const r = Math.floor(Math.random() * 4 + 2); // 2 to 5 m
        const Fc = (m * v * v) / r;
        return {
          id: 'CIRC_1',
          category: 'Circular Motion',
          question: `A mass of ${m} kg moves along a circle of radius ${r} m at constant speed ${v} m/s. Calculate the centripetal force.`,
          unit: 'N',
          correctAnswer: Fc,
          formula: 'F_c = m·v² / r',
          solution: `F_c = (${m} × ${v}²) / ${r} = ${Fc.toFixed(2)} N.`,
          tolerancePct: 2.0
        };
      }

      case 'WORK_DONE': {
        const F = Math.floor(Math.random() * 40 + 10);
        const d = Math.floor(Math.random() * 10 + 2);
        const theta = 60;
        const W = F * d * Math.cos(MechanicsMath.toRadians(theta));
        return {
          id: 'WORK_1',
          category: 'Work & Energy',
          question: `A force of ${F} N acts on a body displacing it by ${d} m at an angle of ${theta}° to the displacement. Calculate the work done.`,
          unit: 'J',
          correctAnswer: W,
          formula: 'W = F·d·cos θ',
          solution: `W = ${F} × ${d} × cos(${theta}°) = ${W.toFixed(2)} J.`,
          tolerancePct: 2.0
        };
      }

      case 'MOMENTUM_ELASTIC_COLLISION': {
        const m = Math.floor(Math.random() * 4 + 2);
        const v = Math.floor(Math.random() * 6 + 3);
        const p = m * v;
        return {
          id: 'COLL_1',
          category: 'Momentum',
          question: `Find the magnitude of linear momentum of a vehicle of mass ${m} kg moving at ${v} m/s.`,
          unit: 'kg·m/s',
          correctAnswer: p,
          formula: 'p = m·v',
          solution: `p = ${m} × ${v} = ${p.toFixed(2)} kg·m/s.`,
          tolerancePct: 2.0
        };
      }

      case 'TORQUE_LEVER': {
        const r = Math.floor(Math.random() * 3 + 2); // 2 to 4 m
        const F = Math.floor(Math.random() * 30 + 10); // 10 to 40 N
        const tau = r * F; // theta = 90 deg
        return {
          id: 'TORQUE_1',
          category: 'Rotation',
          question: `A force of ${F} N is applied perpendicularly at the end of a lever arm of length ${r} m. What is the torque produced?`,
          unit: 'N·m',
          correctAnswer: tau,
          formula: 'τ = r·F·sin θ',
          solution: `τ = ${r} × ${F} × sin(90°) = ${tau.toFixed(2)} N·m.`,
          tolerancePct: 2.0
        };
      }

      case 'ESCAPE_VELOCITY': {
        // Moon: M = 7.342e22, R = 1.737e6
        const M = 7.342e22;
        const R = 1.737e6;
        const G = 6.6743e-11;
        const ve = Math.sqrt((2 * G * M) / R);
        return {
          id: 'GRAV_1',
          category: 'Gravitation',
          question: `Given Moon mass = 7.34 × 10²² kg and radius = 1.74 × 10⁶ m, find the escape velocity from the Moon's surface (G = 6.674 × 10⁻¹¹ N·m²/kg²).`,
          unit: 'm/s',
          correctAnswer: ve,
          formula: 'v_e = √(2GM / R)',
          solution: `v_e = √(2 × 6.674×10⁻¹¹ × 7.342×10²² / 1.737×10⁶) = ${ve.toFixed(0)} m/s (approx 2375 m/s).`,
          tolerancePct: 5.0
        };
      }

      case 'SHM_TIME_PERIOD': {
        const m = 2; // kg
        const k = 50; // N/m
        const T = 2 * Math.PI * Math.sqrt(m / k);
        return {
          id: 'SHM_1',
          category: 'Oscillations',
          question: `A spring-mass oscillator has mass m = ${m} kg and spring constant k = ${k} N/m. Calculate its time period of oscillation.`,
          unit: 's',
          correctAnswer: T,
          formula: 'T = 2π·√(m / k)',
          solution: `T = 2π × √(${m} / ${k}) = ${T.toFixed(3)} s.`,
          tolerancePct: 3.0
        };
      }

      case 'WAVE_SPEED': {
        const f = Math.floor(Math.random() * 200 + 100); // 100 to 300 Hz
        const lambda = (Math.floor(Math.random() * 15 + 5)) / 10; // 0.5 to 2.0 m
        const v = f * lambda;
        return {
          id: 'WAVE_1',
          category: 'Waves',
          question: `A sound wave has a frequency of ${f} Hz and wavelength ${lambda} m. Calculate the speed of the wave.`,
          unit: 'm/s',
          correctAnswer: v,
          formula: 'v = f·λ',
          solution: `v = ${f} × ${lambda} = ${v.toFixed(2)} m/s.`,
          tolerancePct: 2.0
        };
      }

      case 'BEAT_FREQUENCY': {
        const f1 = Math.floor(Math.random() * 50 + 250); // 250 to 300 Hz
        const diff = Math.floor(Math.random() * 6 + 2); // 2 to 7 Hz
        const f2 = f1 + diff;
        return {
          id: 'BEATS_1',
          category: 'Waves & Sound',
          question: `Two tuning forks of frequencies ${f1} Hz and ${f2} Hz are sounded together. What is the beat frequency heard?`,
          unit: 'Hz',
          correctAnswer: diff,
          formula: 'f_b = |f₁ - f₂|',
          solution: `f_b = |${f1} - ${f2}| = ${diff} Hz.`,
          tolerancePct: 1.0
        };
      }

      default: {
        return this.generateRandomProblem('KINEMATICS_1D_STOPPING');
      }
    }
  }

  static checkAnswer(problem, studentAnswer) {
    const num = parseFloat(studentAnswer);
    if (!Number.isFinite(num)) {
      return { isCorrect: false, errorMsg: 'Please enter a valid numeric value.' };
    }

    const diff = Math.abs(num - problem.correctAnswer);
    const maxAllowedDiff = Math.abs(problem.correctAnswer) * (problem.tolerancePct / 100);

    const isCorrect = diff <= Math.max(0.1, maxAllowedDiff);
    return {
      isCorrect,
      entered: num,
      expected: problem.correctAnswer,
      diff,
      solution: problem.solution
    };
  }
}
