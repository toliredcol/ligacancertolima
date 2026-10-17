import { useEffect, useRef, useState } from 'react';
import { Plus, Pencil, Trash2, X, Save, FileText, Home, Upload, ExternalLink, Globe } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { CustomPage } from '../../../lib/supabase';
import RichTextEditor from '../../../components/RichTextEditor';

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

const EMPTY: Partial<CustomPage> = {
  title: '',
  slug: '',
  content_html: '',
  content_type: 'html',
  external_url: '',
  open_in_new_tab: false,
  show_on_home: false,
  button_text: '',
  button_bg_color: '#5170ff',
  button_text_color: '#ffffff',
  button_icon_url: null,
  button_icon_position: 'left',
};

function isValidHttpsUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:';
  } catch {
    return false;
  }
}

export default function AdminPages() {
  const [pages, setPages] = useState<CustomPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<CustomPage> | null>(null);
  const [saving, setSaving] = useState(false);
  const [slugManual, setSlugManual] = useState(false);
  const [iconUploading, setIconUploading] = useState(false);
  const [iconError, setIconError] = useState('');
  const iconInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('custom_pages').select('*').order('order_index').order('created_at');
    setPages(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setSlugManual(false);
    setIconError('');
    setEditing({ ...EMPTY });
  };

  const openEdit = (page: CustomPage) => {
    setSlugManual(true);
    setIconError('');
    setEditing({ ...page });
  };

  const handleTitleChange = (title: string) => {
    setEditing(p => ({
      ...p!,
      title,
      slug: slugManual ? p!.slug : slugify(title),
      button_text: p!.button_text || title,
    }));
  };

  const handleSlugChange = (slug: string) => {
    setSlugManual(true);
    setEditing(p => ({ ...p!, slug: slugify(slug) }));
  };

  const handleIconUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setIconError('Solo se permiten imágenes.');
      return;
    }
    setIconUploading(true);
    setIconError('');
    const ext = file.name.split('.').pop() ?? 'png';
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from('content-images')
      .upload(path, file, { contentType: file.type, upsert: false });
    if (upErr) {
      console.error('Icon upload failed', upErr);
      setIconError('No se pudo subir la imagen. Verifica el archivo e inténtalo de nuevo.');
      setIconUploading(false);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from('content-images').getPublicUrl(path);
    setEditing(p => ({ ...p!, button_icon_url: publicUrl }));
    setIconUploading(false);
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.title?.trim()) return;
    if (!editing.slug?.trim()) return;
    const isExternal = editing.content_type === 'external_url';
    if (isExternal && !isValidHttpsUrl(editing.external_url?.trim() ?? '')) return;
    setSaving(true);
    const payload = {
      title: editing.title!.trim(),
      slug: editing.slug!.trim(),
      content_html: editing.content_html ?? '',
      content_type: editing.content_type ?? 'html',
      external_url: isExternal ? editing.external_url!.trim() : null,
      open_in_new_tab: isExternal ? (editing.open_in_new_tab ?? false) : false,
      show_on_home: editing.show_on_home ?? false,
      button_text: editing.button_text?.trim() || editing.title!.trim(),
      button_bg_color: editing.button_bg_color ?? '#5170ff',
      button_text_color: editing.button_text_color ?? '#ffffff',
      button_icon_url: editing.button_icon_url ?? null,
      button_icon_position: editing.button_icon_position ?? 'left',
      order_index: editing.order_index ?? pages.length,
      updated_at: new Date().toISOString(),
    };
    if (editing.id) {
      await supabase.from('custom_pages').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('custom_pages').insert(payload);
    }
    await load();
    setEditing(null);
    setSaving(false);
  };

  const deletePage = async (id: string) => {
    if (!confirm('¿Eliminar esta página? Esta acción no se puede deshacer.')) return;
    await supabase.from('custom_pages').delete().eq('id', id);
    await load();
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Páginas de contenido</h1>
          <p className="text-gray-500 text-sm mt-0.5">Crea páginas personalizadas con botones en la página de inicio</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#5170ff] text-white font-semibold py-2 px-4 rounded-xl text-sm active:scale-95 transition-transform"
        >
          <Plus size={15} /> Nueva página
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
      ) : pages.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <FileText size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No hay páginas aún</p>
          <p className="text-gray-400 text-sm">Crea la primera página de contenido</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pages.map(page => (
            <div key={page.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: page.button_bg_color + '22' }}
              >
                {page.button_icon_url
                  ? <img src={page.button_icon_url} alt="" className="w-6 h-6 object-contain" />
                  : <FileText size={18} style={{ color: page.button_bg_color }} />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{page.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-gray-400 text-xs truncate">/pagina/{page.slug}</span>
                  {page.show_on_home && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                      <Home size={10} /> Inicio
                    </span>
                  )}
                  {page.content_type === 'external_url' && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
                      <ExternalLink size={10} /> URL
                    </span>
                  )}
                </div>
              </div>
              <div
                className="hidden sm:block w-5 h-5 rounded-full flex-shrink-0 border border-gray-200"
                style={{ backgroundColor: page.button_bg_color }}
                title={`Botón: ${page.button_bg_color}`}
              />
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => openEdit(page)} className="p-1.5 text-blue-400 hover:text-blue-600 transition-colors"><Pencil size={15} /></button>
                <button onClick={() => deletePage(page.id)} className="p-1.5 text-red-400 hover:text-red-600 transition-colors"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Create modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <h2 className="font-bold text-gray-900">{editing.id ? 'Editar página' : 'Nueva página'}</h2>
              <button onClick={() => setEditing(null)}><X size={18} className="text-gray-500" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Title */}
              <div>
                <label className="label">Título de la página <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={editing.title ?? ''}
                  onChange={e => handleTitleChange(e.target.value)}
                  placeholder="Ej: Campaña de prevención 2025"
                  className="input-field"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="label">URL / Slug <span className="text-red-500">*</span></label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm flex-shrink-0">/pagina/</span>
                  <input
                    type="text"
                    value={editing.slug ?? ''}
                    onChange={e => handleSlugChange(e.target.value)}
                    placeholder="campana-2025"
                    className="input-field flex-1"
                  />
                </div>
              </div>

              {/* Content type selector */}
              <div>
                <label className="label">Tipo de contenido <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditing(p => ({ ...p!, content_type: 'html', external_url: '' }))}
                    className={`flex items-center gap-2.5 p-3.5 rounded-xl border-2 transition-all ${
                      editing.content_type === 'html'
                        ? 'border-[#5170ff] bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <FileText size={20} className={editing.content_type === 'html' ? 'text-[#5170ff]' : 'text-gray-400'} />
                    <div className="text-left">
                      <p className="font-semibold text-sm text-gray-900">Contenido HTML</p>
                      <p className="text-xs text-gray-400">Muestra una página con tu contenido</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(p => ({ ...p!, content_type: 'external_url' }))}
                    className={`flex items-center gap-2.5 p-3.5 rounded-xl border-2 transition-all ${
                      editing.content_type === 'external_url'
                        ? 'border-[#5170ff] bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <ExternalLink size={20} className={editing.content_type === 'external_url' ? 'text-[#5170ff]' : 'text-gray-400'} />
                    <div className="text-left">
                      <p className="font-semibold text-sm text-gray-900">URL externa</p>
                      <p className="text-xs text-gray-400">Abre un enlace a otra página</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* URL field (external only) */}
              {editing.content_type === 'external_url' && (
                <div>
                  <label className="label">URL del enlace <span className="text-red-500">*</span></label>
                  <input
                    type="url"
                    value={editing.external_url ?? ''}
                    onChange={e => setEditing(p => ({ ...p!, external_url: e.target.value }))}
                    placeholder="https://www.ejemplo.com"
                    className="input-field"
                  />
                  <p className="text-gray-400 text-xs mt-1.5">Debe ser una dirección web válida que empiece con https://</p>
                  {editing.external_url?.trim() && !isValidHttpsUrl(editing.external_url.trim()) && (
                    <p className="text-red-500 text-xs mt-1">Ingresa una URL válida que empiece con https://</p>
                  )}

                  {/* Open target */}
                  <div className="mt-4 space-y-2">
                    <label className="label">Al hacer clic en el botón</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setEditing(p => ({ ...p!, open_in_new_tab: true }))}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all ${
                          editing.open_in_new_tab
                            ? 'border-[#5170ff] bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <ExternalLink size={18} className={editing.open_in_new_tab ? 'text-[#5170ff]' : 'text-gray-400'} />
                        <span className="text-sm font-medium text-gray-900">Nueva pestaña</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(p => ({ ...p!, open_in_new_tab: false }))}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all ${
                          !editing.open_in_new_tab
                            ? 'border-[#5170ff] bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Globe size={18} className={!editing.open_in_new_tab ? 'text-[#5170ff]' : 'text-gray-400'} />
                        <span className="text-sm font-medium text-gray-900">Misma ventana</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Content (HTML only) */}
              {editing.content_type === 'html' && (
                <div>
                  <label className="label">Contenido</label>
                  <RichTextEditor
                    value={editing.content_html ?? ''}
                    onChange={html => setEditing(p => ({ ...p!, content_html: html }))}
                  />
                </div>
              )}

              {/* Show on home */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Mostrar botón en página de inicio</p>
                  <p className="text-gray-500 text-xs mt-0.5">Aparece entre Módulos y Testimonios</p>
                </div>
                <button
                  onClick={() => setEditing(p => ({ ...p!, show_on_home: !p!.show_on_home }))}
                  className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${editing.show_on_home ? 'bg-[#5170ff]' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${editing.show_on_home ? 'left-6' : 'left-0.5'}`} />
                </button>
              </div>

              {/* Button customization */}
              {editing.show_on_home && (
                <div className="space-y-4 p-4 border border-gray-200 rounded-xl">
                  <p className="font-semibold text-gray-900 text-sm">Personalización del botón</p>

                  {/* Button text */}
                  <div>
                    <label className="label">Texto del botón</label>
                    <input
                      type="text"
                      value={editing.button_text ?? ''}
                      onChange={e => setEditing(p => ({ ...p!, button_text: e.target.value }))}
                      placeholder={editing.title || 'Texto del botón'}
                      className="input-field"
                    />
                  </div>

                  {/* Color pickers */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Color de fondo</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={editing.button_bg_color ?? '#5170ff'}
                          onChange={e => setEditing(p => ({ ...p!, button_bg_color: e.target.value }))}
                          className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer flex-shrink-0 p-0.5"
                        />
                        <input
                          type="text"
                          value={editing.button_bg_color ?? '#5170ff'}
                          onChange={e => setEditing(p => ({ ...p!, button_bg_color: e.target.value }))}
                          className="input-field flex-1 font-mono text-sm"
                          maxLength={7}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="label">Color del texto</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={editing.button_text_color ?? '#ffffff'}
                          onChange={e => setEditing(p => ({ ...p!, button_text_color: e.target.value }))}
                          className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer flex-shrink-0 p-0.5"
                        />
                        <input
                          type="text"
                          value={editing.button_text_color ?? '#ffffff'}
                          onChange={e => setEditing(p => ({ ...p!, button_text_color: e.target.value }))}
                          className="input-field flex-1 font-mono text-sm"
                          maxLength={7}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Icon upload */}
                  <div>
                    <label className="label">Icono del botón (opcional)</label>
                    <div className="flex items-center gap-3">
                      {editing.button_icon_url ? (
                        <div className="relative">
                          <img src={editing.button_icon_url} alt="Icono" className="w-12 h-12 object-contain rounded-lg border border-gray-200 bg-gray-50" />
                          <button
                            onClick={() => setEditing(p => ({ ...p!, button_icon_url: null }))}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                          >
                            <X size={10} className="text-white" />
                          </button>
                        </div>
                      ) : (
                        <div
                          className="w-12 h-12 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 cursor-pointer"
                          onClick={() => iconInputRef.current?.click()}
                        >
                          <Upload size={16} className="text-gray-300" />
                        </div>
                      )}
                      <div>
                        <button
                          onClick={() => iconInputRef.current?.click()}
                          disabled={iconUploading}
                          className="text-sm font-medium text-[#5170ff] hover:text-blue-700 disabled:opacity-50"
                        >
                          {iconUploading ? 'Subiendo...' : editing.button_icon_url ? 'Cambiar icono' : 'Subir icono'}
                        </button>
                        <p className="text-xs text-gray-400 mt-0.5">PNG, SVG recomendado. Sin icono = solo texto.</p>
                        {iconError && <p className="text-red-500 text-xs mt-1">{iconError}</p>}
                      </div>
                      <input
                        ref={iconInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleIconUpload(f); e.target.value = ''; }}
                      />
                    </div>
                  </div>

                  {/* Icon position */}
                  {editing.button_icon_url && (
                    <div>
                      <label className="label">Posición del icono</label>
                      <div className="flex gap-2">
                        {(['left', 'right'] as const).map(pos => (
                          <button
                            key={pos}
                            onClick={() => setEditing(p => ({ ...p!, button_icon_position: pos }))}
                            className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${editing.button_icon_position === pos ? 'bg-[#5170ff] text-white border-[#5170ff]' : 'text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                          >
                            {pos === 'left' ? 'Izquierda' : 'Derecha'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Preview */}
                  <div>
                    <label className="label">Vista previa del botón</label>
                    <div className="flex justify-center p-4 bg-gray-50 rounded-xl">
                      <span
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm shadow-md"
                        style={{ backgroundColor: editing.button_bg_color, color: editing.button_text_color }}
                      >
                        {editing.button_icon_url && editing.button_icon_position === 'left' && (
                          <img src={editing.button_icon_url} alt="" className="w-5 h-5 object-contain" />
                        )}
                        {editing.button_text || editing.title || 'Texto del botón'}
                        {editing.button_icon_url && editing.button_icon_position === 'right' && (
                          <img src={editing.button_icon_url} alt="" className="w-5 h-5 object-contain" />
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setEditing(null)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm">Cancelar</button>
              <button
                onClick={save}
                disabled={
                  saving ||
                  !editing.title?.trim() ||
                  !editing.slug?.trim() ||
                  (editing.content_type === 'external_url' && !isValidHttpsUrl(editing.external_url?.trim() ?? ''))
                }
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
