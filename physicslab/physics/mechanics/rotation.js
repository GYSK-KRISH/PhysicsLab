// Rotational Dynamics, Moment of Inertia, and Rolling Motion Physics Engine
import { MechanicsMath } from './mechanicsMath.js';

export class RotationalDynamicsPhysics {
  constructor(options = {}) {
    this.torque = options.torque !== undefined ? options.torque : 10.0; // N*m
    this.momentOfInertia = options.momentOfInertia !== undefined ? options.momentOfInertia : 2.5; // kg*m^2
    this.angularVelocity = 0; // rad/s (omega)
    this.angleRad = 0; // theta
    this.time = 0;
    this.isRunning = false;

    this.recalculate();
  }

  setParameters(torque, I) {
    this.torque = torque;
    this.momentOfInertia = Math.max(0.01, I);
    this.recalculate();
  }

  recalculate() {
    // tau = I * alpha => alpha = tau / I
    this.angularAcceleration = this.torque / this.momentOfInertia;
    // Rotational Kinetic Energy: K_rot = 0.5 * I * omega^2
    this.rotationalKE = 0.5 * this.momentOfInertia * this.angularVelocity * this.angularVelocity;
  }

  reset() {
    this.angularVelocity = 0;
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

    this.recalculate();
    this.angularVelocity += this.angularAcceleration * dt;
    this.angleRad = (this.angleRad + this.angularVelocity * dt) % (Math.PI * 2);
    this.rotationalKE = 0.5 * this.momentOfInertia * this.angularVelocity * this.angularVelocity;
  }
}

export class MomentOfInertiaCalculator {
  // Point Mass: I = M * R^2
  static pointMass(m, r) {
    return {
      formula: 'I = M·R²',
      I: m * r * r,
      c: 1.0,
      name: 'Point Mass'
    };
  }

  // Thin Ring / Hoop: I = M * R^2
  static ring(m, r) {
    return {
      formula: 'I = M·R²',
      I: m * r * r,
      c: 1.0,
      name: 'Thin Ring / Hoop'
    };
  }

  // Solid Disc / Cylinder: I = 0.5 * M * R^2
  static disc(m, r) {
    return {
      formula: 'I = ½·M·R²',
      I: 0.5 * m * r * r,
      c: 0.5,
      name: 'Solid Disc / Cylinder'
    };
  }

  // Solid Sphere: I = 2/5 * M * R^2
  static solidSphere(m, r) {
    return {
      formula: 'I = ⅖·M·R²',
      I: 0.4 * m * r * r,
      c: 0.4,
      name: 'Solid Sphere'
    };
  }

  // Hollow Sphere: I = 2/3 * M * R^2
  static hollowSphere(m, r) {
    return {
      formula: 'I = ⅔·M·R²',
      I: (2 / 3) * m * r * r,
      c: 2 / 3,
      name: 'Hollow Sphere'
    };
  }

  // Thin Rod about center: I = 1/12 * M * L^2
  static rodCenter(m, l) {
    return {
      formula: 'I = ¹/₁₂·M·L²',
      I: (1 / 12) * m * l * l,
      c: 1 / 12,
      name: 'Thin Rod (Center)'
    };
  }
}

export class RollingMotionPhysics {
  constructor(options = {}) {
    this.angleDeg = options.angleDeg || 25.0; // Incline angle
    this.mass = options.mass || 2.0; // kg
    this.radius = options.radius || 0.5; // m
    this.gravity = 9.81;
    this.inclineLength = 12.0; // m

    // Bodies rolling down incline:
    // a = (g * sin(theta)) / (1 + c) where c = I / (M * R^2)
    this.bodies = [
      { id: 'SOLID_SPHERE', name: 'Solid Sphere', c: 0.4, color: '#5EE7FF', dist: 0, vel: 0, omega: 0, finished: false },
      { id: 'SOLID_CYLINDER', name: 'Solid Cylinder', c: 0.5, color: '#8B5CF6', dist: 0, vel: 0, omega: 0, finished: false },
      { id: 'HOLLOW_SPHERE', name: 'Hollow Sphere', c: 0.667, color: '#FACC15', dist: 0, vel: 0, omega: 0, finished: false },
      { id: 'HOLLOW_CYLINDER', name: 'Hollow Cylinder (Ring)', c: 1.0, color: '#4ADE80', dist: 0, vel: 0, omega: 0, finished: false }
    ];

    this.time = 0;
    this.isRunning = false;
    this.recalculate();
  }

  setParameters(angleDeg, mass, radius) {
    this.angleDeg = Math.max(5, Math.min(60, angleDeg));
    this.mass = Math.max(0.1, mass);
    this.radius = Math.max(0.1, radius);
    this.reset();
  }

  recalculate() {
    const thetaRad = MechanicsMath.toRadians(this.angleDeg);
    const gSinTheta = this.gravity * Math.sin(thetaRad);

    for (const b of this.bodies) {
      // Linear acceleration down incline for pure rolling
      b.acc = gSinTheta / (1 + b.c);
      b.I = b.c * this.mass * this.radius * this.radius;
    }
  }

  reset() {
    this.time = 0;
    this.isRunning = false;
    for (const b of this.bodies) {
      b.dist = 0;
      b.vel = 0;
      b.omega = 0;
      b.finished = false;
    }
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

    let allFinished = true;
    for (const b of this.bodies) {
      if (!b.finished) {
        b.vel += b.acc * dt;
        b.dist += b.vel * dt;
        // Pure rolling condition: v = omega * R
        b.omega = b.vel / this.radius;

        // Energy breakdown
        b.keTrans = 0.5 * this.mass * b.vel * b.vel;
        b.keRot = 0.5 * b.I * b.omega * b.omega;
        b.keTotal = b.keTrans + b.keRot;

        if (b.dist >= this.inclineLength) {
          b.dist = this.inclineLength;
          b.finished = true;
        } else {
          allFinished = false;
        }
      }
    }

    if (allFinished) {
      this.isRunning = false;
    }
  }
}
