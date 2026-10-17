import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff, ChevronUp, ChevronDown, X, Save, Clock } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { SliderImage, Module } from '../../../lib/supabase';
import { useAppConfig } from '../../../lib/AppConfigContext';

const EMPTY: Omit<SliderImage, 'id' | 'created_at'> = {
  image_url: '', title: '', subtitle: '',
  link_type: 'none', link_value: '', is_active: true, order_index: 0,
  transition_effect: 'fade',
};

const EFFECT_OPTIONS: { value: string; label: string }[] = [
  { value: 'fade',        label: 'Fade' },
  { value: 'slide-left',  label: 'Slide horizontal' },
  { value: 'slide-up',    label: 'Slide vertical' },
  { value: 'zoom-in',     label: 'Zoom' },
  { value: 'cube',        label: 'Cube' },
  { value: 'flip',        label: 'Flip' },
  { value: 'ken-burns',   label: 'Ken Burns' },
  { value: 'blur-fade',   label: 'Blur fade' },
];

const EFFECT_LABELS: Record<string, string> = Object.fromEntries(
  EFFECT_OPTIONS.map(o => [o.value, o.label])
);

export default function AdminSlider() {
  const [slides, setSlides] = useState<SliderImage[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [editing, setEditing] = useState<Partial<SliderImage> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { sliderDuration, setSliderDuration } = useAppConfig();
  const [durationInput, setDurationInput] = useState<number>(sliderDuration);
  const [savingDuration, setSavingDuration] = useState(false);
  const [durationSaved, setDurationSaved] = useState(false);

  // Sync input when context value loads
  useEffect(() => { setDurationInput(sliderDuration); }, [sliderDuration]);

  const load = async () => {
    const [s, m] = await Promise.all([
      supabase.from('slider_images').select('*').order('order_index'),
      supabase.from('modules').select('id, slug, title').order('order_index'),
    ]);
    setSlides(s.data ?? []);
    setModules(m.data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!editing || !editing.image_url?.trim()) return;
    setSaving(true);
    const effect = editing.transition_effect || 'fade';
    if (editing.id) {
      await supabase.from('slider_images').update({
        image_url: editing.image_url, title: editing.title || null,
        subtitle: editing.subtitle || null, link_type: editing.link_type,
        link_value: editing.link_value || null, is_active: editing.is_active,
        transition_effect: effect,
      }).eq('id', editing.id);
    } else {
      await supabase.from('slider_images').insert({
        ...editing, transition_effect: effect, order_index: slides.length,
      });
    }
    await load();
    setEditing(null);
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este slide?')) return;
    await supabase.from('slider_images').delete().eq('id', id);
    await load();
  };

  const toggleActive = async (slide: SliderImage) => {
    await supabase.from('slider_images').update({ is_active: !slide.is_active }).eq('id', slide.id);
    await load();
  };

  const moveSlide = async (idx: number, dir: -1 | 1) => {
    const target = slides[idx + dir];
    const current = slides[idx];
    if (!target) return;
    await Promise.all([
      supabase.from('slider_images').update({ order_index: target.order_index }).eq('id', current.id),
      supabase.from('slider_images').update({ order_index: current.order_index }).eq('id', target.id),
    ]);
    await load();
  };

  const handleSaveDuration = async () => {
    const clamped = Math.min(15, Math.max(3, durationInput));
    setSavingDuration(true);
    await setSliderDuration(clamped);
    setSavingDuration(false);
    setDurationSaved(true);
    setTimeout(() => setDurationSaved(false), 2500);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Slider de Inicio</h1>
          <p className="text-gray-500 text-sm mt-0.5">{slides.length} slides configurados</p>
        </div>
        <button onClick={() => setEditing({ ...EMPTY })} className="flex items-center gap-2 bg-red-600 text-white font-semibold py-2.5 px-4 rounded-xl text-sm active:scale-95 transition-transform">
          <Plus size={16} /> Agregar slide
        </button>
      </div>

      {/* Duration config */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-gray-400" />
          <p className="text-sm font-semibold text-gray-700">Duración de cada diapositiva</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={3}
            max={15}
            step={1}
            value={durationInput}
            onChange={e => setDurationInput(Number(e.target.value))}
            className="input-field w-24 text-center text-lg font-bold"
          />
          <span className="text-gray-500 text-sm">segundos (entre 3 y 15)</span>
        </div>
        <input
          type="range"
          min={3}
          max={15}
          step={1}
          value={durationInput}
          onChange={e => setDurationInput(Number(e.target.value))}
          className="w-full accent-red-600"
        />
        <button
          onClick={handleSaveDuration}
          disabled={savingDuration}
          className="flex items-center gap-2 bg-red-600 text-white font-semibold py-2 px-4 rounded-xl text-sm disabled:opacity-60 active:scale-95 transition-transform"
        >
          <Save size={14} />
          {durationSaved ? '¡Guardado!' : savingDuration ? 'Guardando...' : 'Guardar duración'}
        </button>
        {durationSaved && (
          <p className="text-green-600 text-xs font-medium">La duración se aplicará automáticamente al slider.</p>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
      ) : slides.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-400">No hay slides. Agrega el primero.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {slides.map((slide, idx) => (
            <div key={slide.id} className={`bg-white rounded-2xl border overflow-hidden flex gap-0 ${slide.is_active ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
              <div className="w-24 h-20 flex-shrink-0 bg-gray-100">
                <img src={slide.image_url} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/96x80?text=IMG'; }} />
              </div>
              <div className="flex-1 p-3 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{slide.title || 'Sin título'}</p>
                <p className="text-gray-400 text-xs truncate mt-0.5">{slide.subtitle || 'Sin subtítulo'}</p>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${slide.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {slide.is_active ? 'Activo' : 'Inactivo'} · {slide.link_type}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">
                    {EFFECT_LABELS[slide.transition_effect] || 'Fade'}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center gap-1 pr-3 flex-shrink-0">
                <button onClick={() => moveSlide(idx, -1)} disabled={idx === 0} className="p-1.5 text-gray-300 hover:text-gray-600 disabled:opacity-20"><ChevronUp size={16} /></button>
                <button onClick={() => moveSlide(idx, 1)} disabled={idx === slides.length - 1} className="p-1.5 text-gray-300 hover:text-gray-600 disabled:opacity-20"><ChevronDown size={16} /></button>
                <button onClick={() => toggleActive(slide)} className={`p-1.5 ${slide.is_active ? 'text-green-500' : 'text-gray-300'} hover:text-green-600`}>
                  {slide.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button onClick={() => setEditing({ ...slide })} className="p-1.5 text-blue-400 hover:text-blue-600"><Pencil size={16} /></button>
                <button onClick={() => handleDelete(slide.id)} className="p-1.5 text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="font-bold text-gray-900">{editing.id ? 'Editar slide' : 'Nuevo slide'}</h2>
              <button onClick={() => setEditing(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <Field label="URL de imagen *">
                <input type="url" value={editing.image_url ?? ''} onChange={e => setEditing(s => ({ ...s!, image_url: e.target.value }))} placeholder="https://..." className="input-field" />
              </Field>
              {editing.image_url && <img src={editing.image_url} alt="preview" className="w-full h-32 object-cover rounded-xl" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
              <Field label="Título (opcional)">
                <input type="text" value={editing.title ?? ''} onChange={e => setEditing(s => ({ ...s!, title: e.target.value }))} placeholder="Título del slide" className="input-field" />
              </Field>
              <Field label="Subtítulo (opcional)">
                <input type="text" value={editing.subtitle ?? ''} onChange={e => setEditing(s => ({ ...s!, subtitle: e.target.value }))} placeholder="Texto descriptivo" className="input-field" />
              </Field>
              <Field label="Tipo de enlace">
                <select value={editing.link_type} onChange={e => setEditing(s => ({ ...s!, link_type: e.target.value as SliderImage['link_type'], link_value: '' }))} className="input-field">
                  <option value="none">Sin enlace</option>
                  <option value="module">Módulo interno</option>
                  <option value="section">Sección interna</option>
                  <option value="external">URL externa</option>
                </select>
              </Field>
              {editing.link_type === 'module' && (
                <Field label="Módulo">
                  <select value={editing.link_value ?? ''} onChange={e => setEditing(s => ({ ...s!, link_value: e.target.value }))} className="input-field">
                    <option value="">Selecciona...</option>
                    {modules.map(m => <option key={m.id} value={m.slug}>{m.title}</option>)}
                  </select>
                </Field>
              )}
              {editing.link_type === 'section' && (
                <Field label="Sección">
                  <select value={editing.link_value ?? ''} onChange={e => setEditing(s => ({ ...s!, link_value: e.target.value }))} className="input-field">
                    <option value="">Selecciona...</option>
                    <option value="modulos">Módulos</option>
                    <option value="testimonios">Testimonios</option>
                  </select>
                </Field>
              )}
              {editing.link_type === 'external' && (
                <Field label="URL externa">
                  <input type="url" value={editing.link_value ?? ''} onChange={e => setEditing(s => ({ ...s!, link_value: e.target.value }))} placeholder="https://..." className="input-field" />
                </Field>
              )}
              <Field label="Efecto de transición">
                <select
                  value={editing.transition_effect ?? 'fade'}
                  onChange={e => setEditing(s => ({ ...s!, transition_effect: e.target.value }))}
                  className="input-field"
                >
                  {EFFECT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </Field>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className={`w-11 h-6 rounded-full transition-colors relative ${editing.is_active ? 'bg-green-500' : 'bg-gray-200'}`} onClick={() => setEditing(s => ({ ...s!, is_active: !s!.is_active }))}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${editing.is_active ? 'left-6' : 'left-1'}`} />
                </div>
                <span className="text-sm font-medium text-gray-700">Slide activo</span>
              </label>
            </div>
            <div className="p-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setEditing(null)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm">Cancelar</button>
              <button onClick={handleSave} disabled={saving || !editing.image_url?.trim()} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600 text-white font-semibold text-sm disabled:opacity-60">
                <Save size={16} /> {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
