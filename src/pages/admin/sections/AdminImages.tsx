import { useEffect, useRef, useState } from 'react';
import { Upload, Trash2, Copy, Check, X, ImageIcon } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { UploadedImage } from '../../../lib/supabase';

const MAX_SIZE = 52428800; // 50 MB

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export default function AdminImages() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<{ file: File; dataUrl: string } | null>(null);
  const [altText, setAltText] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const { data } = await supabase
      .from('uploaded_images')
      .select('*')
      .order('created_at', { ascending: false });
    setImages(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const validateAndPreview = (file: File) => {
    setError('');
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten archivos de imagen.');
      return;
    }
    if (file.size > MAX_SIZE) {
      setError(`El archivo supera el límite de 50 MB (${formatBytes(file.size)}).`);
      return;
    }
    const reader = new FileReader();
    reader.onload = e => setPreview({ file, dataUrl: e.target?.result as string });
    reader.readAsDataURL(file);
    setAltText('');
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndPreview(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndPreview(file);
  };

  const handleUpload = async () => {
    if (!preview) return;
    setUploading(true);
    setError('');

    const ext = preview.file.name.split('.').pop() ?? 'jpg';
    const path = `${crypto.randomUUID()}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from('content-images')
      .upload(path, preview.file, { contentType: preview.file.type, upsert: false });

    if (upErr) {
      console.error('Image upload failed', upErr);
      setError('No se pudo subir la imagen. Verifica el archivo e inténtalo de nuevo.');
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('content-images')
      .getPublicUrl(path);

    await supabase.from('uploaded_images').insert({
      url: publicUrl,
      storage_path: path,
      filename: preview.file.name,
      alt_text: altText.trim() || preview.file.name.replace(/\.[^.]+$/, ''),
      size_bytes: preview.file.size,
    });

    setPreview(null);
    setAltText('');
    await load();
    setUploading(false);
  };

  const handleDelete = async (img: UploadedImage) => {
    if (!confirm(`¿Eliminar "${img.filename}"? Esta acción no se puede deshacer.`)) return;
    await supabase.storage.from('content-images').remove([img.storage_path]);
    await supabase.from('uploaded_images').delete().eq('id', img.id);
    await load();
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Biblioteca de Imágenes</h1>
        <p className="text-gray-500 text-sm mt-0.5">Sube imágenes para usar en bloques de contenido (máx. 50 MB por archivo)</p>
      </div>

      {/* Upload area */}
      {!preview ? (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}
        >
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
            <Upload size={24} className="text-blue-500" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-700">Arrastra una imagen aquí</p>
            <p className="text-gray-400 text-sm mt-1">o haz clic para seleccionar</p>
            <p className="text-gray-400 text-xs mt-2">JPG, PNG, WEBP, GIF, SVG · Máx. 50 MB</p>
          </div>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileInput} />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <p className="font-semibold text-gray-900">Vista previa</p>
            <button onClick={() => { setPreview(null); setAltText(''); }} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"><X size={16} /></button>
          </div>
          <div className="px-4 pb-2">
            <img src={preview.dataUrl} alt="preview" className="w-full max-h-64 object-contain rounded-xl bg-gray-50" />
          </div>
          <div className="px-4 pb-2">
            <p className="text-xs text-gray-400 mb-3">{preview.file.name} · {formatBytes(preview.file.size)}</p>
            <label className="block text-sm font-medium text-gray-700 mb-1">Texto alternativo (alt)</label>
            <input
              type="text"
              value={altText}
              onChange={e => setAltText(e.target.value)}
              placeholder="Describe la imagen para accesibilidad"
              className="input-field"
            />
          </div>
          <div className="px-4 pb-4 flex gap-3 mt-2">
            <button onClick={() => { setPreview(null); setAltText(''); }} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm">Cancelar</button>
            <button onClick={handleUpload} disabled={uploading} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm disabled:opacity-60 flex items-center justify-center gap-2">
              {uploading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Subiendo...</> : <><Upload size={15} /> Subir imagen</>}
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-xl border border-red-100">{error}</p>}

      {/* Gallery */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton aspect-square rounded-xl" />)}
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <ImageIcon size={36} className="text-gray-300 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">No hay imágenes subidas todavía.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 font-medium">{images.length} imagen{images.length !== 1 ? 'es' : ''}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.map(img => (
              <div key={img.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden group">
                <div className="aspect-square bg-gray-50 overflow-hidden">
                  <img src={img.url} alt={img.alt_text} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-medium text-gray-800 truncate">{img.filename}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatBytes(img.size_bytes)}</p>
                  <div className="flex gap-1.5 mt-2">
                    <button
                      onClick={() => copyUrl(img.url)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      {copied === img.url ? <Check size={12} /> : <Copy size={12} />}
                      {copied === img.url ? 'Copiado' : 'Copiar URL'}
                    </button>
                    <button
                      onClick={() => handleDelete(img)}
                      className="p-1.5 rounded-lg bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
