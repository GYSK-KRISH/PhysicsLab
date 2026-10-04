// Free Fall Physics Engine for PhysicsLab
// Implements 1D gravitational acceleration equations

export const PlanetGravity = {
  EARTH: { name: 'Earth', g: 9.81 },
  MOON: { name: 'Moon', g: 1.62 },
  MARS: { name: 'Mars', g: 3.71 }
};

export class FreeFallPhysics {
  constructor(options = {}) {
    this.height = options.height !== undefined ? options.height : 50.0; // meters
    this.gravity = options.gravity !== undefined ? options.gravity : PlanetGravity.EARTH.g; // m/s^2
    this.planetName = options.planetName || 'Earth';

    this.time = 0;
    this.isFalling = false;
    this.hasLanded = false;
    this.speedScale = 1.0;

    this.trajectory = [];
    this.recalculateTheoretical();
  }

  setParameters(height, gravity, planetName = null) {
    this.height = Math.max(1, height);
    this.gravity = Math.max(0.1, gravity);
    if (planetName) {
      this.planetName = planetName;
    }
    this.recalculateTheoretical();
    if (!this.isFalling && !this.hasLanded) {
      this.reset();
    }
  }

  setPlanet(planetKey) {
    const p = PlanetGravity[planetKey];
    if (p) {
      this.gravity = p.g;
      this.planetName = p.name;
      this.recalculateTheoretical();
      if (!this.isFalling && !this.hasLanded) {
        this.reset();
      }
    }
  }

  recalculateTheoretical() {
    // t_impact = sqrt(2h / g)
    this.impactTime = Math.sqrt((2 * this.height) / this.gravity);
    // v_final = sqrt(2gh)
    this.finalVelocity = Math.sqrt(2 * this.gravity * this.height);
  }

  start() {
    if (this.hasLanded) {
      this.reset();
    }
    this.isFalling = true;
  }

  pause() {
    this.isFalling = false;
  }

  reset() {
    this.time = 0;
    this.isFalling = false;
    this.hasLanded = false;
    this.trajectory = [];
    this.recordPoint(0);
  }

  update(dt) {
    if (!this.isFalling || this.hasLanded) return;

    const effectiveDt = dt * this.speedScale;
    this.time += effectiveDt;

    if (this.time >= this.impactTime) {
      this.time = this.impactTime;
      this.isFalling = false;
      this.hasLanded = true;
    }

    this.recordPoint(this.time);
  }

  recordPoint(t) {
    const state = this.getStateAt(t);
    const lastPoint = this.trajectory[this.trajectory.length - 1];
    if (!lastPoint || (t - lastPoint.t >= 0.015) || this.hasLanded) {
      this.trajectory.push(state);
    }
  }

  getStateAt(t) {
    const clampedT = Math.max(0, Math.min(this.impactTime, t));
    
    // y = h - 0.5 * g * t^2
    const currentHeight = Math.max(0, this.height - 0.5 * this.gravity * clampedT * clampedT);
    const distanceFallen = this.height - currentHeight;
    
    // v = g * t
    const velocity = this.gravity * clampedT;
    const acceleration = this.gravity;

    return {
      t: clampedT,
      height: currentHeight,
      distanceFallen: distanceFallen,
      velocity: velocity,
      acceleration: acceleration
    };
  }

  getCurrentState() {
    return this.getStateAt(this.time);
  }
}
