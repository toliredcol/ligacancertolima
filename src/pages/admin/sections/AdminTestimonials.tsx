import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Pencil, X, Save, User } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { Testimonial, Module } from '../../../lib/supabase';

type Filter = 'all' | 'pending' | 'approved' | 'rejected';

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [filter, setFilter] = useState<Filter>('pending');
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [t, m] = await Promise.all([
      supabase.from('testimonials').select('*').order('created_at', { ascending: false }),
      supabase.from('modules').select('id, title').order('order_index'),
    ]);
    setTestimonials(t.data ?? []);
    setModules(m.data ?? []);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: Testimonial['status']) => {
    await supabase.from('testimonials').update({ status }).eq('id', id);
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este testimonio?')) return;
    await supabase.from('testimonials').delete().eq('id', id);
    await load();
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    await supabase.from('testimonials').update({ name: editing.name, story: editing.story, module_id: editing.module_id, status: editing.status }).eq('id', editing.id);
    await load();
    setEditing(null);
    setSaving(false);
  };

  const moduleNames = Object.fromEntries(modules.map(m => [m.id, m.title]));
  const filtered = filter === 'all' ? testimonials : testimonials.filter(t => t.status === filter);
  const counts = { all: testimonials.length, pending: testimonials.filter(t => t.status === 'pending').length, approved: testimonials.filter(t => t.status === 'approved').length, rejected: testimonials.filter(t => t.status === 'rejected').length };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Gestión de Testimonios</h1>
        <p className="text-gray-500 text-sm">{counts.pending} pendientes de revisión</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(['pending', 'approved', 'rejected', 'all'] as Filter[]).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filter === f ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>
            {f === 'pending' ? 'Pendientes' : f === 'approved' ? 'Aprobados' : f === 'rejected' ? 'Rechazados' : 'Todos'}
            <span className="ml-1 opacity-70">({counts[f]})</span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && <p className="text-gray-400 text-center py-8">No hay testimonios en esta categoría.</p>}
        {filtered.map(t => (
          <div key={t.id} className={`bg-white rounded-2xl border p-4 space-y-3 ${t.status === 'pending' ? 'border-amber-200' : t.status === 'approved' ? 'border-green-200' : 'border-gray-200'}`}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                {t.avatar_url ? <img src={t.avatar_url} alt="" className="w-full h-full rounded-full object-cover" /> : <User size={16} className="text-gray-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                <p className="text-gray-400 text-xs">{moduleNames[t.module_id ?? ''] ?? 'Sin módulo'} · {new Date(t.created_at).toLocaleDateString('es-CO')}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${t.status === 'pending' ? 'bg-amber-100 text-amber-700' : t.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {t.status === 'pending' ? 'Pendiente' : t.status === 'approved' ? 'Aprobado' : 'Rechazado'}
              </span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">"{t.story}"</p>
            <div className="flex gap-2 flex-wrap">
              {t.status !== 'approved' && (
                <button onClick={() => updateStatus(t.id, 'approved')} className="flex items-center gap-1.5 text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-xl text-xs font-semibold">
                  <CheckCircle size={14} /> Aprobar
                </button>
              )}
              {t.status !== 'rejected' && (
                <button onClick={() => updateStatus(t.id, 'rejected')} className="flex items-center gap-1.5 text-gray-500 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl text-xs font-semibold">
                  <XCircle size={14} /> Rechazar
                </button>
              )}
              <button onClick={() => setEditing(t)} className="flex items-center gap-1.5 text-blue-500 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl text-xs font-semibold">
                <Pencil size={14} /> Editar
              </button>
              <button onClick={() => handleDelete(t.id)} className="flex items-center gap-1.5 text-red-500 bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl text-xs font-semibold">
                <X size={14} /> Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="font-bold text-gray-900">Editar testimonio</h2>
              <button onClick={() => setEditing(null)}><X size={18} className="text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div><label className="label">Nombre</label><input value={editing.name} onChange={e => setEditing(t => t ? { ...t, name: e.target.value } : null)} className="input-field" /></div>
              <div><label className="label">Historia</label><textarea value={editing.story} onChange={e => setEditing(t => t ? { ...t, story: e.target.value } : null)} className="input-field" rows={4} /></div>
              <div><label className="label">Módulo</label>
                <select value={editing.module_id ?? ''} onChange={e => setEditing(t => t ? { ...t, module_id: e.target.value || null } : null)} className="input-field">
                  <option value="">Sin módulo</option>
                  {modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                </select>
              </div>
              <div><label className="label">Estado</label>
                <select value={editing.status} onChange={e => setEditing(t => t ? { ...t, status: e.target.value as Testimonial['status'] } : null)} className="input-field">
                  <option value="pending">Pendiente</option>
                  <option value="approved">Aprobado</option>
                  <option value="rejected">Rechazado</option>
                </select>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setEditing(null)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-900 text-white font-semibold text-sm disabled:opacity-60">
                <Save size={15} /> {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
