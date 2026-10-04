// Simple Harmonic Motion, Spring Systems, Damping, and Resonance Engine
import { MechanicsMath } from './mechanicsMath.js';

export class SHMPhysics {
  constructor(options = {}) {
    this.mass = options.mass !== undefined ? options.mass : 2.0; // kg
    this.springConstant = options.springConstant !== undefined ? options.springConstant : 50.0; // N/m (k)
    this.amplitude = options.amplitude !== undefined ? options.amplitude : 5.0; // m (A)
    this.phaseRad = options.phaseRad !== undefined ? options.phaseRad : 0.0; // phi

    this.time = 0;
    this.isRunning = false;
    this.history = [];

    this.recalculate();
  }

  setParameters(m, k, A, phi = 0) {
    this.mass = Math.max(0.1, m);
    this.springConstant = Math.max(0.1, k);
    this.amplitude = Math.max(0.01, A);
    this.phaseRad = phi;
    this.reset();
  }

  recalculate() {
    // omega = sqrt(k / m)
    this.omega = Math.sqrt(this.springConstant / this.mass);
    // Period T = 2*pi / omega = 2*pi * sqrt(m / k)
    this.period = (2 * Math.PI) / this.omega;
    // Frequency f = 1 / T
    this.frequency = 1 / this.period;

    // Total mechanical energy: E = 0.5 * k * A^2
    this.totalEnergy = 0.5 * this.springConstant * this.amplitude * this.amplitude;
  }

  reset() {
    this.time = 0;
    this.isRunning = false;
    this.history = [];
    this.recalculate();
    this.recordPoint();
  }

  start() {
    this.isRunning = true;
  }

  pause() {
    this.isRunning = false;
  }

  update(dt) {
    if (!this.isRunning) return;
    this.time += dt;
    this.recordPoint();
  }

  getStateAt(t) {
    // x = A * cos(omega * t + phi)
    const x = this.amplitude * Math.cos(this.omega * t + this.phaseRad);
    // v = -A * omega * sin(omega * t + phi)
    const v = -this.amplitude * this.omega * Math.sin(this.omega * t + this.phaseRad);
    // a = -omega^2 * x
    const a = -this.omega * this.omega * x;

    // Energies:
    // Potential Energy: PE = 0.5 * k * x^2
    const pe = 0.5 * this.springConstant * x * x;
    // Kinetic Energy: KE = 0.5 * m * v^2
    const ke = 0.5 * this.mass * v * v;
    const totalE = pe + ke;

    return {
      t,
      x,
      v,
      a,
      pe,
      ke,
      totalE,
      theoreticalE: this.totalEnergy
    };
  }

  getCurrentState() {
    return this.getStateAt(this.time);
  }

  recordPoint() {
    const state = this.getStateAt(this.time);
    this.history.push(state);
    if (this.history.length > 500) {
      this.history.shift();
    }
  }
}

export class SpringCombinationsPhysics {
  static calculateSeries(k1, k2) {
    // 1 / k_eff = 1/k1 + 1/k2 => k_eff = (k1 * k2) / (k1 + k2)
    const k_eff = (k1 * k2) / (k1 + k2);
    return {
      k1,
      k2,
      k_eff,
      formula: '1/k_eff = 1/k₁ + 1/k₂'
    };
  }

  static calculateParallel(k1, k2) {
    // k_eff = k1 + k2
    const k_eff = k1 + k2;
    return {
      k1,
      k2,
      k_eff,
      formula: 'k_eff = k₁ + k₂'
    };
  }
}

export class DampedOscillationPhysics {
  constructor(options = {}) {
    this.mass = options.mass || 2.0; // m
    this.dampingCoeff = options.dampingCoeff !== undefined ? options.dampingCoeff : 0.8; // c (b)
    this.springConstant = options.springConstant || 30.0; // k
    this.initialDisp = options.initialDisp || 6.0; // x0

    this.pos = this.initialDisp;
    this.vel = 0;
    this.time = 0;
    this.isRunning = false;
    this.history = [];

    this.recalculate();
  }

  setParameters(m, c, k, x0) {
    this.mass = Math.max(0.1, m);
    this.dampingCoeff = Math.max(0, c);
    this.springConstant = Math.max(0.1, k);
    this.initialDisp = x0;
    this.reset();
  }

  recalculate() {
    this.omega0 = Math.sqrt(this.springConstant / this.mass); // natural frequency
    this.gamma = this.dampingCoeff / (2 * this.mass); // damping ratio parameter

    // Damping classification: c^2 compared to 4*m*k
    const cSquared = this.dampingCoeff * this.dampingCoeff;
    const criticalThreshold = 4 * this.mass * this.springConstant;

    if (Math.abs(cSquared - criticalThreshold) < 1e-4) {
      this.regime = 'CRITICAL DAMPING (c² = 4mk)';
      this.type = 'CRITICAL';
    } else if (cSquared < criticalThreshold) {
      this.regime = 'UNDERDAMPED (c² < 4mk)';
      this.type = 'UNDERDAMPED';
      this.omegaDamped = Math.sqrt(Math.max(0, this.omega0 * this.omega0 - this.gamma * this.gamma));
    } else {
      this.regime = 'OVERDAMPED (c² > 4mk)';
      this.type = 'OVERDAMPED';
      this.omegaDamped = 0;
    }
  }

