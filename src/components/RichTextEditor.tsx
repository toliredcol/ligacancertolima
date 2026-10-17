import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered,
  Link as LinkIcon, Image as ImageIcon, Minus, Quote, Loader2,
  AlignLeft, AlignCenter, AlignRight, Images, X, Check, Code,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { UploadedImage } from '../lib/supabase';

interface Props {
  value: string;
  onChange: (html: string) => void;
}

function exec(command: string, value?: string) {
  document.execCommand(command, false, value);
}

export default function RichTextEditor({ value, onChange }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [uploading, setUploading] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [gallery, setGallery] = useState<UploadedImage[]>([]);
  const [codeMode, setCodeMode] = useState(false);
  const [codeContent, setCodeContent] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const savedRange = useRef<Range | null>(null);

  // Set initial content once
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) savedRange.current = sel.getRangeAt(0).cloneRange();
  };

  const restoreSelection = () => {
    if (!savedRange.current) return;
    const sel = window.getSelection();
    if (sel) { sel.removeAllRanges(); sel.addRange(savedRange.current); }
  };

  const handleInput = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  // Load gallery when picker opens
  useEffect(() => {
    if (!showGallery) return;
    supabase
      .from('uploaded_images')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => setGallery(data ?? []));
  }, [showGallery]);

  const handleImageUpload = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const filename = `wysiwyg-${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from('content-images')
        .upload(filename, file, { contentType: file.type, upsert: false });
      if (error) throw error;
      const { data: urlData } = supabase.storage
        .from('content-images')
        .getPublicUrl(filename);
      await supabase.from('uploaded_images').insert({
        url: urlData.publicUrl,
        storage_path: filename,
        filename,
        alt_text: file.name.replace(/\.[^/.]+$/, ''),
        size_bytes: file.size,
      });
      editorRef.current?.focus();
      restoreSelection();
      exec('insertImage', urlData.publicUrl);
      handleInput();
    } catch (err) {
      alert('Error al subir la imagen. Intenta de nuevo.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const insertGalleryImage = (img: UploadedImage) => {
    editorRef.current?.focus();
    restoreSelection();
    exec('insertImage', img.url);
    handleInput();
    setShowGallery(false);
  };

  const insertLink = () => {
    const url = window.prompt('Ingresa la URL del enlace:');
    if (!url) return;
    editorRef.current?.focus();
    restoreSelection();
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) {
      const text = window.prompt('Texto del enlace:') || url;
      exec('insertHTML', `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`);
    } else {
      exec('createLink', url);
    }
    handleInput();
  };

  const doCmd = (cmd: string, value?: string) => {
    editorRef.current?.focus();
    exec(cmd, value);
    handleInput();
  };

  const isActive = (tag: string) => {
    try { return document.queryCommandState(tag); } catch { return false; }
  };

  const Btn = ({
    active, onClick, title, children, disabled,
  }: { active?: boolean; onClick: () => void; title: string; children: React.ReactNode; disabled?: boolean }) => (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); saveSelection(); if (!disabled) onClick(); }}
      title={title}
      disabled={disabled}
      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-sm disabled:opacity-40
        ${active ? 'bg-gray-200 text-gray-900' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'}`}
    >
      {children}
    </button>
  );

  const Sep = () => <div className="w-px h-5 bg-gray-200 mx-0.5" />;

  return (
    <div className="border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-gray-400 transition-colors bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-2 border-b border-gray-100 bg-gray-50">
        <Btn active={isActive('bold')} onClick={() => doCmd('bold')} title="Negrita (Ctrl+B)" disabled={codeMode}>
          <Bold size={13} />
        </Btn>
        <Btn active={isActive('italic')} onClick={() => doCmd('italic')} title="Cursiva (Ctrl+I)" disabled={codeMode}>
          <Italic size={13} />
        </Btn>
        <Btn active={isActive('underline')} onClick={() => doCmd('underline')} title="Subrayado (Ctrl+U)" disabled={codeMode}>
          <UnderlineIcon size={13} />
        </Btn>

        <Sep />

        <Btn active={false} onClick={() => doCmd('formatBlock', '<h1>')} title="Encabezado 1" disabled={codeMode}>
          <span className="text-[11px] font-bold">H1</span>
        </Btn>
        <Btn active={false} onClick={() => doCmd('formatBlock', '<h2>')} title="Encabezado 2" disabled={codeMode}>
          <span className="text-[11px] font-bold">H2</span>
        </Btn>
        <Btn active={false} onClick={() => doCmd('formatBlock', '<h3>')} title="Encabezado 3" disabled={codeMode}>
          <span className="text-[11px] font-bold">H3</span>
        </Btn>
        <Btn active={false} onClick={() => doCmd('formatBlock', '<h4>')} title="Encabezado 4" disabled={codeMode}>
          <span className="text-[11px] font-bold">H4</span>
        </Btn>

        <Sep />

        <Btn active={isActive('insertUnorderedList')} onClick={() => doCmd('insertUnorderedList')} title="Lista con viñetas" disabled={codeMode}>
          <List size={13} />
        </Btn>
        <Btn active={isActive('insertOrderedList')} onClick={() => doCmd('insertOrderedList')} title="Lista numerada" disabled={codeMode}>
          <ListOrdered size={13} />
        </Btn>
        <Btn active={false} onClick={() => doCmd('formatBlock', '<blockquote>')} title="Cita" disabled={codeMode}>
          <Quote size={13} />
        </Btn>
        <Btn active={false} onClick={() => doCmd('insertHorizontalRule')} title="Línea horizontal" disabled={codeMode}>
          <Minus size={13} />
        </Btn>

        <Sep />

        <Btn active={false} onClick={() => doCmd('justifyLeft')} title="Alinear izquierda" disabled={codeMode}>
          <AlignLeft size={13} />
        </Btn>
        <Btn active={false} onClick={() => doCmd('justifyCenter')} title="Centrar" disabled={codeMode}>
          <AlignCenter size={13} />
        </Btn>
        <Btn active={false} onClick={() => doCmd('justifyRight')} title="Alinear derecha" disabled={codeMode}>
          <AlignRight size={13} />
        </Btn>

        <Sep />

        <Btn active={false} onClick={insertLink} title="Insertar enlace" disabled={codeMode}>
          <LinkIcon size={13} />
        </Btn>

        <Btn active={false} onClick={() => { saveSelection(); fileInputRef.current?.click(); }} title="Subir imagen" disabled={uploading || codeMode}>
          {uploading ? <Loader2 size={13} className="animate-spin" /> : <ImageIcon size={13} />}
        </Btn>

        <Btn active={false} onClick={() => { saveSelection(); setShowGallery(true); }} title="Insertar desde galería" disabled={codeMode}>
          <Images size={13} />
        </Btn>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file);
            e.target.value = '';
          }}
        />

        <Sep />

        <Btn
          active={codeMode}
          onClick={() => {
            if (!codeMode) {
              const html = editorRef.current?.innerHTML || '';
              setCodeContent(html);
            } else {
              if (editorRef.current) {
                editorRef.current.innerHTML = codeContent;
                onChange(codeContent);
              }
            }
            setCodeMode(m => !m);
          }}
          title="Código fuente / HTML"
        >
          <Code size={13} />
        </Btn>
      </div>

      {/* Editor area */}
      {codeMode ? (
        <textarea
          value={codeContent}
          onChange={e => {
            setCodeContent(e.target.value);
            onChange(e.target.value);
          }}
          className="w-full min-h-[180px] px-4 py-3 text-gray-700 bg-gray-50 border-0 focus:outline-none resize-y font-mono text-xs leading-relaxed"
          spellCheck={false}
          placeholder="Pega o edita aquí el código HTML..."
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyUp={handleInput}
          className="prose prose-sm max-w-none min-h-[180px] focus:outline-none px-4 py-3 text-gray-700"
          style={{ whiteSpace: 'pre-wrap' }}
        />
      )}

      {/* Gallery modal */}
      {showGallery && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Insertar imagen de galería</h3>
              <button type="button" onClick={() => setShowGallery(false)}>
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {gallery.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-400 text-sm">No hay imágenes. Sube imágenes en la sección <strong>Imágenes</strong> del panel.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {gallery.map(img => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => insertGalleryImage(img)}
                      className="relative aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-blue-400 transition-colors group"
                    >
                      <img src={img.url} alt={img.alt_text} className="w-full h-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-blue-500 rounded-full p-1">
                          <Check size={14} className="text-white" />
                        </div>
                      </div>
                      <div className="absolute bottom-0 inset-x-0 bg-black/50 px-1.5 py-1">
                        <p className="text-white text-[10px] truncate">{img.filename}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-100">
              <button type="button" onClick={() => setShowGallery(false)} className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
