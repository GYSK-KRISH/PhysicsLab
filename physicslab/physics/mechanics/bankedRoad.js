// Banked Road Mechanics Engine for PhysicsLab
import { MechanicsMath } from './mechanicsMath.js';

export class BankedRoadPhysics {
  constructor(options = {}) {
    this.radius = options.radius !== undefined ? options.radius : 50.0; // curve radius (m)
    this.speed = options.speed !== undefined ? options.speed : 20.0; // vehicle speed (m/s)
    this.bankAngleDeg = options.bankAngleDeg !== undefined ? options.bankAngleDeg : 20.0; // degrees
    this.mass = options.mass !== undefined ? options.mass : 1000.0; // kg
    this.mu = options.mu !== undefined ? options.mu : 0.25; // tyre-road friction coeff
    this.gravity = 9.81;

    this.recalculate();
  }

  setParameters(radius, speed, bankAngleDeg, mu, mass = 1000) {
    this.radius = Math.max(5, radius);
    this.speed = Math.max(0.1, speed);
    this.bankAngleDeg = Math.max(0, Math.min(60, bankAngleDeg));
    this.mu = Math.max(0, mu);
    this.mass = Math.max(100, mass);
    this.recalculate();
  }

  recalculate() {
    const thetaRad = MechanicsMath.toRadians(this.bankAngleDeg);
    const tanTheta = Math.tan(thetaRad);
    const sinTheta = Math.sin(thetaRad);
    const cosTheta = Math.cos(thetaRad);

    // 1. Ideal frictionless speed: v_ideal = sqrt(r * g * tan(theta))
    this.idealSpeed = Math.sqrt(this.radius * this.gravity * tanTheta);
    // 2. Ideal bank angle for current speed: theta_ideal = atan(v^2 / (r * g))
    const idealAngleRad = Math.atan((this.speed * this.speed) / (this.radius * this.gravity));
    this.idealBankAngleDeg = MechanicsMath.toDegrees(idealAngleRad);

    // 3. Required Centripetal Force: F_c = m * v^2 / r
    this.requiredCentripetalForce = (this.mass * this.speed * this.speed) / this.radius;

    // 4. Forces calculation with road angle
    // Without friction: N cos(theta) = mg => N = mg / cos(theta)
    // N sin(theta) provides centripetal force
    const normalNoFriction = (this.mass * this.gravity) / Math.max(0.1, cosTheta);
    this.normalForce = normalNoFriction;

    // Maximum safe speed with friction without slipping up:
    // v_max = sqrt( r * g * (tan(theta) + mu) / (1 - mu * tan(theta)) )
    const maxDenom = 1 - this.mu * tanTheta;
    if (maxDenom > 0.05) {
      this.maxSafeSpeed = Math.sqrt((this.radius * this.gravity * (tanTheta + this.mu)) / maxDenom);
    } else {
      this.maxSafeSpeed = 999; // effectively unbounded by friction
    }

    // Minimum safe speed with friction without slipping down:
    // v_min = sqrt( r * g * (tan(theta) - mu) / (1 + mu * tan(theta)) )
    if (tanTheta > this.mu) {
      this.minSafeSpeed = Math.sqrt((this.radius * this.gravity * (tanTheta - this.mu)) / (1 + this.mu * tanTheta));
    } else {
      this.minSafeSpeed = 0; // car won't slip down even if stationary
    }

    this.isSafe = this.speed >= this.minSafeSpeed && this.speed <= this.maxSafeSpeed;
  }
}
