import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { Module, QuizQuestion } from '../../../lib/supabase';
import { getModuleColors } from '../../../lib/moduleColors';

export default function AdminQuizzes() {
  const [modules, setModules] = useState<Module[]>([]);
  const [selected, setSelected] = useState<Module | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [editing, setEditing] = useState<Partial<QuizQuestion> | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('modules').select('*').order('order_index').then(({ data }) => {
      setModules(data ?? []);
      if (data?.length) setSelected(data[0]);
    });
  }, []);

  useEffect(() => {
    if (!selected) return;
    supabase.from('quiz_questions').select('*').eq('module_id', selected.id).order('order_index').then(({ data }) => setQuestions(data ?? []));
  }, [selected]);

  const reload = async () => {
    if (!selected) return;
    const { data } = await supabase.from('quiz_questions').select('*').eq('module_id', selected.id).order('order_index');
    setQuestions(data ?? []);
  };

  const newQuestion = (): Partial<QuizQuestion> => ({
    question: '',
    options: ['', '', '', ''],
    correct_index: 0,
    explanation: '',
    order_index: questions.length,
  });

  const handleSave = async () => {
    if (!editing || !selected || !editing.question?.trim()) return;
    setSaving(true);
    if (editing.id) {
      await supabase.from('quiz_questions').update({
        question: editing.question,
        options: editing.options,
        correct_index: editing.correct_index,
        explanation: editing.explanation,
      }).eq('id', editing.id);
    } else {
      await supabase.from('quiz_questions').insert({ ...editing, module_id: selected.id });
    }
    await reload();
    setEditing(null);
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta pregunta?')) return;
    await supabase.from('quiz_questions').delete().eq('id', id);
    await reload();
  };

  const colors = selected ? getModuleColors(selected.slug) : getModuleColors('antitabaco');

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Gestión de Quizzes</h1>
        <p className="text-gray-500 text-sm">Administra las preguntas por módulo</p>
      </div>

      {/* Module selector */}
      <div className="flex flex-wrap gap-2">
        {modules.map(m => {
          const mc = getModuleColors(m.slug);
          return (
            <button key={m.id} onClick={() => setSelected(m)} className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${selected?.id === m.id ? `${mc.bg} text-white border-transparent` : `${mc.badge} border-transparent`}`}>
              {m.title.split(' ')[0]}
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{questions.length} preguntas en este módulo</p>
            <button onClick={() => setEditing(newQuestion())} className={`flex items-center gap-2 ${colors.bg} text-white font-semibold py-2 px-4 rounded-xl text-sm`}>
              <Plus size={15} /> Agregar pregunta
            </button>
          </div>
          {questions.map((q, i) => (
            <div key={q.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start gap-3">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${colors.bg}`}>{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm leading-snug">{q.question}</p>
                  <div className="mt-2 space-y-1">
                    {q.options.map((opt, j) => (
                      <p key={j} className={`text-xs px-2 py-1 rounded-lg ${j === q.correct_index ? 'bg-green-100 text-green-700 font-medium' : 'bg-gray-50 text-gray-500'}`}>
                        {j === q.correct_index ? '✓ ' : ''}{opt}
                      </p>
                    ))}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => setEditing({ ...q })} className="p-1.5 text-blue-400 hover:text-blue-600"><Pencil size={15} /></button>
                  <button onClick={() => handleDelete(q.id)} className="p-1.5 text-red-400 hover:text-red-600"><Trash2 size={15} /></button>
                </div>
              </div>
            </div>
          ))}
          {questions.length === 0 && <p className="text-gray-400 text-center py-8">No hay preguntas. Agrega la primera.</p>}
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="font-bold text-gray-900">{editing.id ? 'Editar pregunta' : 'Nueva pregunta'}</h2>
              <button onClick={() => setEditing(null)}><X size={18} className="text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="label">Pregunta *</label>
                <textarea value={editing.question ?? ''} onChange={e => setEditing(q => ({ ...q!, question: e.target.value }))} className="input-field" rows={3} placeholder="¿Cuál es la pregunta?" />
              </div>
              <div className="space-y-2">
                <label className="label">Opciones de respuesta (marca la correcta)</label>
                {(editing.options ?? ['', '', '', '']).map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <button
                      onClick={() => setEditing(q => ({ ...q!, correct_index: i }))}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${editing.correct_index === i ? 'border-green-500 bg-green-500' : 'border-gray-300'}`}
                    >
                      {editing.correct_index === i && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                    </button>
                    <input
                      value={opt}
                      onChange={e => { const arr = [...(editing.options ?? [])]; arr[i] = e.target.value; setEditing(q => ({ ...q!, options: arr })); }}
                      className="input-field flex-1"
                      placeholder={`Opción ${i + 1}`}
                    />
                  </div>
                ))}
              </div>
              <div>
                <label className="label">Explicación de la respuesta correcta</label>
                <textarea value={editing.explanation ?? ''} onChange={e => setEditing(q => ({ ...q!, explanation: e.target.value }))} className="input-field" rows={3} placeholder="Explica por qué esa es la respuesta correcta..." />
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setEditing(null)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-60 ${colors.bg}`}>
                <Save size={15} /> {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
