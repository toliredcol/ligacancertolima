import { useState, useRef, useEffect } from 'react';
import { Upload, Save } from 'lucide-react';
import { useAppConfig } from '../../../lib/AppConfigContext';

function LogoSection({
  title,
  description,
  currentSrc,
  bgColor = '#5170ff',
  sizeValue,
  onSizeChange,
  onSaveLogo,
  onSaveSize,
}: {
  title: string;
  description: string;
  currentSrc: string;
  bgColor?: string;
  sizeValue: number;
  onSizeChange: (v: number) => void;
  onSaveLogo: (dataUrl: string) => Promise<void>;
  onSaveSize: (v: number) => Promise<void>;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [savingLogo, setSavingLogo] = useState(false);
  const [savedLogo, setSavedLogo] = useState(false);
  const [savingSize, setSavingSize] = useState(false);
  const [savedSize, setSavedSize] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSaveLogo = async () => {
    if (!preview) return;
    setSavingLogo(true);
    await onSaveLogo(preview);
    setSavingLogo(false);
    setSavedLogo(true);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = '';
    setTimeout(() => setSavedLogo(false), 2500);
  };

  const handleSaveSize = async () => {
    setSavingSize(true);
    await onSaveSize(sizeValue);
    setSavingSize(false);
    setSavedSize(true);
    setTimeout(() => setSavedSize(false), 2500);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-5">
      <div>
        <p className="text-sm font-bold text-gray-800">{title}</p>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>

      {/* Current logo preview */}
      <div>
        <p className="text-xs font-semibold text-gray-600 mb-2">Logo actual</p>
        <div className="rounded-xl p-4 flex items-center justify-center" style={{ backgroundColor: bgColor, minHeight: 90 }}>
          {currentSrc ? (
            <img
              src={currentSrc}
              alt="Logo actual"
              className="object-contain"
              style={{ height: 56, transform: `scale(${sizeValue / 100})`, transformOrigin: 'center' }}
            />
          ) : (
            <p className="text-white/60 text-xs">Sin logo configurado</p>
          )}
        </div>
      </div>

      {/* Upload new logo */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-gray-600">Subir nuevo logo</p>
        <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl p-5 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
          <Upload size={24} className="text-gray-300" />
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">Selecciona una imagen</p>
            <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, SVG — preferiblemente con fondo transparente</p>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </label>

        {preview && (
          <div className="space-y-3 animate-fade-in">
            <p className="text-xs font-semibold text-gray-600">Vista previa</p>
            <div className="rounded-xl p-4 flex items-center justify-center" style={{ backgroundColor: bgColor, minHeight: 90 }}>
              <img src={preview} alt="Vista previa" className="h-14 w-auto object-contain" />
            </div>
            <button
              onClick={handleSaveLogo}
              disabled={savingLogo}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#5170ff] text-white font-semibold text-sm disabled:opacity-60 active:scale-95 transition-transform"
            >
              <Save size={15} />
              {savedLogo ? '¡Logo guardado!' : savingLogo ? 'Guardando...' : 'Guardar logo'}
            </button>
          </div>
        )}

        {savedLogo && !preview && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center animate-fade-in">
            <p className="text-green-700 text-sm font-medium">Logo actualizado correctamente</p>
          </div>
        )}
      </div>

      {/* Size control */}
      <div className="space-y-3 pt-1 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-600">Tamaño del logo</p>
          <span className="text-sm font-bold text-gray-800">{sizeValue}%</span>
        </div>
        <input
          type="range"
          min={50}
          max={200}
          step={5}
          value={sizeValue}
          onChange={e => onSizeChange(Number(e.target.value))}
          className="w-full accent-blue-600"
        />
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>50%</span>
          <div className="flex-1 h-px bg-gray-100" />
          <span>100% (base)</span>
          <div className="flex-1 h-px bg-gray-100" />
          <span>200%</span>
        </div>
        <button
          onClick={handleSaveSize}
          disabled={savingSize}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm disabled:opacity-60 hover:border-gray-300 active:scale-95 transition-transform"
        >
          <Save size={14} />
          {savedSize ? '¡Tamaño guardado!' : savingSize ? 'Guardando...' : 'Guardar tamaño'}
        </button>
      </div>
    </div>
  );
}

export default function AdminLogoConfig() {
  const {
    logoUrl, setLogoUrl,
    logoSize, setLogoSize,
    footerLogoUrl, setFooterLogoUrl,
    footerLogoSize, setFooterLogoSize,
  } = useAppConfig();

  const [headerSize, setHeaderSize] = useState(logoSize);
  const [footerSize, setFooterSize] = useState(footerLogoSize);

  useEffect(() => { setHeaderSize(logoSize); }, [logoSize]);
  useEffect(() => { setFooterSize(footerLogoSize); }, [footerLogoSize]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Configuración del logo</h2>
        <p className="text-gray-500 text-sm mt-0.5">Gestiona los logotipos del header y el footer de la aplicación</p>
      </div>

      <LogoSection
        title="Logo del header"
        description="Aparece en la barra superior azul de toda la aplicación"
        currentSrc={logoUrl}
        bgColor="#5170ff"
        sizeValue={headerSize}
        onSizeChange={setHeaderSize}
        onSaveLogo={setLogoUrl}
        onSaveSize={setLogoSize}
      />

      <LogoSection
        title="Logo del footer"
        description="Aparece en el pie de página. Si no se configura, usa el logo del header"
        currentSrc={footerLogoUrl || logoUrl}
        bgColor="#111827"
        sizeValue={footerSize}
        onSizeChange={setFooterSize}
        onSaveLogo={setFooterLogoUrl}
        onSaveSize={setFooterLogoSize}
      />
    </div>
  );
}
