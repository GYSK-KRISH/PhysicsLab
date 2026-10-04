// Pendulum Physics Engine for PhysicsLab
// Implements simple harmonic motion equations for simple pendulum

export const PlanetGravity = {
  EARTH: { name: 'Earth', g: 9.81 },
  MOON: { name: 'Moon', g: 1.62 },
  MARS: { name: 'Mars', g: 3.71 }
};

export class PendulumPhysics {
  constructor(options = {}) {
    this.length = options.length !== undefined ? options.length : 1.0; // meters
    this.initialAngle = options.initialAngle !== undefined ? options.initialAngle : 30.0; // degrees
    this.gravity = options.gravity !== undefined ? options.gravity : PlanetGravity.EARTH.g; // m/s^2
    this.planetName = options.planetName || 'Earth';

    this.time = 0;
    this.isOscillating = false;
    this.speedScale = 1.0;

    this.trajectory = [];
    this.recalculateTheoretical();
  }

  setParameters(length, initialAngle, gravity, planetName = null) {
    this.length = Math.max(0.1, length);
    this.initialAngle = Math.max(1, Math.min(85, initialAngle));
    this.gravity = Math.max(0.1, gravity);
    if (planetName) {
      this.planetName = planetName;
    }
    this.recalculateTheoretical();
    this.reset();
  }

  setPlanet(planetKey) {
    const p = PlanetGravity[planetKey];
    if (p) {
      this.gravity = p.g;
      this.planetName = p.name;
      this.recalculateTheoretical();
      this.reset();
    }
  }

  recalculateTheoretical() {
    this.theta0Rad = (this.initialAngle * Math.PI) / 180;
    // Natural angular frequency omega0 = sqrt(g / L)
    this.omega0 = Math.sqrt(this.gravity / this.length);
    // Period T = 2 * pi * sqrt(L / g)
    this.period = 2 * Math.PI * Math.sqrt(this.length / this.gravity);
  }

  start() {
    this.isOscillating = true;
  }

  pause() {
    this.isOscillating = false;
  }

  reset() {
    this.time = 0;
    this.isOscillating = false;
    this.trajectory = [];
    this.recordPoint(0);
  }

  update(dt) {
    if (!this.isOscillating) return;

    const effectiveDt = dt * this.speedScale;
    this.time += effectiveDt;

    this.recordPoint(this.time);
  }

  recordPoint(t) {
    const state = this.getStateAt(t);
    const lastPoint = this.trajectory[this.trajectory.length - 1];

    // Keep max trail history length
    if (this.trajectory.length > 250) {
      this.trajectory.shift();
    }

    if (!lastPoint || (t - lastPoint.t >= 0.015)) {
      this.trajectory.push(state);
    }
  }

  getStateAt(t) {
    // theta(t) = theta0 * cos(sqrt(g / L) * t)
    const thetaRad = this.theta0Rad * Math.cos(this.omega0 * t);
    const thetaDeg = (thetaRad * 180) / Math.PI;

    // Angular velocity omega(t) = -theta0 * sqrt(g / L) * sin(sqrt(g / L) * t)
    const angularVelocity = -this.theta0Rad * this.omega0 * Math.sin(this.omega0 * t);

    // Position of bob relative to pivot
    // x = L * sin(theta)
    // y = L * cos(theta)
    const bobX = this.length * Math.sin(thetaRad);
    const bobY = this.length * Math.cos(thetaRad);

    return {
      t: t,
      thetaRad: thetaRad,
      thetaDeg: thetaDeg,
      angularVelocity: angularVelocity,
      bobX: bobX,
      bobY: bobY
    };
  }

  getCurrentState() {
    return this.getStateAt(this.time);
  }
}
