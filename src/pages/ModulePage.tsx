import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Shield, Share2, ChevronRight, CheckCircle2, XCircle,
  Trophy, Download, Play, FileText, ClipboardList,
  ExternalLink, Shuffle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Module, ContentBlock, QuizQuestion, Video, Resource, MatchingGamePair } from '../lib/supabase';
import Header from '../components/Header';
import UvIndexWidget from '../components/UvIndexWidget';
import ContentBlockRenderer, { SkeletonBlock } from '../components/ContentBlockRenderer';
import ShareButtons from '../components/ShareButtons';
import { getModuleHex } from '../lib/moduleColors';
import Confetti from '../components/Confetti';
import DiplomaModal from '../components/DiplomaModal';
import MatchingGame from '../components/MatchingGame';

import esperanzaSenalando from '../assets/images/esperanza-senalando.png';
import esperanzaLeyendo from '../assets/images/esperanza-leyendo.png';
import esperanzaCelebrando from '../assets/images/esperanza-celebrando.png';

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

export default function ModulePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [mod, setMod] = useState<Module | null>(null);
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [pairs, setPairs] = useState<MatchingGamePair[]>([]);
  const [loading, setLoading] = useState(true);
  const [preTestDone, setPreTestDone] = useState(false);
  const [activeSection, setActiveSection] = useState<'content' | 'videos' | 'docs' | 'test'>('content');

  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      const { data: modData } = await supabase.from('modules').select('*').eq('slug', slug).maybeSingle();
      if (!modData) { navigate('/modulos'); return; }
      setMod(modData);
      const [b, q, v, r, mgp] = await Promise.all([
        supabase.from('content_blocks').select('*').eq('module_id', modData.id).order('order_index'),
        supabase.from('quiz_questions').select('*').eq('module_id', modData.id).order('order_index'),
        supabase.from('videos').select('*').eq('module_id', modData.id).order('order_index'),
        supabase.from('resources').select('*').eq('module_id', modData.id).order('order_index'),
        supabase.from('matching_game_pairs').select('*').eq('module_id', modData.id).order('order_index'),
      ]);
      setBlocks(b.data ?? []);
      setQuestions(q.data ?? []);
      setVideos(v.data ?? []);
      setResources(r.data ?? []);
      setPairs(mgp.data ?? []);
      setLoading(false);
    };
    load();
  }, [slug, navigate]);

  const accentColor = slug ? getModuleHex(slug) : '#C41E3A';
  const pngSrc = mod ? PNG_ICON_MAP[mod.icon] : undefined;

  const galleryBlock = [...blocks].reverse().find(b => b.block_type === 'images' && b.title === 'Galería de Infografías');
  const contentBlocks = galleryBlock ? blocks.filter(b => b.id !== galleryBlock.id) : blocks;

  const handleShare = async () => {
    const url = window.location.href;
    const title = mod?.title ?? 'Módulo educativo';
    if (navigator.share) {
      await navigator.share({ title, url });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${title} - ${url}`)}`, '_blank');
    }
  };

  const scrollToSection = (id: string) => {
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  if (loading) return (
    <div className="animate-fade-in">
      <Header showBack title="Cargando..." />
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {[...Array(5)].map((_, i) => <SkeletonBlock key={i} />)}
      </div>
    </div>
  );

  if (!mod) return null;

  const navItems = [
    { id: 'section-content', key: 'content' as const, icon: ClipboardList, label: 'Contenido', count: contentBlocks.length },
    { id: 'section-videos', key: 'videos' as const, icon: Play, label: 'Videos', count: videos.length },
    { id: 'section-docs', key: 'docs' as const, icon: FileText, label: 'Documentos', count: resources.length },
    { id: 'section-test', key: 'test' as const, icon: ClipboardList, label: 'Test', count: questions.length },
    ...(mod.matching_game_active && pairs.length > 0 ? [{ id: 'section-game', key: 'game' as const, icon: Shuffle, label: 'Juego', count: pairs.length }] : []),
  ];

  return (
    <div className="animate-fade-in pb-8">
      <Header showBack title={mod.title} colorHex={accentColor} />

      {/* Module hero */}
      <div
        className="px-4 py-7"
        style={{
          background: `linear-gradient(135deg, ${accentColor}cc 0%, ${accentColor} 50%, ${accentColor}e6 100%)`,
        }}
      >
        <div className="max-w-2xl mx-auto flex items-center gap-5">
          {/* Icon with white circle + glow */}
          <div
            className="icon-pop-in flex-shrink-0 w-20 h-20 rounded-full bg-white/20 flex items-center justify-center"
            style={{ boxShadow: `0 0 28px rgba(255,255,255,0.35), 0 0 8px rgba(255,255,255,0.2)` }}
          >
            {pngSrc ? (
              <img src={pngSrc} alt={mod.title} className="w-14 h-14 object-contain drop-shadow-md" />
            ) : (
              <Shield size={44} className="text-white drop-shadow-md" />
            )}
          </div>

          {/* Title + description + share */}
          <div className="flex-1 min-w-0">
            <h1 className="text-white font-extrabold text-xl leading-tight drop-shadow mb-1">{mod.title}</h1>
            <p className="text-white/85 text-xs leading-relaxed line-clamp-3">{mod.description}</p>
            <button
              onClick={handleShare}
              className="mt-3 flex items-center gap-2 bg-white/20 hover:bg-white/30 active:scale-95 transition-all text-white text-xs font-medium px-3 py-2 rounded-full"
            >
              <Share2 size={13} />
              Compartir módulo
            </button>
          </div>
        </div>
      </div>

      {/* Sub-navigation */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-3 flex gap-1 overflow-x-auto scrollbar-hide py-2">
          {navItems.map(({ id, key, icon: Icon, label, count }) => {
            const isActive = activeSection === key;
            const hasContent = count > 0;
            return (
              <button
                key={key}
                onClick={() => {
                  setActiveSection(key);
                  scrollToSection(id);
                }}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
                  isActive
                    ? 'text-white shadow-sm'
                    : hasContent
                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    : 'bg-gray-50 text-gray-300'
                }`}
                style={isActive ? { backgroundColor: accentColor } : undefined}
              >
                <Icon size={14} />
                <span>{label}</span>
                {count > 0 && (
                  <span
                    className={`text-[10px] rounded-full px-1.5 py-0.5 font-bold min-w-[18px] text-center leading-none ${
                      isActive ? 'bg-white/25 text-white' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-12">

        {/* Pre-test — shown before content */}
        {questions.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: accentColor + '18' }}>
                <ClipboardList size={18} style={{ color: accentColor }} />
              </div>
              <h2 className="text-gray-900 font-bold text-lg">Pre-test</h2>
            </div>
            <SliderPreTest
              questions={questions}
              accentColor={accentColor}
              onDone={() => setPreTestDone(true)}
              isDone={preTestDone}
            />
          </div>
        )}

        {/* Content section */}
        <section id="section-content">
          {slug === 'piel' && (
            <div className="mb-6">
              <UvIndexWidget />
            </div>
          )}
          <div className="module-headings-center space-y-6">
            {contentBlocks.map(block => (
              <div key={block.id} id={`block-${block.id}`}>
                <ContentBlockRenderer block={block} accentColor={accentColor} />
              </div>
            ))}
          </div>
          {galleryBlock && (
            <>
              {/* Separator with Esperanza */}
              <div className="flex items-center gap-3 mt-6 mb-2 px-3 py-2.5 rounded-2xl bg-gray-50 border border-gray-100">
                <img
                  src={esperanzaSenalando}
                  alt="Esperanza, mascota de la Liga Contra el Cáncer"
                  className="object-contain flex-shrink-0"
                  style={{ height: 70, maxWidth: 55 }}
                />
                <p className="text-sm font-semibold text-gray-600 leading-snug">¡Mira estas imágenes!</p>
              </div>
              <div className="module-headings-center mt-3">
                <ContentBlockRenderer block={galleryBlock} accentColor={accentColor} />
              </div>
            </>
          )}
        </section>

        {/* Videos section */}
        <section id="section-videos">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: accentColor + '18' }}>
              <Play size={18} style={{ color: accentColor }} />
            </div>
            <h2 className="text-gray-900 font-bold text-lg">Videos</h2>
          </div>
          {videos.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center">
              <Play size={28} className="text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No hay videos disponibles para este módulo aún.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {videos.map(video => (
                <div key={video.id} className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-white">
                  <div className="video-container">
                    <iframe
                      src={`https://www.youtube.com/embed/${video.youtube_id}`}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div className="p-4">
                    <p className="font-semibold text-gray-900 text-sm">{video.title}</p>
                    {video.description && (
                      <p className="text-gray-500 text-xs mt-1 leading-relaxed">{video.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Documentos section */}
        <section id="section-docs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: accentColor + '18' }}>
              <FileText size={18} style={{ color: accentColor }} />
            </div>
            <h2 className="text-gray-900 font-bold text-lg">Documentos</h2>
          </div>
          {resources.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center">
              <FileText size={28} className="text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No hay documentos disponibles para este módulo aún.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {resources.map(res => (
                <a
                  key={res.id}
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm active:scale-[0.98] transition-transform hover:border-gray-200 group"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: accentColor + '18' }}>
                    <FileText size={18} style={{ color: accentColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{res.title}</p>
                    {res.description && (
                      <p className="text-gray-500 text-xs mt-0.5 truncate">{res.description}</p>
                    )}
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full mt-1 inline-block"
                      style={{ backgroundColor: accentColor + '18', color: accentColor }}
                    >
                      {res.file_type}
                    </span>
                  </div>
                  <ExternalLink size={16} className="text-gray-300 group-hover:text-gray-500 flex-shrink-0 transition-colors" />
                </a>
              ))}
            </div>
          )}
        </section>

        {/* Post-test section */}
        <section id="section-test">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: accentColor + '18' }}>
              <ClipboardList size={18} style={{ color: accentColor }} />
            </div>
            <h2 className="text-gray-900 font-bold text-lg">Post-test</h2>
          </div>

          {questions.length > 0 ? (
            preTestDone ? (
              <PostTest questions={questions} module={mod} accentColor={accentColor} />
            ) : (
              <div className="rounded-2xl border-2 border-dashed p-6 text-center" style={{ borderColor: accentColor + '40' }}>
                <ClipboardList size={28} className="mx-auto mb-3" style={{ color: accentColor + '80' }} />
                <p className="text-sm font-semibold" style={{ color: accentColor }}>
                  Completa el pre-test primero
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Responde el pre-test al inicio del módulo para desbloquear el post-test y obtener tu diploma.
                </p>
              </div>
            )
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center">
              <ClipboardList size={28} className="text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No hay preguntas de test para este módulo aún.</p>
            </div>
          )}
        </section>

        {/* Matching game section */}
        {mod.matching_game_active && pairs.length > 0 && (
          <section id="section-game">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: accentColor + '18' }}>
                <Shuffle size={18} style={{ color: accentColor }} />
              </div>
              <h2 className="text-gray-900 font-bold text-lg">Empareja conceptos</h2>
            </div>
            {/* Separator with Esperanza inviting to play */}
            <div className="flex items-center gap-3 mb-4 px-3 py-2.5 rounded-2xl bg-gray-50 border border-gray-100">
              <img
                src={esperanzaLeyendo}
                alt="Esperanza, mascota de la Liga Contra el Cáncer"
                className="object-contain flex-shrink-0"
                style={{ height: 70, maxWidth: 55 }}
              />
              <p className="text-sm font-semibold text-gray-600 leading-snug">¡Pongamos a prueba lo aprendido!</p>
            </div>
            <MatchingGame moduleId={mod.id} accentColor={accentColor} />
          </section>
        )}

        <ShareButtons moduleTitle={mod.title} />
      </div>
    </div>
  );
}

