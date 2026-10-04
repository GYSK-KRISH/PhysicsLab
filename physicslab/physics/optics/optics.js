// Optics Physics Engine for PhysicsLab (Convex Lens Calculations)
// Implements thin lens equation: 1/f = 1/u + 1/v

export class LensPhysics {
  constructor(options = {}) {
    this.focalLength = options.focalLength !== undefined ? options.focalLength : 20.0; // cm or cm equivalent
    this.objectDistance = options.objectDistance !== undefined ? options.objectDistance : 40.0; // cm
    this.objectHeight = options.objectHeight !== undefined ? options.objectHeight : 15.0; // cm

    this.recalculate();
  }

  setParameters(focalLength, objectDistance, objectHeight = null) {
    this.focalLength = Math.max(1.0, focalLength);
    this.objectDistance = Math.max(0.5, objectDistance);
    if (objectHeight !== null) {
      this.objectHeight = Math.max(2.0, objectHeight);
    }
    this.recalculate();
  }

  recalculate() {
    const f = this.focalLength;
    const u = this.objectDistance;

    // Check for object at focal point (u == f)
    const delta = u - f;
    if (Math.abs(delta) < 0.1) {
      this.isAtFocalPoint = true;
      this.imageDistance = Infinity;
      this.magnification = Infinity;
      this.imageHeight = Infinity;
      this.imageType = 'At Infinity';
      this.orientation = 'N/A';
      this.sizeClass = 'Infinite';
      return;
    }

    this.isAtFocalPoint = false;

    // Thin Lens Formula: 1/v = 1/f - 1/u = (u - f) / (u * f)
    // v = (u * f) / (u - f)
    const v = (u * f) / (u - f);
    this.imageDistance = v;

    // Magnification m = -v / u
    const m = -v / u;
    this.magnification = m;

    // Image height hi = m * ho
    this.imageHeight = m * this.objectHeight;

    // Classification
    if (v > 0) {
      this.imageType = 'Real';
      this.orientation = 'Inverted';
    } else {
      this.imageType = 'Virtual';
      this.orientation = 'Upright';
    }

    const absM = Math.abs(m);
    if (Math.abs(absM - 1.0) < 0.02) {
      this.sizeClass = 'Same Size';
    } else if (absM > 1.0) {
      this.sizeClass = 'Magnified';
    } else {
      this.sizeClass = 'Diminished';
    }
  }

  // Helper to determine lens case classification
  getCaseName() {
    const f = this.focalLength;
    const u = this.objectDistance;

    if (this.isAtFocalPoint) {
      return 'Object at Focal Point (F)';
    } else if (u > 2 * f + 0.1) {
      return 'Object Beyond 2F';
    } else if (Math.abs(u - 2 * f) <= 0.1) {
      return 'Object at 2F';
    } else if (u > f && u < 2 * f) {
      return 'Object Between F and 2F';
    } else {
      return 'Object Inside Focal Length (u < F)';
    }
  }
}
