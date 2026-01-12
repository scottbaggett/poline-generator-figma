import { PaletteDisplay } from './components/PaletteDisplay';
import { DEFAULT_CONFIG, PaletteProvider, usePalette } from './context/PaletteContext';
import { Badge } from './components/ui/badge';
import { SidebarPanel } from './components/SidebarPanel';
import { ArrowBigLeft, ArrowUp01Icon, ArrowUpRight, ArrowUpRightFromCircle, GithubIcon, PaintBucket, UserIcon } from 'lucide-react';

function AppContent() {
  const { config, setConfig, colors } = usePalette() ?? DEFAULT_CONFIG;

  // Get colors for the badge gradient (first and last)
  const badgeStyle = colors.length >= 2
    ? {
      background: `linear-gradient(135deg, ${colors[0].hex}, ${colors[colors.length - 1].hex})`,
    }
    : {};

  return (
    <div className="flex-col h-screen flex-1 h">
      <div className="flex flex-row flex-1 h-full">

        {/* Sidebar Area */}
        <div className="flex flex-col border-r w-80">
          <SidebarPanel
            config={config}
            setConfig={setConfig}
            colors={colors}
          />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col relative bg-background overflow-hidden">

          {/* Top Navigation / Header */}
          <div className="flex content-center justify-between h-12 px-3 items-center sticky top-0 z-10 bg-background ">
            <div className="flex items-center gap-2"><h2 className="font-bold text-sm tracking-wide text-foreground">POLINE GENERATOR</h2>
              <Badge variant="default" style={badgeStyle} className="border-none">BETA</Badge>
            </div>
            <div className="flex items-center gap-4">
              <a href="https://meodai.github.io/poline" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors uppercase font-medium flex items-center gap-1">
                Discover Poline
              </a>
              <a href="https://github.com/scottbaggett/poline-generator-figma" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors uppercase font-medium flex items-center gap-1">
                <GithubIcon className="size-4" />
              </a>
            </div>
          </div>

          <div className="flex-1 flex flex-col px-3 pb-3 min-h-0">
            <PaletteDisplay colors={colors} />
          </div>
        </main>
      </div>

    </div>
  );
}

export default function App() {
  return (
    <PaletteProvider>
      <AppContent />
    </PaletteProvider>
  );
}
