
export type ConstraintType = 'none' | 'horizontal' | 'vertical' | 'circle' | 'frozen';

export interface Complex {
  re: number;
  im: number;
}

export interface ConstraintParams {
  value?: number; // Legacy support (optional)
  y?: number;     // For horizontal
  x?: number;     // For vertical
  radius?: number;// For circle
  center?: Complex; // For circle with offset
}

export interface Coefficient {
  id: number;
  val: Complex;
  constraint: ConstraintType;
  constraintParams: ConstraintParams;
  isDragging: boolean;
}

export interface Target {
  id: number; // Corresponds to the root index it expects
  val: Complex;
  radius: number;
  isFilled: boolean;
}

export interface LevelData {
  id: number;
  degree: number;
  formula?: string; // Display string for the math formula
  zoom?: number; // Initial zoom level (default 1.0)
  // Coeffs now supports optional params for complex constraints
  coeffs: { 
    re: number; 
    im: number; 
    constraint: ConstraintType;
    constraintParams?: ConstraintParams; 
  }[]; 
  targets: { id: number; re: number; im: number }[]; 
}

export const GAME_COLORS = {
  bg: '#050510',
  grid: 'rgba(255,255,255,0.05)',
  constraintGuide: 'rgba(255, 255, 255, 0.3)',
  coeff: '#ff0055',
  coeffActive: '#ff55aa',
  text: '#aaddff',
  palette: [
    '#00ffff', // Cyan
    '#ff00ff', // Magenta
    '#ffff00', // Yellow
    '#00ff00', // Lime
    '#ff8800', // Orange
    '#aa00ff', // Violet
  ]
};