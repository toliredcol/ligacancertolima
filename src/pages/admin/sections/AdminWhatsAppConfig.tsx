import { useState, useRef } from 'react';
import { Upload, Save, MessageCircle, ExternalLink, Check, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAppConfig } from '../../../lib/AppConfigContext';

const MAX_SIZE = 52428800; // 50 MB

function normalizeWhatsappLink(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  // Already a full URL
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  // wa.me/<number>
  if (/^wa\.me\//i.test(trimmed)) return `https://${trimmed}`;
  // Bare number: digits only, optional leading +
  if (/^\+?\d{8,15}$/.test(trimmed)) {
    return `https://wa.me/${trimmed.replace(/^\+/, '')}`;
  }
  return null;
}

export default function AdminWhatsAppConfig() {
  const {
    whatsappImageUrl, setWhatsappImageUrl,
    whatsappLink, setWhatsappLink,
    whatsappOpenNewTab, setWhatsappOpenNewTab,
    whatsappVisible, setWhatsappVisible,
  } = useAppConfig();

  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [savedImage, setSavedImage] = useState(false);
  const [imgError, setImgError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const [linkInput, setLinkInput] = useState(whatsappLink);
  const [linkError, setLinkError] = useState('');
  const [savingLink, setSavingLink] = useState(false);
  const [savedLink, setSavedLink] = useState(false);

  const [openNewTab, setOpenNewTab] = useState(whatsappOpenNewTab);
  const [savingTab, setSavingTab] = useState(false);
  const [savedTab, setSavedTab] = useState(false);

  const [visible, setVisible] = useState(whatsappVisible);
  const [savingVisible, setSavingVisible] = useState(false);
  const [savedVisible, setSavedVisible] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgError('');
    if (!file.type.startsWith('image/')) {
      setImgError('Solo se permiten archivos de imagen.');
      return;
    }
    if (file.size > MAX_SIZE) {
      setImgError(`El archivo supera el límite de 50 MB.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSaveImage = async () => {
    if (!preview) return;
    setUploading(true);
    setImgError('');
    try {
      const res = await fetch(preview);
      const blob = await res.blob();
      const ext = (blob.type.split('/')[1] || 'png').replace('svg+xml', 'svg');
      const path = `whatsapp/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('content-images')
        .upload(path, blob, { contentType: blob.type, upsert: false });
      if (upErr) throw new Error(upErr.message);
      const { data: { publicUrl } } = supabase.storage
        .from('content-images')
        .getPublicUrl(path);
      await setWhatsappImageUrl(publicUrl);
      setSavedImage(true);
      setPreview(null);
      if (fileRef.current) fileRef.current.value = '';
      setTimeout(() => setSavedImage(false), 2500);
    } catch (err) {
      console.error('WhatsApp image upload failed', err);
      setImgError('No se pudo subir la imagen. Verifica el archivo e inténtalo de nuevo.');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveLink = async () => {
    setLinkError('');
    const normalized = normalizeWhatsappLink(linkInput);
    if (!normalized) {
      setLinkError('Formato inválido. Usa un número con código de país (ej: 573158137106) o una URL completa (wa.me/...).');
      return;
    }
    setSavingLink(true);
    setLinkInput(normalized);
    await setWhatsappLink(normalized);
    setSavingLink(false);
    setSavedLink(true);
    setTimeout(() => setSavedLink(false), 2500);
  };

  const handleSaveTab = async () => {
    setSavingTab(true);
    await setWhatsappOpenNewTab(openNewTab);
    setSavingTab(false);
    setSavedTab(true);
    setTimeout(() => setSavedTab(false), 2500);
  };

  const handleSaveVisible = async () => {
    setSavingVisible(true);
    await setWhatsappVisible(visible);
    setSavingVisible(false);
    setSavedVisible(true);
    setTimeout(() => setSavedVisible(false), 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Configuración del botón de WhatsApp</h2>
        <p className="text-gray-500 text-sm mt-0.5">Personaliza la imagen, el enlace y el comportamiento de apertura del botón flotante</p>
      </div>

      {/* Visibility section */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-gray-800">Publicar botón de WhatsApp</p>
            <p className="text-xs text-gray-400 mt-0.5">Controla si el botón flotante es visible en el sitio público</p>
          </div>
          {visible ? <Eye size={20} className="text-green-500 flex-shrink-0 mt-1" /> : <EyeOff size={20} className="text-gray-300 flex-shrink-0 mt-1" />}
        </div>

        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm font-medium text-gray-700">{visible ? 'Publicado' : 'Oculto'}</span>
          <button
            type="button"
            role="switch"
            aria-checked={visible}
            onClick={() => setVisible(v => !v)}
            className={`relative w-12 h-6 rounded-full transition-colors ${visible ? 'bg-green-500' : 'bg-gray-300'}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${visible ? 'translate-x-6' : ''}`}
            />
          </button>
        </label>

        <button
          onClick={handleSaveVisible}
          disabled={savingVisible}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#5170ff] text-white font-semibold text-sm disabled:opacity-60 active:scale-95 transition-transform"
        >
          {savedVisible ? <><Check size={15} /> ¡Configuración guardada!</> : savingVisible ? 'Guardando...' : <><Save size={15} /> Guardar configuración</>}
        </button>
      </div>

      {/* Image section */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-5">
        <div>
          <p className="text-sm font-bold text-gray-800">Imagen del botón</p>
          <p className="text-xs text-gray-400 mt-0.5">Se sube al almacenamiento y se actualiza automáticamente en el sitio</p>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-600 mb-2">Imagen actual</p>
          <div className="rounded-xl p-4 flex items-center justify-center bg-gray-50" style={{ minHeight: 110 }}>
            <img
              src={whatsappImageUrl}
              alt="Imagen actual del botón"
              className="w-16 h-16 object-cover rounded-full"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
            />
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-600">Subir nueva imagen</p>
          <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl p-5 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
            <Upload size={24} className="text-gray-300" />
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">Selecciona una imagen</p>
              <p className="text-xs text-gray-400 mt-0.5">PNG, JPG — se mostrará circular</p>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </label>

          {preview && (
            <div className="space-y-3 animate-fade-in">
              <p className="text-xs font-semibold text-gray-600">Vista previa</p>
              <div className="rounded-xl p-4 flex items-center justify-center bg-gray-50">
                <img src={preview} alt="Vista previa" className="w-16 h-16 object-cover rounded-full" />
              </div>
              <button
                onClick={handleSaveImage}
                disabled={uploading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#5170ff] text-white font-semibold text-sm disabled:opacity-60 active:scale-95 transition-transform"
              >
                {savedImage ? <><Check size={15} /> ¡Imagen guardada!</> : uploading ? 'Subiendo...' : <><Save size={15} /> Guardar imagen</>}
              </button>
            </div>
          )}

          {imgError && <p className="text-red-600 text-xs bg-red-50 px-3 py-2 rounded-lg border border-red-100">{imgError}</p>}
        </div>
      </div>

      {/* Link section */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
        <div>
          <p className="text-sm font-bold text-gray-800">Enlace de WhatsApp</p>
          <p className="text-xs text-gray-400 mt-0.5">Número con código de país o URL completa (wa.me/...)</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MessageCircle size={16} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={linkInput}
              onChange={(e) => { setLinkInput(e.target.value); setLinkError(''); }}
              placeholder="573158137106 o https://wa.me/573158137106"
              className="input-field"
            />
          </div>
          {linkError && <p className="text-red-600 text-xs">{linkError}</p>}
        </div>

        <button
          onClick={handleSaveLink}
          disabled={savingLink}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#5170ff] text-white font-semibold text-sm disabled:opacity-60 active:scale-95 transition-transform"
        >
          {savedLink ? <><Check size={15} /> ¡Enlace guardado!</> : savingLink ? 'Guardando...' : <><Save size={15} /> Guardar enlace</>}
        </button>
      </div>

      {/* Open in new tab section */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-gray-800">Abrir en nueva ventana</p>
            <p className="text-xs text-gray-400 mt-0.5">Si está activado, el enlace abre en una pestaña nueva</p>
          </div>
          <ExternalLink size={20} className="text-gray-300 flex-shrink-0 mt-1" />
        </div>

        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm font-medium text-gray-700">{openNewTab ? 'Sí' : 'No'}</span>
          <button
            type="button"
            role="switch"
            aria-checked={openNewTab}
            onClick={() => setOpenNewTab(v => !v)}
            className={`relative w-12 h-6 rounded-full transition-colors ${openNewTab ? 'bg-[#5170ff]' : 'bg-gray-300'}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${openNewTab ? 'translate-x-6' : ''}`}
            />
          </button>
        </label>

        <button
          onClick={handleSaveTab}
          disabled={savingTab}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#5170ff] text-white font-semibold text-sm disabled:opacity-60 active:scale-95 transition-transform"
        >
          {savedTab ? <><Check size={15} /> ¡Configuración guardada!</> : savingTab ? 'Guardando...' : <><Save size={15} /> Guardar configuración</>}
        </button>
      </div>
    </div>
  );
}
