import { Poline, positionFunctions } from 'poline';
import * as d3 from 'd3';
import { GeneratedColor, PositionFunction } from '../../types';

// Map our enum to actual poline position functions
const positionFunctionMap: Record<PositionFunction, (t: number) => number> = {
  [PositionFunction.LINEAR]: positionFunctions.linearPosition,
  [PositionFunction.EXPONENTIAL]: positionFunctions.exponentialPosition,
  [PositionFunction.QUADRATIC]: positionFunctions.quadraticPosition,
  [PositionFunction.CUBIC]: positionFunctions.cubicPosition,
  [PositionFunction.QUARTIC]: positionFunctions.quarticPosition,
  [PositionFunction.SINUSOIDAL]: positionFunctions.sinusoidalPosition,
  [PositionFunction.ASINUSOIDAL]: positionFunctions.asinusoidalPosition,
  [PositionFunction.ARC]: positionFunctions.arcPosition,
};

// Convert hex color to HSL array [h, s, l] for Poline
// Poline expects: hue [0-360], saturation [0-1], lightness [0-1]
const hexToHSL = (hex: string): [number, number, number] => {
  const hsl = d3.hsl(hex);
  return [
    hsl.h || 0,  // hue 0-360
    hsl.s,       // saturation 0-1
    hsl.l        // lightness 0-1
  ];
};

// Convert HSL array to our GeneratedColor format
const hslToGeneratedColor = (hsl: [number, number, number]): GeneratedColor => {
  const [h, s, l] = hsl;
  const color = d3.hsl(h, s, l);
  const hex = color.formatHex();
  const rgb = d3.rgb(color.toString());
  const lch = d3.lch(color.toString());

  return {
    hex,
    hsl: `hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`,
    rgb: `rgb(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)})`,
    lch: `lch(${Math.round(lch.l)}% ${Math.round(lch.c)} ${Math.round(lch.h || 0)})`,
  };
};

export interface PolineOptions {
  anchors: string[];
  numPoints: number;
  positionFunction: PositionFunction;
  hueShift: number;
  closedLoop: boolean;
  invertedLightness: boolean;
}

export const generatePalette = (
  anchors: string[],
  numPoints: number,
  positionFunction: PositionFunction,
  hueShift: number,
  closedLoop: boolean,
  invertedLightness: boolean
): GeneratedColor[] => {
  if (anchors.length < 2) return [];

  // Convert hex anchors to HSL arrays for Poline
  const anchorColors = anchors.map(hexToHSL);

  // Create Poline instance
  const poline = new Poline({
    anchorColors,
    numPoints,
    positionFunction: positionFunctionMap[positionFunction],
    closedLoop,
    invertedLightness,
  });

  // Apply hue shift if specified
  if (hueShift !== 0) {
    poline.shiftHue(hueShift);
  }

  // Get colors and convert to our format
  const colors = poline.colors as [number, number, number][];
  return colors.map(hslToGeneratedColor);
};

// Export position function names for UI
export const positionFunctionNames: Record<PositionFunction, string> = {
  [PositionFunction.LINEAR]: 'Linear',
  [PositionFunction.EXPONENTIAL]: 'Exponential',
  [PositionFunction.QUADRATIC]: 'Quadratic',
  [PositionFunction.CUBIC]: 'Cubic',
  [PositionFunction.QUARTIC]: 'Quartic',
  [PositionFunction.SINUSOIDAL]: 'Sinusoidal',
  [PositionFunction.ASINUSOIDAL]: 'Arc Sinusoidal',
  [PositionFunction.ARC]: 'Arc',
};

// Re-export Poline class for advanced usage
export { Poline, positionFunctions };
