// Inclined Plane Mechanics Engine for PhysicsLab
import { MechanicsMath } from './mechanicsMath.js';

export class InclinedPlanePhysics {
  constructor(options = {}) {
    this.angleDeg = options.angleDeg !== undefined ? options.angleDeg : 30.0; // degrees
    this.mass = options.mass !== undefined ? options.mass : 2.0; // kg
    this.mu = options.mu !== undefined ? options.mu : 0.2; // friction coefficient
    this.gravity = options.gravity !== undefined ? options.gravity : 9.81; // m/s^2
    this.inclineLength = 10.0; // meters

    this.distanceAlongIncline = 0.0; // meters from top
    this.velocity = 0.0; // m/s
    this.time = 0;
    this.isRunning = false;

    this.recalculate();
  }

  setParameters(angleDeg, mass, mu, grav = 9.81) {
    this.angleDeg = Math.max(0, Math.min(85, angleDeg));
    this.mass = Math.max(0.1, mass);
    this.mu = Math.max(0, mu);
    this.gravity = Math.max(0.1, grav);
    this.recalculate();
  }

  recalculate() {
    const thetaRad = MechanicsMath.toRadians(this.angleDeg);
    this.sinTheta = Math.sin(thetaRad);
    this.cosTheta = Math.cos(thetaRad);

    this.weight = this.mass * this.gravity;
    this.parallelWeight = this.weight * this.sinTheta; // mg sin(theta) down incline
    this.perpWeight = this.weight * this.cosTheta; // mg cos(theta) perpendicular
    this.normalForce = this.perpWeight;

    this.maxFriction = this.mu * this.normalForce;

    // Net force down the incline
    if (this.parallelWeight > this.maxFriction) {
      this.frictionForce = this.maxFriction;
      this.netForce = this.parallelWeight - this.frictionForce;
      this.acceleration = this.netForce / this.mass; // g(sin theta - mu cos theta)
    } else {
      this.frictionForce = this.parallelWeight;
      this.netForce = 0;
      this.acceleration = 0;
    }
  }

  reset() {
    this.distanceAlongIncline = 0;
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
    this.distanceAlongIncline += this.velocity * dt;

    if (this.distanceAlongIncline >= this.inclineLength) {
      this.distanceAlongIncline = this.inclineLength;
      this.isRunning = false;
    }
  }
}
