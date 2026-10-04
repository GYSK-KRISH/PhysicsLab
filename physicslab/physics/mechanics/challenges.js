// Mechanics Laboratory Challenges System (Class 11 & Advanced)
// Contains 20+ Class 11 challenges and 15+ Advanced challenges

export const CLASS11_CHALLENGES = [
  {
    id: 'C11_01',
    title: 'Maximum Projectile Range Angle',
    type: 'CONCEPT_PREDICTION',
    category: 'Kinematics',
    question: 'In vacuum on level ground, at what launch angle is horizontal range maximum?',
    options: ['30°', '45°', '60°', '90°'],
    correctIndex: 1,
    explanation: 'R = (u²·sin 2θ)/g is maximum when sin 2θ = 1 => 2θ = 90° => θ = 45°.'
  },
  {
    id: 'C11_02',
    title: 'Complementary Angle Ranges',
    type: 'CONCEPT_PREDICTION',
    category: 'Kinematics',
    question: 'For equal projection speeds, which pair of launch angles gives the exact same horizontal range?',
    options: ['30° and 60°', '20° and 50°', '45° and 90°', '15° and 60°'],
    correctIndex: 0,
    explanation: 'Launch angles θ and (90° - θ) yield identical range because sin(2(90-θ)) = sin(180-2θ) = sin(2θ).'
  },
  {
    id: 'C11_03',
    title: 'Velocity-Time Graph Slope',
    type: 'GRAPH_INTERPRETATION',
    category: 'Kinematics',
    question: 'What physical quantity is represented by the slope of a Velocity vs Time (v-t) graph?',
    options: ['Displacement', 'Acceleration', 'Force', 'Momentum'],
    correctIndex: 1,
    explanation: 'Slope = dv/dt = instantaneous acceleration.'
  },
  {
    id: 'C11_04',
    title: 'Area Under Force-Displacement Graph',
    type: 'GRAPH_INTERPRETATION',
    category: 'Work & Energy',
    question: 'What physical quantity does the area under a Force vs Position (F-x) curve represent?',
    options: ['Power', 'Work Done', 'Momentum', 'Impulse'],
    correctIndex: 1,
    explanation: 'Work W = ∫ F dx, which equals the definite integral / area under the F-x curve.'
  },
  {
    id: 'C11_05',
    title: 'Area Under Force-Time Graph',
    type: 'GRAPH_INTERPRETATION',
    category: 'Laws of Motion',
    question: 'The area under a Force vs Time (F-t) graph represents:',
    options: ['Work', 'Impulse (Change in Momentum)', 'Kinetic Energy', 'Power'],
    correctIndex: 1,
    explanation: 'Impulse J = ∫ F dt = Δp (change in linear momentum).'
  },
  {
    id: 'C11_06',
    title: 'Static vs Kinetic Friction',
    type: 'CONCEPT',
    category: 'Friction',
    question: 'Why is the coefficient of static friction (μs) generally greater than kinetic friction (μk)?',
    options: [
      'Static contact points form molecular micro-welds that require extra force to break',
      'Kinetic friction creates negative normal force',
      'Gravity decreases when an object moves',
      'Air resistance cancels kinetic friction'
    ],
    correctIndex: 0,
    explanation: 'At rest, surface roughness interlocking and adhesion welds fully settle, requiring peak breakaway force.'
  },
  {
    id: 'C11_07',
    title: 'Centripetal Acceleration Direction',
    type: 'VECTOR',
    category: 'Circular Motion',
    question: 'For uniform circular motion, in which direction does the centripetal acceleration vector point?',
    options: ['Tangential to velocity', 'Radially outward', 'Radially inward toward circle center', 'Perpendicular to orbital plane'],
    correctIndex: 2,
    explanation: 'Centripetal acceleration a_c is directed radially inward toward the instantaneous center of curvature.'
  },
  {
    id: 'C11_08',
    title: 'Ideal Banking of Road',
    type: 'CALCULATION',
    category: 'Circular Motion',
    question: 'For a curve of radius r at speed v without friction, what is the ideal bank angle θ?',
    options: ['tan θ = v² / (rg)', 'sin θ = v / (rg)', 'tan θ = rg / v²', 'cos θ = v² / (rg)'],
    correctIndex: 0,
    explanation: 'Resolving N sin θ = mv²/r and N cos θ = mg gives tan θ = v² / (rg).'
  },
  {
    id: 'C11_09',
    title: 'Work Done by Centripetal Force',
    type: 'CONCEPT',
    category: 'Work & Energy',
    question: 'How much work is done by the centripetal force on a body moving in uniform circular motion in one complete revolution?',
    options: ['2π·F·r', 'Zero', '½·m·v²', 'm·g·r'],
    correctIndex: 1,
    explanation: 'Centripetal force is always perpendicular to instantaneous displacement (cos 90° = 0), so work done is always 0.'
  },
  {
    id: 'C11_10',
    title: 'Elastic Collision Kinetic Energy',
    type: 'CONSERVATION',
    category: 'Collisions',
    question: 'In a perfectly elastic 1D collision between two isolated bodies:',
    options: [
      'Only momentum is conserved',
      'Both total momentum and total kinetic energy are conserved',
      'Only kinetic energy is conserved',
      'Neither momentum nor kinetic energy is conserved'
    ],
    correctIndex: 1,
    explanation: 'In elastic collisions, no mechanical energy is lost to heat/deformation, conserving both p and KE.'
  },
  {
    id: 'C11_11',
    title: 'Perfect Inelastic Collision Restitution',
    type: 'PARAMETER',
    category: 'Collisions',
    question: 'What is the coefficient of restitution (e) for a perfectly inelastic collision where bodies stick together?',
    options: ['e = 1.0', 'e = 0.5', 'e = 0.0', 'e = -1.0'],
    correctIndex: 2,
    explanation: 'For perfectly inelastic collision, separation velocity is 0, so e = 0.'
  },
  {
    id: 'C11_12',
    title: 'Center of Mass of Two Equal Masses',
    type: 'CALCULATION',
    category: 'System of Particles',
    question: 'Where is the center of mass of two equal point masses m located?',
    options: ['At the first mass', 'At the geometric midpoint between them', 'At infinity', 'Outside the line joining them'],
    correctIndex: 1,
    explanation: 'x_cm = (m·x1 + m·x2) / (2m) = (x1 + x2)/2, exactly the midpoint.'
  },
  {
    id: 'C11_13',
    title: 'Moment of Inertia Comparison',
    type: 'RANKING',
    category: 'Rotational Motion',
    question: 'For equal mass M and radius R, which object has the LARGEST moment of inertia about its central axis?',
    options: ['Solid Sphere (0.4 MR²)', 'Solid Disc (0.5 MR²)', 'Thin Ring / Hoop (1.0 MR²)', 'Hollow Sphere (0.67 MR²)'],
    correctIndex: 2,
    explanation: 'In a thin ring, all mass is distributed at the maximum distance R from the axis, giving I = MR².'
  },
  {
    id: 'C11_14',
    title: 'Race Down an Incline',
    type: 'PREDICTION',
    category: 'Rolling Motion',
    question: 'When a solid sphere, solid cylinder, and hoop of equal radius roll down an incline without slipping, which reaches the bottom FIRST?',
    options: ['Hoop', 'Solid Cylinder', 'Solid Sphere', 'All reach at the same time'],
    correctIndex: 2,
    explanation: 'Acceleration a = (g sin θ)/(1 + I/MR²). Solid sphere has lowest I/(MR²) = 0.4, hence highest acceleration.'
  },
  {
    id: 'C11_15',
    title: 'Torque Formula',
    type: 'FORMULA',
    category: 'Rotational Motion',
    question: 'Torque vector τ produced by force F at position vector r is given by:',
    options: ['r · F', 'r × F', 'F / r', '½ r² F'],
    correctIndex: 1,
    explanation: 'Torque is the vector cross product τ = r × F with magnitude r·F·sin θ.'
  },
  {
    id: 'C11_16',
    title: 'Gravitational Force Distance Dependence',
    type: 'CONCEPT',
    category: 'Gravitation',
    question: 'If the distance between two masses is DOUBLED, the gravitational force becomes:',
    options: ['Doubled (2x)', 'Halved (½x)', 'One-fourth (¼x)', 'Four times (4x)'],
    correctIndex: 2,
    explanation: 'Newton\'s law F ∝ 1/r². Doubling r multiplies force by 1/(2²) = 1/4.'
  },
  {
    id: 'C11_17',
    title: 'Escape Velocity Relation to Orbital Speed',
    type: 'CALCULATION',
    category: 'Gravitation',
    question: 'Near Earth\'s surface, escape velocity v_e is related to circular orbital speed v_o by:',
    options: ['v_e = v_o', 'v_e = √2 · v_o', 'v_e = 2 · v_o', 'v_e = v_o / √2'],
    correctIndex: 1,
    explanation: 'v_e = √(2GM/R) = √2 × √(GM/R) = √2 · v_o (approx 1.414 × 7.9 km/s = 11.2 km/s).'
  },
  {
    id: 'C11_18',
    title: 'SHM Restoring Force',
    type: 'CONCEPT',
    category: 'Oscillations',
    question: 'In Simple Harmonic Motion, the restoring force is proportional to:',
    options: ['Displacement from equilibrium (in opposite direction)', 'Velocity squared', 'Time elapsed', 'Square root of amplitude'],
    correctIndex: 0,
    explanation: 'Hooke\'s Law F = -k·x defines linear SHM with restoring acceleration a = -ω²x.'
  },
  {
    id: 'C11_19',
    title: 'Springs in Parallel Equivalent Constant',
    type: 'CALCULATION',
    category: 'Oscillations',
    question: 'Two identical springs of spring constant k are connected in PARALLEL. The effective spring constant is:',
    options: ['k / 2', 'k', '2k', 'k²'],
    correctIndex: 2,
    explanation: 'In parallel, both experience equal displacement, so forces add: k_eff = k1 + k2 = 2k.'
  },
  {
    id: 'C11_20',
    title: 'Wave Speed Formula',
    type: 'FORMULA',
    category: 'Waves',
    question: 'The relationship between wave speed v, frequency f, and wavelength λ is:',
    options: ['v = f / λ', 'v = f · λ', 'v = λ / f', 'v = 2π f λ'],
    correctIndex: 1,
    explanation: 'Speed v = distance / time = λ / T = f · λ.'
  }
];

