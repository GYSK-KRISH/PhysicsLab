// Comprehensive Projectile Motion Engine for PhysicsLab Mechanics
import { Vector2D } from './vector2d.js';
import { MechanicsMath } from './mechanicsMath.js';

export class AdvancedProjectilePhysics {
  constructor(options = {}) {
    this.velocity = options.velocity !== undefined ? options.velocity : 25.0; // m/s
    this.angle = options.angle !== undefined ? options.angle : 45.0; // degrees
    this.gravity = options.gravity !== undefined ? options.gravity : 9.81; // m/s^2
    this.launchHeight = options.launchHeight !== undefined ? options.launchHeight : 0.0; // m
    this.airResistance = options.airResistance !== undefined ? options.airResistance : 0.0; // drag coeff k (F_drag = -k * v^2)
    this.mass = options.mass !== undefined ? options.mass : 1.0; // kg

    this.time = 0;
    this.isRunning = false;
    this.hasLanded = false;
    this.speedScale = 1.0;

    this.currentPos = new Vector2D(0, this.launchHeight);
    this.currentVel = new Vector2D(0, 0);
    this.trajectory = [];

    this.recalculateTheoretical();
    this.reset();
  }

  setParameters(vel, angle, grav, height = 0, drag = 0, mass = 1) {
    this.velocity = Math.max(0.1, vel);
    this.angle = Math.max(-89, Math.min(89, angle));
    this.gravity = Math.max(0.1, grav);
    this.launchHeight = Math.max(0, height);
    this.airResistance = Math.max(0, drag);
    this.mass = Math.max(0.01, mass);

    this.recalculateTheoretical();
    if (!this.isRunning && !this.hasLanded) {
      this.reset();
    }
  }

  recalculateTheoretical() {
    const rad = MechanicsMath.toRadians(this.angle);
    this.rad = rad;
    this.vx0 = this.velocity * Math.cos(rad);
    this.vy0 = this.velocity * Math.sin(rad);

    // Analytical solution (vacuum)
    // y(t) = h + vy0*t - 0.5*g*t^2 = 0
    // 0.5*g*t^2 - vy0*t - h = 0
    const a = 0.5 * this.gravity;
    const b = -this.vy0;
    const c = -this.launchHeight;
    const roots = MechanicsMath.solveQuadratic(a, b, c);
    const positiveRoots = roots.filter(r => r > 1e-6);
    this.timeOfFlightIdeal = positiveRoots.length > 0 ? Math.max(...positiveRoots) : (2 * this.vy0) / this.gravity;

    this.rangeIdeal = this.vx0 * this.timeOfFlightIdeal;
    
    // Apex calculations
    this.timeToApexIdeal = Math.max(0, this.vy0 / this.gravity);
    this.maxHeightIdeal = this.launchHeight + (this.vy0 > 0 ? (this.vy0 * this.vy0) / (2 * this.gravity) : 0);
  }

  reset() {
    this.time = 0;
    this.isRunning = false;
    this.hasLanded = false;
    this.currentPos.set(0, this.launchHeight);
    const rad = MechanicsMath.toRadians(this.angle);
    this.currentVel.set(this.velocity * Math.cos(rad), this.velocity * Math.sin(rad));
    this.trajectory = [];
    this.recordPoint();
  }

  start() {
    if (this.hasLanded) {
      this.reset();
    }
    this.isRunning = true;
  }

  pause() {
    this.isRunning = false;
  }

  update(dt) {
    if (!this.isRunning || this.hasLanded) return;

    const subSteps = 10;
    const subDt = (dt * this.speedScale) / subSteps;

    for (let i = 0; i < subSteps; i++) {
      if (this.hasLanded) break;

      if (this.airResistance <= 1e-6) {
        // Analytical vacuum step
        this.time += subDt;
        const state = this.getAnalyticalState(this.time);
        this.currentPos.set(state.x, state.y);
        this.currentVel.set(state.vx, state.vy);

        if (this.currentPos.y <= 0 && this.time > 0.01) {
          this.currentPos.y = 0;
          this.hasLanded = true;
          this.isRunning = false;
          break;
        }
      } else {
        // Numerical RK4 step with quadratic air drag
        this.time += subDt;
        // state = [x, y, vx, vy]
        const state = [this.currentPos.x, this.currentPos.y, this.currentVel.x, this.currentVel.y];
        const nextState = MechanicsMath.rk4Step(this.time, state, subDt, (t, y) => {
          const vx = y[2];
          const vy = y[3];
          const speed = Math.sqrt(vx * vx + vy * vy);
          const dragF = this.airResistance * speed;
          const ax = -(dragF * vx) / this.mass;
          const ay = -this.gravity - (dragF * vy) / this.mass;
          return [vx, vy, ax, ay];
        });

        this.currentPos.set(nextState[0], Math.max(0, nextState[1]));
        this.currentVel.set(nextState[2], nextState[3]);

        if (nextState[1] <= 0 && this.time > 0.01) {
          this.currentPos.y = 0;
          this.hasLanded = true;
          this.isRunning = false;
          break;
        }
      }
    }

    this.recordPoint();
  }

  recordPoint() {
    const last = this.trajectory[this.trajectory.length - 1];
    if (!last || (this.time - last.t >= 0.015) || this.hasLanded) {
      this.trajectory.push({
        t: this.time,
        x: this.currentPos.x,
        y: this.currentPos.y,
        vx: this.currentVel.x,
        vy: this.currentVel.y,
        speed: this.currentVel.magnitude()
      });
    }
  }

  getAnalyticalState(t) {
    const rad = MechanicsMath.toRadians(this.angle);
    const vx0 = this.velocity * Math.cos(rad);
    const vy0 = this.velocity * Math.sin(rad);

    const x = vx0 * t;
    const y = Math.max(0, this.launchHeight + vy0 * t - 0.5 * this.gravity * t * t);
    const vx = vx0;
    const vy = vy0 - this.gravity * t;

    return {
      t: t,
      x: x,
      y: y,
      vx: vx,
      vy: vy,
      speed: Math.sqrt(vx * vx + vy * vy)
    };
  }

  getCurrentState() {
    return {
      t: this.time,
      x: this.currentPos.x,
      y: this.currentPos.y,
      vx: this.currentVel.x,
      vy: this.currentVel.y,
      speed: this.currentVel.magnitude(),
      isFlying: this.isRunning,
      hasLanded: this.hasLanded,
      maxHeight: this.maxHeightIdeal,
      range: this.hasLanded ? this.currentPos.x : this.rangeIdeal,
      timeOfFlight: this.hasLanded ? this.time : this.timeOfFlightIdeal
    };
  }
}
