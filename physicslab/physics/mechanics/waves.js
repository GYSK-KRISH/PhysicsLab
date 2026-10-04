// Wave Mechanics, Superposition, Standing Waves, and Beats Physics Engine
import { MechanicsMath } from './mechanicsMath.js';

export class WaveLabPhysics {
  constructor(options = {}) {
    this.amplitude = options.amplitude || 3.0; // A (m)
    this.frequency = options.frequency || 2.0; // f (Hz)
    this.wavelength = options.wavelength || 10.0; // lambda (m)
    this.waveType = options.waveType || 'TRANSVERSE'; // 'TRANSVERSE' | 'LONGITUDINAL'

    this.time = 0;
    this.isRunning = false;
    this.recalculate();
  }

  setParameters(A, f, lambda, type = 'TRANSVERSE') {
    this.amplitude = Math.max(0.1, A);
    this.frequency = Math.max(0.1, f);
    this.wavelength = Math.max(0.5, lambda);
    this.waveType = type;
    this.recalculate();
  }

  recalculate() {
    // Wave speed: v = f * lambda
    this.waveSpeed = this.frequency * this.wavelength;
    // Wave number: k = 2*pi / lambda
    this.k = (2 * Math.PI) / this.wavelength;
    // Angular frequency: omega = 2*pi * f
    this.omega = 2 * Math.PI * this.frequency;
    // Period: T = 1 / f
    this.period = 1 / this.frequency;
  }

  reset() {
    this.time = 0;
    this.isRunning = false;
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
    this.time += dt;
  }

  getDisplacementAt(x, t = this.time) {
    // y(x, t) = A * sin(k*x - omega*t)
    return this.amplitude * Math.sin(this.k * x - this.omega * t);
  }
}

export class SuperpositionPhysics {
  constructor(options = {}) {
    this.a1 = options.a1 || 2.5;
    this.f1 = options.f1 || 1.5;
    this.lambda1 = options.lambda1 || 12.0;

    this.a2 = options.a2 || 2.5;
    this.f2 = options.f2 || 1.5;
    this.lambda2 = options.lambda2 || 12.0;

    this.phaseDiffDeg = options.phaseDiffDeg !== undefined ? options.phaseDiffDeg : 0; // delta phi

    this.time = 0;
    this.isRunning = false;
  }

  setParameters(a1, f1, a2, f2, phaseDeg) {
    this.a1 = Math.max(0, a1);
    this.f1 = Math.max(0.1, f1);
    this.a2 = Math.max(0, a2);
    this.f2 = Math.max(0.1, f2);
    this.phaseDiffDeg = phaseDeg;
  }

  reset() {
    this.time = 0;
    this.isRunning = false;
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
  }

  getWavesAt(x, t = this.time) {
    const k1 = (2 * Math.PI) / this.lambda1;
    const w1 = 2 * Math.PI * this.f1;

    const k2 = (2 * Math.PI) / this.lambda2;
    const w2 = 2 * Math.PI * this.f2;
    const phiRad = MechanicsMath.toRadians(this.phaseDiffDeg);

    const y1 = this.a1 * Math.sin(k1 * x - w1 * t);
    const y2 = this.a2 * Math.sin(k2 * x - w2 * t + phiRad);
    const yResultant = y1 + y2;

    return { y1, y2, yResultant };
  }
}

export class StandingWavePhysics {
  constructor(options = {}) {
    this.length = options.length || 20.0; // string length L (m)
    this.tension = options.tension || 100.0; // Tension T (N)
    this.linearDensity = options.linearDensity || 0.01; // mu (kg/m)
    this.harmonicN = options.harmonicN || 2; // n = 1, 2, 3, 4, 5

    this.time = 0;
    this.isRunning = false;
    this.amplitude = 2.0;

    this.recalculate();
  }

  setParameters(length, tension, linearDensity, n) {
    this.length = Math.max(2.0, length);
    this.tension = Math.max(1.0, tension);
    this.linearDensity = Math.max(0.001, linearDensity);
    this.harmonicN = Math.max(1, Math.min(6, Math.round(n)));
    this.recalculate();
  }

  recalculate() {
    // Wave speed on stretched string: v = sqrt(T / mu)
    this.waveSpeed = Math.sqrt(this.tension / this.linearDensity);
    // Wavelength for n-th harmonic: lambda_n = (2 * L) / n
    this.wavelength = (2 * this.length) / this.harmonicN;
    // Harmonic frequency: f_n = n * v / (2 * L) = v / lambda_n
    this.frequency = (this.harmonicN * this.waveSpeed) / (2 * this.length);
    this.k = (2 * Math.PI) / this.wavelength;
    this.omega = 2 * Math.PI * this.frequency;

    // Nodes occur at: x = m * lambda / 2 = m * L / n (for m = 0, 1, ..., n)
    this.nodes = [];
    for (let m = 0; m <= this.harmonicN; m++) {
      this.nodes.push((m * this.length) / this.harmonicN);
    }

    // Antinodes occur at: x = (2m + 1) * lambda / 4
    this.antinodes = [];
    for (let m = 0; m < this.harmonicN; m++) {
      this.antinodes.push(((2 * m + 1) * this.length) / (2 * this.harmonicN));
    }
  }

  reset() {
    this.time = 0;
    this.isRunning = false;
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
    this.time += dt;
  }

  getDisplacementAt(x, t = this.time) {
    // Standing wave equation: y(x, t) = 2A * sin(k*x) * cos(omega*t)
    return 2 * this.amplitude * Math.sin(this.k * x) * Math.cos(this.omega * t);
  }
}

export class BeatsPhysics {
  constructor(options = {}) {
    this.f1 = options.f1 || 10.0; // Hz
    this.f2 = options.f2 || 12.0; // Hz
    this.amplitude = options.amplitude || 2.0;

    this.time = 0;
    this.isRunning = false;
    this.recalculate();
  }

  setParameters(f1, f2, A = 2.0) {
    this.f1 = Math.max(0.5, f1);
    this.f2 = Math.max(0.5, f2);
    this.amplitude = Math.max(0.1, A);
    this.recalculate();
  }

  recalculate() {
    // Beat frequency: f_b = |f1 - f2|
    this.beatFrequency = Math.abs(this.f1 - this.f2);
    // Beat period: T_b = 1 / f_b
    this.beatPeriod = this.beatFrequency > 0 ? 1 / this.beatFrequency : Infinity;
    // Carrier frequency: f_avg = (f1 + f2) / 2
    this.carrierFrequency = (this.f1 + this.f2) / 2;
  }

  reset() {
    this.time = 0;
    this.isRunning = false;
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
    this.time += dt;
  }

  getStateAt(t = this.time) {
    const w1 = 2 * Math.PI * this.f1;
    const w2 = 2 * Math.PI * this.f2;

    const y1 = this.amplitude * Math.cos(w1 * t);
    const y2 = this.amplitude * Math.cos(w2 * t);
    const resultant = y1 + y2;

    // Amplitude envelope: A_env(t) = 2*A * |cos( 2*pi*(f1-f2)/2 * t )|
    const envelope = 2 * this.amplitude * Math.abs(Math.cos(Math.PI * (this.f1 - this.f2) * t));

    return {
      t,
      y1,
      y2,
      resultant,
      envelope,
      negEnvelope: -envelope
    };
  }
}
