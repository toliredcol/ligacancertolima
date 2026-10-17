import { useEffect, useState } from 'react';
import { Trophy, Award, BarChart3 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { QuizCompletion, Module } from '../lib/supabase';
import Header from '../components/Header';
import { getModuleColors, getModuleHex } from '../lib/moduleColors';

export default function ProgressPage() {
  const [completions, setCompletions] = useState<QuizCompletion[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('quiz_completions').select('*').order('completed_at', { ascending: false }).limit(50),
      supabase.from('modules').select('*').order('order_index'),
    ]).then(([c, m]) => {
      setCompletions(c.data ?? []);
      setModules(m.data ?? []);
      setLoading(false);
    });
  }, []);

  const moduleMap = Object.fromEntries(modules.map(m => [m.id, m]));
  const statsByModule = modules.map(m => {
    const mCompletions = completions.filter(c => c.module_id === m.id);
    return { module: m, count: mCompletions.length, avg: mCompletions.length ? Math.round(mCompletions.reduce((s, c) => s + c.score / c.total_questions * 100, 0) / mCompletions.length) : 0 };
  });

  return (
    <div className="animate-fade-in">
      <Header title="Mi Progreso" />
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm">
            <Trophy size={28} className="text-amber-500 mx-auto mb-2" />
            <p className="text-3xl font-extrabold text-gray-900">{completions.length}</p>
            <p className="text-gray-400 text-xs mt-1">Quizzes completados</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm">
            <Award size={28} className="text-red-500 mx-auto mb-2" />
            <p className="text-3xl font-extrabold text-gray-900">
              {completions.filter(c => c.score / c.total_questions >= 0.6).length}
            </p>
            <p className="text-gray-400 text-xs mt-1">Diplomas obtenidos</p>
          </div>
        </div>

        {/* By module */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={18} className="text-gray-500" />
            <h2 className="font-bold text-gray-900">Actividad por módulo</h2>
          </div>
          {loading ? (
            <div className="space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>
          ) : (
            <div className="space-y-3">
              {statsByModule.map(({ module: m, count, avg }) => {
                const colors = getModuleColors(m.slug);
                const hex = getModuleHex(m.slug);
                return (
                  <div key={m.id} className={`bg-white rounded-2xl border ${colors.border} p-4 flex items-center gap-4`}>
                    <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                      <Trophy size={18} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{m.title}</p>
                      <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(avg, 100)}%`, backgroundColor: hex }} />
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-sm" style={{ color: hex }}>{count > 0 ? `${avg}%` : '—'}</p>
                      <p className="text-gray-400 text-xs">{count} vez</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent completions */}
        {completions.length > 0 && (
          <div>
            <h2 className="font-bold text-gray-900 mb-4">Actividad reciente</h2>
            <div className="space-y-2">
              {completions.slice(0, 10).map(c => {
                const m = moduleMap[c.module_id];
                if (!m) return null;
                const pct = Math.round(c.score / c.total_questions * 100);
                const passed = pct >= 60;
                return (
                  <div key={c.id} className="bg-white rounded-xl border border-gray-100 p-3.5 flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${passed ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <Award size={16} className={passed ? 'text-green-600' : 'text-gray-400'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{c.user_name}</p>
                      <p className="text-xs text-gray-400 truncate">{m.title}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-bold ${passed ? 'text-green-600' : 'text-gray-500'}`}>{c.score}/{c.total_questions}</p>
                      <p className="text-xs text-gray-400">{new Date(c.completed_at).toLocaleDateString('es-CO')}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!loading && completions.length === 0 && (
          <div className="text-center py-12">
            <Trophy size={48} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">Aún no has completado ningún quiz</p>
            <p className="text-gray-300 text-sm mt-1">¡Completa un módulo para ver tu progreso aquí!</p>
          </div>
        )}
      </div>
    </div>
  );
}
