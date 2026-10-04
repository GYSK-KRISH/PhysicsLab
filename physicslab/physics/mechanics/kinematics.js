// Kinematics Physics Engine (1D and 2D) for PhysicsLab
import { Vector2D } from './vector2d.js';
import { MechanicsMath } from './mechanicsMath.js';

export class Kinematics1DPhysics {
  constructor(options = {}) {
    this.x0 = options.x0 !== undefined ? options.x0 : 0; // initial position (m)
    this.v0 = options.v0 !== undefined ? options.v0 : 10; // initial velocity (m/s)
    this.a = options.a !== undefined ? options.a : 2; // acceleration (m/s^2)
    this.time = 0;
    this.isRunning = false;
    this.trajectory = [];
  }

  setParameters(x0, v0, a) {
    this.x0 = Number.isFinite(x0) ? x0 : 0;
    this.v0 = Number.isFinite(v0) ? v0 : 0;
    this.a = Number.isFinite(a) ? a : 0;
    this.reset();
  }

  reset() {
    this.time = 0;
    this.isRunning = false;
    this.trajectory = [];
    this.recordPoint(0);
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
    this.recordPoint(this.time);
  }

  step(dt) {
    this.time = Math.max(0, this.time + dt);
    this.recordPoint(this.time);
  }

  recordPoint(t) {
    const state = this.getStateAt(t);
    const last = this.trajectory[this.trajectory.length - 1];
    if (!last || (t - last.t >= 0.02) || !this.isRunning) {
      this.trajectory.push(state);
    }
  }

  getStateAt(t) {
    const time = Math.max(0, t);
    // s = v0*t + 0.5*a*t^2
    const displacement = this.v0 * time + 0.5 * this.a * time * time;
    const x = this.x0 + displacement;
    // v = v0 + a*t
    const v = this.v0 + this.a * time;
    // v^2 = v0^2 + 2*a*s
    const vSquared = this.v0 * this.v0 + 2 * this.a * displacement;

    return {
      t: time,
      x: x,
      displacement: displacement,
      v: v,
      vSquared: vSquared,
      a: this.a
    };
  }

  getCurrentState() {
    return this.getStateAt(this.time);
  }
}

export class Kinematics2DPhysics {
  constructor(options = {}) {
    this.pos0 = new Vector2D(options.x0 || 0, options.y0 || 0);
    this.vel0 = new Vector2D(options.vx0 !== undefined ? options.vx0 : 15, options.vy0 !== undefined ? options.vy0 : 20);
    this.acc = new Vector2D(options.ax !== undefined ? options.ax : 0, options.ay !== undefined ? options.ay : -9.81);
    this.time = 0;
    this.isRunning = false;
    this.trajectory = [];
  }

  setParameters(vx0, vy0, ax, ay, x0 = 0, y0 = 0) {
    this.pos0.set(x0, y0);
    this.vel0.set(vx0, vy0);
    this.acc.set(ax, ay);
    this.reset();
  }

  reset() {
    this.time = 0;
    this.isRunning = false;
    this.trajectory = [];
    this.recordPoint(0);
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
    this.recordPoint(this.time);
  }

  step(dt) {
    this.time = Math.max(0, this.time + dt);
    this.recordPoint(this.time);
  }

  recordPoint(t) {
    const state = this.getStateAt(t);
    const last = this.trajectory[this.trajectory.length - 1];
    if (!last || (t - last.t >= 0.02) || !this.isRunning) {
      this.trajectory.push(state);
    }
  }

  getStateAt(t) {
    const time = Math.max(0, t);
    const x = this.pos0.x + this.vel0.x * time + 0.5 * this.acc.x * time * time;
    const y = this.pos0.y + this.vel0.y * time + 0.5 * this.acc.y * time * time;

    const vx = this.vel0.x + this.acc.x * time;
    const vy = this.vel0.y + this.acc.y * time;

    const speed = Math.sqrt(vx * vx + vy * vy);
    const accMag = this.acc.magnitude();

    return {
      t: time,
      pos: new Vector2D(x, y),
      vel: new Vector2D(vx, vy),
      acc: this.acc.clone(),
      speed: speed,
      accMag: accMag,
      x: x,
      y: y,
      vx: vx,
      vy: vy,
      ax: this.acc.x,
      ay: this.acc.y
    };
  }

  getCurrentState() {
    return this.getStateAt(this.time);
  }
}
