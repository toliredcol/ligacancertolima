import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { SliderImage } from '../lib/supabase';
import { safeExternalUrl } from '../lib/safeExternalUrl';

type EffectName =
  | 'fade'
  | 'slide-left'
  | 'slide-up'
  | 'zoom-in'
  | 'cube'
  | 'flip'
  | 'ken-burns'
  | 'blur-fade';

const VALID_EFFECTS: EffectName[] = [
  'fade', 'slide-left', 'slide-up', 'zoom-in',
  'cube', 'flip', 'ken-burns', 'blur-fade',
];

function normalizeEffect(raw: string | null | undefined): EffectName {
  if (raw && VALID_EFFECTS.includes(raw as EffectName)) return raw as EffectName;
  return 'fade';
}

interface Props {
  slides: SliderImage[];
  slideDurationMs?: number;
}

export default function HeroSlider({ slides, slideDurationMs = 5000 }: Props) {
  const [current, setCurrent] = useState(0);
  const [entering, setEntering] = useState(false);
  const [paused, setPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<number | null>(null);
  const navigate = useNavigate();
  const activeSlides = slides.filter(s => s.is_active);

  const goTo = useCallback((nextIdx: number) => {
    setEntering(true);
    setCurrent(nextIdx);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setEntering(false));
    });
  }, []);

  const goNext = useCallback(() => {
    goTo((current + 1) % activeSlides.length);
  }, [current, activeSlides.length, goTo]);

  const goPrev = useCallback(() => {
    goTo((current - 1 + activeSlides.length) % activeSlides.length);
  }, [current, activeSlides.length, goTo]);

  useEffect(() => {
    if (paused || activeSlides.length <= 1) return;
    const t = setInterval(goNext, slideDurationMs);
    return () => clearInterval(t);
  }, [paused, goNext, activeSlides.length, slideDurationMs]);

  const handleSlideClick = (slide: SliderImage) => {
    if (isDragging) return;
    if (slide.link_type === 'module' && slide.link_value) navigate(`/modulo/${slide.link_value}`);
    else if (slide.link_type === 'section' && slide.link_value) {
      const el = document.getElementById(slide.link_value);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (slide.link_type === 'external' && slide.link_value) {
      const target = safeExternalUrl(slide.link_value);
      if (target) window.open(target, '_blank', 'noopener,noreferrer');
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    dragStart.current = e.touches[0].clientX;
    setPaused(true);
    setIsDragging(false);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (dragStart.current === null) return;
    const diff = dragStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      setIsDragging(true);
      diff > 0 ? goNext() : goPrev();
    }
    dragStart.current = null;
    setTimeout(() => setPaused(false), 1000);
  };

  if (!activeSlides.length) {
    return (
      <div className="w-full bg-gradient-to-br from-red-700 to-red-900 flex items-center justify-center" style={{ height: '55vw', minHeight: 200, maxHeight: 480 }}>
        <p className="text-white text-lg font-semibold">Liga Contra el Cáncer - Zonal Tolima</p>
      </div>
    );
  }

  // The effect of the incoming (current) slide drives the transition
  const currentEffect = normalizeEffect(activeSlides[current]?.transition_effect);

  return (
    <div
      className="relative w-full overflow-hidden bg-gray-900 select-none"
      style={{ height: 'clamp(200px, 55vw, 480px)', perspective: '1200px' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {activeSlides.map((s, i) => {
        const isActive = i === current;
        const effect = normalizeEffect(s.transition_effect);

        let style: React.CSSProperties;

        if (isActive) {
          if (entering) {
            // Starting state for the entering slide, based on its own effect
            const enterFrom: Record<EffectName, React.CSSProperties> = {
              'fade':         { opacity: 0 },
              'slide-left':   { opacity: 0, transform: 'translateX(60px)' },
              'slide-up':     { opacity: 0, transform: 'translateY(40px)' },
              'zoom-in':      { opacity: 0, transform: 'scale(1.08)' },
              'cube':         { opacity: 0, transform: 'rotateY(90deg) translateZ(-40px)' },
              'flip':         { opacity: 0, transform: 'rotateY(180deg)' },
              'ken-burns':    { opacity: 0, transform: 'scale(1.18)' },
              'blur-fade':    { opacity: 0, filter: 'blur(18px)' },
            };
            style = {
              ...enterFrom[effect],
              zIndex: 10,
              transition: 'none',
            };
          } else {
            // Settled state — animate to final position
            const transitions: Record<EffectName, string> = {
              'fade':         'opacity 0.7s ease',
              'slide-left':   'opacity 0.7s ease, transform 0.7s ease',
              'slide-up':     'opacity 0.7s ease, transform 0.7s ease',
              'zoom-in':      'opacity 0.7s ease, transform 0.7s ease',
              'cube':         'opacity 0.7s ease, transform 0.7s ease',
              'flip':         'opacity 0.7s ease, transform 0.7s ease',
              'ken-burns':    'opacity 0.8s ease, transform 6s linear',
              'blur-fade':    'opacity 0.8s ease, filter 0.8s ease',
            };
            style = {
              opacity: 1,
              transform: 'translateX(0) translateY(0) scale(1) rotateY(0deg)',
              filter: 'blur(0px)',
              zIndex: 10,
              transition: transitions[effect],
            };
          }
        } else {
          // Leaving slide — fade out
          style = {
            opacity: 0,
            zIndex: 0,
            transition: 'opacity 0.5s ease',
          };
        }

        // Ken Burns: apply slow pan to the image element while slide is settled
        const isKenBurns = effect === 'ken-burns' && isActive && !entering;

        return (
          <div
            key={s.id}
            className="absolute inset-0"
            style={{
              ...style,
              cursor: s.link_type !== 'none' ? 'pointer' : 'default',
              transformStyle: 'preserve-3d',
              backfaceVisibility: effect === 'flip' || effect === 'cube' ? 'hidden' : 'visible',
            }}
            onClick={() => handleSlideClick(s)}
          >
            <img
              src={s.image_url}
              alt={s.title ?? ''}
              className="w-full h-full object-cover"
              loading={i === 0 ? 'eager' : 'lazy'}
              style={isKenBurns ? {
                transform: 'scale(1.12) translate(2%, -1.5%)',
                transition: 'transform 6s linear',
              } : undefined}
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=800`;
              }}
            />
            {(s.title || s.subtitle) && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-5">
                {s.title && (
                  <h2 className="text-white font-bold text-xl md:text-3xl leading-tight drop-shadow-lg"
                    style={{ overflowWrap: 'break-word' }}>
                    {s.title}
                  </h2>
                )}
                {s.subtitle && (
                  <p className="text-white/90 text-sm md:text-base mt-1 drop-shadow"
                    style={{ overflowWrap: 'break-word' }}>
                    {s.subtitle}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Desktop arrows */}
      {activeSlides.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/40 hover:bg-black/60 rounded-full items-center justify-center text-white transition-colors"
            aria-label="Anterior"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/40 hover:bg-black/60 rounded-full items-center justify-center text-white transition-colors"
            aria-label="Siguiente"
          >
            <ChevronRight size={22} />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {activeSlides.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center gap-1.5">
          {activeSlides.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); goTo(i); }}
              className={`rounded-full transition-all duration-300 ${
                i === current ? 'w-5 h-2 bg-white' : 'w-2 h-2 bg-white/50'
              }`}
              aria-label={`Ir al slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
