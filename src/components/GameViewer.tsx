import { X } from 'lucide-react';

interface GameViewerProps {
  gameUrl: string;
  title: string;
  onClose: () => void;
}

export default function GameViewer({ gameUrl, title, onClose }: GameViewerProps) {
  return (
    <div className="fixed inset-0 z-[100] bg-gray-900 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 flex-shrink-0">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-white/90 hover:text-white text-sm font-medium transition-colors"
        >
          <X size={20} />
          <span className="hidden sm:inline">Cerrar</span>
        </button>
        <p className="text-white font-semibold text-sm sm:text-base truncate flex-1 text-center px-2">
          {title}
        </p>
        <div className="w-8 sm:w-20" />
      </div>

      {/* Game area - portrait orientation, taller than wide */}
      <div className="flex-1 flex items-center justify-center px-3 py-4 overflow-hidden">
        <div
          className="relative w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
          style={{ maxWidth: 'min(390px, 92vw)', height: '100%', maxHeight: '820px' }}
        >
          <iframe
            src={gameUrl}
            title={title}
            className="absolute inset-0 w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock"
            allow="fullscreen"
          />
        </div>
      </div>
    </div>
  );
}
