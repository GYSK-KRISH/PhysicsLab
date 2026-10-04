// Center of Mass Physics Engine for PhysicsLab Mechanics
import { Vector2D } from './vector2d.js';

export class CenterOfMassPhysics {
  constructor() {
    this.particles = [
      { id: 1, mass: 2.0, pos: new Vector2D(-50, -30), vel: new Vector2D(0, 0), color: '#5EE7FF' },
      { id: 2, mass: 4.0, pos: new Vector2D(60, 40), vel: new Vector2D(0, 0), color: '#8B5CF6' },
      { id: 3, mass: 1.0, pos: new Vector2D(-20, 60), vel: new Vector2D(0, 0), color: '#4ADE80' }
    ];

    this.comPos = new Vector2D(0, 0);
    this.comVel = new Vector2D(0, 0);
    this.totalMass = 0;
    this.recalculate();
  }

  addParticle(mass, x, y, color = '#FACC15') {
    const id = this.particles.length + 1;
    this.particles.push({
      id,
      mass: Math.max(0.1, mass),
      pos: new Vector2D(x, y),
      vel: new Vector2D(0, 0),
      color
    });
    this.recalculate();
  }

  removeParticle(index) {
    if (this.particles.length > 1 && index >= 0 && index < this.particles.length) {
      this.particles.splice(index, 1);
      this.recalculate();
    }
  }

  setParticlePos(index, x, y) {
    if (index >= 0 && index < this.particles.length) {
      this.particles[index].pos.set(x, y);
      this.recalculate();
    }
  }

  setParticleMass(index, mass) {
    if (index >= 0 && index < this.particles.length) {
      this.particles[index].mass = Math.max(0.1, mass);
      this.recalculate();
    }
  }

  recalculate() {
    let totalM = 0;
    let sumMX = 0;
    let sumMY = 0;
    let sumMVX = 0;
    let sumMVY = 0;

    for (const p of this.particles) {
      totalM += p.mass;
      sumMX += p.mass * p.pos.x;
      sumMY += p.mass * p.pos.y;
      sumMVX += p.mass * p.vel.x;
      sumMVY += p.mass * p.vel.y;
    }

    this.totalMass = totalM > 0 ? totalM : 1;
    this.comPos.set(sumMX / this.totalMass, sumMY / this.totalMass);
    this.comVel.set(sumMVX / this.totalMass, sumMVY / this.totalMass);
  }
}
