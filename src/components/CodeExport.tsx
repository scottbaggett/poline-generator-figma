import React, { useState, useEffect } from 'react';
import { GeneratedColor, FigmaStyleConfig, FigmaNamingPattern } from '../../types';
import { Copy, Check, Code, Terminal, Figma, Settings, ChevronDown, ChevronUp } from 'lucide-react';

interface CodeExportProps {
  colors: GeneratedColor[];
}

// Check if running in Figma plugin environment
const isFigmaPlugin = () => {
  return typeof window !== 'undefined' && window.parent !== window;
};

const DEFAULT_FIGMA_CONFIG: FigmaStyleConfig = {
  prefix: 'poline',
  namingPattern: FigmaNamingPattern.NUMERIC,
  createVariables: false,
};

export const CodeExport: React.FC<CodeExportProps> = ({ colors }) => {
  const [copied, setCopied] = useState(false);
  const [format, setFormat] = useState<'css' | 'json' | 'tailwind'>('css');
  const [isCreatingStyles, setIsCreatingStyles] = useState(false);
  const [isInFigma, setIsInFigma] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [figmaConfig, setFigmaConfig] = useState<FigmaStyleConfig>(DEFAULT_FIGMA_CONFIG);

  useEffect(() => {
    setIsInFigma(isFigmaPlugin());
    
    // Listen for messages from plugin code
    window.addEventListener('message', (event) => {
      if (event.data.pluginMessage) {
        const { type, styles, message } = event.data.pluginMessage;
        if (type === 'styles-created') {
          setIsCreatingStyles(false);
          setCopied(true);
          setTimeout(() => setCopied(false), 3000);
        } else if (type === 'error') {
          setIsCreatingStyles(false);
          console.error('Figma plugin error:', message);
        }
      }
    });
  }, []);

  const getCode = () => {
    if (format === 'json') {
      return JSON.stringify(colors.map(c => c.hex), null, 2);
    }
    if (format === 'tailwind') {
        const obj: Record<string, string> = {};
        colors.forEach((c, i) => {
            const key = i === 0 ? '50' : i === colors.length - 1 ? '950' : `${Math.round((i / (colors.length - 1)) * 900)}`;
            obj[key] = c.hex;
        });
        return JSON.stringify(obj, null, 2);
    }
    // CSS Variables
    return `:root {\n${colors.map((c, i) => `  --color-${i + 1}: ${c.hex};`).join('\n')}\n}`;
  };

  const handleCopy = async () => {
    const text = getCode();
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback for older browsers or restricted environments
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.warn('Failed to copy:', err);
        }
        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.warn('Clipboard access failed:', err);
      // Still show copied state even if clipboard fails
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCreateFigmaStyles = () => {
    if (!isInFigma) {
      console.warn('Not running in Figma plugin environment');
      return;
    }
    
    setIsCreatingStyles(true);
    // Send message to plugin code with configuration
    if (window.parent) {
      window.parent.postMessage({
        pluginMessage: {
          type: 'create-color-styles',
          colors: colors,
          config: figmaConfig
        }
      }, '*');
    }
  };

  const getStyleName = (index: number): string => {
    const { prefix, namingPattern, customNames } = figmaConfig;
    
    let name: string;
    if (namingPattern === FigmaNamingPattern.TAILWIND) {
      if (index === 0) {
        name = '50';
      } else if (index === colors.length - 1) {
        name = '950';
      } else {
        name = `${Math.round((index / (colors.length - 1)) * 900)}`;
      }
    } else if (namingPattern === FigmaNamingPattern.CUSTOM && customNames && customNames[index]) {
      name = customNames[index];
    } else {
      name = `${index + 1}`;
    }
    
    return prefix ? `${prefix}/${name}` : name;
  };

  return (
    <div className="bg-background border-t border-gray-900 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-white">
            <Terminal className="w-4 h-4 text-white" />
            <h2 className="font-bold text-sm tracking-wide">EXPORT</h2>
        </div>
        <div className="flex bg-gray-900 rounded-lg p-1 gap-1">
            {['css', 'json', 'tailwind'].map(f => (
                <button
                    key={f}
                    onClick={() => setFormat(f as any)}
                    className={`px-3 py-1 text-[10px] uppercase font-bold tracking-wider rounded-md transition-all ${
                        format === f 
                        ? 'bg-white text-black shadow-sm' 
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                >
                    {f}
                </button>
            ))}
        </div>
      </div>
      
      <div className="relative group">
        <pre className="bg-gray-900/50 rounded-lg p-4 text-xs font-mono text-gray-400 overflow-x-auto h-32 border border-gray-800 scrollbar-thin">
          {getCode()}
        </pre>
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-2 bg-white text-black rounded hover:bg-gray-200 transition-all opacity-0 group-hover:opacity-100"
          title="Copy to clipboard"
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>
      
      {isInFigma && (
        <>
          {/* Configuration Panel */}
          <div className="mt-4 border border-gray-800 rounded-lg overflow-hidden">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="w-full px-4 py-3 bg-gray-900/50 hover:bg-gray-900 transition-colors flex items-center justify-between text-white text-xs font-bold uppercase tracking-wider"
            >
              <div className="flex items-center gap-2">
                <Settings className="w-3 h-3" />
                Style Configuration
              </div>
              {showConfig ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            {showConfig && (
              <div className="p-4 space-y-4 bg-gray-900/30 border-t border-gray-800">
                {/* Prefix */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Prefix
                  </label>
                  <input
                    type="text"
                    value={figmaConfig.prefix}
                    onChange={(e) => setFigmaConfig({ ...figmaConfig, prefix: e.target.value })}
                    placeholder="Poline"
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded text-white text-sm font-mono focus:outline-none focus:ring-1 focus:ring-white focus:border-white"
                  />
                </div>

                {/* Naming Pattern */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Naming Pattern
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: FigmaNamingPattern.NUMERIC, label: 'Numeric' },
                      { value: FigmaNamingPattern.TAILWIND, label: 'Tailwind' },
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => setFigmaConfig({ ...figmaConfig, namingPattern: value })}
                        className={`px-3 py-2 text-xs rounded border font-mono transition-all text-center uppercase tracking-wider ${
                          figmaConfig.namingPattern === value
                            ? 'bg-white text-black border-white font-bold'
                            : 'bg-background border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Style Type */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Style Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: false, label: 'Paint Style' },
                      { value: true, label: 'Variable' },
                    ].map(({ value, label }) => (
                      <button
                        key={String(value)}
                        onClick={() => setFigmaConfig({ ...figmaConfig, createVariables: value })}
                        className={`px-3 py-2 text-xs rounded border font-mono transition-all text-center uppercase tracking-wider ${
                          figmaConfig.createVariables === value
                            ? 'bg-white text-black border-white font-bold'
                            : 'bg-background border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div className="space-y-2 pt-2 border-t border-gray-800">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Preview
                  </label>
                  <div className="bg-gray-900/50 rounded p-2 text-xs font-mono text-gray-400 max-h-24 overflow-y-auto">
                    {colors.slice(0, 5).map((_, i) => (
                      <div key={i}>{getStyleName(i)}</div>
                    ))}
                    {colors.length > 5 && <div className="text-gray-600">...</div>}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Create Button */}
          <button
            onClick={handleCreateFigmaStyles}
            disabled={isCreatingStyles}
            className="mt-4 w-full py-3 bg-white text-black rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isCreatingStyles ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Creating {figmaConfig.createVariables ? 'Variables' : 'Styles'}...
              </>
            ) : (
              <>
                <Figma className="w-4 h-4" />
                Create Figma {figmaConfig.createVariables ? 'Variables' : 'Styles'}
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
};