// ─── Pre-test Slider ──────────────────────────────────────────────────────────

interface SliderPreTestProps {
  questions: QuizQuestion[];
  accentColor: string;
  onDone: () => void;
  isDone: boolean;
}

function SliderPreTest({ questions, accentColor, onDone, isDone }: SliderPreTestProps) {
  const [slide, setSlide] = useState(0);
  const [answers, setAnswers] = useState<{ selected: number; correct: boolean }[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const [allDone, setAllDone] = useState(isDone);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const q = questions[slide];

  const handleSelect = (idx: number) => {
    if (selected !== null || allDone) return;
    const isCorrect = idx === q.correct_index;
    setSelected(idx);
    setShowFeedback(true);
    setAnswers(prev => [...prev, { selected: idx, correct: isCorrect }]);

    if (isCorrect) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);
    }

    timerRef.current = setTimeout(() => {
      if (slide + 1 >= questions.length) {
        setAllDone(true);
        onDone();
      } else {
        setSlide(s => s + 1);
        setSelected(null);
        setShowFeedback(false);
        setAnimKey(k => k + 1);
      }
    }, 1600);
  };

  if (allDone) {
    const score = answers.filter(a => a.correct).length;
    return (
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-5 pt-5 pb-5 space-y-4">
          <div
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full"
            style={{ backgroundColor: accentColor + '18', color: accentColor }}
          >
            Pre-test completado
          </div>
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <img
                src={esperanzaCelebrando}
                alt="Esperanza, mascota de la Liga Contra el Cáncer"
                className="object-contain"
                style={{ height: 120, maxWidth: 100 }}
              />
            </div>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: accentColor + '15' }}>
              <CheckCircle2 size={32} style={{ color: accentColor }} />
            </div>
            <p className="text-3xl font-extrabold" style={{ color: accentColor }}>{score}/{questions.length}</p>
            <p className="text-gray-500 text-sm">respuestas correctas en el pre-test</p>
          </div>
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold"
            style={{ backgroundColor: accentColor + '15', color: accentColor }}
          >
            <CheckCircle2 size={16} />
            Pre-test guardado. Continúa leyendo el contenido y luego completa el post-test.
          </div>
        </div>
      </div>
    );
  }

  const lastAnswer = answers[answers.length - 1];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      {showConfetti && <Confetti />}

      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full"
            style={{ backgroundColor: accentColor + '18', color: accentColor }}
          >
            Pre-test
          </div>
          <span className="text-xs text-gray-400 font-medium">{slide + 1} / {questions.length}</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${(slide / questions.length) * 100}%`, backgroundColor: accentColor }}
          />
        </div>
      </div>

      <div key={animKey} className="px-5 pb-5 space-y-4 slide-in">
        <p className="font-semibold text-gray-900 text-[15px] leading-snug">
          {slide + 1}. {q.question}
        </p>

        <div className="space-y-2.5">
          {(q.options as string[]).map((opt, idx) => {
            const isCorrect = idx === q.correct_index;
            const isSelected = idx === selected;
            let cls = 'border-gray-200 bg-white text-gray-700';
            if (showFeedback) {
              if (isCorrect) cls = 'border-green-400 bg-green-50 text-green-800';
              else if (isSelected) cls = 'border-red-400 bg-red-50 text-red-800';
            }
            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={selected !== null}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 text-sm font-medium ${cls} ${selected === null ? 'active:scale-[0.98] hover:border-gray-300' : ''}`}
              >
                <span className="flex-1 leading-snug">{opt}</span>
                {showFeedback && isCorrect && <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />}
                {showFeedback && isSelected && !isCorrect && <XCircle size={18} className="text-red-500 flex-shrink-0" />}
              </button>
            );
          })}
        </div>

        {showFeedback && lastAnswer && (
          <div
            className={`flex items-start gap-2 px-4 py-3 rounded-xl text-sm font-medium animate-fade-in ${
              lastAnswer.correct
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {lastAnswer.correct ? (
              <>
                <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5 text-green-600" />
                <span>¡Correcto!</span>
              </>
            ) : (
              <>
                <XCircle size={16} className="flex-shrink-0 mt-0.5 text-red-500" />
                <span>Respuesta correcta: <strong>{(q.options as string[])[q.correct_index]}</strong></span>
              </>
            )}
          </div>
        )}

        <div className="flex items-center justify-center gap-1.5 pt-1">
          {questions.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === slide ? 20 : 8,
                height: 8,
                backgroundColor: i < slide ? accentColor : i === slide ? accentColor : '#e5e7eb',
                opacity: i < slide ? 0.5 : 1,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Post-test ────────────────────────────────────────────────────────────────

interface PostTestProps {
  questions: QuizQuestion[];
  module: Module;
  accentColor: string;
}

function PostTest({ questions, module: mod, accentColor }: PostTestProps) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [finished, setFinished] = useState(false);
  const [shakeIdx, setShakeIdx] = useState<number | null>(null);
  const [showDiploma, setShowDiploma] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const q = questions[current];
  const score = answers.filter(Boolean).length;
  const passed = score >= Math.ceil(questions.length * 0.6);
  const progress = ((current + (selected !== null ? 1 : 0)) / questions.length) * 100;

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const correct = idx === q.correct_index;
    if (!correct) { setShakeIdx(idx); setTimeout(() => setShakeIdx(null), 600); }
    setShowExplanation(true);
    setAnswers(prev => [...prev, correct]);
  };

  const handleNext = async () => {
    if (current + 1 >= questions.length) {
      setFinished(true);
      if (passed) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
        await supabase.from('quiz_completions').insert({
          module_id: mod.id,
          user_name: 'Participante',
          score,
          total_questions: questions.length,
        });
      }
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setShowExplanation(false);
    }
    setTimeout(() => containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const handleRestart = () => {
    setCurrent(0); setSelected(null); setAnswers([]);
    setShowExplanation(false); setFinished(false); setShowConfetti(false);
  };

  return (
    <div ref={containerRef} className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      {showConfetti && <Confetti />}
      <div className="px-5 pt-5 pb-3">
        <div
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3"
          style={{ backgroundColor: accentColor + '18', color: accentColor }}
        >
          Post-test
        </div>
        <h3 className="font-bold text-gray-900 text-base leading-snug">
          ¿Qué aprendiste sobre {mod.title}?
        </h3>
        <p className="text-gray-400 text-xs mt-1">Pon a prueba lo que aprendiste</p>
      </div>

      {finished ? (
        <div className="px-5 pb-5 space-y-4 text-center">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: accentColor + '15' }}>
              <Trophy size={40} style={{ color: accentColor }} />
            </div>
          </div>
          <div>
            <div className="flex justify-center mb-2">
              <img
                src={esperanzaCelebrando}
                alt="Esperanza, mascota de la Liga Contra el Cáncer"
                className="object-contain"
                style={{ height: 120, maxWidth: 100 }}
              />
            </div>
            <p className="text-xl font-bold text-gray-900">¡Quiz completado!</p>
            <p className="text-4xl font-extrabold mt-2" style={{ color: accentColor }}>{score}/{questions.length}</p>
            <p className="text-gray-500 text-sm mt-1">{passed ? '¡Excelente! Has aprobado el módulo.' : 'Sigue aprendiendo, ¡tú puedes!'}</p>
          </div>
          <div className="flex flex-col gap-3">
            {passed && (
              <button
                onClick={() => setShowDiploma(true)}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-white font-semibold text-sm active:scale-95 transition-transform"
                style={{ backgroundColor: accentColor }}
              >
                <Download size={18} />
                Obtener mi diploma
              </button>
            )}
            <button onClick={handleRestart} className="w-full py-3.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm">
              Repetir post-test
            </button>
          </div>
          {showDiploma && (
            <DiplomaModal module={mod} score={score} total={questions.length} onClose={() => setShowDiploma(false)} />
          )}
        </div>
      ) : (
        <div className="pb-5">
          <div className="h-1.5 bg-gray-100 mx-5 mb-4 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: accentColor }} />
          </div>
          <div className="px-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-medium">Pregunta {current + 1} de {questions.length}</span>
              <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: accentColor + '15', color: accentColor }}>{score} correctas</span>
            </div>
            <p className="font-semibold text-gray-900 text-[15px] leading-snug">{q.question}</p>
            <div className="space-y-2.5">
              {(q.options as string[]).map((opt, idx) => {
                const isCorrect = idx === q.correct_index;
                const isSelected = idx === selected;
                let cls = 'border-gray-200 bg-white text-gray-700';
                if (selected !== null) {
                  if (isCorrect) cls = 'border-green-400 bg-green-50 text-green-800';
                  else if (isSelected) cls = 'border-red-400 bg-red-50 text-red-800';
                }
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    disabled={selected !== null}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 min-h-[52px] text-sm font-medium ${cls} ${shakeIdx === idx ? 'animate-shake' : ''} ${selected === null ? 'active:scale-[0.98] hover:border-gray-300' : ''}`}
                  >
                    <span className="flex-1 leading-snug">{opt}</span>
                    {selected !== null && isCorrect && <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />}
                    {selected !== null && isSelected && !isCorrect && <XCircle size={18} className="text-red-500 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
            {showExplanation && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 animate-fade-in">
                <p className="text-blue-800 text-sm leading-relaxed">{q.explanation}</p>
              </div>
            )}
            {selected !== null && (
              <button
                onClick={handleNext}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-semibold text-sm transition-transform active:scale-95"
                style={{ backgroundColor: accentColor }}
              >
                {current + 1 >= questions.length ? 'Ver resultado' : 'Siguiente pregunta'}
                <ChevronRight size={18} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
