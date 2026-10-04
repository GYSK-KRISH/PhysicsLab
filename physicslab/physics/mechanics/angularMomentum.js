// Angular Momentum Physics Engine for PhysicsLab Mechanics
import { MechanicsMath } from './mechanicsMath.js';

export class AngularMomentumPhysics {
  constructor(options = {}) {
    this.mass = options.mass || 5.0; // kg
    this.initialRadius = options.initialRadius || 2.0; // m
    this.currentRadius = this.initialRadius;
    this.initialOmega = options.initialOmega || 3.0; // rad/s
    this.currentOmega = this.initialOmega;

    this.angleRad = 0;
    this.time = 0;
    this.isRunning = false;

    this.recalculate();
  }

  setParameters(mass, initialRadius, initialOmega) {
    this.mass = Math.max(0.1, mass);
    this.initialRadius = Math.max(0.2, initialRadius);
    this.initialOmega = Math.max(0.1, initialOmega);
    this.currentRadius = this.initialRadius;
    this.reset();
  }

  setRadius(r) {
    this.currentRadius = Math.max(0.2, Math.min(4.0, r));
    this.recalculateConservation();
  }

  recalculate() {
    // Initial moment of inertia: I0 = M * R0^2
    this.initialI = this.mass * this.initialRadius * this.initialRadius;
    // Initial angular momentum: L0 = I0 * omega0 (conserved)
    this.initialL = this.initialI * this.initialOmega;
    this.initialKE = 0.5 * this.initialI * this.initialOmega * this.initialOmega;

    this.recalculateConservation();
  }

  recalculateConservation() {
    // Current moment of inertia: I = M * R^2
    this.currentI = this.mass * this.currentRadius * this.currentRadius;
    // By conservation of angular momentum: L = I * omega = L0 => omega = L0 / I
    this.currentOmega = this.initialL / this.currentI;
    this.currentL = this.currentI * this.currentOmega;
    // Current Rotational Kinetic Energy: KE = 0.5 * I * omega^2 = L^2 / (2*I)
    // (Note: KE increases as radius contracts because work is done pulling arms inward!)
    this.currentKE = 0.5 * this.currentI * this.currentOmega * this.currentOmega;
    this.workDoneInward = this.currentKE - this.initialKE;
  }

  reset() {
    this.currentRadius = this.initialRadius;
    this.angleRad = 0;
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

    this.recalculateConservation();
    this.angleRad = (this.angleRad + this.currentOmega * dt) % (Math.PI * 2);
  }
}
