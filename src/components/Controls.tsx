import React, { useState, useRef, useEffect } from 'react';
import { PaletteConfig, InterpolationMode } from '../../types';
import { Sliders, RefreshCcw, Plus, Trash2, GripVertical, RefreshCcwDot, SquareIcon } from 'lucide-react';
import { HexColorPicker } from "react-colorful";
import { v4 as uuidv4 } from 'uuid'; // We'll simulate this since we don't have uuid package, just use random string
import { Button } from './ui/button';

// Helper for ID generation
const generateId = () => Math.random().toString(36).substr(2, 9);

interface ControlsProps {
  config: PaletteConfig;
  setConfig: React.Dispatch<React.SetStateAction<PaletteConfig>>;
}

// Sub-component for individual color input to handle popover state
const ColorInput: React.FC<{
  label: string;
  color: string;
  onChange: (hex: string) => void;
  onRemove: () => void;
  canRemove: boolean;
}> = ({ label, color, onChange, onRemove, canRemove }) => {
  const [isOpen, setIsOpen] = useState(false);
  const popover = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popover.current && !popover.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="flex gap-2 relative group flex-row">
   
 
        <Button
        type="button"
          size="icon-lg"
          variant="secondary"
          style={{ backgroundColor: color }}
          onClick={() => setIsOpen(true)}
        />


      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 shadow-2xl rounded-lg p-3 bg-gray-900 border border-gray-800 w-full" ref={popover}>
           <HexColorPicker color={color} onChange={onChange} />
        </div>
      )}
    </div>
  );
};

export const Controls: React.FC<ControlsProps> = ({ config, setConfig }) => {
  
  const handleAnchorChange = (index: number, hex: string) => {
    const newAnchors = [...config.anchors];
    newAnchors[index].hex = hex;
    setConfig(prev => ({ ...prev, anchors: newAnchors }));
  };

  const handleReverse = () => {
    setConfig(prev => ({
        ...prev,
        anchors: [...prev.anchors].reverse()
    }));
  };

  const addAnchor = () => {
    setConfig(prev => {
        const lastAnchor = prev.anchors[prev.anchors.length - 1];
        const newAnchor = { id: generateId(), hex: lastAnchor.hex }; // Duplicate last color
        return {
            ...prev,
            anchors: [...prev.anchors, newAnchor]
        };
    });
  };

  const removeAnchor = (index: number) => {
    if (config.anchors.length <= 2) return;
    setConfig(prev => ({
        ...prev,
        anchors: prev.anchors.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="bg-background p-6 flex flex-col gap-10 h-full overflow-y-auto no-scrollbar">
      
      {/* Header */}
      <div className="flex items-center gap-2 text-white pb-4 border-b border-gray-900">
        <Sliders className="w-4 h-4 text-white" />
        <h2 className="font-bold text-sm tracking-wide">CONFIG</h2>
      </div>

      {/* Anchors */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
             <h3 className="text-sm font-semibold uppercase tracking-wider">Anchors</h3>
            <Button variant="ghost" size="icon" onClick={handleReverse}>
                <RefreshCcwDot />
            </Button>
        </div>
       
        <div className="flex flex-row gap-3">
            {config.anchors.map((anchor, idx) => (
                <ColorInput 
                    key={anchor.id}
                    label={`Stop ${idx + 1}`}
                    color={anchor.hex}
                    onChange={(hex) => handleAnchorChange(idx, hex)}
                    onRemove={() => removeAnchor(idx)}
                    canRemove={config.anchors.length > 2}
                />
            ))}
       

        <Button 
            variant="secondary"
            size="icon-lg"
            onClick={addAnchor}
            >
            <Plus className="w-3 h-3" />
        </Button>
      </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        <div className="flex justify-between items-baseline">
            <h3 className="text-xs font-semibold text-white">Steps</h3>
            <span className="text-xs font-mono text-gray-500">{config.steps}</span>
        </div>
        <input
          type="range"
          min="2"
          max="24"
          value={config.steps}
          onChange={(e) => setConfig(prev => ({ ...prev, steps: parseInt(e.target.value) }))}
          className="w-full h-1 bg-gray-900 rounded-lg appearance-none cursor-pointer accent-white hover:accent-gray-300"
        />
      </div>

      {/* Interpolation Mode */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold text-white">Interpolation</h3>
        <div className="grid grid-cols-2 gap-2">
            {Object.values(InterpolationMode).map((m) => (
                <button
                    key={m}
                    onClick={() => setConfig(prev => ({ ...prev, mode: m }))}
                    className={`px-3 py-3 text-xs rounded border font-mono transition-all text-center uppercase tracking-wider ${
                        config.mode === m 
                        ? 'bg-white text-black border-white font-bold' 
                        : 'bg-background border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300'
                    }`}
                >
                    {m}
                </button>
            ))}
        </div>
      </div>

      {/* Hue Rotation */}
      <div className="space-y-4">
         <div className="flex justify-between items-baseline">
            <h3 className="text-xs font-semibold text-white">Hue Shift</h3>
            <span className="text-xs font-mono text-gray-500">{config.hueRotation}°</span>
         </div>
         
        <div className="relative h-1 bg-gray-900 rounded-lg w-full flex items-center">
            <input
            type="range"
            min="-360"
            max="360"
            step="10"
            value={config.hueRotation}
            onChange={(e) => setConfig(prev => ({ ...prev, hueRotation: parseInt(e.target.value) }))}
            className="absolute w-full h-1 bg-transparent appearance-none cursor-pointer accent-white hover:accent-gray-300 z-10"
            />
             {/* Center marker */}
            <div className="absolute left-1/2 w-px h-3 bg-gray-700 -top-1"></div>
        </div>
      </div>

    </div>
  );
};