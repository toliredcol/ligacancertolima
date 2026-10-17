import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Save, Shuffle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { Module, MatchingGamePair } from '../../../lib/supabase';
import { getModuleColors } from '../../../lib/moduleColors';

export default function AdminMatchingGame() {
  const [modules, setModules] = useState<Module[]>([]);
  const [selected, setSelected] = useState<Module | null>(null);
  const [pairs, setPairs] = useState<MatchingGamePair[]>([]);
  const [editing, setEditing] = useState<Partial<MatchingGamePair> | null>(null);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    supabase.from('modules').select('*').order('order_index').then(({ data }) => {
      setModules(data ?? []);
      if (data?.length) setSelected(data[0]);
    });
  }, []);

  useEffect(() => {
    if (!selected) return;
    supabase.from('matching_game_pairs').select('*').eq('module_id', selected.id).order('order_index').then(({ data }) => setPairs(data ?? []));
  }, [selected]);

  const reload = async () => {
    if (!selected) return;
    const { data } = await supabase.from('matching_game_pairs').select('*').eq('module_id', selected.id).order('order_index');
    setPairs(data ?? []);
  };

  const newPair = (): Partial<MatchingGamePair> => ({
    concept: '',
    definition: '',
    order_index: pairs.length,
  });

  const handleSave = async () => {
    if (!editing || !selected || !editing.concept?.trim() || !editing.definition?.trim()) return;
    setSaving(true);
    if (editing.id) {
      await supabase.from('matching_game_pairs').update({
        concept: editing.concept,
        definition: editing.definition,
      }).eq('id', editing.id);
    } else {
      await supabase.from('matching_game_pairs').insert({ ...editing, module_id: selected.id });
    }
    await reload();
    setEditing(null);
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este par?')) return;
    await supabase.from('matching_game_pairs').delete().eq('id', id);
    await reload();
  };

  const toggleActive = async () => {
    if (!selected) return;
    setToggling(true);
    const newValue = !selected.matching_game_active;
    await supabase.from('modules').update({ matching_game_active: newValue }).eq('id', selected.id);
    const updated = { ...selected, matching_game_active: newValue };
    setSelected(updated);
    setModules(ms => ms.map(m => m.id === updated.id ? updated : m));
    setToggling(false);
  };

  const colors = selected ? getModuleColors(selected.slug) : getModuleColors('antitabaco');

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Juego de Emparejar Conceptos</h1>
        <p className="text-gray-500 text-sm">Administra los pares de concepto + definición por módulo</p>
      </div>

      {/* Module selector */}
      <div className="flex flex-wrap gap-2">
        {modules.map(m => {
          const mc = getModuleColors(m.slug);
          return (
            <button key={m.id} onClick={() => setSelected(m)} className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${selected?.id === m.id ? `${mc.bg} text-white border-transparent` : `${mc.badge} border-transparent`}`}>
              {m.title.split(' ')[0]}
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="space-y-3">
          {/* Active toggle */}
          <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-4">
            <div>
              <p className="font-semibold text-gray-900 text-sm">Juego activo en este módulo</p>
              <p className="text-gray-500 text-xs mt-0.5">Cuando está activo, el juego se muestra en el frontend público</p>
            </div>
            <button
              onClick={toggleActive}
              disabled={toggling}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors flex-shrink-0 ${selected.matching_game_active ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${selected.matching_game_active ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{pairs.length} pares en este módulo</p>
            <button onClick={() => setEditing(newPair())} className={`flex items-center gap-2 ${colors.bg} text-white font-semibold py-2 px-4 rounded-xl text-sm`}>
              <Plus size={15} /> Agregar par
            </button>
          </div>
          {pairs.map((p, i) => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start gap-3">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${colors.bg}`}>{i + 1}</span>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Concepto</span>
                    <p className="font-medium text-gray-900 text-sm leading-snug">{p.concept}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Definición</span>
                    <p className="text-gray-600 text-sm leading-snug">{p.definition}</p>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => setEditing({ ...p })} className="p-1.5 text-blue-400 hover:text-blue-600"><Pencil size={15} /></button>
                  <button onClick={() => handleDelete(p.id)} className="p-1.5 text-red-400 hover:text-red-600"><Trash2 size={15} /></button>
                </div>
              </div>
            </div>
          ))}
          {pairs.length === 0 && (
            <div className="text-center py-10">
              <Shuffle size={32} className="text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No hay pares. Agrega el primero.</p>
            </div>
          )}
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="font-bold text-gray-900">{editing.id ? 'Editar par' : 'Nuevo par'}</h2>
              <button onClick={() => setEditing(null)}><X size={18} className="text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="label">Concepto *</label>
                <textarea value={editing.concept ?? ''} onChange={e => setEditing(p => ({ ...p!, concept: e.target.value }))} className="input-field" rows={2} placeholder="Ej: Biopsia" />
              </div>
              <div>
                <label className="label">Definición *</label>
                <textarea value={editing.definition ?? ''} onChange={e => setEditing(p => ({ ...p!, definition: e.target.value }))} className="input-field" rows={3} placeholder="Ej: Extracción de una muestra de tejido para análisis microscópico..." />
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setEditing(null)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-60 ${colors.bg}`}>
                <Save size={15} /> {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
