import React, { useState } from 'react';
import { Wand2, Loader2, Sparkles } from 'lucide-react';
import { generateMagicPalette } from '../services/geminiService';

interface MagicBarProps {
  onColorsGenerated: (start: string, end: string) => void;
}

export const MagicBar: React.FC<MagicBarProps> = ({ onColorsGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleMagic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await generateMagicPalette(prompt);
      if (result) {
        onColorsGenerated(result.start, result.end);
        setPrompt('');
      } else {
        setError("Couldn't generate colors. Try checking API key.");
      }
    } catch (err) {
      setError("An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleMagic} className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          {isLoading ? (
            <Loader2 className="h-5 w-5 text-white animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 text-gray-400 group-focus-within:text-white transition-colors" />
          )}
        </div>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Type a mood to generate colors with AI..."
          className="block w-full pl-11 pr-24 py-4 border border-gray-800 rounded-full leading-5 bg-gray-900/50 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white focus:border-white focus:bg-background sm:text-sm transition-all"
          disabled={isLoading}
        />
        <div className="absolute inset-y-1.5 right-1.5">
            <button 
            type="submit" 
            disabled={!prompt.trim() || isLoading}
            className="h-full px-5 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
            Generate
            </button>
        </div>
      </form>
      {error && <p className="text-red-500 text-xs mt-2 ml-4 font-mono">{error}</p>}
    </div>
  );
};