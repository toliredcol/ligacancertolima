import { useState, useRef } from 'react';
import { CheckCircle2, XCircle, ChevronRight, Trophy, Download, Share2 } from 'lucide-react';
import type { QuizQuestion, Module } from '../lib/supabase';
import { supabase } from '../lib/supabase';
import { getModuleHex } from '../lib/moduleColors';
import Confetti from './Confetti';
import DiplomaModal from './DiplomaModal';

interface Props {
  questions: QuizQuestion[];
  module: Module;
}

export default function Quiz({ questions, module: mod }: Props) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [finished, setFinished] = useState(false);
  const [shakeIdx, setShakeIdx] = useState<number | null>(null);
  const [showDiploma, setShowDiploma] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const accentColor = getModuleHex(mod.slug);

  if (!questions.length) return null;

  const q = questions[current];
  const score = answers.filter(Boolean).length;
  const passed = score >= Math.ceil(questions.length * 0.6);

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const correct = idx === q.correct_index;
    if (!correct) setShakeIdx(idx);
    setShowExplanation(true);
    setAnswers(prev => [...prev, correct]);
    setTimeout(() => setShakeIdx(null), 600);
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
  };

  const handleRestart = () => {
    setCurrent(0);
    setSelected(null);
    setAnswers([]);
    setShowExplanation(false);
    setFinished(false);
    setShowConfetti(false);
  };

  const progress = ((current + (selected !== null ? 1 : 0)) / questions.length) * 100;

  if (finished) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center space-y-4 animate-fade-in">
        {showConfetti && <Confetti />}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: accentColor + '15' }}>
            <Trophy size={40} style={{ color: accentColor }} />
          </div>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">¡Quiz completado!</h3>
          <p className="text-4xl font-extrabold mt-2" style={{ color: accentColor }}>
            {score}/{questions.length}
          </p>
          <p className="text-gray-500 text-sm mt-1">
            {passed ? '¡Excelente! Has aprobado el módulo.' : 'Sigue aprendiendo, ¡tú puedes!'}
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {passed && (
            <button
              onClick={() => setShowDiploma(true)}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-white font-semibold text-sm transition-transform active:scale-95"
              style={{ backgroundColor: accentColor }}
            >
              <Download size={18} />
              Obtener mi diploma
            </button>
          )}
          <button
            onClick={handleRestart}
            className="w-full py-3.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 active:scale-95 transition-transform"
          >
            Repetir quiz
          </button>
        </div>
        {showDiploma && (
          <DiplomaModal
            module={mod}
            score={score}
            total={questions.length}
            onClose={() => setShowDiploma(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      {/* Progress bar */}
      <div className="h-1.5 bg-gray-100">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${progress}%`, backgroundColor: accentColor }}
        />
      </div>

      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 font-medium">Pregunta {current + 1} de {questions.length}</span>
          <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: accentColor + '15', color: accentColor }}>
            {score} correctas
          </span>
        </div>

        <p className="font-semibold text-gray-900 text-[16px] leading-snug">{q.question}</p>

        <div className="space-y-2.5">
          {q.options.map((opt, idx) => {
            const isCorrect = idx === q.correct_index;
            const isSelected = idx === selected;
            let btnClass = 'border-gray-200 bg-white text-gray-700';
            if (selected !== null) {
              if (isCorrect) btnClass = 'border-green-400 bg-green-50 text-green-800';
              else if (isSelected) btnClass = 'border-red-400 bg-red-50 text-red-800';
            }
            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={selected !== null}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 min-h-[52px] text-sm font-medium
                  ${btnClass}
                  ${shakeIdx === idx ? 'animate-shake' : ''}
                  ${selected === null ? 'active:scale-[0.98] hover:border-gray-300' : ''}
                `}
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
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-semibold text-sm transition-transform active:scale-95 animate-bounce-once"
            style={{ backgroundColor: accentColor }}
          >
            {current + 1 >= questions.length ? 'Ver resultado' : 'Siguiente pregunta'}
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
