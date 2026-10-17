import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import type { Module } from '../lib/supabase';
import { getModuleHex } from '../lib/moduleColors';

import cancervphicono from '../assets/images/cancervphicono.png';
import cancertabacoicono from '../assets/images/cancertabacoicono.png';
import cancermamaicono from '../assets/images/cancermamaicono.png';
import cancerpielicono from '../assets/images/cancerpielicono.png';
import cancercolonicono from '../assets/images/cancercolonicono.png';
import cancerprostataicono from '../assets/images/cancerprostataicono.png';

const PNG_ICON_MAP: Record<string, string> = {
  'cancervphicono.png': cancervphicono,
  'cancertabacoicono.png': cancertabacoicono,
  'cancermamaicono.png': cancermamaicono,
  'cancerpielicono.png': cancerpielicono,
  'cancercolonicono.png': cancercolonicono,
  'cancerprostataicono.png': cancerprostataicono,
};

interface Props {
  module: Module;
  variant?: 'grid' | 'list';
}

export default function ModuleCard({ module: mod, variant = 'grid' }: Props) {
  const navigate = useNavigate();
  const accentColor = getModuleHex(mod.slug);
  const pngSrc = PNG_ICON_MAP[mod.icon];

  if (variant === 'list') {
    return (
      <button
        onClick={() => navigate(`/modulo/${mod.slug}`)}
        className="module-card-enter flex flex-col rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white w-full text-left transition-all duration-300 active:scale-[0.98] hover:shadow-xl hover:-translate-y-1 group"
      >
        {/* Icon left + title & description right */}
        <div className="p-4 flex items-center gap-4">
          <div
            className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
            style={{ backgroundColor: accentColor + '1A' }}
          >
            {pngSrc ? (
              <img
                src={pngSrc}
                alt={mod.title}
                className="w-10 h-10 object-contain drop-shadow-sm"
              />
            ) : (
              <Shield size={28} style={{ color: accentColor }} />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3
              className="font-bold text-sm leading-snug"
              style={{ color: accentColor }}
            >
              {mod.title}
            </h3>
            <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mt-0.5">
              {mod.description}
            </p>
          </div>
        </div>

        {/* Bottom accent bar */}
        <div className="h-0.5 w-full mt-auto" style={{ backgroundColor: accentColor + '40' }} />
      </button>
    );
  }

  return (
    <button
      onClick={() => navigate(`/modulo/${mod.slug}`)}
      className="module-card-enter flex flex-col rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white w-full text-left transition-all duration-200 active:scale-95 hover:shadow-lg hover:-translate-y-0.5 group"
    >
      {/* Icon + Title row */}
      <div className="p-4 flex items-center gap-3">
        {/* Icon container with accent tinted background */}
        <div
          className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
          style={{ backgroundColor: accentColor + '1A' }}
        >
          {pngSrc ? (
            <img
              src={pngSrc}
              alt={mod.title}
              className="w-10 h-10 object-contain drop-shadow-sm"
            />
          ) : (
            <Shield size={28} style={{ color: accentColor }} />
          )}
        </div>

        {/* Title */}
        <h3
          className="font-bold text-[13px] leading-snug flex-1 min-w-0"
          style={{ color: accentColor }}
        >
          {mod.title}
        </h3>
      </div>

      {/* Divider */}
      <div className="h-px mx-4" style={{ backgroundColor: accentColor + '20' }} />

      {/* Description */}
      <div className="px-4 pt-2.5 pb-4">
        <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{mod.description}</p>
      </div>

      {/* Bottom accent bar */}
      <div className="h-0.5 w-full mt-auto" style={{ backgroundColor: accentColor + '40' }} />
    </button>
  );
}
