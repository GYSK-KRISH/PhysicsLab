// Circular Motion Physics Engine for PhysicsLab
import { Vector2D } from './vector2d.js';
import { MechanicsMath } from './mechanicsMath.js';

export class CircularMotionPhysics {
  constructor(options = {}) {
    this.radius = options.radius !== undefined ? options.radius : 4.0; // m
    this.mass = options.mass !== undefined ? options.mass : 2.0; // kg
    this.speed = options.speed !== undefined ? options.speed : 8.0; // m/s (tangential velocity)

    this.angleRad = 0; // current angular position
    this.time = 0;
    this.isRunning = false;

    this.recalculate();
  }

  setParameters(radius, mass, speed) {
    this.radius = Math.max(0.5, radius);
    this.mass = Math.max(0.1, mass);
    this.speed = Math.max(0.1, speed);
    this.recalculate();
  }

  recalculate() {
    // v = r * omega => omega = v / r
    this.angularVelocity = this.speed / this.radius; // rad/s
    // a_c = v^2 / r = r * omega^2
    this.centripetalAcc = (this.speed * this.speed) / this.radius; // m/s^2
    // F_c = m * a_c
    this.centripetalForce = this.mass * this.centripetalAcc; // N
    // Period T = 2*pi / omega
    this.period = (2 * Math.PI) / this.angularVelocity; // s
    // Frequency f = 1 / T
    this.frequency = 1 / this.period; // Hz
  }

  reset() {
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
    this.angleRad = (this.angleRad + this.angularVelocity * dt) % (Math.PI * 2);
  }

  getObjectVectors(centerX = 0, centerY = 0) {
    // Position on circle
    const x = centerX + this.radius * Math.cos(this.angleRad);
    const y = centerY + this.radius * Math.sin(this.angleRad);

    // Tangential velocity vector (perpendicular to radius)
    const vx = -this.speed * Math.sin(this.angleRad);
    const vy = this.speed * Math.cos(this.angleRad);

    // Centripetal acceleration vector (pointing toward center)
    const ax = -this.centripetalAcc * Math.cos(this.angleRad);
    const ay = -this.centripetalAcc * Math.sin(this.angleRad);

    // Centripetal force vector
    const fx = this.mass * ax;
    const fy = this.mass * ay;

    return {
      pos: new Vector2D(x, y),
      vel: new Vector2D(vx, vy),
      acc: new Vector2D(ax, ay),
      force: new Vector2D(fx, fy)
    };
  }
}
