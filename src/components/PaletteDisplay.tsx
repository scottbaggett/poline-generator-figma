import React from "react";
import { GeneratedColor } from "../../types";

interface PaletteDisplayProps {
  colors: GeneratedColor[];
}

export const PaletteDisplay: React.FC<PaletteDisplayProps> = ({ colors }) => {
  const [copied, setCopied] = React.useState<string | null>(null);
  const getContrastColor = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luminance > 128 ? "#000" : "#fff";
  };

  const handleColorClick = (color: GeneratedColor) => {
    navigator.clipboard.writeText(color.hex);
    setCopied(color.hex);
    setTimeout(() => setCopied(null), 400);
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-y-auto">
      <div className="w-full flex flex-col gap-8 grow">
        {/* Visual Bar Container - constrained to width */}
        <div className="h-full rounded-xl overflow-hidden shadow-2xl flex ring-1 ring-border w-full">
          {colors.map((color, idx) => (
            <button
              type="button"
              onClick={() => handleColorClick(color)}
              key={idx}
              style={{ backgroundColor: color.hex }}
              className="cursor-pointer flex-1 min-w-0  h-full flex flex-col items-center justify-end pb-4 group relative transition-[flex] hover:flex-[100px] duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
            >
              <div className="flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 px-1 text-center w-full">
                <span
                  className="text-sm font-bold font-mono tracking-widest uppercase mb-1 whitespace-nowrap overflow-hidden text-ellipsis w-full px-2"
                  style={{ color: getContrastColor(color.hex) }}
                >
                  {copied ? 'Copied!' : color.hex}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
