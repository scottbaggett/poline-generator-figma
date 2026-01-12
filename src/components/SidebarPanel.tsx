import React, { useState, useRef, useEffect } from "react";
import {
  PaletteConfig,
  PositionFunction,
  GeneratedColor,
  FigmaStyleConfig,
  FigmaNamingPattern,
} from "../../types";
import { positionFunctionNames } from "../utils/colorGen";
import {
  Plus,
  RefreshCcwDot,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Terminal,
  Figma,
  Settings,
  Palette,
  RotateCcw,
  Trash,
} from "lucide-react";
import { HexColorInput, HexColorPicker } from "react-colorful";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Slider } from "./ui/slider";
import { Checkbox } from "./ui/checkbox";
import { DEFAULT_CONFIG } from "@/context/PaletteContext";
import { cn } from "@/lib/utils";

// Helper for ID generation
const generateId = () => Math.random().toString(36).substr(2, 9);

interface SidebarPanelProps {
  config: PaletteConfig;
  setConfig: React.Dispatch<React.SetStateAction<PaletteConfig>>;
  colors: GeneratedColor[];
}

// Sub-component for individual color input
const ColorInput: React.FC<{
  color: string;
  onChange: (hex: string) => void;
}> = ({ color, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const popover = useRef<HTMLDivElement>(null);

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
        <div
          className="absolute top-full left-0 mt-2 z-50 shadow-2xl rounded-lg p-3 bg-background border"
          ref={popover}
        >
          <HexColorPicker color={color} onChange={onChange} />
          <HexColorInput
            color={color}
            onChange={onChange}
            className="mt-2 w-full input-text"
          />
        </div>
      )}
    </div>
  );
};

// Collapsible section component
const CollapsibleSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}> = ({ title, icon, isOpen, onToggle, children }) => (
  <div className="border border-border rounded-lg overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full px-3 py-3 bg-card hover:bg-secondary/50 transition-colors flex items-center justify-between text-foreground text-xs font-bold uppercase tracking-wider"
    >
      <div className="flex items-center gap-2">
        {icon}
        {title}
      </div>
      {isOpen ? (
        <ChevronUp className="w-4 h-4" />
      ) : (
        <ChevronDown className="w-4 h-4" />
      )}
    </button>
    {isOpen && (
      <div className="p-3 space-y-4 bg-card border-t border-border">
        {children}
      </div>
    )}
  </div>
);

// Check if running in Figma plugin environment
const isFigmaPlugin = () => {
  return typeof window !== "undefined" && window.parent !== window;
};

const DEFAULT_FIGMA_CONFIG: FigmaStyleConfig = {
  prefix: "poline",
  namingPattern: FigmaNamingPattern.NUMERIC,
  createVariables: false,
};

