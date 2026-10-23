import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Module } from '../lib/supabase';
import Header from '../components/Header';
import ModuleCard from '../components/ModuleCard';

export default function ModulesPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('modules').select('*').order('order_index').then(({ data }) => {
      setModules(data ?? []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="animate-fade-in">
      <Header title="Módulos educativos" />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <p className="text-gray-500 text-sm mb-5 leading-relaxed">
          Selecciona un módulo para aprender sobre prevención y detección temprana del cáncer.
          Al finalizar cada módulo, podrás obtener tu diploma.
        </p>
        {loading ? (
          <div className="grid grid-cols-1 gap-3">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {modules.map(mod => <ModuleCard key={mod.id} module={mod} variant="list" />)}
          </div>
        )}
      </div>
    </div>
  );
}
