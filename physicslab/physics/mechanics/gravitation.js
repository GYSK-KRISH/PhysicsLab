// Gravitation, Field, Potential, and Orbital Mechanics Physics Engine
import { Vector2D } from './vector2d.js';
import { MechanicsMath } from './mechanicsMath.js';

export const GRAVITATIONAL_CONSTANT = 6.6743e-11; // N*m^2/kg^2

export class GravitationPhysics {
  // 1. Two-body Universal Gravitation: F = G*m1*m2 / r^2
  static calculateForce(m1, m2, r, G = GRAVITATIONAL_CONSTANT) {
    const safeR = Math.max(1e-3, r);
    const force = (G * m1 * m2) / (safeR * safeR);
    const potentialEnergy = -(G * m1 * m2) / safeR;
    const fieldAt2 = (G * m1) / (safeR * safeR);
    return {
      force,
      potentialEnergy,
      fieldAt2,
      r: safeR
    };
  }

  // 2. Multi-body Gravitational Field at point (x, y)
  static calculateFieldAt(point, sources, G = 1.0) {
    // G scaled for canvas simulation visual grids
    const totalField = new Vector2D(0, 0);

    for (const src of sources) {
      const rVec = Vector2D.subtract(src.pos, point); // pointing toward source
      const dist = rVec.magnitude();
      if (dist < 5.0) continue; // inside mass boundary

      const gMag = (G * src.mass) / (dist * dist);
      const gVec = rVec.normalize().multiply(gMag);
      totalField.add(gVec);
    }

    return totalField;
  }

  // 3. Gravitational Potential at distance r: V = -G*M / r
  static calculatePotential(M, r, G = GRAVITATIONAL_CONSTANT) {
    const safeR = Math.max(1e-2, r);
    const V = -(G * M) / safeR;
    return {
      r: safeR,
      potential: V
    };
  }

  // 4. Escape Velocity: v_e = sqrt(2 * G * M / R)
  static calculateEscapeVelocity(M, R, G = GRAVITATIONAL_CONSTANT) {
    const safeR = Math.max(1.0, R);
    const v_escape = Math.sqrt((2 * G * M) / safeR);
    const v_orbital_surface = Math.sqrt((G * M) / safeR);
    return {
      v_escape,
      v_orbital_surface
    };
  }

  // 5. Circular Satellite Orbit: v = sqrt(G*M / r), T = 2*pi*sqrt(r^3 / (G*M))
  static calculateCircularOrbit(planetMass, planetRadius, altitude, G = GRAVITATIONAL_CONSTANT) {
    const r = planetRadius + altitude;
    const speed = Math.sqrt((G * planetMass) / r);
    const period = 2 * Math.PI * Math.sqrt((r * r * r) / (G * planetMass));
    const acceleration = (G * planetMass) / (r * r);
    return {
      r,
      altitude,
      speed,
      period,
      acceleration
    };
  }

  // 6. Geostationary Orbit parameters (Earth rotation period T = 86164s sidereal day)
  static calculateGeostationaryOrbit(planetMass = 5.972e24, planetRadius = 6.371e6, siderealDaySec = 86164) {
    const G = GRAVITATIONAL_CONSTANT;
    // r_geo = ( (G * M * T^2) / (4 * pi^2) )^(1/3)
    const r_geo = Math.cbrt((G * planetMass * siderealDaySec * siderealDaySec) / (4 * Math.PI * Math.PI));
    const altitude = r_geo - planetRadius;
    const speed = Math.sqrt((G * planetMass) / r_geo);
    const period = siderealDaySec;
    return {
      r_geo,
      altitude,
      speed,
      period
    };
  }
}

export class OrbitSimulator {
  constructor(options = {}) {
    this.planetMass = options.planetMass || 10000;
    this.planetRadius = options.planetRadius || 30;
    this.G = 1.0; // Scaled simulation G

    this.satellitePos = new Vector2D(120, 0);
    this.satelliteVel = new Vector2D(0, Math.sqrt((this.G * this.planetMass) / 120));
    this.satelliteMass = 1.0;

    this.time = 0;
    this.isRunning = false;
    this.trajectory = [];
  }

  setInitialState(r, vy, G_mass = 10000) {
    this.planetMass = G_mass;
    this.satellitePos.set(r, 0);
    this.satelliteVel.set(0, vy);
    this.reset();
  }

  reset() {
    this.time = 0;
    this.isRunning = false;
    this.trajectory = [];
  }

  start() {
    this.isRunning = true;
  }

  pause() {
    this.isRunning = false;
  }

  update(dt) {
    if (!this.isRunning) return;

    // Sub-stepping with RK4 for high orbital accuracy and energy conservation
    const subSteps = 10;
    const subDt = dt / subSteps;

    for (let s = 0; s < subSteps; s++) {
      this.time += subDt;

      const state = [this.satellitePos.x, this.satellitePos.y, this.satelliteVel.x, this.satelliteVel.y];
      const nextState = MechanicsMath.rk4Step(this.time, state, subDt, (t, y) => {
        const px = y[0];
        const py = y[1];
        const vx = y[2];
        const vy = y[3];
        const r2 = px * px + py * py;
        const r = Math.sqrt(r2);
        if (r < 5.0) return [vx, vy, 0, 0];

        const fMag = (this.G * this.planetMass) / r2;
        const ax = -fMag * (px / r);
        const ay = -fMag * (py / r);
        return [vx, vy, ax, ay];
      });

      this.satellitePos.set(nextState[0], nextState[1]);
      this.satelliteVel.set(nextState[2], nextState[3]);

      if (this.satellitePos.magnitude() < this.planetRadius) {
        this.isRunning = false;
        break;
      }
    }

    this.recordTrajectory();
  }

  recordTrajectory() {
    const r = this.satellitePos.magnitude();
    const v = this.satelliteVel.magnitude();
    const ke = 0.5 * this.satelliteMass * v * v;
    const pe = -(this.G * this.planetMass * this.satelliteMass) / r;
    const totalEnergy = ke + pe;

    this.trajectory.push({
      x: this.satellitePos.x,
      y: this.satellitePos.y,
      r,
      v,
      ke,
      pe,
      totalEnergy
    });

    if (this.trajectory.length > 600) {
      this.trajectory.shift();
    }
  }

  getOrbitalParameters() {
    const r = this.satellitePos.magnitude();
    const v = this.satelliteVel.magnitude();
    const ke = 0.5 * this.satelliteMass * v * v;
    const pe = -(this.G * this.planetMass * this.satelliteMass) / r;
    const totalEnergy = ke + pe;

    // Semi-major axis from Vis-Viva: 1/a = 2/r - v^2 / (G*M)
    const invA = (2 / r) - (v * v) / (this.G * this.planetMass);
    const a = invA > 1e-6 ? 1 / invA : Infinity;

    return {
      r,
      v,
      ke,
      pe,
      totalEnergy,
      isBound: totalEnergy < 0,
      semiMajorAxis: a
    };
  }
}