export const ADVANCED_CHALLENGES = [
  {
    id: 'ADV_01',
    title: 'Lab Frame vs COM Frame Velocities',
    type: 'ADVANCED_COLLISION',
    category: 'System of Particles',
    question: 'In a 1D elastic collision viewed from the Centre of Mass (COM) frame, what happens to each particle\'s velocity after collision?',
    options: [
      'Each particle reverses its velocity with equal magnitude',
      'Both velocities become zero',
      'Velocities increase by a factor of 2',
      'Velocities rotate by 90 degrees'
    ],
    correctIndex: 0,
    explanation: 'In COM frame, total momentum is identically zero; an elastic collision simply reverses each body\'s velocity: u_i,com = -v_i,com.'
  },
  {
    id: 'ADV_02',
    title: 'Oblique 2D Collision Vector Conservation',
    type: 'VECTOR_MOMENTUM',
    category: 'Collisions',
    question: 'In a 2D collision of frictionless spheres, which velocity component remains strictly unchanged during impact?',
    options: [
      'Component along line of centers (normal)',
      'Component tangential to contact plane',
      'Both components change equally',
      'Total velocity magnitude of each sphere'
    ],
    correctIndex: 1,
    explanation: 'No impulse acts in the tangential direction for smooth spheres, so the tangential velocity component is preserved.'
  },
  {
    id: 'ADV_03',
    title: 'Damping Regime Condition',
    type: 'DAMPED_SHM',
    category: 'Oscillations',
    question: 'For damped oscillator m·x\'\' + c·x\' + k·x = 0, what is the exact condition for CRITICAL DAMPING?',
    options: ['c² = 4mk', 'c² < 4mk', 'c² > 4mk', 'c = mk'],
    correctIndex: 0,
    explanation: 'The characteristic quadratic roots are real and coincident when the discriminant c² - 4mk = 0.'
  },
  {
    id: 'ADV_04',
    title: 'Resonance Peak in Forced Oscillators',
    type: 'RESONANCE',
    category: 'Oscillations',
    question: 'In a lightly damped forced oscillator driven by F0 cos(ωt), maximum steady-state amplitude occurs when driving frequency ω is:',
    options: [
      'Very close to the natural frequency ω0 = √(k/m)',
      'Zero (DC limit)',
      'Twice the natural frequency (2ω0)',
      'Independent of driving frequency'
    ],
    correctIndex: 0,
    explanation: 'Resonance occurs when the driving frequency matches the natural frequency of the system, minimizing mechanical impedance.'
  },
  {
    id: 'ADV_05',
    title: 'Vis-Viva Orbital Equation',
    type: 'ORBITAL_MECHANICS',
    category: 'Gravitation',
    question: 'According to the Vis-Viva equation for Keplerian orbits, speed v at distance r with semi-major axis a is:',
    options: ['v² = GM (2/r - 1/a)', 'v² = GM (1/r - 1/a)', 'v² = GM / (r·a)', 'v = √(GM / a)'],
    correctIndex: 0,
    explanation: 'From conservation of orbital energy E = -GMm/(2a) = ½mv² - GMm/r, we get v² = GM(2/r - 1/a).'
  },
  {
    id: 'ADV_06',
    title: 'Geostationary Orbit Altitude',
    type: 'CALCULATION',
    category: 'Gravitation',
    question: 'What is the approximate altitude above Earth\'s surface for a Geostationary satellite (orbital period ~24h)?',
    options: ['~35,786 km', '~400 km', '~12,000 km', '~100,000 km'],
    correctIndex: 0,
    explanation: 'Orbital radius is r ≈ 42,164 km. Subtracting Earth radius (6,371 km) gives altitude h ≈ 35,786 km.'
  },
  {
    id: 'ADV_07',
    title: 'Figure Skater Angular Momentum',
    type: 'ANGULAR_CONSERVATION',
    category: 'Rotational Motion',
    question: 'When a spinning skater pulls in their arms, their moment of inertia I decreases by half (½ I0). What happens to rotational KE?',
    options: ['KE is halved', 'KE remains unchanged', 'KE doubles (2x KE0)', 'KE quadruples (4x KE0)'],
    correctIndex: 2,
    explanation: 'L is conserved: KE = L² / (2I). If I becomes I/2, KE becomes 2 × KE0. The extra energy comes from muscular work done pulling arms in.'
  },
  {
    id: 'ADV_08',
    title: 'Work Done in Variable Force Integral',
    type: 'INTEGRAL_WORK',
    category: 'Work & Energy',
    question: 'If force is F(x) = k·x, the work done stretching from x = 0 to x = x1 is:',
    options: ['k·x1', '½ k·x1²', 'k·x1²', '⅓ k·x1³'],
    correctIndex: 1,
    explanation: 'W = ∫₀^{x1} k x dx = ½ k x1².'
  },
  {
    id: 'ADV_09',
    title: 'Standing Wave Nodes on String Fixed at Both Ends',
    type: 'STANDING_WAVES',
    category: 'Waves',
    question: 'For a string of length L fixed at both ends vibrating in its 3rd harmonic (n = 3), how many ANTINODES are present?',
    options: ['2', '3', '4', '6'],
    correctIndex: 1,
    explanation: 'For the n-th harmonic of a fixed-fixed string, there are exactly n antinodes and n+1 nodes.'
  },
  {
    id: 'ADV_10',
    title: 'Beat Frequency from Superposition',
    type: 'BEATS',
    category: 'Waves',
    question: 'Two acoustic sources emit sounds at 440 Hz and 444 Hz. What is the period between successive sound intensity maxima?',
    options: ['0.25 s', '4.0 s', '1.0 s', '0.002 s'],
    correctIndex: 0,
    explanation: 'Beat frequency fb = |444 - 440| = 4 Hz. Beat period Tb = 1/fb = 1/4 = 0.25 seconds.'
  },
  {
    id: 'ADV_11',
    title: 'Kinetic Energy vs Momentum Relation',
    type: 'CALCULATION',
    category: 'Work & Energy',
    question: 'If linear momentum of an object is increased by 100% (doubled), its kinetic energy increases by:',
    options: ['100%', '200%', '300%', '400%'],
    correctIndex: 2,
    explanation: 'KE = p² / (2m). If p -> 2p, KE -> 4 × KE0, which is an increase of 300% (4x - 1x = 3x = 300%).'
  },
  {
    id: 'ADV_12',
    title: 'Escape from Gravitational Field',
    type: 'ENERGY',
    category: 'Gravitation',
    question: 'What is the total mechanical energy (E = KE + PE) of a projectile launched exactly at escape velocity?',
    options: ['Negative (E < 0)', 'Zero (E = 0)', 'Positive (E > 0)', 'Infinite'],
    correctIndex: 1,
    explanation: 'At escape velocity, KE = ½ m ve² = GMm/R = -PE, so total mechanical energy E = KE + PE = 0.'
  },
  {
    id: 'ADV_13',
    title: 'Phase Difference in Wave Superposition',
    type: 'INTERFERENCE',
    category: 'Waves',
    question: 'For two waves of equal amplitude A and frequency, what phase difference Δφ produces COMPLETE DESTRUCTIVE INTERFERENCE?',
    options: ['0 rad (0°)', 'π/2 rad (90°)', 'π rad (180°)', '2π rad (360°)'],
    correctIndex: 2,
    explanation: 'At Δφ = π (180°), sin(kx - ωt + π) = -sin(kx - ωt), resulting in y1 + y2 = 0 everywhere.'
  },
  {
    id: 'ADV_14',
    title: 'Pure Rolling Incline Deceleration Condition',
    type: 'ROLLING',
    category: 'Rotational Motion',
    question: 'Why does a rolling sphere not lose mechanical energy on an incline despite static friction acting at the contact point?',
    options: [
      'Static friction does no work because instantaneous contact point has zero velocity',
      'Normal force cancels friction work',
      'The incline has zero slope at contact',
      'Rotational inertia eliminates friction'
    ],
    correctIndex: 0,
    explanation: 'In pure rolling without slipping, the instantaneous point of contact is momentarily at rest (v_contact = 0), so static friction performs no work.'
  },
  {
    id: 'ADV_15',
    title: 'Conservation of Angular Momentum Direction',
    type: 'VECTOR_TORQUE',
    category: 'Rotational Motion',
    question: 'Angular momentum of a system is conserved in vector magnitude AND direction if and only if:',
    options: [
      'Total net external torque on system is zero (Στ_ext = 0)',
      'Total net external force is zero',
      'Moment of inertia is constant',
      'All internal forces are conservative'
    ],
    correctIndex: 0,
    explanation: 'dL/dt = Στ_ext. When net external torque is zero, dL/dt = 0, so vector L remains strictly constant.'
  }
];

export class ChallengesBank {
  static getByCategory(category) {
    if (category === 'CLASS11') return CLASS11_CHALLENGES;
    if (category === 'ADVANCED') return ADVANCED_CHALLENGES;
    return [...CLASS11_CHALLENGES, ...ADVANCED_CHALLENGES];
  }
}

