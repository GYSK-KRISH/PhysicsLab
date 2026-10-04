// Universal 2D Vector Engine for PhysicsLab Mechanics
// Provides robust vector operations and transformations

export class Vector2D {
  constructor(x = 0, y = 0) {
    this.x = Number.isFinite(x) ? x : 0;
    this.y = Number.isFinite(y) ? y : 0;
  }

  set(x, y) {
    this.x = Number.isFinite(x) ? x : 0;
    this.y = Number.isFinite(y) ? y : 0;
    return this;
  }

  clone() {
    return new Vector2D(this.x, this.y);
  }

  copy(v) {
    this.x = v.x;
    this.y = v.y;
    return this;
  }

  add(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  static add(v1, v2) {
    return new Vector2D(v1.x + v2.x, v1.y + v2.y);
  }

  subtract(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  static subtract(v1, v2) {
    return new Vector2D(v1.x - v2.x, v1.y - v2.y);
  }

  multiply(scalar) {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  static multiply(v, scalar) {
    return new Vector2D(v.x * scalar, v.y * scalar);
  }

  divide(scalar) {
    if (Math.abs(scalar) > 1e-12) {
      this.x /= scalar;
      this.y /= scalar;
    } else {
      this.x = 0;
      this.y = 0;
    }
    return this;
  }

  static divide(v, scalar) {
    if (Math.abs(scalar) > 1e-12) {
      return new Vector2D(v.x / scalar, v.y / scalar);
    }
    return new Vector2D(0, 0);
  }

  magnitudeSquared() {
    return this.x * this.x + this.y * this.y;
  }

  magnitude() {
    return Math.sqrt(this.magnitudeSquared());
  }

  normalize() {
    const mag = this.magnitude();
    if (mag > 1e-12) {
      this.x /= mag;
      this.y /= mag;
    } else {
      this.x = 0;
      this.y = 0;
    }
    return this;
  }

  unit() {
    return this.clone().normalize();
  }

  dot(v) {
    return this.x * v.x + this.y * v.y;
  }

  cross(v) {
    // 2D cross product magnitude (z-component)
    return this.x * v.y - this.y * v.x;
  }

  angle() {
    // Returns angle in radians relative to positive x-axis
    return Math.atan2(this.y, this.x);
  }

  angleTo(v) {
    const dot = this.dot(v);
    const magProduct = this.magnitude() * v.magnitude();
    if (magProduct < 1e-12) return 0;
    const cosVal = Math.max(-1, Math.min(1, dot / magProduct));
    return Math.acos(cosVal);
  }

  rotate(angleRad) {
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);
    const nx = this.x * cos - this.y * sin;
    const ny = this.x * sin + this.y * cos;
    this.x = nx;
    this.y = ny;
    return this;
  }

  static rotate(v, angleRad) {
    return v.clone().rotate(angleRad);
  }

  project(v) {
    const vMagSq = v.magnitudeSquared();
    if (vMagSq < 1e-12) {
      this.x = 0;
      this.y = 0;
      return this;
    }
    const scalar = this.dot(v) / vMagSq;
    this.x = v.x * scalar;
    this.y = v.y * scalar;
    return this;
  }

  reflect(normal) {
    const n = normal.unit();
    const dot2 = 2 * this.dot(n);
    this.x -= dot2 * n.x;
    this.y -= dot2 * n.y;
    return this;
  }

  distanceTo(v) {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  lerp(v, t) {
    this.x += (v.x - this.x) * t;
    this.y += (v.y - this.y) * t;
    return this;
  }

  static fromPolar(r, thetaRad) {
    return new Vector2D(r * Math.cos(thetaRad), r * Math.sin(thetaRad));
  }
}
