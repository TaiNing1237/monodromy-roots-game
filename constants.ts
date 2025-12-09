

import { LevelData } from './types';

export const PENTATONIC_SCALE = [261.63, 311.13, 349.23, 392.00, 466.16, 523.25]; // C Minor Pentatonic

export const INITIAL_LEVELS: LevelData[] = [
  {
    id: 1,
    degree: 2,
    formula: "z² - a = 0",
    coeffs: [
      {
        re: -1.43,
        im: 0.02,
        constraint: "circle",
        constraintParams: {
          radius: 1.43
        }
      },
      {
        re: 0,
        im: 0,
        constraint: "frozen",
        constraintParams: {}
      }
    ],
    targets: [
      {
        // Pos target (1.19) now asks for ID 1 (which starts at Neg)
        id: 1, 
        re: 1.19,
        im: 0.01
      },
      {
        // Neg target (-1.19) now asks for ID 0 (which starts at Pos)
        id: 0,
        re: -1.19,
        im: -0.01
      }
    ]
  },
  {
    id: 2,
    degree: 2,
    formula: "z² - z - a = 0",
    coeffs: [
      {
        re: 0,
        im: 0,
        constraint: "circle",
        constraintParams: {
          radius: 0.96,
          center: {
            re: 0.96,
            im: -0.01
          }
        }
      },
      {
        re: -1,
        im: 0,
        constraint: "frozen",
        constraintParams: {}
      }
    ],
    targets: [
      {
        id: 1,
        re: 1,
        im: 0
      },
      {
        id: 0,
        re: 0,
        im: 0
      }
    ]
  },
  {
    id: 3,
    degree: 2,
    formula: "z² - az - 1 = 0",
    coeffs: [
      {
        re: -1,
        im: 0,
        constraint: "frozen",
        constraintParams: {}
      },
      {
        re: 0.01,
        im: 0,
        constraint: "circle",
        constraintParams: {
          radius: 1.36,
          center: {
            re: -0.02,
            im: -1.37
          }
        }
      }
    ],
    targets: [
      {
        id: 1,
        re: 1,
        im: 0
      },
      {
        id: 0,
        re: -1,
        im: 0
      }
    ]
  },
  {
    id: 4,
    degree: 2,
    formula: "z² + bz + c = 0",
    coeffs: [
      {
        re: -1.74,
        im: 0,
        constraint: "horizontal",
        constraintParams: {
          y: 0
        }
      },
      {
        re: -0.36,
        im: 1.01,
        constraint: "vertical",
        constraintParams: {
          x: -0.36
        }
      }
    ],
    targets: [
      {
        id: 0,
        re: -1.05,
        im: -0.43
      },
      {
        id: 1,
        re: 1.41,
        im: -0.57
      }
    ]
  },
  {
    id: 5,
    degree: 3,
    formula: "z³ - a = 0",
    zoom: 0.7,
    coeffs: [
      {
        re: 1.68,
        im: 0,
        constraint: "circle",
        constraintParams: {
          radius: 1.68
        }
      },
      {
        re: 0,
        im: 0.01,
        constraint: "frozen",
        constraintParams: {}
      },
      {
        re: 0,
        im: 0.01,
        constraint: "frozen",
        constraintParams: {}
      }
    ],
    targets: [
      {
        id: 0,
        re: 1.19,
        im: -0.01
      },
      {
        id: 1,
        re: -0.6,
        im: 1.03
      },
      {
        id: 2,
        re: -0.59,
        im: -1.03
      }
    ]
  },
  {
    id: 6,
    degree: 3,
    formula: "z³ - az + 1 = 0",
    coeffs: [
        { re: 1, im: 0, constraint: 'frozen', constraintParams: {} }, // c0 (constant)
        { re: 0, im: 0, constraint: 'none', constraintParams: {} },   // c1 (-az), start free at 0
        { re: 0, im: 0, constraint: 'frozen', constraintParams: {} }  // c2 (z^2)
    ],
    targets: [
        // Roots of z^3 + 1 = 0
        { id: 0, re: -1, im: 0 },
        { id: 1, re: 0.5, im: 0.866 },
        { id: 2, re: 0.5, im: -0.866 }
    ]
  },
  {
    id: 7,
    degree: 3,
    coeffs: [
        { re: 0, im: 0, constraint: 'circle', constraintParams: { radius: 1 } },
        { re: 0, im: 0, constraint: 'none' },
        { re: 0, im: 0, constraint: 'none' }
    ],
    targets: [
        { id: 0, re: 1, im: 0 },
        { id: 1, re: -0.5, im: 0.86 },
        { id: 2, re: -0.5, im: -0.86 }
    ]
  },
  {
    id: 8,
    degree: 3,
    coeffs: [
        { re: -1, im: 0, constraint: 'frozen', constraintParams: {} },
        { re: 1, im: 0, constraint: 'circle', constraintParams: { radius: 2 } },
        { re: 0, im: 1, constraint: 'horizontal', constraintParams: { y: 1 } }
    ],
    targets: [
        { id: 0, re: 0, im: 1 },
        { id: 1, re: 1, im: -1 },
        { id: 2, re: -1, im: -1 }
    ]
  },
  {
    id: 9,
    degree: 3,
    coeffs: [
        { re: 0, im: 0, constraint: 'none' },
        { re: 0, im: 0, constraint: 'none' },
        { re: 0, im: 0, constraint: 'none' }
    ],
    targets: [
        { id: 0, re: 0.5, im: 0.5 },
        { id: 1, re: -0.5, im: 0.5 },
        { id: 2, re: 0, im: -1 }
    ]
  }
];
