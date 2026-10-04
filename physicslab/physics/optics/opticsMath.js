// Optics Mathematical Engine for PhysicsLab
// Implements geometric optics, thin lens/mirror equations, Snell's law, dispersion, and optical instrument formulas

export class OpticsMath {
  // --- Thin Lens Calculation ---
  // Formula: 1/f = 1/u + 1/v => v = (u * f) / (u - f)
  // Sign convention: Convex f > 0, Concave f < 0, Object u > 0 (in front of lens)
  static calculateLens(f, u, ho = 15) {
    const isAtFocus = Math.abs(u - f) < 0.1;
    if (isAtFocus) {
      return {
        v: Infinity,
        m: Infinity,
        hi: Infinity,
        isAtFocus: true,
        imageType: 'At Infinity',
        orientation: 'N/A',
        sizeClass: 'Infinite'
      };
    }

    const v = (u * f) / (u - f);
    const m = -v / u;
    const hi = m * ho;

    const isReal = v > 0;
    const imageType = isReal ? 'Real' : 'Virtual';
    const orientation = m < 0 ? 'Inverted' : 'Upright';
    const absM = Math.abs(m);
    
    let sizeClass = 'Diminished';
    if (Math.abs(absM - 1.0) < 0.03) {
      sizeClass = 'Same Size';
    } else if (absM > 1.0) {
      sizeClass = 'Magnified';
    }

    return {
      v,
      m,
      hi,
      isAtFocus: false,
      isReal,
      imageType,
      orientation,
      sizeClass
    };
  }

  // --- Mirror Calculation ---
  // Formula: 1/f = 1/u + 1/v => 1/v = 1/f - 1/u = (u - f) / (u * f) => v = (u * f) / (u - f)
  // Sign convention (Cartesian):
  // Object u > 0
  // Concave Mirror: f < 0, Center C = 2f (focus in front of mirror)
  // Convex Mirror: f > 0, Center C = 2f (focus behind mirror)
  static calculateMirror(f, u, ho = 15) {
    const absF = Math.abs(f);
    const isAtFocus = Math.abs(u - absF) < 0.1;

    if (isAtFocus && f < 0) { // Concave mirror at focal point
      return {
        v: -Infinity,
        m: Infinity,
        hi: Infinity,
        isAtFocus: true,
        imageType: 'At Infinity',
        orientation: 'N/A',
        sizeClass: 'Infinite'
      };
    }

    // For mirror: 1/f = 1/u + 1/v (with f < 0 for concave, f > 0 for convex)
    // v = (u * f) / (u - f)
    // Real image in front of mirror has v > 0 (or v < 0 depending on sign convention)
    // Let's use standard real image in front of mirror (same side as object):
    // v_real = (u * absF) / (u - absF) when u > absF for concave mirror
    let v, m;
    let isReal = false;

    if (f < 0) { // Concave Mirror
      const fMag = Math.abs(f);
      if (u > fMag) { // Real image in front of mirror
        v = (u * fMag) / (u - fMag);
        m = -v / u;
        isReal = true;
      } else { // Virtual image behind mirror
        v = -(u * fMag) / (fMag - u);
        m = -v / u;
        isReal = false;
      }
    } else { // Convex Mirror (always virtual image behind mirror)
      const fMag = Math.abs(f);
      v = -(u * fMag) / (u + fMag);
      m = -v / u;
      isReal = false;
    }

    const hi = m * ho;
    const imageType = isReal ? 'Real' : 'Virtual';
    const orientation = m < 0 ? 'Inverted' : 'Upright';
    const absM = Math.abs(m);

    let sizeClass = 'Diminished';
    if (Math.abs(absM - 1.0) < 0.03) {
      sizeClass = 'Same Size';
    } else if (absM > 1.0) {
      sizeClass = 'Magnified';
    }

    return {
      v,
      m,
      hi,
      isAtFocus: false,
      isReal,
      imageType,
      orientation,
      sizeClass
    };
  }

