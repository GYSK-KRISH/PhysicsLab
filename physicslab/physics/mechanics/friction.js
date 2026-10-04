// Static and Kinetic Friction Laboratory Physics Engine
import { MechanicsMath } from './mechanicsMath.js';

export class FrictionPhysics {
  constructor(options = {}) {
    this.mass = options.mass !== undefined ? options.mass : 4.0; // kg
    this.appliedForce = options.appliedForce !== undefined ? options.appliedForce : 10.0; // N
    this.mu_s = options.mu_s !== undefined ? options.mu_s : 0.5; // static friction coefficient
    this.mu_k = options.mu_k !== undefined ? options.mu_k : 0.35; // kinetic friction coefficient
    this.gravity = 9.81;

    this.position = 0;
    this.velocity = 0;
    this.acceleration = 0;
    this.time = 0;
    this.isRunning = false;
    this.isMoving = false;
    this.justBrokenAway = false;
    this.breakawayTimer = 0;

    this.history = []; // Recorded { t, fApplied, fFriction, isStatic }
    this.recalculate();
  }

  setParameters(mass, appliedF, mu_s, mu_k) {
    this.mass = Math.max(0.1, mass);
    this.appliedForce = Math.max(0, appliedF);
    this.mu_s = Math.max(0.01, mu_s);
    // Ensure kinetic friction does not exceed static friction physically
    this.mu_k = Math.max(0.01, Math.min(this.mu_s, mu_k));
    this.recalculate();
  }

  recalculate() {
    this.normalForce = this.mass * this.gravity;
    this.maxStaticFriction = this.mu_s * this.normalForce;
    this.kineticFriction = this.mu_k * this.normalForce;

    if (!this.isMoving) {
      if (this.appliedForce > this.maxStaticFriction) {
        // BREAKAWAY TRANSITION
        this.isMoving = true;
        this.justBrokenAway = true;
        this.breakawayTimer = 1.0;
        this.frictionForce = this.kineticFriction;
        this.netForce = this.appliedForce - this.kineticFriction;
        this.acceleration = this.netForce / this.mass;
      } else {
        // Static equilibrium
        this.frictionForce = this.appliedForce;
        this.netForce = 0;
        this.acceleration = 0;
      }
    } else {
      // Already moving
      this.frictionForce = this.kineticFriction;
      this.netForce = this.appliedForce - this.kineticFriction;
      this.acceleration = this.netForce / this.mass;

      // Check if motion stops when applied force drops below kinetic
      if (this.appliedForce < this.kineticFriction && this.velocity <= 0) {
        this.isMoving = false;
        this.velocity = 0;
        this.acceleration = 0;
        this.frictionForce = this.appliedForce;
        this.netForce = 0;
      }
    }
  }

  reset() {
    this.position = 0;
    this.velocity = 0;
    this.acceleration = 0;
    this.time = 0;
    this.isRunning = false;
    this.isMoving = false;
    this.justBrokenAway = false;
    this.breakawayTimer = 0;
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
    if (this.breakawayTimer > 0) {
      this.breakawayTimer -= dt;
      if (this.breakawayTimer <= 0) {
        this.justBrokenAway = false;
      }
    }

    if (!this.isRunning) return;
    this.time += dt;

    this.recalculate();

    if (this.isMoving) {
      this.velocity += this.acceleration * dt;
      if (this.velocity < 0) {
        this.velocity = 0;
        this.isMoving = false;
      }
      this.position += this.velocity * dt;
    }

    if (this.history.length < 500) {
      this.history.push({
        t: this.time,
        fApplied: this.appliedForce,
        fFriction: this.frictionForce,
        isStatic: !this.isMoving
      });
    }
  }
}