  reset() {
    this.pos = this.initialDisp;
    this.vel = 0;
    this.time = 0;
    this.isRunning = false;
    this.history = [];
    this.recalculate();
  }

  start() {
    this.isRunning = true;
  }

  pause() {
    this.isRunning = false;
  }

  update(dt) {
    if (!this.isRunning) return;

    // Accurate RK4 integration for m*x'' + c*x' + k*x = 0
    const subSteps = 10;
    const subDt = dt / subSteps;

    for (let s = 0; s < subSteps; s++) {
      this.time += subDt;
      const state = [this.pos, this.vel];
      const nextState = MechanicsMath.rk4Step(this.time, state, subDt, (t, y) => {
        const x = y[0];
        const v = y[1];
        // a = -(c*v + k*x) / m
        const a = -(this.dampingCoeff * v + this.springConstant * x) / this.mass;
        return [v, a];
      });

      this.pos = nextState[0];
      this.vel = nextState[1];
    }

    // Theoretical amplitude decay envelope: A(t) = A0 * e^(-gamma * t)
    const envelope = this.initialDisp * Math.exp(-this.gamma * this.time);

    this.history.push({
      t: this.time,
      x: this.pos,
      v: this.vel,
      envelope: envelope,
      negEnvelope: -envelope
    });

    if (this.history.length > 500) {
      this.history.shift();
    }
  }
}

export class ForcedOscillationPhysics {
  constructor(options = {}) {
    this.mass = options.mass || 1.5;
    this.springConstant = options.springConstant || 60.0;
    this.damping = options.damping || 0.5;
    this.f0 = options.f0 || 15.0; // driving force amplitude
    this.drivingOmega = options.drivingOmega || 6.32; // driving frequency

    this.pos = 0;
    this.vel = 0;
    this.time = 0;
    this.isRunning = false;
    this.history = [];

    this.recalculate();
  }

  setParameters(m, k, c, f0, omegaDriving) {
    this.mass = Math.max(0.1, m);
    this.springConstant = Math.max(0.1, k);
    this.damping = Math.max(0.01, c);
    this.f0 = Math.max(0, f0);
    this.drivingOmega = Math.max(0.1, omegaDriving);
    this.recalculate();
  }

  recalculate() {
    this.naturalOmega = Math.sqrt(this.springConstant / this.mass);

    // Steady state amplitude formula:
    // A(omega) = (F0 / m) / sqrt( (omega0^2 - omega^2)^2 + (c*omega/m)^2 )
    const deltaOmegaSq = this.naturalOmega * this.naturalOmega - this.drivingOmega * this.drivingOmega;
    const dampingTerm = (this.damping * this.drivingOmega) / this.mass;
    const denom = Math.sqrt(deltaOmegaSq * deltaOmegaSq + dampingTerm * dampingTerm);

    this.steadyStateAmplitude = denom > 1e-6 ? (this.f0 / this.mass) / denom : 0;
    this.isAtResonance = Math.abs(this.drivingOmega - this.naturalOmega) < 0.2;
  }

  reset() {
    this.pos = 0;
    this.vel = 0;
    this.time = 0;
    this.isRunning = false;
    this.history = [];
    this.recalculate();
  }

  start() {
    this.isRunning = true;
  }

  pause() {
    this.isRunning = false;
  }

  update(dt) {
    if (!this.isRunning) return;

    const subSteps = 10;
    const subDt = dt / subSteps;

    for (let s = 0; s < subSteps; s++) {
      this.time += subDt;
      const state = [this.pos, this.vel];
      const nextState = MechanicsMath.rk4Step(this.time, state, subDt, (t, y) => {
        const x = y[0];
        const v = y[1];
        // m*x'' + c*x' + k*x = F0 * cos(omega * t)
        const drivingForce = this.f0 * Math.cos(this.drivingOmega * t);
        const a = (drivingForce - this.damping * v - this.springConstant * x) / this.mass;
        return [v, a];
      });

      this.pos = nextState[0];
      this.vel = nextState[1];
    }

    this.history.push({
      t: this.time,
      x: this.pos,
      v: this.vel,
      steadyStateA: this.steadyStateAmplitude
    });

    if (this.history.length > 500) {
      this.history.shift();
    }
  }

  getResonanceCurvePoints() {
    // Generate theoretical amplitude vs driving frequency response curve points
    const points = [];
    const minOmega = 0.5;
    const maxOmega = this.naturalOmega * 2.2;
    const steps = 60;

    for (let i = 0; i <= steps; i++) {
      const w = minOmega + (i / steps) * (maxOmega - minOmega);
      const deltaW = this.naturalOmega * this.naturalOmega - w * w;
      const dTerm = (this.damping * w) / this.mass;
      const denom = Math.sqrt(deltaW * deltaW + dTerm * dTerm);
      const amp = denom > 1e-6 ? (this.f0 / this.mass) / denom : 0;
      points.push({ omega: w, amp });
    }

    return points;
  }
}
