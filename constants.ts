

import { LevelData } from './types';

export const PENTATONIC_SCALE = [261.63, 311.13, 349.23, 392.00, 466.16, 523.25]; // C Minor Pentatonic

export const INITIAL_LEVELS: LevelData[] = [
  {
    id: 1,
    degree: 2,
    formula: "z² + c = 0",
    zoom: 1,
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
    formula: "z² - z + c = 0",
    zoom: 0.76,
    coeffs: [
      {
        re: 2,
        im: 0,
        constraint: "circle",
        constraintParams: {
          radius: 1,
          center: {
            re: 1,
            im: 0
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
        id: 0,
        re: 0.5,
        im: -1.32
      },
      {
        id: 1,
        re: 0.5,
        im: 1.32
      }
    ]
  },
  {
    id: 3,
    degree: 2,
    formula: "z² + bz - 1 = 0",
    zoom: 0.84,
    coeffs: [
      {
        re: -1,
        im: 0,
        constraint: "frozen",
        constraintParams: {}
      },
      {
        re: 0.00,
        im: 0,
        constraint: "circle",
        constraintParams: {
          radius: 1.36,
          center: {
            re: 0,
            im: -1.36
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
    zoom: 0.84,
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
        im: 1.00,
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
    formula: "z³ + c = 0",
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
        im: -0.01,
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
        im: -1.03
      },
      {
        id: 2,
        re: -0.6,
        im: 1.03
      }
    ]
  },
  {
    id: 6,
    degree: 3,
    formula: "z³ + bz + 1 = 0",
    zoom: 1,
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
    formula: "z³ + az² + bz + c = 0",
    zoom: 0.7,
    coeffs: [
        {
          re: 1.06,
          im: 0.02,
          constraint: "circle",
          constraintParams: {
            radius: 1.06
          }
        },
        {
          re: 1.93,
          im: 0.01,
          constraint: "circle",
          constraintParams: {
            radius: 1.93
          }
        },
        {
          re: 0.59,
          im: 0,
          constraint: "circle",
          constraintParams: {
            radius: 0.59
          }
        }
    ],
    targets: [
      {
        id: 0,
        re: -0.54,
        im: 0
      },
      {
        id: 1,
        re: -1.42,
        im: 0
      },
      {
        id: 2,
        re: 1.38,
        im: 0
      }
    ]
  },
  {
    id: 8,
    degree: 3,
    formula: "z³ + az² + bz + c = 0",
    zoom: 0.63,
    coeffs: [
        { re: 1, im: 0.01, constraint: 'circle', constraintParams: {
            radius: 0.97,
            center: {
              re: 1.46,
              im: 0.87
            }
          } 
        },
        { re: 1, im: 0.01, constraint: 'circle', constraintParams: { 
          radius: 1.68,
          center: {
            re: -0.68,
            im: 0
          }
         } 
        },
        { re: 1, im: 0.01, constraint: 'circle', constraintParams: {
            radius: 0.95,
            center: {
              re: 1.44,
              im: -0.83
            }
          } 
        }
    ],
    targets: [
        { id: 0, re: 0, im: 1 },
        { id: 1, re: 0, im: -1 },
        { id: 2, re: -1, im: 0 }
    ]
  },
  {
    id: 9,
    degree: 4,
    formula: "z⁴ + c = 0",
    zoom: 0.9,
    coeffs: [
      {
        re: -1.45,
        im: 0.01,
        constraint: "circle",
        constraintParams: {
          radius: 1.45
        }
      },
      {
        re: 0,
        im: 0,
        constraint: "frozen",
        constraintParams: {}
      },
      {
        re: 0,
        im: 0,
        constraint: "frozen",
        constraintParams: {}
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
        id: 0,
        re: -0.77,
        im: -0.78
      },
      {
        id: 1,
        re: 0.78,
        im: -0.77
      },
      {
        id: 2,
        re: 0.77,
        im: 0.78
      },
      {
        id: 3,
        re: -0.78,
        im: 0.77
      }
    ]
  },
  {
    id: 10,
    degree: 4,
    formula: "z⁴ + bz + c = 0",
    zoom: 0.54,
    coeffs: [
      {
        re: -1.62,
        im: 0.04,
        constraint: "circle",
        constraintParams: {
          radius: 1.62
        }
      },
      {
        re: 2.96,
        im: -0.01,
        constraint: "circle",
        constraintParams: {
          radius: 1.14,
          center: {
            re: 1.82,
            im: 0.01
          }
        }
      },
      {
        re: 0,
        im: 0,
        constraint: "frozen",
        constraintParams: {}
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
        id: 0,
        re: 0.8,
        im: 0.93
      },
      {
        id: 1,
        re: -0.8,
        im: 0.65
      },
      {
        id: 2,
        re: 0.81,
        im: -0.93
      },
      {
        id: 3,
        re: -0.8,
        im: -0.66
      }
    ]
  },
  {
    id: 11,
    degree: 4,
    formula: "z⁴ + az² + bz + c = 0",
    zoom: 1.1,
    coeffs: [
      {
        re: -1.28,
        im: -0.31,
        constraint: "circle",
        constraintParams: {
          radius: 1.31
        }
      },
      {
        re: 0,
        im: 0.02,
        constraint: "frozen",
        constraintParams: {}
      },
      {
        re: 0.05,
        im: -0.01,
        constraint: "circle",
        constraintParams: {
          radius: 0.65,
          center: {
            re: 0,
            im: -0.65
          }
        }
      },
      {
        re: -0.1,
        im: 0.02,
        constraint: "circle",
        constraintParams: {
          radius: 0.64,
          center: {
            re: -0.01,
            im: 0.66
          }
        }
      }
    ],
    targets: [
      {
        id: 0,
        re: 0.75,
        im: 0.75
      },
      {
        id: 1,
        re: -0.76,
        im: 0.75
      },
      {
        id: 2,
        re: 0.77,
        im: -0.76
      },
      {
        id: 3,
        re: -0.75,
        im: -0.76
      }
    ]
  },
  {
    id: 12,
    degree: 4,
    formula: "z⁴ + az² + bz + c = 0",
    zoom: 0.84,
    coeffs: [
      {
        re: 1.75,
        im: 0.67,
        constraint: "circle",
        constraintParams: {
          radius: 1.88
        }
      },
      {
        re: -0.63,
        im: 0.33,
        constraint: "vertical",
        constraintParams: {
          x: -0.63
        }
      },
      {
        re: -0.19,
        im: -0.55,
        constraint: "horizontal",
        constraintParams: {
          y: -0.55
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
        id: 0,
        re: -0.94,
        im: -1.02
      },
      {
        id: 1,
        re: -0.77,
        im: 0.74
      },
      {
        id: 2,
        re: 0.91,
        im: -0.58
      },
      {
        id: 3,
        re: 0.81,
        im: 0.85
      }
    ]
  },
  {
    id: 13,
    degree: 5,
    formula: "z⁵ + c = 0",
    zoom: 1,
    coeffs: [
      {
        re: -1.43,
        im: -0.02,
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
      },
      {
        re: 0,
        im: 0,
        constraint: "frozen",
        constraintParams: {}
      },
      {
        re: 0,
        im: 0,
        constraint: "frozen",
        constraintParams: {}
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
        id: 0,
        re: -0.33,
        im: 1.02
      },
      {
        id: 1,
        re: -1.07,
        im: 0
      },
      {
        id: 2,
        re: -0.33,
        im: -1.02
      },
      {
        id: 3,
        re: 0.87,
        im: -0.63
      },
      {
        id: 4,
        re: 0.87,
        im: 0.63
      }
    ]
  },
  {
    id: 14,
    degree: 5,
    formula: "z⁵ + bz + 1 = 0",
    zoom: 0.9,
    coeffs: [
      {
        re: 1,
        im: 0,
        constraint: "frozen",
        constraintParams: {}
      },
      {
        re: -0.26,
        im: 0.01,
        constraint: "none",
        constraintParams: {}
      },
      {
        re: 0,
        im: 0,
        constraint: "frozen",
        constraintParams: {}
      },
      {
        re: 0,
        im: 0,
        constraint: "frozen",
        constraintParams: {}
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
        id: 0,
        re: -1.05,
        im: 0
      },
      {
        id: 1,
        re: 0.79,
        im: 0.54
      },
      {
        id: 2,
        re: 0.79,
        im: -0.54
      },
      {
        id: 3,
        re: -0.27,
        im: 0.98
      },
      {
        id: 4,
        re: -0.27,
        im: -0.98
      }
    ]
  },
  {
    id: 15,
    degree: 5,
    formula: "z⁵ + az² + 1 = 0",
    zoom: 0.63,
    coeffs: [
      {
        re: 1,
        im: 0,
        constraint: "frozen",
        constraintParams: {}
      },
      {
        re: 0,
        im: 0,
        constraint: "frozen",
        constraintParams: {}
      },
      {
        re: -2.4,
        im: 0.02,
        constraint: "none",
        constraintParams: {}
      },
      {
        re: 0,
        im: 0,
        constraint: "frozen",
        constraintParams: {}
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
        id: 0,
        re: -0.62,
        im: 0
      },
      {
        id: 1,
        re: -0.63,
        im: 1.24
      },
      {
        id: 2,
        re: 1.18,
        im: 0
      },
      {
        id: 3,
        re: 0.7,
        im: 0
      },
      {
        id: 4,
        re: -0.63,
        im: -1.24
      }
    ]
  },
  {
    id: 16,
    degree: 5,
    formula: "Make your own game: Press 'D'",
    zoom: 0.8,
    coeffs: [
        { re: 0.7, im: 0, constraint: 'circle', constraintParams: {radius: 0.7} }, // c0 (constant)
        { re: 0, im: -1, constraint: 'none', constraintParams: {} },   // c1
        { re: 0, im: 1, constraint: 'none', constraintParams: {} },   // c2
        { re: 1, im: -0.7, constraint: 'circle', constraintParams: {radius: 0.7, center: {re: 1, im: 0}} }   // c3
        { re: 0, im: 0, constraint: 'frozen', constraintParams: {} }   // c4
    ],
    targets: [
      {
        id: 0,
        re: -0.37,
        im: -0.01
      },
      {
        id: 1,
        re: -0.44,
        im: 1.38
      },
      {
        id: 2,
        re: 0.66,
        im: -0.73
      },
      {
        id: 3,
        re: -0.47,
        im: -1.35
      },
      {
        id: 4,
        re: 0.61,
        im: 0.71
      }
    ]
  }
  // {
  //   id: 100,
  //   degree: 4,
  //   formula: "z⁵ + z⁴ + z³ + az² + bz + c = 0",
  //   coeffs: [
  //       { re: 0, im: -0.7, constraint: 'none', constraintParams: {} }, // c0 (constant)
  //       { re: 0, im: 0, constraint: 'frozen', constraintParams: {} },   // c1
  //       { re: 0, im: 0, constraint: 'frozen', constraintParams: {} },   // c2
  //       { re: 0, im: 0, constraint: 'frozen', constraintParams: {} }   // c3
  //   ],
  //   targets: [
  //       { id: 0, re: -1, im: 0 },
  //       { id: 1, re: 0.5, im: 0.866 },
  //       { id: 2, re: 0.5, im: -0.866 },
  //       { id: 3, re: -0.5, im: 0.866 }
  //   ]
  // },
];