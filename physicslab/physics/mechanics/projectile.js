// Projectile Motion Physics Engine for PhysicsLab
// Implements exact 2D Newtonian kinematic equations

export class ProjectilePhysics {
  constructor(options = {}) {
    this.velocity = options.velocity !== undefined ? options.velocity : 20.0; // m/s
    this.angle = options.angle !== undefined ? options.angle : 45.0; // degrees
    this.gravity = options.gravity !== undefined ? options.gravity : 9.81; // m/s^2

    // Internal simulation state
    this.time = 0; // seconds
    this.isFlying = false;
    this.hasLanded = false;
    this.speedScale = 1.0;

    // Recorded trajectory data for graph rendering & path drawing
    this.trajectory = [];

    this.recalculateTheoretical();
  }

  get rangeIdeal() { return this.range; }
  get maxHeightIdeal() { return this.maxHeight; }
  get timeOfFlightIdeal() { return this.timeOfFlight; }

  setParameters(velocity, angle, gravity) {
    this.velocity = Math.max(0.1, velocity);
    this.angle = Math.max(0, Math.min(90, angle));
    this.gravity = Math.max(0.1, gravity);
    this.recalculateTheoretical();
    if (!this.isFlying && !this.hasLanded) {
      this.reset();
    }
  }

  recalculateTheoretical() {
    const rad = (this.angle * Math.PI) / 180;
    this.rad = rad;
    this.vx0 = this.velocity * Math.cos(rad);
    this.vy0 = this.velocity * Math.sin(rad);

    // Exact theoretical formulas
    // T = (2 * u * sin(theta)) / g
    this.timeOfFlight = (2 * this.velocity * Math.sin(rad)) / this.gravity;
    
    // H = (u^2 * sin^2(theta)) / (2 * g)
    const sinAngle = Math.sin(rad);
    this.maxHeight = (this.velocity * this.velocity * sinAngle * sinAngle) / (2 * this.gravity);
    
    // R = (u^2 * sin(2 * theta)) / g
    this.range = (this.velocity * this.velocity * Math.sin(2 * rad)) / this.gravity;

    // Time at which peak height is reached
    this.timeToApex = this.vy0 / this.gravity;
  }

  start() {
    if (this.hasLanded) {
      this.reset();
    }
    this.isFlying = true;
  }

  pause() {
    this.isFlying = false;
  }

  reset() {
    this.time = 0;
    this.isFlying = false;
    this.hasLanded = false;
    this.trajectory = [];
    
    // Record initial point
    this.recordPoint(0);
  }

  update(dt) {
    if (!this.isFlying || this.hasLanded) return;

    const effectiveDt = dt * this.speedScale;
    this.time += effectiveDt;

    if (this.time >= this.timeOfFlight) {
      this.time = this.timeOfFlight;
      this.isFlying = false;
      this.hasLanded = true;
    }

    this.recordPoint(this.time);
  }

  recordPoint(t) {
    const state = this.getStateAt(t);
    // Record at reasonable sample density
    const lastPoint = this.trajectory[this.trajectory.length - 1];
    if (!lastPoint || (t - lastPoint.t >= 0.015) || this.hasLanded) {
      this.trajectory.push(state);
    }
  }

  getStateAt(t) {
    const clampedT = Math.max(0, Math.min(this.timeOfFlight, t));
    
    // Exact Kinematic Equations:
    // x = u * cos(theta) * t
    // y = u * sin(theta) * t - 0.5 * g * t^2
    const x = this.vx0 * clampedT;
    const y = Math.max(0, this.vy0 * clampedT - 0.5 * this.gravity * clampedT * clampedT);

    // Velocity components:
    // vx = u * cos(theta)
    // vy = u * sin(theta) - g * t
    const vx = this.vx0;
    const vy = clampedT >= this.timeOfFlight && this.timeOfFlight > 0 
      ? 0 
      : this.vy0 - this.gravity * clampedT;
    const vTotal = Math.sqrt(vx * vx + vy * vy);
    const vAngle = Math.atan2(vy, vx);

    // Accelerations:
    const ax = 0;
    const ay = -this.gravity;

    return {
      t: clampedT,
      x: x,
      y: y,
      vx: vx,
      vy: vy,
      v: vTotal,
      vAngle: vAngle,
      ax: ax,
      ay: ay
    };
  }

  getCurrentState() {
    return this.getStateAt(this.time);
  }
}

export { ProjectilePhysics as AdvancedProjectilePhysics };
