import { useEffect, useRef, useState } from 'react';
import {
  Plus, Pencil, Trash2, X, Save, BookOpen,
  ChevronUp, ChevronDown, Upload, FileText, ImageIcon, Video, Play, Palette, Gamepad2,
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { ChildrenStory } from '../../../lib/supabase';

const EMPTY: Partial<ChildrenStory> = {
  title: '',
  thumbnail_url: '',
  pdf_url: '',
  description: '',
  order_index: 0,
  content_type: 'pdf',
  youtube_url: '',
  html_file_url: '',
  game_url: '',
};

export default function AdminStories() {
  const [stories, setStories] = useState<ChildrenStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<ChildrenStory> | null>(null);
  const [saving, setSaving] = useState(false);

  // Upload states
  const [thumbUploading, setThumbUploading] = useState(false);
  const [thumbError, setThumbError] = useState('');
  const [pdfUploading, setPdfUploading] = useState(false);
  const [pdfError, setPdfError] = useState('');
  const thumbInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('children_stories')
      .select('*')
      .order('order_index')
      .order('created_at');
    setStories(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  // --- Thumbnail upload ---
  const handleThumbUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setThumbError('Solo se permiten imágenes.');
      return;
    }
    setThumbUploading(true);
    setThumbError('');
    const ext = file.name.split('.').pop() ?? 'png';
    const path = `stories/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from('content-images')
      .upload(path, file, { contentType: file.type, upsert: false });
    if (upErr) {
      console.error('Thumbnail upload failed', upErr);
      setThumbError('No se pudo subir la imagen. Verifica el archivo e inténtalo de nuevo.');
      setThumbUploading(false);
      return;
    }
    const { data: { publicUrl } } = supabase.storage
      .from('content-images')
      .getPublicUrl(path);
    setEditing(p => ({ ...p!, thumbnail_url: publicUrl }));
    setThumbUploading(false);
  };

  // --- PDF upload ---
  const handlePdfUpload = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setPdfError('Solo se permiten archivos PDF.');
      return;
    }
    setPdfUploading(true);
    setPdfError('');
    const ext = file.name.split('.').pop() ?? 'pdf';
    const path = `stories/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from('story-pdfs')
      .upload(path, file, { contentType: 'application/pdf', upsert: false });
    if (upErr) {
      console.error('PDF upload failed', upErr);
      setPdfError('No se pudo subir el PDF. Verifica el archivo e inténtalo de nuevo.');
      setPdfUploading(false);
      return;
    }
    const { data: { publicUrl } } = supabase.storage
      .from('story-pdfs')
      .getPublicUrl(path);
    setEditing(p => ({ ...p!, pdf_url: publicUrl }));
    setPdfUploading(false);
  };

  // --- CRUD ---
  const save = async () => {
    if (!editing) return;
    if (!editing.title?.trim()) return;

    const contentType = editing.content_type ?? 'pdf';

    if (contentType === 'pdf' && !editing.pdf_url?.trim()) return;
    if (contentType === 'video' && !editing.youtube_url?.trim()) return;
    if (contentType === 'coloring' && !isValidHttpsUrl(editing.html_file_url?.trim() ?? '')) return;
    if (contentType === 'game' && !isValidHttpsUrl(editing.game_url?.trim() ?? '')) return;
    if (!editing.thumbnail_url?.trim()) return;

    setSaving(true);
    const payload: Record<string, unknown> = {
      title: editing.title!.trim(),
      thumbnail_url: editing.thumbnail_url!,
      description: editing.description?.trim() || null,
      order_index: editing.order_index ?? stories.length,
      content_type: contentType,
      youtube_url: contentType === 'video' ? editing.youtube_url!.trim() : null,
      pdf_url: contentType === 'pdf' ? editing.pdf_url! : null,
      html_file_url: contentType === 'coloring' ? editing.html_file_url! : null,
      game_url: contentType === 'game' ? editing.game_url!.trim() : null,
    };
    if (editing.id) {
      await supabase.from('children_stories').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('children_stories').insert(payload);
    }
    await load();
    setEditing(null);
    setSaving(false);
  };

  const deleteStory = async (id: string) => {
    if (!confirm('¿Eliminar este contenido? Esta acción no se puede deshacer.')) return;
    await supabase.from('children_stories').delete().eq('id', id);
    await load();
  };

  const moveStory = async (idx: number, dir: -1 | 1) => {
    const target = stories[idx + dir];
    const current = stories[idx];
    if (!target) return;
    await Promise.all([
      supabase.from('children_stories').update({ order_index: target.order_index }).eq('id', current.id),
      supabase.from('children_stories').update({ order_index: current.order_index }).eq('id', target.id),
    ]);
    await load();
  };

  const isVideo = editing?.content_type === 'video';
  const isColoring = editing?.content_type === 'coloring';
  const isGame = editing?.content_type === 'game';

  const isValidHttpsUrl = (value: string) => {
    try {
      const url = new URL(value);
      return url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const canSave =
    !!editing?.title?.trim() &&
    !!editing?.thumbnail_url?.trim() &&
    (isVideo
      ? !!editing?.youtube_url?.trim()
      : isColoring
        ? isValidHttpsUrl(editing?.html_file_url?.trim() ?? '')
        : isGame
          ? isValidHttpsUrl(editing?.game_url?.trim() ?? '')
          : !!editing?.pdf_url?.trim());

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">El Rincón de los Cuentos</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {stories.length} {stories.length === 1 ? 'contenido publicado' : 'contenidos publicados'}
          </p>
        </div>
        <button
          onClick={() => { setThumbError(''); setPdfError(''); setEditing({ ...EMPTY }); }}
          className="flex items-center gap-2 bg-[#5170ff] text-white font-semibold py-2.5 px-4 rounded-xl text-sm active:scale-95 transition-transform"
        >
          <Plus size={16} /> Nuevo contenido
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-24 rounded-2xl" />
          ))}
        </div>
      ) : stories.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <BookOpen size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No hay contenido aún</p>
          <p className="text-gray-400 text-sm">Crea el primer cuento o video</p>
        </div>
      ) : (
        <div className="space-y-3">
          {stories.map((story, idx) => {
            const isVideoItem = story.content_type === 'video';
            const isColoringItem = story.content_type === 'coloring';
            const isGameItem = story.content_type === 'game';
            return (
              <div
                key={story.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex"
              >
                {/* Thumbnail */}
                <div className="w-24 h-24 flex-shrink-0 bg-gray-100 relative">
                  <img
                    src={story.thumbnail_url}
                    alt={story.title}
                    className="w-full h-full object-cover"
                    onError={e => {
                      (e.target as HTMLImageElement).style.opacity = '0.3';
                    }}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 p-3 min-w-0 flex flex-col justify-center">
                  <p className="font-semibold text-gray-900 text-sm truncate">{story.title}</p>
                  {story.description && (
                    <p className="text-gray-400 text-xs truncate mt-0.5">{story.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    {isVideoItem ? (
                      <span className="flex items-center gap-1 text-[10px] font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                        <Video size={10} /> Video
                      </span>
                    ) : isColoringItem ? (
                      <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <Palette size={10} /> Colorear
                      </span>
                    ) : isGameItem ? (
                      <span className="flex items-center gap-1 text-[10px] font-medium text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">
                        <Gamepad2 size={10} /> Juego
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-medium text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                        <FileText size={10} /> PDF
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col items-center justify-center gap-1 pr-3 flex-shrink-0">
                  <button
                    onClick={() => moveStory(idx, -1)}
                    disabled={idx === 0}
                    className="p-1.5 text-gray-300 hover:text-gray-600 disabled:opacity-20 transition-colors"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    onClick={() => moveStory(idx, 1)}
                    disabled={idx === stories.length - 1}
                    className="p-1.5 text-gray-300 hover:text-gray-600 disabled:opacity-20 transition-colors"
                  >
                    <ChevronDown size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setThumbError('');
                      setPdfError('');
                      setEditing({ ...story });
                    }}
                    className="p-1.5 text-blue-400 hover:text-blue-600 transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => deleteStory(story.id)}
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

      {/* Edit / Create modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <h2 className="font-bold text-gray-900">
                {editing.id ? 'Editar contenido' : 'Nuevo contenido'}
              </h2>
              <button onClick={() => setEditing(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Content type selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tipo de contenido <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditing(p => ({ ...p!, content_type: 'pdf' }))}
                    className={`flex items-center gap-2.5 p-3.5 rounded-xl border-2 transition-all ${
                      editing.content_type === 'pdf'
                        ? 'border-[#5170ff] bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <FileText size={20} className={editing.content_type === 'pdf' ? 'text-[#5170ff]' : 'text-gray-400'} />
                    <div className="text-left">
                      <p className="font-semibold text-sm text-gray-900">Libro (PDF)</p>
                      <p className="text-xs text-gray-400">Cuento ilustrado</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(p => ({ ...p!, content_type: 'video' }))}
                    className={`flex items-center gap-2.5 p-3.5 rounded-xl border-2 transition-all ${
                      editing.content_type === 'video'
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Video size={20} className={editing.content_type === 'video' ? 'text-red-500' : 'text-gray-400'} />
                    <div className="text-left">
                      <p className="font-semibold text-sm text-gray-900">Video vertical</p>
                      <p className="text-xs text-gray-400">YouTube Shorts</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(p => ({ ...p!, content_type: 'coloring' }))}
                    className={`flex items-center gap-2.5 p-3.5 rounded-xl border-2 transition-all ${
                      editing.content_type === 'coloring'
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Palette size={20} className={editing.content_type === 'coloring' ? 'text-emerald-500' : 'text-gray-400'} />
                    <div className="text-left">
                      <p className="font-semibold text-sm text-gray-900">Libro para Colorear</p>
                      <p className="text-xs text-gray-400">HTML5 interactivo</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(p => ({ ...p!, content_type: 'game' }))}
                    className={`flex items-center gap-2.5 p-3.5 rounded-xl border-2 transition-all ${
                      editing.content_type === 'game'
                        ? 'border-sky-500 bg-sky-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Gamepad2 size={20} className={editing.content_type === 'game' ? 'text-sky-500' : 'text-gray-400'} />
                    <div className="text-left">
                      <p className="font-semibold text-sm text-gray-900">Juego en línea</p>
                      <p className="text-xs text-gray-400">Juego interactivo</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Título <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editing.title ?? ''}
                  onChange={e => setEditing(p => ({ ...p!, title: e.target.value }))}
                  placeholder={isVideo ? 'Ej: Cómo cuidar mi piel' : isColoring ? 'Ej: Colorea a Esperanza' : isGame ? 'Ej: Aprendamos jugando' : 'Ej: El León Valiente'}
                  className="input-field"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Descripción (opcional)
                </label>
                <textarea
                  value={editing.description ?? ''}
                  onChange={e => setEditing(p => ({ ...p!, description: e.target.value }))}
                  placeholder="Breve descripción..."
                  rows={2}
                  className="input-field resize-none"
                />
              </div>

              {/* Thumbnail upload (shared by both types) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Imagen de miniatura <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-4">
                  {editing.thumbnail_url ? (
                    <div className="relative flex-shrink-0">
                      <img
                        src={editing.thumbnail_url}
                        alt="Miniatura"
                        className="w-20 h-20 object-cover rounded-xl border border-gray-200"
                      />
                      <button
                        onClick={() => setEditing(p => ({ ...p!, thumbnail_url: '' }))}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                      >
                        <X size={10} className="text-white" />
                      </button>
                    </div>
                  ) : (
                    <div
                      className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 cursor-pointer flex-shrink-0"
                      onClick={() => thumbInputRef.current?.click()}
                    >
                      {thumbUploading ? (
                        <div className="w-6 h-6 border-2 border-gray-200 border-t-[#5170ff] rounded-full animate-spin" />
                      ) : (
                        <ImageIcon size={20} className="text-gray-300" />
                      )}
                    </div>
                  )}
                  <div className="flex-1">
                    <button
                      onClick={() => thumbInputRef.current?.click()}
                      disabled={thumbUploading}
                      className="flex items-center gap-2 text-sm font-medium text-[#5170ff] hover:text-blue-700 disabled:opacity-50"
                    >
                      <Upload size={15} />
                      {thumbUploading ? 'Subiendo...' : editing.thumbnail_url ? 'Cambiar miniatura' : 'Subir miniatura'}
                    </button>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG o WebP. Se mostrará como portada.</p>
                    {thumbError && <p className="text-red-500 text-xs mt-1">{thumbError}</p>}
                  </div>
                  <input
                    ref={thumbInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) handleThumbUpload(f);
                      e.target.value = '';
                    }}
                  />
                </div>
              </div>

              {/* PDF upload (only for PDF type) */}
              {!isVideo && !isColoring && !isGame && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Archivo PDF del cuento <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 flex-shrink-0">
                      {pdfUploading ? (
                        <div className="w-6 h-6 border-2 border-gray-200 border-t-[#5170ff] rounded-full animate-spin" />
                      ) : editing.pdf_url ? (
                        <FileText size={24} className="text-red-500" />
                      ) : (
                        <FileText size={20} className="text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      {editing.pdf_url ? (
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-700 truncate">
                            {editing.pdf_url.split('/').pop()}
                          </p>
                          <button
                            onClick={() => setEditing(p => ({ ...p!, pdf_url: '' }))}
                            className="text-xs text-red-500 hover:text-red-700 font-medium"
                          >
                            Quitar PDF
                          </button>
                        </div>
                      ) : null}
                      <button
                        onClick={() => pdfInputRef.current?.click()}
                        disabled={pdfUploading}
                        className="flex items-center gap-2 text-sm font-medium text-[#5170ff] hover:text-blue-700 disabled:opacity-50"
                      >
                        <Upload size={15} />
                        {pdfUploading ? 'Subiendo...' : editing.pdf_url ? 'Cambiar PDF' : 'Subir PDF'}
                      </button>
                      <p className="text-xs text-gray-400 mt-1">Archivo PDF del cuento ilustrado.</p>
                      {pdfError && <p className="text-red-500 text-xs mt-1">{pdfError}</p>}
                    </div>
                    <input
                      ref={pdfInputRef}
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={e => {
                        const f = e.target.files?.[0];
                        if (f) handlePdfUpload(f);
                        e.target.value = '';
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Coloring book URL (only for coloring type) */}
              {isColoring && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    URL del libro para colorear <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 flex-shrink-0">
                      <Palette size={24} className="text-emerald-500" />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={editing.html_file_url ?? ''}
                        onChange={e => setEditing(p => ({ ...p!, html_file_url: e.target.value }))}
                        placeholder="https://www.ejemplo.com/libro-para-colorear"
                        className="input-field"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Enlace a una página HTML5 externa que se mostrará dentro del cuento.
                      </p>
                      {editing.html_file_url?.trim() && !isValidHttpsUrl(editing.html_file_url.trim()) && (
                        <p className="text-red-500 text-xs mt-1">
                          Ingresa una URL válida que empiece con https://
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Game URL (only for game type) */}
              {isGame && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    URL del juego en línea <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 flex-shrink-0">
                      <Gamepad2 size={24} className="text-sky-500" />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={editing.game_url ?? ''}
                        onChange={e => setEditing(p => ({ ...p!, game_url: e.target.value }))}
                        placeholder="https://www.ejemplo.com/juego"
                        className="input-field"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Enlace a un juego en línea que se mostrará en vertical.
                      </p>
                      {editing.game_url?.trim() && !isValidHttpsUrl(editing.game_url.trim()) && (
                        <p className="text-red-500 text-xs mt-1">
                          Ingresa una URL válida que empiece con https://
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* YouTube URL (only for video type) */}
              {isVideo && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    URL o ID del video de YouTube <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 flex-shrink-0">
                      <Play size={24} className="text-red-500" fill="currentColor" />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={editing.youtube_url ?? ''}
                        onChange={e => setEditing(p => ({ ...p!, youtube_url: e.target.value }))}
                        placeholder="https://youtube.com/watch?v=... o youtu.be/..."
                        className="input-field"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Pega el enlace completo del video o Short de YouTube.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setEditing(null)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={save}
                disabled={saving || !canSave}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#5170ff] text-white font-semibold text-sm disabled:opacity-60"
              >
                <Save size={15} />
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
