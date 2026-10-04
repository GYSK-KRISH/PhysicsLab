// Newton's Laws and Free Body Diagram Physics Engine
import { Vector2D } from './vector2d.js';
import { MechanicsMath } from './mechanicsMath.js';

export class NewtonLawsPhysics {
  constructor(options = {}) {
    this.mass = options.mass !== undefined ? options.mass : 5.0; // kg
    this.appliedForce = options.appliedForce !== undefined ? options.appliedForce : 25.0; // N (positive right)
    this.frictionCoeff = options.frictionCoeff !== undefined ? options.frictionCoeff : 0.2;
    this.gravity = options.gravity !== undefined ? options.gravity : 9.81; // m/s^2
    this.tensionForce = options.tensionForce !== undefined ? options.tensionForce : 0.0; // N

    this.position = 0; // m
    this.velocity = 0; // m/s
    this.acceleration = 0; // m/s^2
    this.time = 0;
    this.isRunning = false;

    this.recalculate();
  }

  setParameters(mass, appliedF, mu, grav = 9.81, tension = 0) {
    this.mass = Math.max(0.1, mass);
    this.appliedForce = appliedF;
    this.frictionCoeff = Math.max(0, mu);
    this.gravity = Math.max(0.1, grav);
    this.tensionForce = tension;
    this.recalculate();
  }

  recalculate() {
    this.normalForce = this.mass * this.gravity;
    this.weightForce = this.mass * this.gravity;

    const maxStaticFriction = this.frictionCoeff * this.normalForce;
    const netApplied = this.appliedForce + this.tensionForce;

    let friction = 0;
    if (Math.abs(this.velocity) < 1e-4) {
      // Static regime
      if (Math.abs(netApplied) <= maxStaticFriction) {
        friction = -netApplied;
        this.acceleration = 0;
      } else {
        friction = -Math.sign(netApplied) * maxStaticFriction;
        const fNet = netApplied + friction;
        this.acceleration = fNet / this.mass;
      }
    } else {
      // Kinetic regime
      friction = -Math.sign(this.velocity) * maxStaticFriction;
      const fNet = netApplied + friction;
      this.acceleration = fNet / this.mass;
    }

    this.frictionForce = friction;
    this.netForce = netApplied + friction;
  }

  reset() {
    this.position = 0;
    this.velocity = 0;
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

    this.recalculate();
    this.velocity += this.acceleration * dt;
    this.position += this.velocity * dt;
  }
}
