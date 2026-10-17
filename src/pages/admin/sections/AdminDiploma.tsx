import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { DiplomaConfig } from '../../../lib/supabase';
import { useAppConfig } from '../../../lib/AppConfigContext';

export default function AdminDiploma() {
  const { logoUrl } = useAppConfig();
  const [config, setConfig] = useState<DiplomaConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.from('diploma_config').select('*').maybeSingle().then(({ data }) => {
      if (data) setConfig(data);
    });
  }, []);

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    await supabase.from('diploma_config').update({
      title: config.title,
      congratulations_text: config.congratulations_text,
      signer_name: config.signer_name,
      signer_title: config.signer_title,
      accent_color: config.accent_color,
    }).eq('id', config.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!config) return <div className="skeleton h-96 rounded-2xl" />;

  const today = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Personalización del Diploma</h1>
        <p className="text-gray-500 text-sm">Configura el aspecto del diploma que reciben los participantes</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900">Configuración</h2>
          <div>
            <label className="label">Título del diploma</label>
            <input value={config.title} onChange={e => setConfig(c => c ? { ...c, title: e.target.value } : c)} className="input-field" />
          </div>
          <div>
            <label className="label">Texto de felicitación</label>
            <textarea value={config.congratulations_text} onChange={e => setConfig(c => c ? { ...c, congratulations_text: e.target.value } : c)} className="input-field" rows={2} />
          </div>
          <div>
            <label className="label">Nombre del firmante</label>
            <input value={config.signer_name} onChange={e => setConfig(c => c ? { ...c, signer_name: e.target.value } : c)} className="input-field" />
          </div>
          <div>
            <label className="label">Cargo / Institución</label>
            <input value={config.signer_title} onChange={e => setConfig(c => c ? { ...c, signer_title: e.target.value } : c)} className="input-field" />
          </div>
          <div>
            <label className="label">Color de acento</label>
            <div className="flex items-center gap-3">
              <input type="color" value={config.accent_color} onChange={e => setConfig(c => c ? { ...c, accent_color: e.target.value } : c)} className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer" />
              <input value={config.accent_color} onChange={e => setConfig(c => c ? { ...c, accent_color: e.target.value } : c)} className="input-field flex-1" />
            </div>
          </div>
          <button onClick={handleSave} disabled={saving} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-semibold text-sm disabled:opacity-60 bg-gray-900 active:scale-95 transition-transform">
            <Save size={16} />
            {saved ? '¡Guardado!' : saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>

        {/* Preview */}
        <div>
          <h2 className="font-bold text-gray-900 mb-3">Vista previa</h2>
          <div
            className="bg-white rounded-xl overflow-hidden text-center"
            style={{ border: `4px double ${config.accent_color}`, padding: '20px', fontFamily: 'Georgia, serif' }}
          >
            <img src={logoUrl} alt="Logo" style={{ height: 48, margin: '0 auto 10px', objectFit: 'contain' }} />
            <p style={{ fontSize: 10, color: '#888', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>{config.signer_title}</p>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: config.accent_color, margin: '10px 0 6px' }}>{config.title}</h3>
            <p style={{ fontSize: 10, color: '#666', marginBottom: 12 }}>Hace constar que:</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', borderBottom: `2px solid ${config.accent_color}`, paddingBottom: 6, marginBottom: 12 }}>Nombre del Participante</p>
            <p style={{ fontSize: 11, color: '#555', lineHeight: 1.5, marginBottom: 8 }}>{config.congratulations_text}</p>
            <p style={{ fontSize: 13, fontWeight: 700, color: config.accent_color, marginBottom: 12 }}>Módulo Educativo</p>
            <p style={{ fontSize: 10, color: '#666', marginBottom: 16 }}>Obteniendo 5 de 5 respuestas correctas</p>
            <div style={{ borderTop: '1px solid #eee', paddingTop: 12, display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ textAlign: 'left' }}><p style={{ fontSize: 9, color: '#999' }}>{today}</p></div>
              <div style={{ textAlign: 'right' }}><p style={{ fontSize: 10, fontWeight: 600, color: '#333' }}>{config.signer_name}</p><p style={{ fontSize: 9, color: '#999' }}>Firma digital</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
