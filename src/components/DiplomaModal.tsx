import { useState, useRef, useEffect } from 'react';
import { X, Download, User } from 'lucide-react';
import type { Module, DiplomaConfig } from '../lib/supabase';
import { supabase } from '../lib/supabase';
import { getModuleHex } from '../lib/moduleColors';
import { useAppConfig } from '../lib/AppConfigContext';

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
  const diplomaRef = useRef<HTMLDivElement>(null);
  const accentColor = getModuleHex(mod.slug);
  const { logoUrl } = useAppConfig();

  useEffect(() => {
    supabase.from('diploma_config').select('*').maybeSingle().then(({ data }) => {
      if (data) setConfig(data);
    });
  }, []);

  const handleGenerate = () => {
    if (!name.trim()) return;
    setStep('preview');
  };

  const handleDownload = async () => {
    if (!diplomaRef.current) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(diplomaRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const link = document.createElement('a');
      link.download = `diploma-${mod.slug}-${name.replace(/\s/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      alert('No se pudo descargar el diploma. Intenta tomar una captura de pantalla.');
    }
  };

  const today = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-base">
            {step === 'name' ? 'Obtén tu diploma' : 'Tu diploma'}
          </h2>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {step === 'name' ? (
          <div className="p-5 space-y-4">
            <p className="text-gray-600 text-sm">Ingresa tu nombre completo para personalizar tu diploma.</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tu nombre completo</label>
              <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-gray-400 transition-colors">
                <div className="pl-3"><User size={18} className="text-gray-400" /></div>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                  placeholder="Ej: Juan Carlos Pérez"
                  className="flex-1 p-3 text-sm outline-none bg-transparent"
                  autoFocus
                />
              </div>
            </div>
            <button
              onClick={handleGenerate}
              disabled={!name.trim()}
              className="w-full py-3.5 rounded-xl text-white font-semibold text-sm disabled:opacity-50 transition-all active:scale-95"
              style={{ backgroundColor: accentColor }}
            >
              Generar diploma
            </button>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {/* Diploma preview */}
            <div
              ref={diplomaRef}
              className="bg-white rounded-xl overflow-hidden"
              style={{ border: `4px double ${accentColor}`, padding: '24px', textAlign: 'center', fontFamily: 'Georgia, serif' }}
            >
              <img src={logoUrl} alt="Logo" style={{ height: 56, margin: '0 auto 12px', objectFit: 'contain' }} />
              <p style={{ fontSize: 11, color: '#888', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>
                {config?.signer_title ?? 'Liga Colombiana Contra el Cáncer - Zonal Tolima'}
              </p>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: accentColor, margin: '12px 0 6px' }}>
                {config?.title ?? 'Certificado de Educación en Salud'}
              </h3>
              <p style={{ fontSize: 11, color: '#666', marginBottom: 16 }}>
                Hace constar que:
              </p>
              <p style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', borderBottom: `2px solid ${accentColor}`, paddingBottom: 8, marginBottom: 16 }}>
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
              <div style={{ borderTop: `1px solid #eee`, paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: 10, color: '#999', marginBottom: 2 }}>Fecha de emisión</p>
                  <p style={{ fontSize: 11, color: '#555' }}>{today}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#333' }}>{config?.signer_name ?? 'Equipo Liga Contra el Cáncer'}</p>
                  <p style={{ fontSize: 10, color: '#999' }}>Firma digital</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('name')}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 active:scale-95 transition-transform"
              >
                Cambiar nombre
              </button>
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm active:scale-95 transition-transform"
                style={{ backgroundColor: accentColor }}
              >
                <Download size={16} />
                Descargar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
