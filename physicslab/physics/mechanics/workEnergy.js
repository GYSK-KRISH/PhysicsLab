// Work, Energy, and Power Physics Engine for PhysicsLab
import { Vector2D } from './vector2d.js';
import { MechanicsMath } from './mechanicsMath.js';

export class WorkEnergyPhysics {
  // 1. Constant Force Work: W = F * d * cos(theta)
  static calculateWork(force, displacement, angleDeg) {
    const thetaRad = MechanicsMath.toRadians(angleDeg);
    const work = force * displacement * Math.cos(thetaRad);
    return {
      force: force,
      displacement: displacement,
      angleDeg: angleDeg,
      cosTheta: Math.cos(thetaRad),
      work: work
    };
  }

  // 2. Variable Force Integration: W = ∫ F(x) dx
  static integrateVariableWork(controlPoints) {
    // controlPoints is array of {x, y} where y = Force F(x)
    return MechanicsMath.trapezoidalIntegration(controlPoints);
  }

  // 3. Work-Energy Theorem: W_net = ΔK = 0.5*m*v_f^2 - 0.5*m*v_i^2
  static checkWorkEnergyTheorem(mass, vInitial, vFinal, netWork) {
    const initialKE = 0.5 * mass * vInitial * vInitial;
    const finalKE = 0.5 * mass * vFinal * vFinal;
    const deltaKE = finalKE - initialKE;
    const difference = Math.abs(netWork - deltaKE);
    const isConsistent = difference < 0.05;

    return {
      mass,
      vInitial,
      vFinal,
      initialKE,
      finalKE,
      deltaKE,
      netWork,
      difference,
      isConsistent
    };
  }

  // 4. Power calculations: P_inst = F * v, P_avg = W / t
  static calculatePower(force, velocity, work = 0, time = 1) {
    const instantPower = force * velocity;
    const avgPower = time > 0 ? work / time : 0;
    return {
      instantPower,
      avgPower
    };
  }
}
