import { useEffect, useState } from 'react';
import { Plus, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Testimonial, Module } from '../lib/supabase';
import Header from '../components/Header';
import TestimonialCard from '../components/TestimonialCard';

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', story: '', module_id: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.from('testimonials').select('*').eq('status', 'approved').order('created_at', { ascending: false }),
      supabase.from('modules').select('id, title, slug').order('order_index'),
    ]).then(([t, m]) => {
      setTestimonials(t.data ?? []);
      setModules(m.data ?? []);
      setLoading(false);
    });
  }, []);

  const moduleNames = Object.fromEntries(modules.map(m => [m.id, m.title]));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.story.trim()) return;
    setSubmitting(true);
    await supabase.from('testimonials').insert({
      name: form.name.trim(),
      story: form.story.trim(),
      module_id: form.module_id || null,
      status: 'pending',
    });
    setSubmitting(false);
    setSubmitted(true);
    setShowForm(false);
    setForm({ name: '', story: '', module_id: '' });
  };

  return (
    <div className="animate-fade-in">
      <Header title="Testimonios" />
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <p className="text-gray-500 text-sm leading-relaxed flex-1">
            Historias reales de personas que cambiaron su vida gracias al conocimiento.
          </p>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-red-600 text-white font-semibold py-2.5 px-4 rounded-xl text-sm flex-shrink-0 active:scale-95 transition-transform"
          >
            <Plus size={16} />
            Contar mi historia
          </button>
        </div>

        {submitted && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 animate-fade-in">
            <p className="text-green-800 text-sm font-medium">¡Gracias por compartir tu historia!</p>
            <p className="text-green-600 text-xs mt-1">Tu testimonio será revisado y publicado pronto.</p>
          </div>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4 animate-slide-up">
            <h3 className="font-bold text-gray-900 text-base">Comparte tu experiencia</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tu nombre</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ej: María García"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-400 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Módulo relacionado (opcional)</label>
              <select
                value={form.module_id}
                onChange={e => setForm(f => ({ ...f, module_id: e.target.value }))}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-400 transition-colors bg-white"
              >
                <option value="">Selecciona un módulo...</option>
                {modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tu historia</label>
              <textarea
                value={form.story}
                onChange={e => setForm(f => ({ ...f, story: e.target.value }))}
                placeholder="Cuéntanos cómo el conocimiento sobre el cáncer cambió tu vida..."
                rows={4}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-400 transition-colors resize-none"
                required
              />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm">Cancelar</button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600 text-white font-semibold text-sm disabled:opacity-60"
              >
                <Send size={15} />
                {submitting ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}</div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 font-medium">No hay testimonios aún</p>
            <p className="text-gray-300 text-sm mt-1">¡Sé el primero en compartir tu historia!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {testimonials.map(t => (
              <TestimonialCard key={t.id} testimonial={t} moduleName={moduleNames[t.module_id ?? '']} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
