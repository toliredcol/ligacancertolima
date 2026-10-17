import { X } from 'lucide-react';

interface ColoringBookViewerProps {
  htmlUrl: string;
  title: string;
  onClose: () => void;
}

export default function ColoringBookViewer({ htmlUrl, title, onClose }: ColoringBookViewerProps) {
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

      {/* Book area */}
      <div className="flex-1 overflow-hidden bg-white">
        <iframe
          src={htmlUrl}
          title={title}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-forms"
          allow="fullscreen"
        />
      </div>
    </div>
  );
}
