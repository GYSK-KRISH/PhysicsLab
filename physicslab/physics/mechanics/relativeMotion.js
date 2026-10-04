// Relative Motion Physics Engine for PhysicsLab Mechanics
import { Vector2D } from './vector2d.js';
import { MechanicsMath } from './mechanicsMath.js';

export class RelativeMotionPhysics {
  constructor(options = {}) {
    this.mode = options.mode || 'CARS'; // 'CARS' | 'RIVER_BOAT' | 'RAIN_PERSON'

    // Scenario 1: Two Cars
    this.carA_pos = new Vector2D(0, 50);
    this.carA_vel = new Vector2D(20, 0); // m/s
    this.carB_pos = new Vector2D(100, 0);
    this.carB_vel = new Vector2D(15, 0); // m/s

    // Scenario 2: River & Boat
    this.riverWidth = 100; // m
    this.riverCurrent = new Vector2D(4, 0); // m/s (eastward)
    this.boatSpeedStill = 6; // m/s
    this.boatHeadingDeg = 90; // degrees (90 is straight across north)
    this.boatPos = new Vector2D(0, 0);

    // Scenario 3: Rain & Person
    this.rainVel = new Vector2D(0, -12); // m/s (falling down)
    this.personSpeed = 5; // m/s (walking right)

    this.time = 0;
    this.isRunning = false;
  }

  setMode(mode) {
    this.mode = mode;
    this.reset();
  }

  reset() {
    this.time = 0;
    this.isRunning = false;
    this.carA_pos.set(0, 50);
    this.carB_pos.set(100, 0);
    this.boatPos.set(0, 0);
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

    if (this.mode === 'CARS') {
      this.carA_pos.add(Vector2D.multiply(this.carA_vel, dt));
      this.carB_pos.add(Vector2D.multiply(this.carB_vel, dt));
    } else if (this.mode === 'RIVER_BOAT') {
      const vResultant = this.getRiverBoatResultantVelocity();
      this.boatPos.add(Vector2D.multiply(vResultant, dt));
      if (this.boatPos.y >= this.riverWidth) {
        this.boatPos.y = this.riverWidth;
        this.isRunning = false;
      }
    }
  }

  getRelativeCarVelocity() {
    // V_AB = V_A - V_B
    return Vector2D.subtract(this.carA_vel, this.carB_vel);
  }

  getRiverBoatResultantVelocity() {
    const headingRad = MechanicsMath.toRadians(this.boatHeadingDeg);
    const vBoatEngine = new Vector2D(
      this.boatSpeedStill * Math.cos(headingRad),
      this.boatSpeedStill * Math.sin(headingRad)
    );
    // V_boat_ground = V_boat_water + V_river
    return Vector2D.add(vBoatEngine, this.riverCurrent);
  }

  getRainRelativeVelocity() {
    const personVel = new Vector2D(this.personSpeed, 0);
    // V_rain_person = V_rain - V_person
    const vRel = Vector2D.subtract(this.rainVel, personVel);
    // Umbrella angle from vertical: tan(theta) = |v_rel.x| / |v_rel.y|
    const umbrellaAngleRad = Math.atan2(Math.abs(vRel.x), Math.abs(vRel.y));
    const umbrellaAngleDeg = MechanicsMath.toDegrees(umbrellaAngleRad);
    return {
      vRel: vRel,
      umbrellaAngleDeg: umbrellaAngleDeg,
      personVel: personVel,
      rainVel: this.rainVel
    };
  }
}
