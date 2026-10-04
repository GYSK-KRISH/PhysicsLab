// Collision Physics Engine (1D and 2D) for PhysicsLab Mechanics
import { Vector2D } from './vector2d.js';
import { MechanicsMath } from './mechanicsMath.js';

export class Collision1DPhysics {
  constructor(options = {}) {
    this.m1 = options.m1 !== undefined ? options.m1 : 2.0; // kg
    this.u1 = options.u1 !== undefined ? options.u1 : 8.0; // m/s
    this.m2 = options.m2 !== undefined ? options.m2 : 3.0; // kg
    this.u2 = options.u2 !== undefined ? options.u2 : -2.0; // m/s
    this.e = options.e !== undefined ? options.e : 1.0; // coefficient of restitution (1 = elastic, 0 = perfectly inelastic)

    this.pos1 = -20.0;
    this.pos2 = 20.0;
    this.v1 = this.u1;
    this.v2 = this.u2;

    this.time = 0;
    this.hasCollided = false;
    this.collisionTime = 0;
    this.isRunning = false;

    this.history = []; // Timeline of state
    this.recalculateVelocities();
  }

  setParameters(m1, u1, m2, u2, e) {
    this.m1 = Math.max(0.1, m1);
    this.u1 = u1;
    this.m2 = Math.max(0.1, m2);
    this.u2 = u2;
    this.e = Math.max(0, Math.min(1, e));
    this.reset();
  }

  recalculateVelocities() {
    // 1D Collision analytical formulas with coefficient of restitution e:
    // v1 = (m1*u1 + m2*u2 - m2*e*(u1 - u2)) / (m1 + m2)
    // v2 = (m1*u1 + m2*u2 + m1*e*(u1 - u2)) / (m1 + m2)
    const totalMass = this.m1 + this.m2;
    const relVelInitial = this.u1 - this.u2;

    this.finalV1 = (this.m1 * this.u1 + this.m2 * this.u2 - this.m2 * this.e * relVelInitial) / totalMass;
    this.finalV2 = (this.m1 * this.u1 + this.m2 * this.u2 + this.m1 * this.e * relVelInitial) / totalMass;

    // Center of Mass velocity (constant in isolated system)
    this.v_cm = (this.m1 * this.u1 + this.m2 * this.u2) / totalMass;

    // Initial momentum and KE
    this.p1_initial = this.m1 * this.u1;
    this.p2_initial = this.m2 * this.u2;
    this.p_total_initial = this.p1_initial + this.p2_initial;

    this.ke1_initial = 0.5 * this.m1 * this.u1 * this.u1;
    this.ke2_initial = 0.5 * this.m2 * this.u2 * this.u2;
    this.ke_total_initial = this.ke1_initial + this.ke2_initial;

    // Final momentum and KE
    this.p1_final = this.m1 * this.finalV1;
    this.p2_final = this.m2 * this.finalV2;
    this.p_total_final = this.p1_final + this.p2_final;

    this.ke1_final = 0.5 * this.m1 * this.finalV1 * this.finalV1;
    this.ke2_final = 0.5 * this.m2 * this.finalV2 * this.finalV2;
    this.ke_total_final = this.ke1_final + this.ke2_final;

    this.energyLoss = this.ke_total_initial - this.ke_total_final;
  }

  reset() {
    this.pos1 = -20.0;
    this.pos2 = 20.0;
    this.v1 = this.u1;
    this.v2 = this.u2;
    this.time = 0;
    this.hasCollided = false;
    this.collisionTime = 0;
    this.isRunning = false;
    this.history = [];
    this.recalculateVelocities();
    this.recordPoint();
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

    if (!this.hasCollided) {
      this.pos1 += this.v1 * dt;
      this.pos2 += this.v2 * dt;

      // Check collision (body radius = 3.0m each, so contact at distance 6.0m)
      if (this.pos1 + 3.0 >= this.pos2 - 3.0) {
        this.hasCollided = true;
        this.collisionTime = this.time;
        this.v1 = this.finalV1;
        this.v2 = this.finalV2;
      }
    } else {
      this.pos1 += this.v1 * dt;
      this.pos2 += this.v2 * dt;
    }

    this.recordPoint();
  }

