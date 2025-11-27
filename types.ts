export interface ColorPoint {
  id: string;
  hex: string;
  locked?: boolean;
}

export interface GeneratedColor {
  hex: string;
  hsl: string;
  lch: string;
  rgb: string;
  name?: string; // Potential future use
}

export enum InterpolationMode {
  LCH = 'lch',
  RGB = 'rgb',
  HSL = 'hsl',
  LAB = 'lab'
}

export enum PositionFunction {
  LINEAR = 'linearPosition',
  EXPONENTIAL = 'exponentialPosition',
  QUADRATIC = 'quadraticPosition',
  CUBIC = 'cubicPosition',
  QUARTIC = 'quarticPosition',
  SINUSOIDAL = 'sinusoidalPosition',
  ASINUSOIDAL = 'asinusoidalPosition',
  ARC = 'arcPosition',
}

export interface PaletteConfig {
  anchors: ColorPoint[];
  steps: number; // Number of colors generated (numPoints in Poline)
  positionFunction: PositionFunction;
  hueShift: number; // Degrees to shift hue across palette
  closedLoop: boolean; // Whether palette loops back to start
  invertedLightness: boolean; // Invert lightness direction
}

export interface ExportFormat {
  label: string;
  ext: string;
  generator: (colors: GeneratedColor[]) => string;
}

export enum FigmaNamingPattern {
  NUMERIC = 'numeric',      // 1, 2, 3, ...
  TAILWIND = 'tailwind',   // 50, 100, 200, ..., 950
  CUSTOM = 'custom'         // User-defined names
}

export interface FigmaStyleConfig {
  prefix: string;           // e.g., "Poline", "Brand", "Primary"
  namingPattern: FigmaNamingPattern;
  customNames?: string[];   // For custom naming pattern
  createVariables: boolean; // Create variables vs paint styles
}
