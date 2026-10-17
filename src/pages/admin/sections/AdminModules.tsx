import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Save, Play, FileText, Images, Check, ChevronUp, ChevronDown } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { Module, ContentBlock, Video, Resource, UploadedImage } from '../../../lib/supabase';
import { getModuleColors } from '../../../lib/moduleColors';
import RichTextEditor from '../../../components/RichTextEditor';

type Tab = 'blocks' | 'videos' | 'resources';

const BLOCK_TYPES = [
  { value: 'text', label: 'Texto con editor enriquecido' },
  { value: 'list', label: 'Lista de puntos clave' },
  { value: 'stat', label: 'Dato estadístico' },
  { value: 'accordion', label: 'Acordeón / FAQ' },
  { value: 'alert', label: 'Alerta o consejo' },
  { value: 'steps', label: 'Paso a paso' },
  { value: 'divider', label: 'Separador' },
  { value: 'images', label: 'Galería de imágenes' },
];

export default function AdminModules() {
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [tab, setTab] = useState<Tab>('blocks');
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [editingBlock, setEditingBlock] = useState<Partial<ContentBlock> | null>(null);
  const [editingVideo, setEditingVideo] = useState<Partial<Video> | null>(null);
  const [editingResource, setEditingResource] = useState<Partial<Resource> | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from('modules').select('*').order('order_index').then(({ data }) => {
      setModules(data ?? []);
      if (data?.length) setSelectedModule(data[0]);
    });
  }, []);

  useEffect(() => {
    if (!selectedModule) return;
    setLoading(true);
    Promise.all([
      supabase.from('content_blocks').select('*').eq('module_id', selectedModule.id).order('order_index'),
      supabase.from('videos').select('*').eq('module_id', selectedModule.id).order('order_index'),
      supabase.from('resources').select('*').eq('module_id', selectedModule.id).order('order_index'),
    ]).then(([b, v, r]) => {
      setBlocks(b.data ?? []);
      setVideos(v.data ?? []);
      setResources(r.data ?? []);
      setLoading(false);
    });
  }, [selectedModule]);

  const reload = async () => {
    if (!selectedModule) return;
    const [b, v, r] = await Promise.all([
      supabase.from('content_blocks').select('*').eq('module_id', selectedModule.id).order('order_index'),
      supabase.from('videos').select('*').eq('module_id', selectedModule.id).order('order_index'),
      supabase.from('resources').select('*').eq('module_id', selectedModule.id).order('order_index'),
    ]);
    setBlocks(b.data ?? []);
    setVideos(v.data ?? []);
    setResources(r.data ?? []);
  };

  // Block helpers
  const defaultContent = (type: string) => {
    if (type === 'text') return { html: '' };
    if (type === 'list') return { items: [{ text: '' }] };
    if (type === 'stat') return { value: '', label: '' };
    if (type === 'accordion') return { faqs: [{ question: '', answer: '' }] };
    if (type === 'alert') return { type: 'tip', message: '' };
    if (type === 'steps') return { steps: [{ title: '', description: '' }] };
    if (type === 'images') return { images: [] };
    return {};
  };

  const saveBlock = async () => {
    if (!editingBlock || !selectedModule) return;
    setSaving(true);
    if (editingBlock.id) {
      await supabase.from('content_blocks').update({ title: editingBlock.title, content: editingBlock.content }).eq('id', editingBlock.id);
    } else {
      await supabase.from('content_blocks').insert({ ...editingBlock, module_id: selectedModule.id, order_index: blocks.length });
    }
    await reload();
    setEditingBlock(null);
    setSaving(false);
  };

  const deleteBlock = async (id: string) => {
    if (!confirm('¿Eliminar este bloque?')) return;
    await supabase.from('content_blocks').delete().eq('id', id);
    await reload();
  };

  const moveBlock = async (idx: number, dir: -1 | 1) => {
    const a = blocks[idx];
    const b = blocks[idx + dir];
    if (!b) return;
    await Promise.all([
      supabase.from('content_blocks').update({ order_index: b.order_index }).eq('id', a.id),
      supabase.from('content_blocks').update({ order_index: a.order_index }).eq('id', b.id),
    ]);
    await reload();
  };

  const saveVideo = async () => {
    if (!editingVideo || !selectedModule) return;
    setSaving(true);
    if (editingVideo.id) {
      await supabase.from('videos').update({ title: editingVideo.title, youtube_id: editingVideo.youtube_id, description: editingVideo.description }).eq('id', editingVideo.id);
    } else {
      await supabase.from('videos').insert({ ...editingVideo, module_id: selectedModule.id, order_index: videos.length });
    }
    await reload();
    setEditingVideo(null);
    setSaving(false);
  };

  const saveResource = async () => {
    if (!editingResource || !selectedModule) return;
    setSaving(true);
    if (editingResource.id) {
      await supabase.from('resources').update({ title: editingResource.title, url: editingResource.url, description: editingResource.description, file_type: editingResource.file_type }).eq('id', editingResource.id);
    } else {
      await supabase.from('resources').insert({ ...editingResource, module_id: selectedModule.id, order_index: resources.length });
    }
    await reload();
    setEditingResource(null);
    setSaving(false);
  };

  const colors = selectedModule ? getModuleColors(selectedModule.slug) : getModuleColors('antitabaco');

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Gestión de Contenido</h1>
        <p className="text-gray-500 text-sm">Administra bloques, videos y recursos por módulo</p>
      </div>

      {/* Module selector */}
      <div className="flex flex-wrap gap-2">
        {modules.map(m => {
          const mc = getModuleColors(m.slug);
          return (
            <button key={m.id} onClick={() => setSelectedModule(m)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${selectedModule?.id === m.id ? `${mc.bg} text-white border-transparent` : `${mc.badge} border-transparent`}`}>
              {m.title.split(' ')[0]}
            </button>
          );
        })}
      </div>

      {selectedModule && (
        <>
          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {([['blocks', 'Bloques'], ['videos', 'Videos'], ['resources', 'Recursos']] as [Tab, string][]).map(([t, l]) => (
              <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>{l}</button>
            ))}
          </div>

          {loading ? <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}</div> : (
            <>
              {/* Blocks */}
              {tab === 'blocks' && (
                <div className="space-y-3">
                  <div className="flex justify-end">
                    <button onClick={() => setEditingBlock({ block_type: 'text', title: '', content: defaultContent('text') })} className={`flex items-center gap-2 ${colors.bg} text-white font-semibold py-2 px-4 rounded-xl text-sm active:scale-95 transition-transform`}>
                      <Plus size={15} /> Agregar bloque
                    </button>
                  </div>
                  {blocks.map((block, i) => (
                    <div key={block.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3">
                      <div className="flex-col flex-shrink-0 flex gap-0.5">
                        <button onClick={() => moveBlock(i, -1)} disabled={i === 0} className="p-1 text-gray-300 hover:text-gray-600 disabled:opacity-20 disabled:pointer-events-none"><ChevronUp size={15} /></button>
                        <button onClick={() => moveBlock(i, 1)} disabled={i === blocks.length - 1} className="p-1 text-gray-300 hover:text-gray-600 disabled:opacity-20 disabled:pointer-events-none"><ChevronDown size={15} /></button>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{block.title || 'Sin título'}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${colors.badge} font-medium`}>{BLOCK_TYPES.find(t => t.value === block.block_type)?.label ?? block.block_type}</span>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => setEditingBlock({ ...block })} className="p-1.5 text-blue-400 hover:text-blue-600"><Pencil size={15} /></button>
                        <button onClick={() => deleteBlock(block.id)} className="p-1.5 text-red-400 hover:text-red-600"><Trash2 size={15} /></button>
                      </div>
                    </div>
                  ))}
                  {blocks.length === 0 && <p className="text-gray-400 text-center py-6">No hay bloques. Agrega el primero.</p>}
                </div>
              )}

              {/* Videos */}
              {tab === 'videos' && (
                <div className="space-y-3">
                  <div className="flex justify-end">
                    <button onClick={() => setEditingVideo({ title: '', youtube_id: '', description: '' })} className={`flex items-center gap-2 ${colors.bg} text-white font-semibold py-2 px-4 rounded-xl text-sm active:scale-95 transition-transform`}>
                      <Plus size={15} /> Agregar video
                    </button>
                  </div>
                  {videos.map(video => (
                    <div key={video.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${colors.light} flex items-center justify-center flex-shrink-0`}><Play size={16} className={colors.text} /></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{video.title}</p>
                        <p className="text-gray-400 text-xs truncate">youtube.com/watch?v={video.youtube_id}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => setEditingVideo({ ...video })} className="p-1.5 text-blue-400 hover:text-blue-600"><Pencil size={15} /></button>
                        <button onClick={async () => { if (confirm('¿Eliminar?')) { await supabase.from('videos').delete().eq('id', video.id); reload(); } }} className="p-1.5 text-red-400 hover:text-red-600"><Trash2 size={15} /></button>
                      </div>
                    </div>
                  ))}
                  {videos.length === 0 && <p className="text-gray-400 text-center py-6">No hay videos.</p>}
                </div>
              )}

              {/* Resources */}
              {tab === 'resources' && (
                <div className="space-y-3">
                  <div className="flex justify-end">
                    <button onClick={() => setEditingResource({ title: '', url: '', description: '', file_type: 'PDF' })} className={`flex items-center gap-2 ${colors.bg} text-white font-semibold py-2 px-4 rounded-xl text-sm active:scale-95 transition-transform`}>
                      <Plus size={15} /> Agregar recurso
                    </button>
                  </div>
                  {resources.map(res => (
                    <div key={res.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${colors.light} flex items-center justify-center flex-shrink-0`}><FileText size={16} className={colors.text} /></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{res.title}</p>
                        <p className="text-gray-400 text-xs truncate">{res.file_type} · {res.url}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => setEditingResource({ ...res })} className="p-1.5 text-blue-400 hover:text-blue-600"><Pencil size={15} /></button>
                        <button onClick={async () => { if (confirm('¿Eliminar?')) { await supabase.from('resources').delete().eq('id', res.id); reload(); } }} className="p-1.5 text-red-400 hover:text-red-600"><Trash2 size={15} /></button>
                      </div>
                    </div>
                  ))}
                  {resources.length === 0 && <p className="text-gray-400 text-center py-6">No hay recursos.</p>}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Block edit modal */}
      {editingBlock && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="font-bold text-gray-900">Bloque de contenido</h2>
              <button onClick={() => setEditingBlock(null)}><X size={18} className="text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="label">Tipo de bloque</label>
                <select value={editingBlock.block_type} onChange={e => setEditingBlock(b => ({ ...b!, block_type: e.target.value as ContentBlock['block_type'], content: defaultContent(e.target.value) }))} className="input-field">
                  {BLOCK_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Título del bloque</label>
                <input type="text" value={editingBlock.title ?? ''} onChange={e => setEditingBlock(b => ({ ...b!, title: e.target.value }))} placeholder="Título visible" className="input-field" />
              </div>
              <ContentEditor block={editingBlock} onChange={content => setEditingBlock(b => ({ ...b!, content }))} />
            </div>
            <div className="p-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setEditingBlock(null)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm">Cancelar</button>
              <button onClick={saveBlock} disabled={saving} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-60 ${colors.bg}`}>
                <Save size={15} /> {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video edit modal */}
      {editingVideo && (
        <ModalShell title={editingVideo.id ? 'Editar video' : 'Agregar video'} onClose={() => setEditingVideo(null)}>
          <div className="p-5 space-y-4">
            <div><label className="label">Título</label><input type="text" value={editingVideo.title ?? ''} onChange={e => setEditingVideo(v => ({ ...v!, title: e.target.value }))} className="input-field" placeholder="Nombre del video" /></div>
            <div><label className="label">ID de YouTube</label><input type="text" value={editingVideo.youtube_id ?? ''} onChange={e => setEditingVideo(v => ({ ...v!, youtube_id: e.target.value }))} className="input-field" placeholder="Ej: dQw4w9WgXcQ" /></div>
            <div><label className="label">Descripción (opcional)</label><textarea value={editingVideo.description ?? ''} onChange={e => setEditingVideo(v => ({ ...v!, description: e.target.value }))} className="input-field" rows={2} /></div>
          </div>
          <ModalFooter onCancel={() => setEditingVideo(null)} onSave={saveVideo} saving={saving} colorBg={colors.bg} />
        </ModalShell>
      )}

      {/* Resource edit modal */}
      {editingResource && (
        <ModalShell title={editingResource.id ? 'Editar recurso' : 'Agregar recurso'} onClose={() => setEditingResource(null)}>
          <div className="p-5 space-y-4">
            <div><label className="label">Título</label><input type="text" value={editingResource.title ?? ''} onChange={e => setEditingResource(r => ({ ...r!, title: e.target.value }))} className="input-field" /></div>
            <div><label className="label">URL</label><input type="url" value={editingResource.url ?? ''} onChange={e => setEditingResource(r => ({ ...r!, url: e.target.value }))} className="input-field" /></div>
            <div><label className="label">Tipo de archivo</label>
              <select value={editingResource.file_type ?? 'PDF'} onChange={e => setEditingResource(r => ({ ...r!, file_type: e.target.value }))} className="input-field">
                {['PDF', 'DOC', 'XLS', 'Video', 'Enlace'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div><label className="label">Descripción</label><input type="text" value={editingResource.description ?? ''} onChange={e => setEditingResource(r => ({ ...r!, description: e.target.value }))} className="input-field" /></div>
          </div>
          <ModalFooter onCancel={() => setEditingResource(null)} onSave={saveResource} saving={saving} colorBg={colors.bg} />
        </ModalShell>
      )}
    </div>
  );
}

function ContentEditor({ block, onChange }: { block: Partial<ContentBlock>; onChange: (c: Record<string, unknown>) => void }) {
  const c = block.content as Record<string, unknown>;
  if (block.block_type === 'text') {
    const initialHtml = (c?.html as string) ?? (
      (c?.paragraphs as string[] | undefined)
        ? (c.paragraphs as string[]).map(p => `<p>${p}</p>`).join('')
        : ''
    );
    return (
      <div className="space-y-1.5">
        <label className="label">Contenido</label>
        <RichTextEditor
          value={initialHtml}
          onChange={html => onChange({ html })}
        />
      </div>
    );
  }
  if (block.block_type === 'list') {
    const items = (c?.items as { text: string }[]) ?? [{ text: '' }];
    return (
      <div className="space-y-2">
        <label className="label">Ítems</label>
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input value={item.text} onChange={e => { const arr = [...items]; arr[i] = { text: e.target.value }; onChange({ items: arr }); }} className="input-field flex-1" placeholder={`Ítem ${i + 1}`} />
            {items.length > 1 && <button onClick={() => onChange({ items: items.filter((_, j) => j !== i) })} className="text-red-400"><X size={16} /></button>}
          </div>
        ))}
        <button onClick={() => onChange({ items: [...items, { text: '' }] })} className="text-blue-500 text-sm font-medium">+ Agregar ítem</button>
      </div>
    );
  }
  if (block.block_type === 'stat') {
    return (
      <div className="space-y-3">
        <div><label className="label">Valor (ej: 99%)</label><input value={(c?.value as string) ?? ''} onChange={e => onChange({ ...c, value: e.target.value })} className="input-field" /></div>
        <div><label className="label">Descripción</label><input value={(c?.label as string) ?? ''} onChange={e => onChange({ ...c, label: e.target.value })} className="input-field" /></div>
        <div><label className="label">Fuente (opcional)</label><input value={(c?.source as string) ?? ''} onChange={e => onChange({ ...c, source: e.target.value })} className="input-field" /></div>
      </div>
    );
  }
  if (block.block_type === 'accordion') {
    const faqs = (c?.faqs as { question: string; answer: string }[]) ?? [{ question: '', answer: '' }];
    return (
      <div className="space-y-3">
        <label className="label">Preguntas y respuestas</label>
        {faqs.map((faq, i) => (
          <div key={i} className="space-y-1.5 p-3 border border-gray-200 rounded-xl">
            <input value={faq.question} onChange={e => { const arr = [...faqs]; arr[i] = { ...arr[i], question: e.target.value }; onChange({ faqs: arr }); }} className="input-field" placeholder="Pregunta" />
            <textarea value={faq.answer} onChange={e => { const arr = [...faqs]; arr[i] = { ...arr[i], answer: e.target.value }; onChange({ faqs: arr }); }} className="input-field" rows={2} placeholder="Respuesta" />
            {faqs.length > 1 && <button onClick={() => onChange({ faqs: faqs.filter((_, j) => j !== i) })} className="text-red-400 text-xs">Eliminar</button>}
          </div>
        ))}
        <button onClick={() => onChange({ faqs: [...faqs, { question: '', answer: '' }] })} className="text-blue-500 text-sm font-medium">+ Agregar pregunta</button>
      </div>
    );
  }
  if (block.block_type === 'alert') {
    return (
      <div className="space-y-3">
        <div><label className="label">Tipo</label>
          <select value={(c?.type as string) ?? 'tip'} onChange={e => onChange({ ...c, type: e.target.value })} className="input-field">
            <option value="tip">Consejo (verde)</option>
            <option value="warning">Advertencia (amarillo)</option>
          </select>
        </div>
        <div><label className="label">Mensaje</label><textarea value={(c?.message as string) ?? ''} onChange={e => onChange({ ...c, message: e.target.value })} className="input-field" rows={3} /></div>
      </div>
    );
  }
  if (block.block_type === 'steps') {
    const steps = (c?.steps as { title: string; description: string }[]) ?? [{ title: '', description: '' }];
    return (
      <div className="space-y-3">
        <label className="label">Pasos</label>
        {steps.map((step, i) => (
          <div key={i} className="space-y-1.5 p-3 border border-gray-200 rounded-xl">
            <input value={step.title} onChange={e => { const arr = [...steps]; arr[i] = { ...arr[i], title: e.target.value }; onChange({ steps: arr }); }} className="input-field" placeholder={`Paso ${i + 1}: Título`} />
            <textarea value={step.description} onChange={e => { const arr = [...steps]; arr[i] = { ...arr[i], description: e.target.value }; onChange({ steps: arr }); }} className="input-field" rows={2} placeholder="Descripción" />
            {steps.length > 1 && <button onClick={() => onChange({ steps: steps.filter((_, j) => j !== i) })} className="text-red-400 text-xs">Eliminar</button>}
          </div>
        ))}
        <button onClick={() => onChange({ steps: [...steps, { title: '', description: '' }] })} className="text-blue-500 text-sm font-medium">+ Agregar paso</button>
      </div>
    );
  }
  if (block.block_type === 'images') {
    return <ImagesEditor content={c} onChange={onChange} />;
  }
  return null;
}

function ImagesEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  const [gallery, setGallery] = useState<UploadedImage[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const selected = (content?.images as { src: string; alt: string }[]) ?? [];

  useEffect(() => {
    supabase.from('uploaded_images').select('*').order('created_at', { ascending: false }).then(({ data }) => setGallery(data ?? []));
  }, [showPicker]);

  const addImage = (img: UploadedImage) => {
    if (selected.some(s => s.src === img.url)) return;
    onChange({ images: [...selected, { src: img.url, alt: img.alt_text }] });
  };

  const removeImage = (idx: number) => {
    onChange({ images: selected.filter((_, i) => i !== idx) });
  };

  const updateAlt = (idx: number, alt: string) => {
    const arr = [...selected];
    arr[idx] = { ...arr[idx], alt };
    onChange({ images: arr });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="label">Imágenes seleccionadas</label>
        <button
          type="button"
          onClick={() => setShowPicker(true)}
          className="flex items-center gap-1.5 text-blue-600 text-sm font-medium hover:text-blue-700"
        >
          <Images size={15} /> Agregar desde galería
        </button>
      </div>

      {selected.length === 0 ? (
        <div className="border border-dashed border-gray-200 rounded-xl p-6 text-center">
          <p className="text-gray-400 text-sm">Sin imágenes. Selecciona desde la galería.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {selected.map((img, i) => (
            <div key={i} className="flex gap-3 items-center p-2 border border-gray-200 rounded-xl">
              <img src={img.src} alt={img.alt} className="w-14 h-14 object-cover rounded-lg flex-shrink-0 bg-gray-100" />
              <div className="flex-1 min-w-0">
                <input
                  value={img.alt}
                  onChange={e => updateAlt(i, e.target.value)}
                  placeholder="Texto alternativo"
                  className="input-field text-xs py-1.5"
                />
              </div>
              <button onClick={() => removeImage(i)} className="p-1.5 text-red-400 hover:text-red-600 flex-shrink-0"><X size={15} /></button>
            </div>
          ))}
        </div>
      )}

      {showPicker && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Galería de imágenes</h3>
              <button onClick={() => setShowPicker(false)}><X size={18} className="text-gray-500" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {gallery.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-400 text-sm">No hay imágenes. Sube imágenes en la sección <strong>Imágenes</strong> del panel.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {gallery.map(img => {
                    const isSelected = selected.some(s => s.src === img.url);
                    return (
                      <button
                        key={img.id}
                        onClick={() => { addImage(img); setShowPicker(false); }}
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-colors ${isSelected ? 'border-blue-500' : 'border-transparent hover:border-blue-300'}`}
                      >
                        <img src={img.url} alt={img.alt_text} className="w-full h-full object-cover" loading="lazy" />
                        {isSelected && (
                          <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                              <Check size={14} className="text-white" />
                            </div>
                          </div>
                        )}
                        <div className="absolute bottom-0 inset-x-0 bg-black/40 px-1.5 py-1">
                          <p className="text-white text-[10px] truncate">{img.filename}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-100">
              <button onClick={() => setShowPicker(false)} className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="font-bold text-gray-900">{title}</h2>
          <button onClick={onClose}><X size={18} className="text-gray-500" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ModalFooter({ onCancel, onSave, saving, colorBg }: { onCancel: () => void; onSave: () => void; saving: boolean; colorBg: string }) {
  return (
    <div className="p-4 border-t border-gray-100 flex gap-3">
      <button onClick={onCancel} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm">Cancelar</button>
      <button onClick={onSave} disabled={saving} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-60 ${colorBg}`}>
        <Save size={15} /> {saving ? 'Guardando...' : 'Guardar'}
      </button>
    </div>
  );
}
