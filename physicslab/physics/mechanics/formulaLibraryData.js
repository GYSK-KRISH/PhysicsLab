// Comprehensive Mechanics Formula Library Data for PhysicsLab
// 12 Categorized Mechanics Domains with full LaTeX-style equation strings, variable definitions, and SI units

export const FORMULA_CATEGORIES = [
  'ALL',
  'KINEMATICS',
  'VECTORS',
  'NEWTONS_LAWS',
  'FRICTION',
  'CIRCULAR_MOTION',
  'WORK_ENERGY_POWER',
  'MOMENTUM_COLLISIONS',
  'ROTATION',
  'GRAVITATION',
  'OSCILLATIONS_SHM',
  'WAVES'
];

export const FORMULA_LIBRARY = [
  // 1. Kinematics
  {
    category: 'KINEMATICS',
    name: 'Velocity-Time Kinematic Equation',
    formula: 'v = u + a·t',
    variables: 'u: initial velocity (m/s), a: acceleration (m/s²), t: time (s), v: final velocity (m/s)',
    description: 'Relates velocity linearly to time under constant acceleration.'
  },
  {
    category: 'KINEMATICS',
    name: 'Displacement-Time Kinematic Equation',
    formula: 's = u·t + ½·a·t²',
    variables: 's: displacement (m), u: initial velocity (m/s), a: acceleration (m/s²), t: time (s)',
    description: 'Calculates position/displacement under constant acceleration.'
  },
  {
    category: 'KINEMATICS',
    name: 'Velocity-Displacement Relation',
    formula: 'v² = u² + 2·a·s',
    variables: 'v: final velocity (m/s), u: initial velocity (m/s), a: acceleration (m/s²), s: displacement (m)',
    description: 'Eliminates time from kinematic relations.'
  },
  {
    category: 'KINEMATICS',
    name: 'Projectile Time of Flight',
    formula: 'T = (2·u·sin θ) / g',
    variables: 'u: launch speed (m/s), θ: launch angle, g: gravitational acceleration (m/s²)',
    description: 'Total time taken by a projectile to return to launch altitude.'
  },
  {
    category: 'KINEMATICS',
    name: 'Projectile Maximum Height',
    formula: 'H = (u²·sin²θ) / (2·g)',
    variables: 'H: maximum height (m), u: launch speed (m/s), θ: launch angle, g: gravity (m/s²)',
    description: 'Peak vertical altitude reached by a projectile above launch level.'
  },
  {
    category: 'KINEMATICS',
    name: 'Projectile Horizontal Range',
    formula: 'R = (u²·sin 2θ) / g',
    variables: 'R: horizontal range (m), u: launch speed (m/s), θ: angle, g: gravity (m/s²)',
    description: 'Total horizontal distance traversed by a projectile over level ground.'
  },
  {
    category: 'KINEMATICS',
    name: 'Relative Velocity',
    formula: 'v_AB = v_A - v_B',
    variables: 'v_AB: velocity of A relative to B, v_A: velocity of A, v_B: velocity of B',
    description: 'Vector difference between the velocities of two bodies in a reference frame.'
  },

  // 2. Vectors
  {
    category: 'VECTORS',
    name: 'Vector Magnitude',
    formula: '|A| = √(Ax² + Ay²)',
    variables: 'Ax: x-component, Ay: y-component, |A|: vector magnitude',
    description: 'Length/magnitude of a two-dimensional Cartesian vector.'
  },
  {
    category: 'VECTORS',
    name: 'Vector Dot Product',
    formula: 'A · B = |A|·|B|·cos θ = Ax·Bx + Ay·By',
    variables: 'A, B: vectors, θ: angle between vectors, A·B: scalar dot product',
    description: 'Measures parallelism and projects one vector along another.'
  },
  {
    category: 'VECTORS',
    name: 'Vector Cross Product Magnitude',
    formula: '|A × B| = |A|·|B|·sin θ = Ax·By - Ay·Bx',
    variables: 'A, B: vectors, θ: angle between vectors',
    description: 'Area of parallelogram spanned by vectors and perpendicular direction.'
  },

  // 3. Newton's Laws
  {
    category: 'NEWTONS_LAWS',
    name: 'Newton\'s Second Law',
    formula: 'F_net = m·a = dp/dt',
    variables: 'F_net: net force (N), m: mass (kg), a: acceleration (m/s²), p: momentum (kg·m/s)',
    description: 'Net external force equals the rate of change of linear momentum.'
  },
  {
    category: 'NEWTONS_LAWS',
    name: 'Linear Momentum',
    formula: 'p = m·v',
    variables: 'p: linear momentum (kg·m/s), m: mass (kg), v: velocity (m/s)',
    description: 'Quantity of translational motion possessed by a moving mass.'
  },
  {
    category: 'NEWTONS_LAWS',
    name: 'Impulse-Momentum Theorem',
    formula: 'J = ∫ F dt = Δp = m·(v - u)',
    variables: 'J: impulse (N·s), F: force (N), Δp: change in momentum (kg·m/s)',
    description: 'Total impulse applied equals the net change in linear momentum.'
  },

  // 4. Friction
  {
    category: 'FRICTION',
    name: 'Maximum Static Friction (Breakaway)',
    formula: 'f_s,max = μ_s·N',
    variables: 'f_s,max: limiting static friction (N), μ_s: static coefficient, N: normal force (N)',
    description: 'Maximum resistive force before contact surface begins sliding.'
  },
  {
    category: 'FRICTION',
    name: 'Kinetic Friction',
    formula: 'f_k = μ_k·N',
    variables: 'f_k: kinetic friction force (N), μ_k: kinetic coefficient, N: normal force (N)',
    description: 'Constant opposing friction acting between sliding surfaces.'
  },

  // 5. Circular Motion
  {
    category: 'CIRCULAR_MOTION',
    name: 'Centripetal Acceleration',
    formula: 'a_c = v² / r = r·ω²',
    variables: 'a_c: centripetal acceleration (m/s²), v: speed (m/s), r: radius (m), ω: angular speed (rad/s)',
    description: 'Radially inward acceleration required to maintain circular trajectory.'
  },
  {
    category: 'CIRCULAR_MOTION',
    name: 'Centripetal Force',
    formula: 'F_c = (m·v²) / r = m·r·ω²',
    variables: 'F_c: centripetal force (N), m: mass (kg), v: speed (m/s), r: radius (m)',
    description: 'Net radial force necessary to hold mass on a curved path.'
  },
  {
    category: 'CIRCULAR_MOTION',
    name: 'Ideal Road Bank Angle',
    formula: 'tan θ = v² / (r·g)',
    variables: 'θ: banking angle, v: vehicle speed (m/s), r: curve radius (m), g: gravity (m/s²)',
    description: 'Angle of incline where normal force provides full centripetal force with zero friction.'
  },

  // 6. Work, Energy, and Power
  {
    category: 'WORK_ENERGY_POWER',
    name: 'Constant Force Work',
    formula: 'W = F · d = F·d·cos θ',
    variables: 'W: work (J), F: force (N), d: displacement (m), θ: angle between F and d',
    description: 'Energy transferred by a constant force along a displacement.'
  },
  {
    category: 'WORK_ENERGY_POWER',
    name: 'Variable Force Integral Work',
    formula: 'W = ∫ F(x) dx',
    variables: 'W: work (J), F(x): position-dependent force function',
    description: 'Definite integral area under the force-displacement graph.'
  },
  {
    category: 'WORK_ENERGY_POWER',
    name: 'Kinetic Energy',
    formula: 'K = ½·m·v²',
    variables: 'K: kinetic energy (J), m: mass (kg), v: speed (m/s)',
    description: 'Mechanical energy possessed by an object due to its motion.'
  },
  {
    category: 'WORK_ENERGY_POWER',
    name: 'Work-Energy Theorem',
    formula: 'W_net = ΔK = ½·m·v_f² - ½·m·v_i²',
    variables: 'W_net: total net work (J), ΔK: change in kinetic energy (J)',
    description: 'The net work done on a particle equals the change in its kinetic energy.'
  },
  {
    category: 'WORK_ENERGY_POWER',
    name: 'Instantaneous Power',
    formula: 'P = F · v = dW/dt',
    variables: 'P: power (W / Watts), F: force (N), v: velocity (m/s)',
    description: 'Instantaneous rate of doing work or transferring mechanical energy.'
  },

  // 7. Momentum and Collisions
  {
    category: 'MOMENTUM_COLLISIONS',
    name: 'Conservation of Linear Momentum',
    formula: 'm₁·u₁ + m₂·u₂ = m₁·v₁ + m₂·v₂',
    variables: 'm₁, m₂: masses (kg), u₁, u₂: initial velocities, v₁, v₂: final velocities',
    description: 'Total momentum remains constant in an isolated system.'
  },
  {
    category: 'MOMENTUM_COLLISIONS',
    name: 'Coefficient of Restitution',
    formula: 'e = (v₂ - v₁) / (u₁ - u₂)',
    variables: 'e: restitution coeff (0 = perfectly inelastic, 1 = perfectly elastic)',
    description: 'Ratio of relative speed of separation to relative speed of approach.'
  },
  {
    category: 'MOMENTUM_COLLISIONS',
    name: 'Center of Mass Position',
    formula: 'R_cm = (Σ m_i · r_i) / (Σ m_i)',
    variables: 'R_cm: center of mass vector, m_i: individual particle masses, r_i: positions',
    description: 'Mass-weighted average spatial position of a multi-particle system.'
  },

  // 8. Rotation
  {
    category: 'ROTATION',
    name: 'Torque Vector',
    formula: 'τ = r × F = r·F·sin θ',
    variables: 'τ: torque (N·m), r: position vector from pivot (m), F: applied force (N)',
    description: 'Rotational analog of force that causes angular acceleration.'
  },
  {
    category: 'ROTATION',
    name: 'Rotational Newton\'s Second Law',
    formula: 'τ_net = I·α = dL/dt',
    variables: 'τ: torque (N·m), I: moment of inertia (kg·m²), α: angular acceleration (rad/s²)',
    description: 'Net torque equals moment of inertia times angular acceleration.'
  },
  {
    category: 'ROTATION',
    name: 'Angular Momentum',
    formula: 'L = I·ω = r × p',
    variables: 'L: angular momentum (kg·m²/s), I: moment of inertia, ω: angular velocity (rad/s)',
    description: 'Conserved rotational quantity in systems free of net external torque.'
  },
  {
    category: 'ROTATION',
    name: 'Rotational Kinetic Energy',
    formula: 'K_rot = ½·I·ω²',
    variables: 'K_rot: rotational kinetic energy (J), I: moment of inertia, ω: angular velocity',
    description: 'Kinetic energy stored in rotational motion of a rigid body.'
  },
  {
    category: 'ROTATION',
    name: 'Rolling Down Incline Acceleration',
    formula: 'a = (g·sin θ) / (1 + I / (M·R²))',
    variables: 'a: linear acceleration (m/s²), θ: incline angle, I: moment of inertia, M: mass, R: radius',
    description: 'Linear acceleration of a body rolling without slipping down an incline.'
  },

  // 9. Gravitation
  {
    category: 'GRAVITATION',
    name: 'Newton\'s Law of Universal Gravitation',
    formula: 'F = (G·m₁·m₂) / r²',
    variables: 'G: 6.6743×10⁻¹¹ N·m²/kg², m₁, m₂: masses (kg), r: distance between centers (m)',
    description: 'Universal attractive force between any two masses.'
  },
  {
    category: 'GRAVITATION',
    name: 'Gravitational Potential',
    formula: 'V = -(G·M) / r',
    variables: 'V: gravitational potential (J/kg), M: source mass (kg), r: distance (m)',
    description: 'Work done per unit mass bringing a test mass from infinity to distance r.'
  },
  {
    category: 'GRAVITATION',
    name: 'Escape Velocity',
    formula: 'v_e = √( (2·G·M) / R )',
    variables: 'v_e: escape velocity (m/s), M: planet mass (kg), R: planet radius (m)',
    description: 'Minimum speed needed for a body to escape a gravitational field to infinity.'
  },
  {
    category: 'GRAVITATION',
    name: 'Orbital Speed & Period',
    formula: 'v_o = √(GM / r),  T = 2π·√(r³ / (GM))',
    variables: 'v_o: circular orbital speed, T: orbital period (s), r: orbital radius (m)',
    description: 'Speed and period of a satellite in circular orbit around a central body.'
  },
  {
    category: 'GRAVITATION',
    name: 'Vis-Viva Orbital Speed Equation',
    formula: 'v² = G·M·(2/r - 1/a)',
    variables: 'v: orbital speed, r: current distance, a: semi-major axis of ellipse',
    description: 'General orbital speed relation for Keplerian elliptical orbits.'
  },

  // 10. Oscillations & SHM
  {
    category: 'OSCILLATIONS_SHM',
    name: 'SHM Angular Frequency',
    formula: 'ω = √(k / m) = 2π / T = 2π·f',
    variables: 'ω: angular frequency (rad/s), k: spring constant (N/m), m: mass (kg), T: period (s)',
    description: 'Fundamental oscillation frequency of a linear spring-mass system.'
  },
  {
    category: 'OSCILLATIONS_SHM',
    name: 'SHM Position Equation',
    formula: 'x(t) = A·cos(ω·t + φ)',
    variables: 'A: amplitude (m), ω: angular frequency (rad/s), φ: phase constant (rad)',
    description: 'Harmonic displacement equation as a function of time.'
  },
  {
    category: 'OSCILLATIONS_SHM',
    name: 'SHM Total Mechanical Energy',
    formula: 'E = ½·k·A² = ½·m·v² + ½·k·x²',
    variables: 'E: total energy (J), k: spring constant, A: amplitude, v: velocity, x: displacement',
    description: 'Continuous exchange between potential energy and kinetic energy conserving total E.'
  },
  {
    category: 'OSCILLATIONS_SHM',
    name: 'Springs in Series and Parallel',
    formula: 'Series: 1/k_eff = 1/k₁ + 1/k₂,  Parallel: k_eff = k₁ + k₂',
    variables: 'k_eff: effective spring constant (N/m)',
    description: 'Equivalent spring constants for combined elastic elements.'
  },
  {
    category: 'OSCILLATIONS_SHM',
    name: 'Damped Oscillator Equation',
    formula: 'm·x\'\' + c·x\' + k·x = 0',
    variables: 'c: damping coefficient (N·s/m). Critical damping at c² = 4mk.',
    description: 'Differential equation describing energy dissipation in an oscillator.'
  },

  // 11. Waves
  {
    category: 'WAVES',
    name: 'Wave Speed Relation',
    formula: 'v = f · λ = λ / T',
    variables: 'v: wave speed (m/s), f: frequency (Hz), λ: wavelength (m), T: period (s)',
    description: 'Universal relation linking wave propagation speed, frequency, and wavelength.'
  },
  {
    category: 'WAVES',
    name: 'Wave Speed on Stretched String',
    formula: 'v = √(T_tension / μ)',
    variables: 'T_tension: string tension (N), μ: linear mass density (kg/m)',
    description: 'Propagation speed of transverse mechanical waves on a tense string.'
  },
  {
    category: 'WAVES',
    name: 'Principle of Superposition',
    formula: 'y(x, t) = y₁(x, t) + y₂(x, t)',
    variables: 'y₁, y₂: individual wave displacements, y: resultant displacement',
    description: 'Net displacement equals algebraic sum of overlapping wave displacements.'
  },
  {
    category: 'WAVES',
    name: 'Standing Wave on Fixed String (n-th harmonic)',
    formula: 'f_n = (n·v) / (2·L),  λ_n = (2·L) / n',
    variables: 'n: harmonic number (1, 2, 3...), L: string length (m), v: wave speed (m/s)',
    description: 'Resonant frequencies and wavelengths forming stationary nodal patterns.'
  },
  {
    category: 'WAVES',
    name: 'Beat Frequency',
    formula: 'f_beat = |f₁ - f₂|',
    variables: 'f₁, f₂: close source frequencies (Hz), f_beat: beat frequency (Hz)',
    description: 'Periodic amplitude pulsation rate resulting from the interference of two nearby tones.'
  }
];

export class FormulaLibraryData {
  static getCategories() {
    return FORMULA_CATEGORIES;
  }
  static getAll() {
    return FORMULA_LIBRARY;
  }
  static getByCategory(cat) {
    if (!cat || cat === 'ALL') return FORMULA_LIBRARY;
    return FORMULA_LIBRARY.filter(f => f.category === cat);
  }
}

