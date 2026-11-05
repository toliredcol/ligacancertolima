import { useEffect, useRef, useState } from 'react';
import { Download, User, X } from 'lucide-react';
import type { Module, DiplomaConfig } from '../lib/supabase';
import { supabase } from '../lib/supabase';
import { getModuleHex } from '../lib/moduleColors';
import { useAppConfig } from '../lib/AppConfigContext';

const INSTITUTION_FALLBACK = 'Liga Contra el Cáncer - Zonal Tolima';
const SIGNER_NAME_FALLBACK = 'Equipo Liga Contra el Cáncer';
const DIPLOMA_WIDTH = 640;

interface Props {
  module: Module;
  score: number;
  total: number;
  onClose: () => void;
}

export default function DiplomaModal({ module: mod, score, total, onClose }: Props) {
  const [name, setName] = useState('');
  const [step, setStep] = useState<'name' | 'preview'>('name');
  const [config, setConfig] = useState<DiplomaConfig | null>(null);
  const [designHeight, setDesignHeight] = useState(0);
  const [previewWidth, setPreviewWidth] = useState(0);
  const captureRef = useRef<HTMLDivElement>(null);
  const previewBoxRef = useRef<HTMLDivElement>(null);
  const accentColor = getModuleHex(mod.slug);
  const { logoUrl } = useAppConfig();

  const today = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    supabase.from('diploma_config').select('*').maybeSingle().then(({ data }) => {
      if (data) setConfig(data);
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  useEffect(() => {
    const node = captureRef.current;
    if (!node) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.height) setDesignHeight(entry.contentRect.height);
      }
    });
    ro.observe(node);
    return () => ro.disconnect();
  }, [step, config]);

  useEffect(() => {
    const node = previewBoxRef.current;
    if (!node) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width) setPreviewWidth(entry.contentRect.width);
      }
    });
    ro.observe(node);
    return () => ro.disconnect();
  }, [step]);

  const handleGenerate = () => {
    if (!name.trim()) return;
    setStep('preview');
  };

  const handleDownload = async () => {
    if (!captureRef.current) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(captureRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        windowWidth: DIPLOMA_WIDTH,
      });
      const link = document.createElement('a');
      link.download = `diploma-${mod.slug}-${name.replace(/\s/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      alert('No se pudo descargar el diploma. Intenta tomar una captura de pantalla.');
    }
  };

  const signerTitle = config?.signer_title?.trim() || INSTITUTION_FALLBACK;
  const signerName = config?.signer_name?.trim() || SIGNER_NAME_FALLBACK;

  const renderDesign = () => (
    <div
      style={{
        width: DIPLOMA_WIDTH,
        boxSizing: 'border-box',
        background: '#ffffff',
        border: `4px double ${accentColor}`,
        padding: '32px',
        textAlign: 'center',
        fontFamily: 'Georgia, serif',
      }}
    >
      <img src={logoUrl} alt="Logo" style={{ height: 56, margin: '0 auto 12px', objectFit: 'contain' }} />
      <p style={{ fontSize: 11, color: '#888', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4, lineHeight: 1.4 }}>
        {signerTitle}
      </p>
      <h3 style={{ fontSize: 20, fontWeight: 700, color: accentColor, margin: '14px 0 6px', lineHeight: 1.25 }}>
        {config?.title ?? 'Certificado de Educación en Salud'}
      </h3>
      <p style={{ fontSize: 12, color: '#666', marginBottom: 16 }}>
        Hace constar que:
      </p>
      <p style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', borderBottom: `2px solid ${accentColor}`, paddingBottom: 8, marginBottom: 16, overflowWrap: 'break-word' }}>
        {name}
      </p>
      <p style={{ fontSize: 12, color: '#555', lineHeight: 1.6, marginBottom: 12 }}>
        {config?.congratulations_text ?? 'Ha completado exitosamente el módulo educativo sobre'}
      </p>
      <p style={{ fontSize: 15, fontWeight: 700, color: accentColor, marginBottom: 16 }}>
        {mod.title}
      </p>
      <p style={{ fontSize: 12, color: '#666', marginBottom: 20 }}>
        Obteniendo {score} de {total} respuestas correctas
      </p>
      <div style={{ borderTop: '1px solid #eee', paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ textAlign: 'left' }}>
          <p style={{ fontSize: 10, color: '#999', marginBottom: 2 }}>Fecha de emisión</p>
          <p style={{ fontSize: 11, color: '#555' }}>{today}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#333' }}>{signerName}</p>
          <p style={{ fontSize: 10, color: '#999' }}>Firma digital</p>
        </div>
      </div>
    </div>
  );

  const scale = previewWidth > 0 ? Math.min(1, previewWidth / DIPLOMA_WIDTH) : 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fade-in"
      onClick={onClose}
    >
      {/* Offscreen full-size diploma used for download (original quality) */}
      <div
        ref={captureRef}
        style={{ position: 'fixed', top: 0, left: -10000, pointerEvents: 'none', lineHeight: 0 }}
        aria-hidden="true"
      >
        {renderDesign()}
      </div>

      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{
          maxHeight: 'calc(100dvh - 2rem - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
          marginTop: 'env(safe-area-inset-top)',
          marginBottom: 'env(safe-area-inset-bottom)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (fixed) */}
        <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-base">
            {step === 'name' ? 'Obtén tu diploma' : 'Tu diploma'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="w-11 h-11 -mr-1 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Middle (scrollable) */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4">
          {step === 'name' ? (
            <div className="space-y-4">
              <p className="text-gray-600 text-sm">Ingresa tu nombre completo para personalizar tu diploma.</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tu nombre completo</label>
                <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-gray-400 transition-colors">
                  <div className="pl-3">
                    <User size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                    placeholder="Ej: Juan Carlos Pérez"
                    className="flex-1 p-3 text-sm outline-none bg-transparent"
                    autoFocus
                  />
                </div>
              </div>
            </div>
          ) : (
            <div ref={previewBoxRef} className="w-full">
              <div style={{ position: 'relative', width: '100%', height: designHeight * scale, overflow: 'hidden' }}>
                <div style={{ width: DIPLOMA_WIDTH, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
                  {renderDesign()}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer (sticky, always visible) */}
        <div
          className="shrink-0 border-t border-gray-100 bg-white px-4 pt-3 pb-3"
          style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
        >
          {step === 'name' ? (
            <button
              onClick={handleGenerate}
              disabled={!name.trim()}
              className="w-full min-h-[44px] rounded-xl text-white font-semibold text-sm disabled:opacity-50 transition-all active:scale-95"
              style={{ backgroundColor: accentColor }}
            >
              Generar diploma
            </button>
          ) : (
            <div className="space-y-2">
              <button
                onClick={handleDownload}
                className="w-full min-h-[44px] flex items-center justify-center gap-2 rounded-xl text-white font-semibold text-sm active:scale-95 transition-transform"
                style={{ backgroundColor: accentColor }}
              >
                <Download size={16} />
                Descargar diploma
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setStep('name')}
                  className="flex-1 min-h-[44px] rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 active:scale-95 transition-transform"
                >
                  Cambiar nombre
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 min-h-[44px] rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 active:scale-95 transition-transform"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