export const SidebarPanel: React.FC<SidebarPanelProps> = ({
  config,
  setConfig,
  colors,
}) => {
  // Section visibility state
  const [showAnchors, setShowAnchors] = useState(true);
  const [showExport, setShowExport] = useState(false);
  const [showFigma, setShowFigma] = useState(false);

  // Export state
  const [copied, setCopied] = useState(false);
  const [format, setFormat] = useState<"css" | "json" | "tailwind">("css");
  const [isCreatingStyles, setIsCreatingStyles] = useState(false);
  const [figmaConfig, setFigmaConfig] =
    useState<FigmaStyleConfig>(DEFAULT_FIGMA_CONFIG);

  useEffect(() => {
    // Listen for messages from plugin code
    const handleMessage = (event: MessageEvent) => {
      if (event.data.pluginMessage) {
        const { type, message } = event.data.pluginMessage;
        if (type === "styles-created") {
          setIsCreatingStyles(false);
          setCopied(true);
          setTimeout(() => setCopied(false), 3000);
        } else if (type === "error") {
          setIsCreatingStyles(false);
          console.error("Figma plugin error:", message);
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Anchor handlers
  const handleAnchorChange = (index: number, hex: string) => {
    const newAnchors = [...config.anchors];
    newAnchors[index].hex = hex;
    setConfig((prev) => ({ ...prev, anchors: newAnchors }));
  };

  const handleReverse = () => {
    setConfig((prev) => ({
      ...prev,
      anchors: [...prev.anchors].reverse(),
    }));
  };

  const addAnchor = () => {
    setConfig((prev) => {
      const lastAnchor = prev.anchors[prev.anchors.length - 1];
      const newAnchor = { id: generateId(), hex: lastAnchor.hex };
      return {
        ...prev,
        anchors: [...prev.anchors, newAnchor],
      };
    });
  };

  // Export handlers
  const getCode = () => {
    if (format === "json") {
      return JSON.stringify(
        colors.map((c) => c.hex),
        null,
        2
      );
    }
    if (format === "tailwind") {
      const tailwindScale = [
        50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
      ];
      const obj: Record<string, string> = {};
      colors.forEach((c, i) => {
        let key: string;
        if (colors.length <= tailwindScale.length) {
          const scaleIndex = Math.round(
            (i / (colors.length - 1)) * (tailwindScale.length - 1)
          );
          key = `${tailwindScale[scaleIndex]}`;
        } else {
          key = `${i + 1}`;
        }
        obj[key] = c.hex;
      });
      return JSON.stringify(obj, null, 2);
    }
    return `:root {\n${colors
      .map((c, i) => `  --color-${i + 1}: ${c.hex};`)
      .join("\n")}\n}`;
  };

  const handleCopy = async () => {
    const text = getCode();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCreateFigmaStyles = () => {
    if (!isFigmaPlugin()) {
      console.warn("Not running in Figma plugin environment");
      return;
    }

    setIsCreatingStyles(true);
    if (window.parent) {
      window.parent.postMessage(
        {
          pluginMessage: {
            type: "create-color-styles",
            colors: colors,
            config: figmaConfig,
          },
        },
        "*"
      );
    }
  };

  const getStyleName = (index: number): string => {
    const { prefix, namingPattern, customNames } = figmaConfig;
    const total = colors.length;

    let name: string;
    if (namingPattern === FigmaNamingPattern.TAILWIND) {
      // Standard Tailwind color scale
      const tailwindScale = [
        50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
      ];

      if (total <= tailwindScale.length) {
        // Map colors evenly across the scale
        const scaleIndex = Math.round(
          (index / (total - 1)) * (tailwindScale.length - 1)
        );
        name = `${tailwindScale[scaleIndex]}`;
      } else {
        // More colors than scale values - use numeric fallback
        name = `${index + 1}`;
      }
    } else if (
      namingPattern === FigmaNamingPattern.CUSTOM &&
      customNames &&
      customNames[index]
    ) {
      name = customNames[index];
    } else {
      name = `${index + 1}`;
    }

    return prefix ? `${prefix}/${name}` : name;
  };

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG);
  };

  return (
    <div className="bg-background flex flex-col h-full overflow-hidden">
      {/* Header */}

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-">
        {/* Anchors Section */}
        <CollapsibleSection
          title="Config"
          icon={<Palette className="w-3 h-3" />}
          isOpen={showAnchors}
          onToggle={() => setShowAnchors(!showAnchors)}
        >
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between items-baseline">
              <h3 className="text-xs font-semibold mb-0">Anchors</h3>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleReset}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Trash className="size-3 text-inherit!" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleReverse}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <RefreshCcwDot className="size-3 text-inherit!" />
                </Button>
                <span className="text-xs font-mono text-muted-foreground">
                  {config.anchors.length}
                </span>
              </div>
            </div>

            <div className="flex flex-row gap-3 flex-wrap">
              {config.anchors.map((anchor, idx) => (
                <ColorInput
                  key={anchor.id}
                  color={anchor.hex}
                  onChange={(hex) => handleAnchorChange(idx, hex)}
                />
              ))}
              <Button variant="secondary" size="icon-lg" onClick={addAnchor}>
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>
          {/* Steps */}
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <h3 className="text-xs font-semibold mb-2">Steps</h3>
              <span className="text-xs font-mono text-muted-foreground">
                {colors.length}
              </span>
            </div>
            <Slider
              min={4}
              max={20}
              step={1}
              defaultValue={[config.steps]}
              onValueChange={(value) =>
                setConfig((prev) => ({ ...prev, steps: value[0] }))
              }
            />
          </div>

          {/* Distribution */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold mb-2">Distribution</h3>
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
                    onClick={() =>
                      setConfig((prev) => ({ ...prev, positionFunction: fn }))
                    }
                    className={
                      config.positionFunction === fn ? "bg-secondary" : ""
                    }
                  >
                    {positionFunctionNames[fn]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Hue Shift */}
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <h3 className="text-xs font-semibold">Hue Shift</h3>
              <span className="text-xs font-mono text-muted-foreground">
                {config.hueShift}°
              </span>
            </div>
            <Slider
              min={-180}
              max={180}
              step={5}
              value={[config.hueShift]}
              onValueChange={(value) =>
                setConfig((prev) => ({ ...prev, hueShift: value[0] }))
              }
            />
          </div>

          {/* Options */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-semibold mb-2">Options</h3>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={config.closedLoop}
                  onCheckedChange={(checked) =>
                    setConfig((prev) => ({
                      ...prev,
                      closedLoop: checked as boolean,
                    }))
                  }
                />
                <span
                  className={cn(
                    "text-xs text-muted-foreground",
                    config.closedLoop && "text-foreground"
                  )}
                >
                  Closed Loop
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={config.invertedLightness}
                  onCheckedChange={(checked) =>
                    setConfig((prev) => ({
                      ...prev,
                      invertedLightness: checked as boolean,
                    }))
                  }
                />
                <span
                  className={cn(
                    "text-xs text-muted-foreground",
                    config.invertedLightness && "text-foreground"
                  )}
                >
                  Inverted Lightness
                </span>
              </label>
            </div>
          </div>
        </CollapsibleSection>

        {/* Export Section */}
        <CollapsibleSection
          title="Export"
          icon={<Terminal className="w-3 h-3" />}
          isOpen={showExport}
          onToggle={() => setShowExport(!showExport)}
        >
          <div className="flex bg-secondary/50 rounded-lg p-1 gap-1">
            {["css", "json", "tailwind"].map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f as "css" | "json" | "tailwind")}
                className={`flex-1 px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider rounded-md transition-all ${
                  format === f
                    ? "bg-secondary text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="relative group">
            <pre className="bg-background rounded-lg p-4 text-xs font-mono text-muted-foreground overflow-x-auto h-32 border border-border scrollbar-thin">
              {getCode()}
            </pre>
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 p-2 bg-secondary text-foreground rounded hover:bg-secondary/80 transition-all opacity-0 group-hover:opacity-100"
              title="Copy to clipboard"
            >
              {copied ? (
                <Check className="w-3 h-3" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          </div>
        </CollapsibleSection>

        {/* Figma Styles Section */}
        <CollapsibleSection
          title="Figma Styles"
          icon={<Settings className="w-3 h-3" />}
          isOpen={showFigma}
          onToggle={() => setShowFigma(!showFigma)}
        >
          {/* Prefix */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Prefix
            </label>
            <input
              type="text"
              value={figmaConfig.prefix}
              onChange={(e) =>
                setFigmaConfig({ ...figmaConfig, prefix: e.target.value })
              }
              placeholder="Poline"
              className="w-full px-3 py-2 bg-background border border-border rounded text-foreground text-sm font-mono focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary"
            />
          </div>

          {/* Naming Pattern */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Naming Pattern
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: FigmaNamingPattern.NUMERIC, label: "Numeric" },
                { value: FigmaNamingPattern.TAILWIND, label: "Tailwind" },
              ].map(({ value, label }) => (
                <Button
                  key={value}
                  onClick={() =>
                    setFigmaConfig({ ...figmaConfig, namingPattern: value })
                  }
                  variant={
                    figmaConfig.namingPattern === value ? "default" : "outline"
                  }
                  size="sm"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Style Type */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Style Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: false, label: "Paint Style" },
                { value: true, label: "Variable" },
              ].map(({ value, label }) => (
                <Button
                  key={String(value)}
                  onClick={() =>
                    setFigmaConfig({ ...figmaConfig, createVariables: value })
                  }
                  variant={
                    figmaConfig.createVariables === value
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2 pt-2 border-t border-border">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Preview
            </label>
            <div className="bg-background rounded p-2 text-xs font-mono text-muted-foreground max-h-24 overflow-y-auto">
              {colors.slice(0, 5).map((_, i) => (
                <div key={i}>{getStyleName(i)}</div>
              ))}
              {colors.length > 5 && (
                <div className="text-muted-foreground/50">...</div>
              )}
            </div>
          </div>

          {/* Create Button */}
          <button
            onClick={handleCreateFigmaStyles}
            disabled={isCreatingStyles}
            className="w-full py-3 bg-foreground text-background rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-foreground/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isCreatingStyles ? (
              <>
                <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                Creating {figmaConfig.createVariables ? "Variables" : "Styles"}
                ...
              </>
            ) : (
              <>
                <Figma className="w-4 h-4" />
                Create Figma{" "}
                {figmaConfig.createVariables ? "Variables" : "Styles"}
              </>
            )}
          </button>
        </CollapsibleSection>
      </div>
    </div>
  );
};
