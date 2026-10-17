import { X } from 'lucide-react';

interface VideoViewerProps {
  youtubeUrl: string;
  title: string;
  onClose: () => void;
}

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // Already a bare ID (11 chars, alphanumeric + - _)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtube\.com\/watch\?.*&v=)([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match) return match[1];
  }

  return null;
}

export default function VideoViewer({ youtubeUrl, title, onClose }: VideoViewerProps) {
  const videoId = extractYouTubeId(youtubeUrl);
  const embedUrl = videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1`
    : null;

  return (
    <div className="fixed inset-0 z-[100] bg-gray-900/95 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800/80 flex-shrink-0">
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

      {/* Video area */}
      <div className="flex-1 flex items-center justify-center px-4 py-4 overflow-hidden">
        {embedUrl ? (
          <div
            className="relative w-full bg-black rounded-2xl overflow-hidden shadow-2xl"
            style={{ maxWidth: 'min(420px, 90vw)', aspectRatio: '9 / 16' }}
          >
            <iframe
              src={embedUrl}
              title={title}
              className="absolute inset-0 w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center px-6">
            <p className="text-red-400 font-medium text-sm">
              No se pudo cargar el video. Verifica que el enlace de YouTube sea válido.
            </p>
            <button onClick={onClose} className="text-white/70 underline text-sm">
              Volver
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
