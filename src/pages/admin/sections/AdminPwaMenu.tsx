import { useEffect, useState } from 'react';
import {
  Plus, Pencil, Trash2, X, Save, ChevronUp, ChevronDown, Eye, EyeOff, Smartphone
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import {
  MENU_ICONS, MENU_TYPE_LABELS,
  type PwaMenuItem, type PwaMenuType
} from '../../../lib/pwaMenu';

const VALID_ROUTE_PREFIXES = [
  '/',
  '/modulos',
  '/modulo/',
  '/progreso',
  '/testimonios',
  '/pagina/',
  '/el-rincon-de-los-cuentos',
];

const MAX_LABEL = 12;
const MIN_ACTIVE = 2;
const MAX_ACTIVE = 5;

function isValidInternalRoute(value: string): boolean {
  return VALID_ROUTE_PREFIXES.some(p =>
    p === '/' ? value === '/' : value === p || value.startsWith(p)
  );
}

function isValidExternalUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:';
  } catch {
    return false;
  }
}

const EMPTY: Partial<PwaMenuItem> = {
  label: '',
  icon: 'Home',
  type: 'ruta_interna',
  target: '/',
  order_index: 0,
  active: true,
};

export default function AdminPwaMenu() {
  const [items, setItems] = useState<PwaMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<PwaMenuItem> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('pwa_menu_items')
      .select('*')
      .order('order_index');
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const activeCount = items.filter(i => i.active).length;

  const validate = (draft: Partial<PwaMenuItem>): string | null => {
    const label = draft.label?.trim() ?? '';
    if (!label) return 'La etiqueta es obligatoria.';
    if (label.length > MAX_LABEL) return `La etiqueta no puede superar ${MAX_LABEL} caracteres.`;

    const type = draft.type ?? 'ruta_interna';
    const target = draft.target?.trim() ?? '';

    if (type === 'ruta_interna') {
      if (!isValidInternalRoute(target)) return 'La ruta interna no es válida.';
    } else if (type === 'whatsapp') {
      if (!target) return 'El enlace de WhatsApp es obligatorio.';
    } else if (type === 'enlace_externo') {
      if (!isValidExternalUrl(target)) return 'El enlace externo debe empezar con https://.';
    }

    // Al crear, verificar no exceder el máximo de activos
    const wouldBeActive = draft.active ?? true;
    const existingActive = items.filter(i => i.id !== draft.id && i.active).length;
    if (wouldBeActive && existingActive + 1 > MAX_ACTIVE) {
      return `No puede haber más de ${MAX_ACTIVE} opciones activas.`;
    }
    if (wouldBeActive && existingActive + 1 < MIN_ACTIVE && draft.id) {
      return `Debe haber al menos ${MIN_ACTIVE} opciones activas.`;
    }
    return null;
  };

  const handleSave = async () => {
    if (!editing) return;
    setError('');
    const err = validate(editing);
    if (err) { setError(err); return; }

    setSaving(true);
    const payload = {
      label: editing.label!.trim(),
      icon: editing.icon ?? 'Home',
      type: editing.type ?? 'ruta_interna',
      target: (editing.target ?? '').trim(),
      order_index: editing.order_index ?? items.length,
      active: editing.active ?? true,
    };

    if (editing.id) {
      await supabase.from('pwa_menu_items').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('pwa_menu_items').insert(payload);
    }
    await load();
    setEditing(null);
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta opción del menú? Esta acción no se puede deshacer.')) return;
    await supabase.from('pwa_menu_items').delete().eq('id', id);
    await load();
  };

  const toggleActive = async (item: PwaMenuItem) => {
    const nextActive = !item.active;
    if (!nextActive && activeCount - 1 < MIN_ACTIVE) {
      alert(`Debe haber al menos ${MIN_ACTIVE} opciones activas.`);
      return;
    }
    if (nextActive && activeCount + 1 > MAX_ACTIVE) {
      alert(`No puede haber más de ${MAX_ACTIVE} opciones activas.`);
      return;
    }
    await supabase.from('pwa_menu_items').update({ active: nextActive }).eq('id', item.id);
    await load();
  };

  const move = async (idx: number, dir: -1 | 1) => {
    const target = items[idx + dir];
    const current = items[idx];
    if (!target) return;
    await Promise.all([
      supabase.from('pwa_menu_items').update({ order_index: target.order_index }).eq('id', current.id),
      supabase.from('pwa_menu_items').update({ order_index: current.order_index }).eq('id', target.id),
    ]);
    await load();
  };

  const previewItems = [...items]
    .filter(i => i.active)
    .sort((a, b) => a.order_index - b.order_index);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Menú de la app (PWA)</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Configura las opciones de la barra inferior que solo se ve en la app instalada
          </p>
        </div>
        <button
          onClick={() => { setError(''); setEditing({ ...EMPTY, order_index: items.length }); }}
          className="flex items-center gap-2 bg-[#5170ff] text-white font-semibold py-2.5 px-4 rounded-xl text-sm active:scale-95 transition-transform"
        >
          <Plus size={16} /> Agregar opción
        </button>
      </div>

      {/* Vista previa */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Smartphone size={18} className="text-gray-400" />
          <p className="text-sm font-bold text-gray-800">Vista previa de la barra</p>
        </div>
        <div className="mx-auto max-w-sm rounded-2xl border border-gray-200 bg-white shadow-inner overflow-hidden">
          <div className="flex items-stretch">
            {previewItems.map(item => {
              const Icon = MENU_ICONS[item.icon] ?? MENU_ICONS['Circle'];
              return (
                <div key={item.id} className="flex-1 flex flex-col items-center justify-center gap-1 min-h-[56px] px-1 text-gray-400">
                  <Icon size={22} strokeWidth={2} />
                  <span className="text-[10px] font-medium leading-none text-center truncate w-full">{item.label}</span>
                </div>
              );
            })}
            {previewItems.length === 0 && (
              <div className="flex-1 text-center py-5 text-gray-300 text-xs">Sin opciones activas</div>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          {activeCount} activas · mínimo {MIN_ACTIVE}, máximo {MAX_ACTIVE}
        </p>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-400 font-medium">No hay opciones en el menú</p>
          <p className="text-gray-400 text-sm">Agrega la primera opción</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => {
            const Icon = MENU_ICONS[item.icon] ?? MENU_ICONS['Circle'];
            return (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-gray-50 text-gray-500">
                  <Icon size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 text-sm truncate">{item.label}</p>
                    {!item.active && (
                      <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Inactiva</span>
                    )}
                  </div>
                  <p className="text-gray-400 text-xs truncate mt-0.5">
                    {MENU_TYPE_LABELS[item.type]} · {item.target}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => move(idx, -1)}
                    disabled={idx === 0}
                    className="p-1.5 text-gray-300 hover:text-gray-600 disabled:opacity-20 transition-colors"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    onClick={() => move(idx, 1)}
                    disabled={idx === items.length - 1}
                    className="p-1.5 text-gray-300 hover:text-gray-600 disabled:opacity-20 transition-colors"
                  >
                    <ChevronDown size={16} />
                  </button>
                  <button
                    onClick={() => toggleActive(item)}
                    className={`p-1.5 transition-colors ${item.active ? 'text-green-500 hover:text-green-700' : 'text-gray-300 hover:text-gray-500'}`}
                    title={item.active ? 'Desactivar' : 'Activar'}
                  >
                    {item.active ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button
                    onClick={() => { setError(''); setEditing({ ...item }); }}
                    className="p-1.5 text-blue-400 hover:text-blue-600 transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-red-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal edición */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="font-bold text-gray-900">{editing.id ? 'Editar opción' : 'Nueva opción'}</h2>
              <button onClick={() => setEditing(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div>
                <label className="label">Etiqueta * (máx. {MAX_LABEL} caracteres)</label>
                <input
                  type="text"
                  value={editing.label ?? ''}
                  maxLength={MAX_LABEL}
                  onChange={e => setEditing(p => ({ ...p!, label: e.target.value }))}
                  placeholder="Ej: Inicio"
                  className="input-field"
                />
                <p className="text-xs text-gray-400 mt-1">{(editing.label ?? '').length}/{MAX_LABEL}</p>
              </div>

              <div>
                <label className="label">Tipo de acción *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(MENU_TYPE_LABELS) as PwaMenuType[]).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setEditing(p => ({ ...p!, type: t }))}
                      className={`px-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-colors ${
                        editing.type === t ? 'border-[#5170ff] bg-blue-50 text-[#5170ff]' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {MENU_TYPE_LABELS[t]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">
                  {editing.type === 'ruta_interna'
                    ? 'Ruta interna *'
                    : editing.type === 'whatsapp'
                      ? 'Enlace de WhatsApp *'
                      : 'Enlace externo (https://) *'}
                </label>
                <input
                  type="text"
                  value={editing.target ?? ''}
                  onChange={e => setEditing(p => ({ ...p!, target: e.target.value }))}
                  placeholder={
                    editing.type === 'ruta_interna'
                      ? '/modulos'
                      : editing.type === 'whatsapp'
                        ? 'https://wa.me/573158137106'
                        : 'https://www.ejemplo.com'
                  }
                  className="input-field"
                />
                {editing.type === 'ruta_interna' && (
                  <p className="text-xs text-gray-400 mt-1">Ej: /, /modulos, /progreso, /pagina/portafolio-de-servicios</p>
                )}
              </div>

              <div>
                <label className="label">Ícono *</label>
                <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 max-h-56 overflow-y-auto p-2 rounded-xl border border-gray-100">
                  {Object.keys(MENU_ICONS).map(name => {
                    const IconComp = MENU_ICONS[name];
                    const selected = editing.icon === name;
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setEditing(p => ({ ...p!, icon: name }))}
                        className={`aspect-square flex items-center justify-center rounded-xl border-2 transition-colors ${
                          selected ? 'border-[#C41E3A] bg-red-50 text-[#C41E3A]' : 'border-gray-100 text-gray-400 hover:border-gray-300'
                        }`}
                        title={name}
                      >
                        <IconComp size={20} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {error && (
                <p className="text-red-600 text-xs bg-red-50 px-3 py-2 rounded-lg border border-red-100">{error}</p>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setEditing(null)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#5170ff] text-white font-semibold text-sm disabled:opacity-60"
              >
                <Save size={15} /> {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
