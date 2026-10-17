import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAppConfig } from '../lib/AppConfigContext';

interface Props {
  title?: string;
  showBack?: boolean;
  colorHex?: string;
  onBack?: () => void;
}

export default function Header({ title, showBack = false, colorHex, onBack }: Props) {
  const navigate = useNavigate();
  const { logoUrl, logoSize } = useAppConfig();

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  return (
    <header className="sticky top-0 z-40 shadow-md">
      {/* Logo band — always visible, always #5170ff */}
      <div className="bg-[#5170ff] flex items-center justify-center relative py-2 px-4" style={{ minHeight: 72 }}>
        {showBack && (
          <button
            onClick={handleBack}
            className="absolute left-3 flex items-center justify-center w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 active:bg-white/40 transition-colors"
            aria-label="Volver"
          >
            <ArrowLeft size={22} className="text-white" />
          </button>
        )}
        <Link to="/" className="flex items-center justify-center">
          <img
            src={logoUrl}
            alt="Liga Colombiana Contra el Cáncer - Zonal Tolima"
            className="w-auto object-contain"
            style={{
              height: 'clamp(56px, 10vw, 72px)',
              transform: `scale(${logoSize / 100})`,
              transformOrigin: 'center',
            }}
          />
        </Link>
      </div>

      {/* Title band — only when title is provided */}
      {title && (
        <div
          className="bg-white border-b-2 px-4 py-2.5"
          style={{ borderColor: colorHex ?? '#C41E3A' }}
        >
          <h1 className="font-bold text-gray-900 text-sm leading-tight text-center truncate">{title}</h1>
        </div>
      )}
    </header>
  );
}
