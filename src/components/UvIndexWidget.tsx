import { useEffect, useState } from 'react';
import { Sun, CloudSun, Cloud, AlertTriangle, AlertCircle } from 'lucide-react';
import esperanzaSol from '../assets/images/esperanzasol.png';

const FALLBACK_LAT = 4.4389;
const FALLBACK_LON = -75.2322;
const FALLBACK_CITY = 'Tolima';

interface UvLevel {
  label: string;
  bg: string;
  text: string;
  icon: typeof Sun;
  iconColor: string;
  recommendation: string;
}

function getUvLevel(uv: number): UvLevel {
  if (uv <= 2) {
    return {
      label: 'Bajo',
      bg: 'bg-green-50 border-green-200',
      text: 'text-green-700',
      icon: Cloud,
      iconColor: 'text-green-500',
      recommendation: 'Protección mínima necesaria. Puedes usar bloqueador SPF 15+ si vas a estar mucho tiempo al aire libre.',
    };
  }
  if (uv <= 5) {
    return {
      label: 'Moderado',
      bg: 'bg-yellow-50 border-yellow-200',
      text: 'text-yellow-700',
      icon: CloudSun,
      iconColor: 'text-yellow-500',
      recommendation: 'Usa bloqueador solar SPF 30 o mayor. Busca sombra durante las horas del mediodía.',
    };
  }
  if (uv <= 7) {
    return {
      label: 'Alto',
      bg: 'bg-orange-50 border-orange-200',
      text: 'text-orange-700',
      icon: Sun,
      iconColor: 'text-orange-500',
      recommendation: 'Protección necesaria. Usa bloqueador SPF 30-50, sombrero y gafas con filtro UV. Evita el sol entre las 10am y 4pm.',
    };
  }
  if (uv <= 10) {
    return {
      label: 'Muy Alto',
      bg: 'bg-red-50 border-red-200',
      text: 'text-red-700',
      icon: AlertTriangle,
      iconColor: 'text-red-500',
      recommendation: 'Protección extra necesaria. Usa bloqueador SPF 50+, reaplica cada 2 horas, busca sombra y evita la exposición directa entre las 10am y 4pm.',
    };
  }
  return {
    label: 'Extremo',
    bg: 'bg-purple-50 border-purple-200',
    text: 'text-purple-700',
    icon: AlertCircle,
    iconColor: 'text-purple-500',
    recommendation: 'Evita la exposición directa al sol. Si debes salir, usa bloqueador SPF 50+, ropa protectora, sombrero de ala ancha y busca sombra siempre que sea posible.',
  };
}

interface UvData {
  uv: number;
  city: string;
}

type UvState =
  | { status: 'loading' }
  | { status: 'success'; data: UvData }
  | { status: 'error' };

export default function UvIndexWidget() {
  const [state, setState] = useState<UvState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    async function fetchUv() {
      try {
        let lat = FALLBACK_LAT;
        let lon = FALLBACK_LON;
        let city = '';

        try {
          const geoRes = await fetch('https://ipwho.is/');
          if (geoRes.ok) {
            const geo = await geoRes.json();
            if (
              geo &&
              geo.success !== false &&
              typeof geo.latitude === 'number' &&
              typeof geo.longitude === 'number'
            ) {
              lat = geo.latitude;
              lon = geo.longitude;
              city = geo.city || '';
            }
          }
        } catch {
          // geolocation failed, use fallback
        }

        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=uv_index_max&timezone=auto`
        );
        if (!weatherRes.ok) throw new Error('Weather API error');
        const weather = await weatherRes.json();
        const uvMaxArr: number[] | undefined = weather?.daily?.uv_index_max;
        if (!uvMaxArr || uvMaxArr.length === 0) throw new Error('No UV data');
        const uv = Math.round(uvMaxArr[0]);
        if (isNaN(uv)) throw new Error('Invalid UV');

        if (!cancelled) {
          setState({ status: 'success', data: { uv, city: city || FALLBACK_CITY } });
        }
      } catch {
        if (!cancelled) {
          setState({ status: 'error' });
        }
      }
    }

    fetchUv();
    return () => { cancelled = true; };
  }, []);

  if (state.status === 'loading') {
    return (
      <div className="mx-4 mb-6 max-w-2xl md:mx-auto">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm animate-pulse">
          <div className="skeleton h-4 w-40 rounded mb-4" />
          <div className="flex items-center gap-4">
            <div className="skeleton h-16 w-16 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-3 w-3/4 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="mx-4 mb-6 max-w-2xl md:mx-auto">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Sun size={20} className="text-gray-400" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Índice UV</p>
              <p className="text-gray-500 text-xs leading-relaxed mt-0.5">
                No pudimos obtener el índice UV en este momento. Recuerda usar bloqueador solar SPF 30 o mayor como medida general de protección.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { uv, city } = state.data;
  const level = getUvLevel(uv);
  const title = city ? `Índice UV en ${city}` : 'Índice UV en tu zona';

  return (
    <div className="mx-4 mb-6 max-w-2xl md:mx-auto">
      <div className={`relative rounded-2xl border ${level.bg} p-5 shadow-sm`} style={{ overflow: 'visible' }}>
        <img
          src={esperanzaSol}
          alt="Esperanza"
          className="absolute object-contain pointer-events-none z-20 drop-shadow-lg"
          style={{ height: 68, width: 'auto', top: '-18px', right: '12px' }}
        />
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900 text-sm pr-16">{title}</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex flex-col items-center justify-center w-20 h-20 rounded-2xl ${level.bg} border ${level.text}`}>
            <span className="text-3xl font-extrabold leading-none">{uv}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wide mt-1">UV</span>
          </div>
          <div className="flex-1 min-w-0">
            <span className={`inline-block text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${level.text} bg-white/60 mb-2`}>
              {level.label}
            </span>
            <p className="text-gray-600 text-xs leading-relaxed">{level.recommendation}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
