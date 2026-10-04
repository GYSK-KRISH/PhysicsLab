// Torque and Lever Physics Engine for PhysicsLab Mechanics
import { Vector2D } from './vector2d.js';
import { MechanicsMath } from './mechanicsMath.js';

export class TorquePhysics {
  constructor(options = {}) {
    this.leverLength = 5.0; // meters (total lever arm)
    this.pivotX = 0.0; // pivot at center or base

    // Force application
    this.distance = options.distance !== undefined ? options.distance : 2.5; // r (meters from pivot)
    this.force = options.force !== undefined ? options.force : 20.0; // F (Newtons)
    this.angleDeg = options.angleDeg !== undefined ? options.angleDeg : 90.0; // theta (degrees)

    this.recalculate();
  }

  setParameters(r, f, angleDeg) {
    this.distance = Math.max(0.1, Math.min(this.leverLength, r));
    this.force = Math.max(0, f);
    this.angleDeg = Math.max(0, Math.min(180, angleDeg));
    this.recalculate();
  }

  recalculate() {
    const thetaRad = MechanicsMath.toRadians(this.angleDeg);
    this.sinTheta = Math.sin(thetaRad);

    // tau = r * F * sin(theta)
    this.torqueMagnitude = this.distance * this.force * this.sinTheta;

    // Perpendicular component of force: F_perp = F * sin(theta)
    this.fPerp = this.force * this.sinTheta;
    // Parallel component: F_parallel = F * cos(theta) (produces 0 torque)
    this.fParallel = this.force * Math.cos(thetaRad);

    // Lever arm perpendicular: r_perp = r * sin(theta)
    this.rPerp = this.distance * this.sinTheta;

    // Direction (CCW positive)
    this.direction = this.torqueMagnitude > 1e-4 ? 'COUNTER-CLOCKWISE (+)' : 'ZERO';
  }
}
