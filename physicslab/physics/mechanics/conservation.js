// Unified Conservation Laws Laboratory Physics Engine for PhysicsLab
import { MechanicsMath } from './mechanicsMath.js';

export class ConservationLawsPhysics {
  constructor() {
    this.mode = 'COLLISION_MOMENTUM_ENERGY'; // 'COLLISION_MOMENTUM_ENERGY' | 'SHM_ENERGY' | 'ANGULAR_MOMENTUM' | 'GRAVITY_ORBIT'
    this.tolerance = 0.05; // 5% numerical tolerance threshold
  }

  static verifyMomentumConservation(pInitial, pCurrent, tolerance = 0.01) {
    const diff = Math.abs(pCurrent - pInitial);
    const relativeError = pInitial !== 0 ? (diff / Math.abs(pInitial)) * 100 : diff * 100;
    const isConserved = diff <= tolerance || relativeError <= 1.0;
    return {
      initial: pInitial,
      current: pCurrent,
      diff,
      relativeError,
      isConserved
    };
  }

  static verifyEnergyConservation(eInitial, eCurrent, tolerance = 0.05) {
    const diff = Math.abs(eCurrent - eInitial);
    const relativeError = eInitial !== 0 ? (diff / Math.abs(eInitial)) * 100 : diff * 100;
    const isConserved = diff <= tolerance || relativeError <= 1.0;
    return {
      initial: eInitial,
      current: eCurrent,
      diff,
      relativeError,
      isConserved
    };
  }

  static verifyAngularMomentumConservation(lInitial, lCurrent, tolerance = 0.01) {
    const diff = Math.abs(lCurrent - lInitial);
    const relativeError = lInitial !== 0 ? (diff / Math.abs(lInitial)) * 100 : diff * 100;
    const isConserved = diff <= tolerance || relativeError <= 1.0;
    return {
      initial: lInitial,
      current: lCurrent,
      diff,
      relativeError,
      isConserved
    };
  }
}
