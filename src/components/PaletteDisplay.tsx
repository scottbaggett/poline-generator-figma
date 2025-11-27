import React from 'react';
import { GeneratedColor } from '../../types';
import * as d3 from 'd3';

interface PaletteDisplayProps {
  colors: GeneratedColor[];
}

export const PaletteDisplay: React.FC<PaletteDisplayProps> = ({ colors }) => {
  
  const getContrastColor = (hex: string) => {
    const c = d3.color(hex);
    if (!c) return 'black';
    const luminance = 0.2126 * c.rgb().r + 0.7152 * c.rgb().g + 0.0722 * c.rgb().b;
    return luminance > 128 ? '#000' : '#fff';
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-y-auto pr-2 pb-2">
       <div className="w-full flex flex-col gap-10">
            {/* Visual Bar Container - constrained to width */}
            <div className="w-full pb-3">
                <div 
                    className="h-40 rounded-xl overflow-hidden shadow-2xl flex ring-1 ring-white/5 w-full"
                >
                    {colors.map((color, idx) => (
                        <div
                            key={idx}
                            style={{ backgroundColor: color.hex }}
                            className="flex-1 min-w-0 flex flex-col items-center justify-end pb-8 group relative transition-[flex] hover:flex-[2] duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
                        >
                            <div className="flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 pointer-events-none px-1 text-center w-full">
                                <span 
                                    className="text-sm font-bold font-mono tracking-widest uppercase mb-1 whitespace-nowrap overflow-hidden text-ellipsis w-full px-2"
                                    style={{ color: getContrastColor(color.hex) }}
                                >
                                    {color.hex}
                                </span>
                                <span 
                                    className="text-[10px] font-mono opacity-70 whitespace-nowrap overflow-hidden text-ellipsis w-full px-2"
                                    style={{ color: getContrastColor(color.hex) }}
                                >
                                    {color.lch}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 pb-8">
                {colors.map((color, idx) => (
                    <div key={idx} className="group bg-gray-900/40 rounded-xl p-3 border border-gray-800 hover:border-gray-600 transition-colors cursor-pointer"
                        onClick={() => navigator.clipboard.writeText(color.hex)}
                    >
                        <div 
                            className="w-full aspect-square rounded-lg mb-4 relative shadow-lg"
                            style={{ backgroundColor: color.hex }}
                        >
                             <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-background/20 backdrop-blur-[1px] rounded-lg">
                                <span className="text-white text-[10px] font-bold uppercase tracking-wider">Copy</span>
                             </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-gray-200 font-mono text-xs font-bold text-center tracking-wider">{color.hex}</p>
                            <div className="h-px bg-gray-800 w-full" />
                            <p className="text-gray-600 font-mono text-[10px] text-center truncate">{color.lch}</p>
                        </div>
                    </div>
                ))}
            </div>
       </div>
    </div>
  );
};