  recordPoint() {
    const p1 = this.m1 * this.v1;
    const p2 = this.m2 * this.v2;
    const ke1 = 0.5 * this.m1 * this.v1 * this.v1;
    const ke2 = 0.5 * this.m2 * this.v2 * this.v2;

    this.history.push({
      t: this.time,
      p1,
      p2,
      pTotal: p1 + p2,
      v1: this.v1,
      v2: this.v2,
      ke1,
      ke2,
      keTotal: ke1 + ke2,
      hasCollided: this.hasCollided
    });
  }

  getCOMFrameState() {
    return {
      v_cm: this.v_cm,
      u1_com: this.u1 - this.v_cm,
      u2_com: this.u2 - this.v_cm,
      v1_com: this.finalV1 - this.v_cm,
      v2_com: this.finalV2 - this.v_cm,
      p_cm_total: 0 // COM frame momentum is always 0
    };
  }
}

export class Collision2DPhysics {
  constructor(options = {}) {
    this.m1 = options.m1 || 2.0;
    this.m2 = options.m2 || 2.0;
    this.pos1 = new Vector2D(-30, -5);
    this.pos2 = new Vector2D(10, 0);
    this.vel1 = new Vector2D(15, 0);
    this.vel2 = new Vector2D(0, 0);
    this.e = options.e !== undefined ? options.e : 1.0;
    this.radius = 4.0;

    this.time = 0;
    this.isRunning = false;
    this.hasCollided = false;
    this.trajectory1 = [];
    this.trajectory2 = [];
  }

  setParameters(m1, m2, vx1, vy1, e, impactY = -2) {
    this.m1 = Math.max(0.1, m1);
    this.m2 = Math.max(0.1, m2);
    this.vel1.set(vx1, vy1);
    this.vel2.set(0, 0);
    this.e = Math.max(0, Math.min(1, e));
    this.pos1.set(-30, impactY);
    this.pos2.set(10, 0);
    this.reset();
  }

  reset() {
    this.time = 0;
    this.isRunning = false;
    this.hasCollided = false;
    this.trajectory1 = [];
    this.trajectory2 = [];
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

    this.pos1.add(Vector2D.multiply(this.vel1, dt));
    this.pos2.add(Vector2D.multiply(this.vel2, dt));

    this.trajectory1.push(this.pos1.clone());
    this.trajectory2.push(this.pos2.clone());

    if (!this.hasCollided) {
      const dist = this.pos1.distanceTo(this.pos2);
      if (dist <= this.radius * 2) {
        this.resolveCollision();
        this.hasCollided = true;
      }
    }
  }

  resolveCollision() {
    // Normal vector from 1 to 2
    const normal = Vector2D.subtract(this.pos2, this.pos1).normalize();
    const tangent = new Vector2D(-normal.y, normal.x);

    // Project velocities onto normal and tangent
    const v1n = this.vel1.dot(normal);
    const v1t = this.vel1.dot(tangent);
    const v2n = this.vel2.dot(normal);
    const v2t = this.vel2.dot(tangent);

    // 1D collision along the normal direction
    const totalM = this.m1 + this.m2;
    const v1n_after = (this.m1 * v1n + this.m2 * v2n - this.m2 * this.e * (v1n - v2n)) / totalM;
    const v2n_after = (this.m1 * v1n + this.m2 * v2n + this.m1 * this.e * (v1n - v2n)) / totalM;

    // Tangential components unchanged (frictionless spheres)
    const v1t_after = v1t;
    const v2t_after = v2t;

    // Convert back to Cartesian
    this.vel1 = Vector2D.add(Vector2D.multiply(normal, v1n_after), Vector2D.multiply(tangent, v1t_after));
    this.vel2 = Vector2D.add(Vector2D.multiply(normal, v2n_after), Vector2D.multiply(tangent, v2t_after));
  }

  getTotalMomentum() {
    const p1 = Vector2D.multiply(this.vel1, this.m1);
    const p2 = Vector2D.multiply(this.vel2, this.m2);
    return Vector2D.add(p1, p2);
  }
}
