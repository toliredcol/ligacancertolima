import { useEffect, useRef, useState, useCallback } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { X, ChevronLeft, ChevronRight, Download, Loader2 } from 'lucide-react';

// PDF.js worker setup
import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore - worker URL import
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

interface StoryViewerProps {
  pdfUrl: string;
  title: string;
  onClose: () => void;
}

const RENDER_SCALE = 1.5;
const RENDER_RANGE = 2; // pages before/after current

export default function StoryViewer({ pdfUrl, title, onClose }: StoryViewerProps) {
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageImages, setPageImages] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const flipBookRef = useRef<any>(null);

  // Load PDF document
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    setPageImages({});
    setCurrentPage(0);

    (async () => {
      try {
        const loadingTask = pdfjsLib.getDocument({ url: pdfUrl });
        const doc = await loadingTask.promise;
        if (cancelled) return;
        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        setLoading(false);
        // Pre-render first few pages
        renderPages(doc, 0, Math.min(RENDER_RANGE * 2, doc.numPages - 1));
      } catch {
        if (!cancelled) {
          setError('No se pudo cargar el PDF del cuento.');
          setLoading(false);
        }
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfUrl]);

  // Render a range of pages to data URLs
  const renderPages = useCallback(async (doc: pdfjsLib.PDFDocumentProxy, from: number, to: number) => {
    for (let i = from; i <= to; i++) {
      if (pageImages[i]) continue; // already rendered
      try {
        const page = await doc.getPage(i + 1); // PDF.js uses 1-based
        const viewport = page.getViewport({ scale: RENDER_SCALE });
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvas, canvasContext: ctx, viewport } as any).promise;
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setPageImages(prev => ({ ...prev, [i]: dataUrl }));
      } catch {
        // skip failed pages
      }
    }
  }, [pageImages]);

  // Lazy-render nearby pages when page changes
  useEffect(() => {
    if (!pdfDoc || totalPages === 0) return;
    const from = Math.max(0, currentPage - RENDER_RANGE);
    const to = Math.min(totalPages - 1, currentPage + RENDER_RANGE);
    renderPages(pdfDoc, from, to);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pdfDoc, totalPages]);

  const handleFlip = (e: any) => {
    setCurrentPage(e.data);
  };

  const prevPage = () => {
    flipBookRef.current?.pageFlip()?.flipPrev();
  };

  const nextPage = () => {
    flipBookRef.current?.pageFlip()?.flipNext();
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `${title}.pdf`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Book dimensions - responsive
  const bookWidth = 400;
  const bookHeight = 550;

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
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm active:scale-95 transition-all flex-shrink-0"
        >
          <Download size={16} />
          <span className="hidden sm:inline">Descargar para imprimir y colorear</span>
          <span className="sm:hidden">Descargar</span>
        </button>
      </div>

      {/* Book area */}
      <div className="flex-1 flex flex-col items-center justify-center overflow-hidden px-2 py-4">
        {loading ? (
          <div className="flex flex-col items-center gap-4 text-white">
            <Loader2 size={40} className="animate-spin text-amber-400" />
            <p className="text-sm text-white/70">Cargando el cuento...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-4 text-center px-6">
            <p className="text-red-400 font-medium text-sm">{error}</p>
            <button onClick={onClose} className="text-white/70 underline text-sm">Volver</button>
          </div>
        ) : (
          <>
            {/* Flipbook */}
            <div className="flex-1 flex items-center justify-center overflow-hidden w-full">
              <HTMLFlipBook
                ref={flipBookRef}
                width={bookWidth}
                height={bookHeight}
                size="stretch"
                minWidth={280}
                maxWidth={500}
                minHeight={350}
                maxHeight={650}
                drawShadow
                flippingTime={600}
                usePortrait
                autoSize
                maxShadowOpacity={0.5}
                showCover
                mobileScrollSupport
                useMouseEvents
                swipeDistance={30}
                clickEventForward
                startPage={0}
                startZIndex={0}
                showPageCorners
                disableFlipByClick={false}
                onFlip={handleFlip}
                className="mx-auto"
                style={{}}
              >
                {Array.from({ length: totalPages }, (_, i) => (
                  <div key={i} className="page-bg" style={{ width: '100%', height: '100%' }}>
                    {pageImages[i] ? (
                      <img
                        src={pageImages[i]}
                        alt={`Página ${i + 1}`}
                        className="w-full h-full object-contain"
                        draggable={false}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-white">
                        <Loader2 size={24} className="animate-spin text-gray-300" />
                      </div>
                    )}
                  </div>
                ))}
              </HTMLFlipBook>
            </div>

            {/* Navigation controls */}
            <div className="flex items-center justify-center gap-6 mt-4 flex-shrink-0">
              <button
                onClick={prevPage}
                disabled={currentPage === 0}
                className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 flex items-center justify-center transition-colors"
              >
                <ChevronLeft size={24} className="text-white" />
              </button>
              <p className="text-white/80 text-sm font-medium tabular-nums">
                Página {currentPage + 1} de {totalPages}
              </p>
              <button
                onClick={nextPage}
                disabled={currentPage >= totalPages - 1}
                className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 flex items-center justify-center transition-colors"
              >
                <ChevronRight size={24} className="text-white" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
