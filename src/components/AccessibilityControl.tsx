import { useState, useEffect, useRef } from 'react';
import { Type, X } from 'lucide-react';

const STORAGE_KEY = 'accessibility-font-scale';
const SCALE_LEVELS = [90, 100, 115, 130];
const DEFAULT_SCALE = 100;

function applyScale(scale: number) {
  document.documentElement.style.fontSize = `${scale}%`;
}

function getStoredScale(): number {
  const v = localStorage.getItem(STORAGE_KEY);
  if (!v) return DEFAULT_SCALE;
  const n = parseInt(v, 10);
  return SCALE_LEVELS.includes(n) ? n : DEFAULT_SCALE;
}

export default function AccessibilityControl() {
  const [open, setOpen] = useState(false);
  const [scale, setScale] = useState(DEFAULT_SCALE);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = getStoredScale();
    setScale(stored);
    applyScale(stored);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  const changeScale = (newScale: number) => {
    setScale(newScale);
    applyScale(newScale);
    localStorage.setItem(STORAGE_KEY, String(newScale));
  };

  const decrease = () => {
    const idx = SCALE_LEVELS.indexOf(scale);
    if (idx > 0) changeScale(SCALE_LEVELS[idx - 1]);
  };
  const increase = () => {
    const idx = SCALE_LEVELS.indexOf(scale);
    if (idx < SCALE_LEVELS.length - 1) changeScale(SCALE_LEVELS[idx + 1]);
  };
  const reset = () => changeScale(DEFAULT_SCALE);

  return (
    <div ref={panelRef} className="fixed bottom-4 left-4 z-[9998]">
      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-11 h-11 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 shadow-md flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-white transition-all active:scale-95"
        aria-label="Opciones de accesibilidad"
        aria-expanded={open}
      >
        {open ? <X size={18} /> : <Type size={20} />}
      </button>

      {/* Panel */}
      {open && (
        <div className="absolute bottom-1 left-0 ml-12 bg-white rounded-2xl shadow-xl border border-gray-200 p-3 w-52 animate-fade-in">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2 px-1">Tamaño del texto</p>
          <div className="flex items-center gap-1">
            <button
              onClick={decrease}
              disabled={scale === SCALE_LEVELS[0]}
              className="flex-1 h-10 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Disminuir texto"
            >
              A-
            </button>
            <button
              onClick={reset}
              className={`flex-1 h-10 rounded-xl border font-semibold text-sm transition-colors ${scale === DEFAULT_SCALE ? 'border-transparent text-white' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
              style={scale === DEFAULT_SCALE ? { backgroundColor: '#5170ff' } : undefined}
              aria-label="Tamaño normal"
            >
              A
            </button>
            <button
              onClick={increase}
              disabled={scale === SCALE_LEVELS[SCALE_LEVELS.length - 1]}
              className="flex-1 h-10 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Aumentar texto"
            >
              A+
            </button>
          </div>
          <div className="mt-2 flex justify-center">
            <div className="flex gap-1">
              {SCALE_LEVELS.map(lvl => (
                <div
                  key={lvl}
                  className={`h-1.5 rounded-full transition-all ${scale === lvl ? 'w-6 bg-[#5170ff]' : 'w-1.5 bg-gray-200'}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
