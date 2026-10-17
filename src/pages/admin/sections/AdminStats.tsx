import { useEffect, useState } from 'react';
import { Trophy, Award, MessageCircle, Image, TrendingUp } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

export default function AdminStats() {
  const [stats, setStats] = useState({ quizzes: 0, diplomas: 0, pending: 0, slides: 0 });
  const [completionsByModule, setCompletionsByModule] = useState<{ title: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [qc, t, s, m, completions] = await Promise.all([
        supabase.from('quiz_completions').select('id, score, total_questions', { count: 'exact' }),
        supabase.from('testimonials').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('slider_images').select('id', { count: 'exact' }),
        supabase.from('modules').select('id, title').order('order_index'),
        supabase.from('quiz_completions').select('module_id, score, total_questions'),
      ]);
      const all = qc.data ?? [];
      const diplomas = all.filter(c => c.total_questions > 0 && (c.score ?? 0) / c.total_questions >= 0.6).length;
      setStats({ quizzes: qc.count ?? 0, diplomas, pending: t.count ?? 0, slides: s.count ?? 0 });
      const mods = m.data ?? [];
      const comp = completions.data ?? [];
      setCompletionsByModule(mods.map(mod => ({
        title: mod.title,
        count: comp.filter(c => c.module_id === mod.id).length,
      })));
      setLoading(false);
    };
    load();
  }, []);

  const cards = [
    { icon: Trophy, label: 'Quizzes completados', value: stats.quizzes, color: 'text-amber-500', bg: 'bg-amber-50' },
    { icon: Award, label: 'Diplomas generados', value: stats.diplomas, color: 'text-red-500', bg: 'bg-red-50' },
    { icon: MessageCircle, label: 'Testimonios pendientes', value: stats.pending, color: 'text-blue-500', bg: 'bg-blue-50' },
    { icon: Image, label: 'Slides activos', value: stats.slides, color: 'text-teal-500', bg: 'bg-teal-50' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Estadísticas</h1>
        <p className="text-gray-500 text-sm mt-1">Resumen de actividad de la aplicación</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={20} className={color} />
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{loading ? '—' : value}</p>
            <p className="text-gray-400 text-xs mt-1 leading-snug">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={18} className="text-gray-500" />
          <h2 className="font-bold text-gray-900">Participación por módulo</h2>
        </div>
        {loading ? (
          <div className="space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="skeleton h-8 rounded" />)}</div>
        ) : (
          <div className="space-y-3">
            {completionsByModule.map(({ title, count }) => {
              const max = Math.max(...completionsByModule.map(m => m.count), 1);
              return (
                <div key={title} className="flex items-center gap-3">
                  <p className="text-sm text-gray-600 w-40 flex-shrink-0 truncate">{title}</p>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full transition-all duration-700" style={{ width: `${(count / max) * 100}%` }} />
                  </div>
                  <p className="text-sm font-semibold text-gray-700 w-8 text-right flex-shrink-0">{count}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
