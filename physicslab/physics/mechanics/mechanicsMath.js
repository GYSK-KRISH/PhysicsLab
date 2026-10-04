// Mechanics Numerical and Mathematical Utilities for PhysicsLab

export class MechanicsMath {
  static clamp(val, min, max) {
    if (!Number.isFinite(val)) return min;
    return Math.max(min, Math.min(max, val));
  }

  static safeDiv(num, den, fallback = 0) {
    if (!Number.isFinite(num) || !Number.isFinite(den) || Math.abs(den) < 1e-12) {
      return fallback;
    }
    const res = num / den;
    return Number.isFinite(res) ? res : fallback;
  }

  static safeSqrt(val, fallback = 0) {
    if (!Number.isFinite(val) || val < 0) {
      return fallback;
    }
    return Math.sqrt(val);
  }

  static toRadians(deg) {
    return (deg * Math.PI) / 180;
  }

  static toDegrees(rad) {
    return (rad * 180) / Math.PI;
  }

  static solveQuadratic(a, b, c) {
    if (Math.abs(a) < 1e-12) {
      if (Math.abs(b) < 1e-12) return [];
      return [-c / b];
    }
    const disc = b * b - 4 * a * c;
    if (disc < -1e-12) return [];
    if (Math.abs(disc) <= 1e-12) return [-b / (2 * a)];
    const sqrtDisc = Math.sqrt(Math.max(0, disc));
    return [(-b + sqrtDisc) / (2 * a), (-b - sqrtDisc) / (2 * a)];
  }

  static rk4Step(t, y, dt, derivFn) {
    // 4th order Runge-Kutta numerical integrator
    // y can be a number or an array of numbers
    if (Array.isArray(y)) {
      const k1 = derivFn(t, y);
      const y2 = y.map((v, i) => v + 0.5 * dt * k1[i]);
      const k2 = derivFn(t + 0.5 * dt, y2);
      const y3 = y.map((v, i) => v + 0.5 * dt * k2[i]);
      const k3 = derivFn(t + 0.5 * dt, y3);
      const y4 = y.map((v, i) => v + dt * k3[i]);
      const k4 = derivFn(t + dt, y4);

      return y.map((v, i) => v + (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
    } else {
      const k1 = derivFn(t, y);
      const k2 = derivFn(t + 0.5 * dt, y + 0.5 * dt * k1);
      const k3 = derivFn(t + 0.5 * dt, y + 0.5 * dt * k2);
      const k4 = derivFn(t + dt, y + dt * k3);
      return y + (dt / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
    }
  }

  static trapezoidalIntegration(points) {
    // points is an array of {x, y} sorted by x
    if (!points || points.length < 2) return { positive: 0, negative: 0, net: 0 };
    let pos = 0;
    let neg = 0;

    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const dx = p2.x - p1.x;
      if (dx <= 0) continue;

      const avgY = (p1.y + p2.y) / 2;
      const area = avgY * dx;

      if (avgY >= 0) {
        pos += area;
      } else {
        neg += Math.abs(area);
      }
    }

    return {
      positive: pos,
      negative: neg,
      net: pos - neg
    };
  }

  static formatNumber(val, decimals = 2) {
    if (!Number.isFinite(val)) return '0.00';
    if (Math.abs(val) < 1e-4 && Math.abs(val) > 0) {
      return val.toExponential(decimals);
    }
    return val.toFixed(decimals);
  }
}
