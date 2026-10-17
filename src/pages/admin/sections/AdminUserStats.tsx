import { useEffect, useState } from 'react';
import { GraduationCap, Users, BookOpen, HelpCircle, RefreshCw } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

type StatRow = { user_type: string; count: number; updated_at: string };

const TYPE_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  estudiante:    { label: 'Estudiante',       icon: GraduationCap, color: '#5170ff' },
  padre_familia: { label: 'Padre de Familia', icon: Users,         color: '#E91E8C' },
  docente:       { label: 'Docente',          icon: BookOpen,      color: '#009688' },
  otro:          { label: 'Otro',             icon: HelpCircle,    color: '#FF9800' },
};

export default function AdminUserStats() {
  const [stats, setStats] = useState<StatRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('user_stats').select('*').order('count', { ascending: false });
    setStats(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const total = stats.reduce((s, r) => s + r.count, 0);
  const max = Math.max(...stats.map(s => s.count), 1);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Estadísticas de usuarios</h2>
          <p className="text-gray-500 text-sm mt-0.5">Visitas registradas por tipo de usuario (solo lectura)</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      {/* Total card */}
      <div className="bg-gradient-to-br from-[#5170ff] to-[#3a54d4] rounded-2xl p-5 text-white text-center shadow-md">
        <p className="text-white/80 text-sm font-medium mb-1">Total de visitas registradas</p>
        <p className="text-5xl font-extrabold">{loading ? '—' : total.toLocaleString('es-CO')}</p>
      </div>

      {/* Per-type cards */}
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(TYPE_META).map(([type, { label, icon: Icon, color }]) => {
          const row = stats.find(s => s.user_type === type);
          const count = row?.count ?? 0;
          return (
            <div key={type} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + '18' }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <p className="text-sm font-semibold text-gray-700 leading-snug">{label}</p>
              </div>
              <p className="text-3xl font-extrabold" style={{ color }}>{loading ? '—' : count.toLocaleString('es-CO')}</p>
            </div>
          );
        })}
      </div>

      {/* Bar chart */}
      {!loading && total > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-3">
          <p className="font-semibold text-gray-900 text-sm">Distribución porcentual</p>
          {stats.map(row => {
            const meta = TYPE_META[row.user_type];
            if (!meta) return null;
            const pct = total > 0 ? Math.round((row.count / total) * 100) : 0;
            return (
              <div key={row.user_type} className="flex items-center gap-3">
                <p className="text-sm text-gray-600 w-36 flex-shrink-0 truncate">{meta.label}</p>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${(row.count / max) * 100}%`, backgroundColor: meta.color }}
                  />
                </div>
                <p className="text-sm font-semibold text-gray-700 w-12 text-right flex-shrink-0">{pct}%</p>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-gray-400 text-center">
        Los contadores son acumulativos y no pueden eliminarse
      </p>
    </div>
  );
}
