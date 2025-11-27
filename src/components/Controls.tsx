import React, { useState, useRef, useEffect } from 'react';
import { PaletteConfig, PositionFunction } from '../../types';
import { positionFunctionNames } from '../utils/colorGen';
import { Sliders, Plus, RefreshCcwDot, ChevronDown } from 'lucide-react';
import { HexColorPicker } from "react-colorful";
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Slider } from './ui/slider';
import { Checkbox } from './ui/checkbox';

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
        <div className="absolute top-full left-0 mt-2 z-50 shadow-2xl rounded-lg p-3 bg-background border  w-full" ref={popover}>
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
    <div className="bg-background flex flex-col  gap-6 h-full overflow-y-auto no-scrollbar">
      
      {/* Header */}
      <div className="flex content-center gap-2 border-b h-12 px-3 items-center">
        <h2 className="font-bold text-sm tracking-wide text-foreground">CONFIG</h2>
      </div>

      {/* Anchors */}
      <div className="flex flex-col gap-2 px-3">
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

      {/* Points per Segment */}
      <div className="flex flex-col gap-2 px-3">
        <div className="flex justify-between items-baseline">
            <h3 className="text-xs font-semibold text-foreground">Points</h3>
            <span className="text-xs font-mono text-muted-foreground">{config.steps}</span>
        </div>
        <Slider
          min={2}
          max={20}
          step={1}
          defaultValue={[config.steps]}
          onValueChange={(value) => setConfig(prev => ({ ...prev, steps: value[0] }))}
        />
      </div>

      {/* Position Function */}
      <div className="flex flex-col gap-2 px-3">
        <h3 className="text-xs font-semibold">Distribution</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              {positionFunctionNames[config.positionFunction]}
              <ChevronDown className="w-4 h-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
            {Object.values(PositionFunction).map((fn) => (
              <DropdownMenuItem
                key={fn}
                onClick={() => setConfig(prev => ({ ...prev, positionFunction: fn }))}
                className={config.positionFunction === fn ? 'bg-secondary' : ''}
              >
                {positionFunctionNames[fn]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Hue Shift */}
      <div className="flex flex-col gap-2 px-3">
         <div className="flex justify-between items-baseline">
            <h3 className="text-xs font-semibold">Hue Shift</h3>
            <span className="text-xs font-mono text-muted-foreground">{config.hueShift}°</span>
         </div>

            <Slider
            min={-180}
            max={180}
            step={5}
            value={[config.hueShift]}
            onValueChange={(value) => setConfig(prev => ({ ...prev, hueShift: value[0] }))}
            />
      </div>

      {/* Toggles */}
      <div className="flex flex-col gap-2 px-3">
        <h3 className="text-xs font-semibold">Options</h3>
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox
              checked={config.closedLoop}
              onCheckedChange={(checked) => setConfig(prev => ({ ...prev, closedLoop: checked }))}
            />
            <span className="text-xs text-muted-foreground">Closed Loop</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox
              checked={config.invertedLightness}
              onCheckedChange={(checked) => setConfig(prev => ({ ...prev, invertedLightness: checked }))}
            />
            <span className="text-xs text-muted-foreground">Inverted Lightness</span>
          </label>
        </div>
      </div>

    </div>
  );
};