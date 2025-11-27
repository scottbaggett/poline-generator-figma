import React, { useState, useMemo } from 'react';
import { Controls } from './components/Controls';
import { PaletteDisplay } from './components/PaletteDisplay';
import { CodeExport } from './components/CodeExport';
import { PaletteConfig, PositionFunction, GeneratedColor } from '../types';
import { generatePalette } from './utils/colorGen';
import { Badge } from './components/ui/badge';

// Default initial state
const INITIAL_CONFIG: PaletteConfig = {
  anchors: [
    { id: 'start', hex: '#6366f1' }, // Indigo 500
    { id: 'end', hex: '#ec4899' }    // Pink 500
  ],
  steps: 4, // numPoints per segment in Poline
  positionFunction: PositionFunction.SINUSOIDAL,
  hueShift: 0,
  closedLoop: false,
  invertedLightness: false
};

export default function App() {
  console.log('Plugin UI: App component rendering');
  
  const [config, setConfig] = useState<PaletteConfig>(INITIAL_CONFIG);
  
  // Memoize generated palette to avoid recalculation on unrelated renders
  const colors: GeneratedColor[] = useMemo(() => {
    const anchorHexes = config.anchors.map(a => a.hex);
    return generatePalette(
      anchorHexes,
      config.steps,
      config.mode,
      config.hueRotation
    );
  }, [config]);

  console.log('Plugin UI: App rendering with', colors.length, 'colors');

  return (
    <div className="flex h-screen bg-background text-gray-100 font-sans selection:bg-white/20">
      
      {/* Sidebar Area */}
      <div className="flex flex-col border-r border-gray-900 bg-background w-[340px]">
          <Controls config={config} setConfig={setConfig} />
          <CodeExport colors={colors} />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative bg-background overflow-hidden">
        
        {/* Top Navigation / Header */}
        <header className="px-8 h-12 border-b flex items-center justify-between bg-background sticky top-0 z-10">
            <div className="flex items-center gap-3">
           
                <div>
                    <h1 className="text-lg font-bold text-foreground tracking-tight">
                        Poline Generator
                    </h1>
                </div>
            </div>
            
            <div className="hidden md:block">
                 <Badge variant="outline">Beta</Badge>
            </div>
        </header>

        {/* Content */}
        <div className="flex-1 flex flex-col p-8 gap-8 min-h-0">
            <PaletteDisplay colors={colors} />
        </div>
      </main>

    </div>
  );
}