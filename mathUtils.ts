import { Complex } from './types';

// --- Complex Number Arithmetic ---
export const cAdd = (a: Complex, b: Complex): Complex => ({ re: a.re + b.re, im: a.im + b.im });
export const cSub = (a: Complex, b: Complex): Complex => ({ re: a.re - b.re, im: a.im - b.im });
export const cMul = (a: Complex, b: Complex): Complex => ({
  re: a.re * b.re - a.im * b.im,
  im: a.re * b.im + a.im * b.re
});
export const cDiv = (a: Complex, b: Complex): Complex => {
  const den = b.re * b.re + b.im * b.im;
  return {
    re: (a.re * b.re + a.im * b.im) / den,
    im: (a.im * b.re - a.re * b.im) / den
  };
};

// Evaluate Polynomial P(z) = z^n + c_{n-1}z^{n-1} + ... + c_0
// Note: coefficients array is [c0, c1, ..., c_{n-1}]
export const evalPoly = (z: Complex, coeffs: Complex[]): Complex => {
  let result = { re: 1, im: 0 }; // Highest order term is 1*z^n
  
  // Calculate z^n term first? 
  // Easier approach: Horner's method or direct summation.
  // P(z) = z^n + sum(c_k * z^k)
  
  // Let's do direct summation for clarity with the specialized array format
  // highest power is N (implied coeff 1).
  // coeffs[i] corresponds to z^i.
  
  let zPow: Complex = { re: 1, im: 0 };
  let sum: Complex = { re: 0, im: 0 };
  
  // Add c0 + c1*z + ... + c_{n-1}*z^{n-1}
  for (let i = 0; i < coeffs.length; i++) {
    const term = cMul(coeffs[i], zPow);
    sum = cAdd(sum, term);
    zPow = cMul(zPow, z);
  }
  
  // Add 1 * z^n
  sum = cAdd(sum, zPow);
  
  return sum;
};

// --- Durand-Kerner Method ---
// Iteratively improves root estimates.
// roots: Current estimates
// coeffs: Polynomial coefficients [c0, c1, ...] for P(z) = z^n + ... + c0
export const findRoots = (currentRoots: Complex[], coeffs: Complex[], iterations: number = 2): Complex[] => {
  const n = coeffs.length + 1; // Degree
  let nextRoots = [...currentRoots];

  // Initialize if empty or wrong size (should rely on frame coherence usually)
  if (nextRoots.length !== coeffs.length) {
      nextRoots = [];
      for(let i=0; i<coeffs.length; i++) {
          // Initialize with roots of unity * radius to avoid symmetry lock
          const angle = (Math.PI * 2 * i) / coeffs.length + 0.1;
          nextRoots.push({ re: Math.cos(angle), im: Math.sin(angle) });
      }
  }

  for (let iter = 0; iter < iterations; iter++) {
    for (let i = 0; i < nextRoots.length; i++) {
      const z = nextRoots[i];
      const pVal = evalPoly(z, coeffs);
      
      let denominator: Complex = { re: 1, im: 0 };
      
      for (let j = 0; j < nextRoots.length; j++) {
        if (i !== j) {
          denominator = cMul(denominator, cSub(z, nextRoots[j]));
        }
      }
      
      // Prevent division by zero if roots collide
      if (Math.abs(denominator.re) < 1e-9 && Math.abs(denominator.im) < 1e-9) {
          denominator = { re: 0.001, im: 0.001 };
      }

      const offset = cDiv(pVal, denominator);
      nextRoots[i] = cSub(z, offset);
    }
  }
  
  return nextRoots;
};