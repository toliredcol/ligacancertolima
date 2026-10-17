import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronRight, Phone, MapPin, BookOpen, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Module, SliderImage, Testimonial, CustomPage, ChildrenStory } from '../lib/supabase';
import HeroSlider from '../components/HeroSlider';
import UvIndexWidget from '../components/UvIndexWidget';
import ModuleCard from '../components/ModuleCard';
import TestimonialCard from '../components/TestimonialCard';
import Header from '../components/Header';
import { useAppConfig } from '../lib/AppConfigContext';
import { safeExternalUrl } from '../lib/safeExternalUrl';
import leyendoEsperanza from '../assets/images/leyendoesperanza.png';
import esperanzaSenalando from '../assets/images/esperanzasenala.png';

export default function HomePage() {
  const [slides, setSlides] = useState<SliderImage[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [customPages, setCustomPages] = useState<CustomPage[]>([]);
  const [stories, setStories] = useState<ChildrenStory[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { logoUrl, footerLogoUrl, footerLogoSize, sliderDuration } = useAppConfig();

  useEffect(() => {
    const load = async () => {
      const [s, m, t, cp, st] = await Promise.all([
        supabase.from('slider_images').select('*').eq('is_active', true).order('order_index'),
        supabase.from('modules').select('*').order('order_index'),
        supabase.from('testimonials').select('*').eq('status', 'approved').order('created_at', { ascending: false }).limit(4),
        supabase.from('custom_pages').select('*').eq('show_on_home', true).order('order_index').order('created_at'),
        supabase.from('children_stories').select('*').order('order_index').order('created_at').limit(1),
      ]);
      setSlides(s.data ?? []);
      setModules(m.data ?? []);
      setTestimonials(t.data ?? []);
      setCustomPages(cp.data ?? []);
      setStories(st.data ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const moduleNames = Object.fromEntries(modules.map(m => [m.id, m.title]));
  const resolvedFooterLogo = footerLogoUrl || logoUrl;

  return (
    <div className="animate-fade-in">
      <Header />

      {/* Hero Slider */}
      {loading ? (
        <div className="skeleton w-full" style={{ height: 'clamp(200px, 55vw, 480px)' }} />
      ) : (
        <HeroSlider slides={slides} slideDurationMs={sliderDuration * 1000} />
      )}

      {/* UV Index widget */}
      <UvIndexWidget />

      {/* Modules section */}
      <section className="px-4 py-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-gray-900 font-bold text-lg">Módulos educativos</h2>
          <button
            onClick={() => navigate('/modulos')}
            className="flex items-center gap-1 text-red-600 text-sm font-medium"
          >
            Ver todos <ChevronRight size={16} />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton h-24 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {modules.map(mod => (
              <ModuleCard key={mod.id} module={mod} variant="list" />
            ))}
          </div>
        )}
      </section>

      {/* Stories banner — El Rincón de los Cuentos */}
      {!loading && stories.length > 0 && (
        <section className="px-4 mb-6 max-w-2xl mx-auto animate-fade-in">
          <button
            onClick={() => navigate('/el-rincon-de-los-cuentos')}
            className="w-full relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 p-5 sm:p-6 text-white shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-left"
          >
            {/* Decorative shapes */}
            <div className="absolute -top-10 -right-6 w-32 h-32 rounded-full bg-white/15 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-4 w-28 h-28 rounded-full bg-yellow-200/25 blur-2xl pointer-events-none" />
            <div className="absolute top-4 right-12 w-3 h-3 rounded-full bg-white/40 animate-pulse" />
            <div className="absolute bottom-6 right-8 w-2 h-2 rounded-full bg-white/30" />

            <div className="relative z-10 flex items-center gap-3 sm:gap-5">
              {/* Esperanza leyendo - main image */}
              <img
                src={leyendoEsperanza}
                alt="Esperanza, mascota de la Liga Contra el Cáncer"
                className="object-contain flex-shrink-0 pointer-events-none drop-shadow-lg"
                style={{ height: 140, width: 110 }}
              />

              {/* Text content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles size={14} className="text-yellow-100" />
                  <span className="text-yellow-100 text-[11px] font-bold uppercase tracking-wide">Espacio para niños</span>
                </div>
                <h2 className="font-extrabold text-lg leading-tight mb-1">
                  El Rincón de los Cuentos
                </h2>
                <p className="text-white/85 text-xs leading-relaxed line-clamp-2 mb-3">
                  Cuentos para Aprender y Cuidarnos. Descubre historias divertidas que enseñan a cuidar la salud.
                </p>
                <div className="flex items-center gap-1.5 bg-white/25 backdrop-blur-sm rounded-full px-4 py-2 shadow-md w-fit">
                  <BookOpen size={16} className="text-white" strokeWidth={2.5} />
                  <span className="font-bold text-xs whitespace-nowrap">Explorar cuentos</span>
                  <ArrowRight size={14} className="text-white" strokeWidth={2.5} />
                </div>
              </div>
            </div>
          </button>
        </section>
      )}

      {/* Call to action */}
      <section className="mx-4 mb-6 rounded-2xl bg-gradient-to-br from-red-700 to-red-900 p-6 text-white max-w-2xl md:mx-auto relative overflow-hidden">
        {/* Decorative animated shape */}
        <div className="cta-decorative absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/8 pointer-events-none" />
        <div className="relative z-10 flex items-end gap-4">
          <div className="relative w-24 h-36 flex-shrink-0 overflow-hidden self-end">
            <img
              src={esperanzaSenalando}
              alt="Esperanza, mascota de la Liga Contra el Cáncer"
              className="absolute left-1/2 top-0 h-60 w-40 max-w-none -translate-x-1/2 object-contain object-top pointer-events-none"
            />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-xl leading-tight mb-2">¿Listo para aprender y cuidarte?</h2>
            <p className="text-white/80 text-sm leading-relaxed mb-4">
              Completa los módulos, responde los quizzes y obtén tu diploma de educación en salud.
            </p>
            <button
              onClick={() => navigate('/modulos')}
              className="flex items-center gap-2 bg-white text-red-700 font-semibold py-3 px-5 rounded-xl text-sm active:scale-95 transition-transform"
            >
              Comenzar ahora <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Custom page buttons */}
      {!loading && customPages.length > 0 && (
        <section className="px-4 mb-6 max-w-2xl mx-auto space-y-5">
          {customPages.map(page => {
            const hasIcon = page.button_icon_url && page.button_icon_position;
            const iconLeft = hasIcon && page.button_icon_position === 'left';
            const iconRight = hasIcon && page.button_icon_position === 'right';
            const isExternal = page.content_type === 'external_url';
            const externalUrl = isExternal ? safeExternalUrl(page.external_url) : null;

            const openPage = () => {
              if (isExternal && externalUrl) {
                if (page.open_in_new_tab) {
                  window.open(externalUrl, '_blank', 'noopener,noreferrer');
                } else {
                  window.location.assign(externalUrl);
                }
                return;
              }
              navigate(`/pagina/${page.slug}`);
            };

            return (
              <div
                key={page.id}
                className="relative w-full animate-fade-in"
                style={{ overflow: 'visible' }}
              >
                {hasIcon && (
                  <img
                    src={page.button_icon_url!}
                    alt=""
                    className="absolute object-contain pointer-events-none z-20 drop-shadow-lg"
                    style={{
                      height: 72,
                      width: 'auto',
                      bottom: '-4px',
                      ...(iconLeft
                        ? { left: '-20px' }
                        : { right: '-20px' }),
                    }}
                  />
                )}
                <button
                  onClick={openPage}
                  className="w-full flex items-center justify-center gap-3 rounded-2xl font-semibold text-base shadow-lg
                    hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]
                    transition-all duration-200 relative z-10"
                  style={{
                    backgroundColor: page.button_bg_color,
                    color: page.button_text_color,
                    paddingTop: '1rem',
                    paddingBottom: '1rem',
                    paddingLeft: iconLeft ? '5.5rem' : '1.5rem',
                    paddingRight: iconRight ? '5.5rem' : '1.5rem',
                  }}
                >
                  <span>{page.button_text || page.title}</span>
                </button>
              </div>
            );
          })}
        </section>
      )}

      {/* Testimonials section */}
      {testimonials.length > 0 && (
        <section id="testimonios" className="px-4 py-2 pb-6 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-gray-900 font-bold text-lg">Historias reales</h2>
            <button
              onClick={() => navigate('/testimonios')}
              className="flex items-center gap-1 text-red-600 text-sm font-medium"
            >
              Ver todas <ChevronRight size={16} />
            </button>
          </div>
          <div className="space-y-3">
            {testimonials.slice(0, 2).map(t => (
              <TestimonialCard key={t.id} testimonial={t} moduleName={moduleNames[t.module_id ?? '']} />
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white px-4 py-8 mt-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex justify-center">
            <img
              src={resolvedFooterLogo}
              alt="Logo"
              className="object-contain opacity-90"
              style={{
                height: 56,
                transform: `scale(${footerLogoSize / 100})`,
                transformOrigin: 'center',
              }}
            />
          </div>
          <div className="space-y-2">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Contacto</p>
            <div className="flex items-center gap-2 text-gray-300 text-sm">
              <Phone size={14} className="text-gray-400" />
              <span>3174017856 · 3158137106</span>
            </div>
            <div className="flex items-start gap-2 text-gray-300 text-sm">
              <MapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <span>Zonal Tolima, Colombia</span>
            </div>
          </div>
          <p className="text-gray-500 text-xs text-center">
            © {new Date().getFullYear()} Liga Colombiana Contra el Cáncer - Zonal Tolima.<br />
            Aplicación educativa sin fines de lucro.
          </p>
        </div>
      </footer>
    </div>
  );
}
