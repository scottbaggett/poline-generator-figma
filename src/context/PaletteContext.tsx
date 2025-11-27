import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { PaletteConfig, PositionFunction, GeneratedColor } from '../../types';
import { generatePalette } from '../utils/colorGen';

// Default initial state
export const DEFAULT_CONFIG: PaletteConfig = {
  anchors: [
    { id: 'start', hex: 'cyan' },
    { id: 'end', hex: 'blue' }
  ],
  steps: 6,
  positionFunction: PositionFunction.LINEAR,
  hueShift: 0,
  closedLoop: false,
  invertedLightness: false
};

interface PaletteContextValue {
  config: PaletteConfig;
  setConfig: React.Dispatch<React.SetStateAction<PaletteConfig>>;
  colors: GeneratedColor[];
}

const PaletteContext = createContext<PaletteContextValue | null>(null);

export function PaletteProvider({ children }: React.PropsWithChildren) {
  const [config, setConfig] = useState<PaletteConfig>(DEFAULT_CONFIG);

  const colors = useMemo(() => {
    const anchorHexes = config.anchors.map(a => a.hex);
    return generatePalette(
      anchorHexes,
      config.steps,
      config.positionFunction,
      config.hueShift,
      config.closedLoop,
      config.invertedLightness
    );
  }, [config]);

  return (
    <PaletteContext.Provider value={{ config, setConfig, colors }}>
      {children}
    </PaletteContext.Provider>
  );
}

export function usePalette() {
  const context = useContext(PaletteContext);
  if (!context) {
    throw new Error('usePalette must be used within a PaletteProvider');
  }
  return context;
}
