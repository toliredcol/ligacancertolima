import { useEffect, useState, lazy, Suspense } from 'react';
import { BookOpen, Play, Brush, Gamepad2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { ChildrenStory } from '../lib/supabase';
import Header from '../components/Header';

const StoryViewer = lazy(() => import('../components/StoryViewer'));
const VideoViewer = lazy(() => import('../components/VideoViewer'));
const ColoringBookViewer = lazy(() => import('../components/ColoringBookViewer'));
const GameViewer = lazy(() => import('../components/GameViewer'));

type Filter = 'all' | 'coloring' | 'video' | 'pdf' | 'game';

export default function StoriesPage() {
  const [stories, setStories] = useState<ChildrenStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedStory, setSelectedStory] = useState<ChildrenStory | null>(null);

  useEffect(() => {
    supabase
      .from('children_stories')
      .select('*')
      .order('order_index')
      .order('created_at')
      .then(({ data }) => {
        setStories(data ?? []);
        setLoading(false);
      });
  }, []);

  const isVideo = selectedStory?.content_type === 'video';
  const isColoring = selectedStory?.content_type === 'coloring';
  const isGame = selectedStory?.content_type === 'game';

  const filters: { value: Filter; label: string; available: boolean }[] = [
    { value: 'all', label: 'Todos', available: true },
    { value: 'coloring', label: 'Para colorear en línea', available: stories.some(s => s.content_type === 'coloring') },
    { value: 'video', label: 'Video', available: stories.some(s => s.content_type === 'video') },
    { value: 'pdf', label: 'Descargable para imprimir', available: stories.some(s => s.content_type === 'pdf') },
    { value: 'game', label: 'Juego en línea', available: stories.some(s => s.content_type === 'game') },
  ];

  const visibleStories = filter === 'all' ? stories : stories.filter(s => s.content_type === filter);

  return (
    <div className="animate-fade-in min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-rose-50">
      <Header title="El Rincón de los Cuentos" colorHex="#f59e0b" />

      {/* Hero / Welcome */}
      <div className="relative overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute top-4 right-4 w-24 h-24 rounded-full bg-amber-200/40 blur-2xl pointer-events-none" />
        <div className="absolute top-12 left-4 w-16 h-16 rounded-full bg-rose-200/40 blur-xl pointer-events-none" />

        <div className="max-w-2xl mx-auto px-4 py-8 text-center relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg mb-4">
            <BookOpen size={32} className="text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 mb-2">
            Cuentos para Aprender y Cuidarnos
          </h1>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-md mx-auto">
            Bienvenidos a un espacio donde los ninos y sus familias pueden
            descubrir historias divertidas que ensenan a cuidar la salud.
            Toca un cuento para leerlo y descargarlo para imprimir y colorear.
          </p>
        </div>
      </div>

      {/* Stories grid */}
      <div className="max-w-2xl mx-auto px-4 pb-12">
        {/* Filter chips */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {filters
            .filter(f => f.available)
            .map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  filter === f.value
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                }`}
              >
                {f.label}
              </button>
            ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton aspect-[3/4] rounded-2xl" />
            ))}
          </div>
        ) : visibleStories.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-md mb-4">
              <BookOpen size={36} className="text-amber-300" />
            </div>
            <p className="text-gray-500 font-semibold text-base">Pronto tendremos cuentos para ti</p>
            <p className="text-gray-400 text-sm mt-1">Estamos preparando historias maravillosas</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {visibleStories.map(story => {
              const isVideoCard = story.content_type === 'video';
              const isColoringCard = story.content_type === 'coloring';
              const isGameCard = story.content_type === 'game';
              return (
                <button
                  key={story.id}
                  onClick={() => setSelectedStory(story)}
                  className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 active:scale-95 bg-white"
                >
                  {/* Thumbnail */}
                  <div className="aspect-[3/4] overflow-hidden bg-gradient-to-br from-amber-100 to-orange-100">
                    <img
                      src={story.thumbnail_url}
                      alt={story.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={e => {
                        (e.target as HTMLImageElement).style.opacity = '0.3';
                      }}
                    />
                  </div>

                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Play icon for video cards */}
                  {isVideoCard && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-12 h-12 rounded-full bg-red-500/90 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-red-500 transition-all duration-300">
                        <Play size={22} className="text-white ml-0.5" fill="currentColor" />
                      </div>
                    </div>
                  )}

                  {/* Palette icon for coloring cards */}
                  {isColoringCard && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/90 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-emerald-500 transition-all duration-300">
                        <Brush size={22} className="text-white" />
                      </div>
                    </div>
                  )}

                  {/* Controller icon for game cards */}
                  {isGameCard && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-12 h-12 rounded-full bg-sky-500/90 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-sky-500 transition-all duration-300">
                        <Gamepad2 size={22} className="text-white" />
                      </div>
                    </div>
                  )}

                  {/* Title */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white font-bold text-sm leading-tight line-clamp-2 drop-shadow-lg">
                      {story.title}
                    </p>
                    {story.description && (
                      <p className="text-white/80 text-[10px] mt-0.5 line-clamp-1">
                        {story.description}
                      </p>
                    )}
                  </div>

                  {/* Hover glow effect */}
                  <div className={`absolute inset-0 rounded-2xl ring-2 ${isVideoCard ? 'ring-red-400/0 group-hover:ring-red-400/60' : isColoringCard ? 'ring-emerald-400/0 group-hover:ring-emerald-400/60' : isGameCard ? 'ring-sky-400/0 group-hover:ring-sky-400/60' : 'ring-amber-400/0 group-hover:ring-amber-400/60'} transition-all duration-300 pointer-events-none`} />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Story viewer overlay (PDF only) */}
      {selectedStory && !isVideo && !isColoring && !isGame && (
        <Suspense
          fallback={
            <div className="fixed inset-0 z-[100] bg-gray-900 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-gray-600 border-t-amber-400 rounded-full animate-spin" />
            </div>
          }
        >
          <StoryViewer
            pdfUrl={selectedStory.pdf_url!}
            title={selectedStory.title}
            onClose={() => setSelectedStory(null)}
          />
        </Suspense>
      )}

      {/* Video viewer overlay (video only) */}
      {selectedStory && isVideo && (
        <Suspense
          fallback={
            <div className="fixed inset-0 z-[100] bg-gray-900 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-gray-600 border-t-red-400 rounded-full animate-spin" />
            </div>
          }
        >
          <VideoViewer
            youtubeUrl={selectedStory.youtube_url ?? ''}
            title={selectedStory.title}
            onClose={() => setSelectedStory(null)}
          />
        </Suspense>
      )}

      {/* Coloring book viewer overlay (coloring only) */}
      {selectedStory && isColoring && (
        <Suspense
          fallback={
            <div className="fixed inset-0 z-[100] bg-gray-900 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-gray-600 border-t-emerald-400 rounded-full animate-spin" />
            </div>
          }
        >
          <ColoringBookViewer
            htmlUrl={selectedStory.html_file_url ?? ''}
            title={selectedStory.title}
            onClose={() => setSelectedStory(null)}
          />
        </Suspense>
      )}

      {/* Game viewer overlay (game only) */}
      {selectedStory && isGame && (
        <Suspense
          fallback={
            <div className="fixed inset-0 z-[100] bg-gray-900 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-gray-600 border-t-sky-400 rounded-full animate-spin" />
            </div>
          }
        >
          <GameViewer
            gameUrl={selectedStory.game_url ?? ''}
            title={selectedStory.title}
            onClose={() => setSelectedStory(null)}
          />
        </Suspense>
      )}
    </div>
  );
}