  // --- Snell's Law & Refraction ---
  // n1 * sin(theta1) = n2 * sin(theta2)
  static calculateRefraction(n1, n2, theta1Deg) {
    const theta1Rad = (theta1Deg * Math.PI) / 180;
    const sinTheta2 = (n1 * Math.sin(theta1Rad)) / n2;

    if (sinTheta2 > 1.0) {
      // Total Internal Reflection (TIR)
      return {
        isTIR: true,
        theta2Rad: null,
        theta2Deg: null,
        criticalAngleDeg: (Math.asin(n2 / n1) * 180) / Math.PI
      };
    }

    const theta2Rad = Math.asin(sinTheta2);
    const theta2Deg = (theta2Rad * 180) / Math.PI;

    let criticalAngleDeg = null;
    if (n1 > n2) {
      criticalAngleDeg = (Math.asin(n2 / n1) * 180) / Math.PI;
    }

    return {
      isTIR: false,
      theta2Rad,
      theta2Deg,
      criticalAngleDeg
    };
  }

  // --- Critical Angle Calculation ---
  static calculateCriticalAngle(n1, n2) {
    if (n1 <= n2) return null;
    return (Math.asin(n2 / n1) * 180) / Math.PI;
  }

  // --- Prism Dispersion Calculation ---
  // Wavelength-dependent refractive indices for Glass (Cauchy formula approximation: n(lambda) = A + B / lambda^2)
  static getWavelengthRefractiveIndex(baseN, lambdaNm) {
    // baseN is reference at ~589nm (Yellow D-line)
    const lambdaMicrons = lambdaNm / 1000;
    const B = 0.0042; // Cauchy constant for typical crown glass
    const nRef = baseN - B / (0.589 * 0.589);
    return nRef + B / (lambdaMicrons * lambdaMicrons);
  }

  // Calculate deviation angle for a triangular prism
  // A = apex angle, i1 = incident angle, n = refractive index
  static calculatePrismDeviation(apexAngleDeg, incidentAngleDeg, n) {
    const A = (apexAngleDeg * Math.PI) / 180;
    const i1 = (incidentAngleDeg * Math.PI) / 180;

    // First surface refraction: sin(r1) = sin(i1) / n
    const sinR1 = Math.sin(i1) / n;
    if (sinR1 > 1.0) return { isValid: false };
    const r1 = Math.asin(sinR1);

    // Inside prism angle r2 = A - r1
    const r2 = A - r1;

    // Second surface refraction: sin(i2) = n * sin(r2)
    const sinI2 = n * Math.sin(r2);
    if (sinI2 > 1.0) return { isValid: false, isTIR: true };
    const i2 = Math.asin(sinI2);

    // Total angle of deviation: D = (i1 + i2) - A
    const deviationRad = i1 + i2 - A;
    const deviationDeg = (deviationRad * 180) / Math.PI;

    return {
      isValid: true,
      isTIR: false,
      r1Deg: (r1 * 180) / Math.PI,
      r2Deg: (r2 * 180) / Math.PI,
      i2Deg: (i2 * 180) / Math.PI,
      deviationDeg
    };
  }

  // --- Optical Instruments ---
  // Simple Magnifying Glass: Angular magnification M = D / f (or 1 + D/f) where D = 25cm near point
  static calculateMagnifyingGlass(f, u, D = 25) {
    const mag = 1 + D / f;
    const lensResult = this.calculateLens(f, u);
    return {
      angularMagnification: mag,
      ...lensResult
    };
  }

  // Compound Microscope: M = -(L / fo) * (D / fe)
  static calculateMicroscope(fo, fe, L = 16, D = 25) {
    const M_objective = L / fo;
    const M_eyepiece = D / fe;
    const totalMagnification = M_objective * M_eyepiece;
    return {
      fo,
      fe,
      L,
      D,
      M_objective,
      M_eyepiece,
      totalMagnification
    };
  }

  // Astronomical Refracting Telescope: M = -fo / fe, Length = fo + fe
  static calculateTelescope(fo, fe) {
    const angularMagnification = fo / fe;
    const tubeLength = fo + fe;
    return {
      fo,
      fe,
      angularMagnification,
      tubeLength
    };
  }
}
