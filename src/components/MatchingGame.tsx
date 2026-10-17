import { useEffect, useState, useCallback } from 'react';
import { Shuffle, CheckCircle2, RotateCcw, Trophy } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { MatchingGamePair } from '../lib/supabase';
import Confetti from './Confetti';
import esperanzaCelebrando from '../assets/images/esperanza-celebrando.png';

interface MatchingGameProps {
  moduleId: string;
  accentColor: string;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MatchingGame({ moduleId, accentColor }: MatchingGameProps) {
  const [pairs, setPairs] = useState<MatchingGamePair[]>([]);
  const [shuffledDefs, setShuffledDefs] = useState<MatchingGamePair[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);
  const [selectedDef, setSelectedDef] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrongPair, setWrongPair] = useState<[string, string] | null>(null);
  const [completed, setCompleted] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('matching_game_pairs')
      .select('*')
      .eq('module_id', moduleId)
      .order('order_index');
    const list = data ?? [];
    setPairs(list);
    setShuffledDefs(shuffle(list));
    setSelectedConcept(null);
    setSelectedDef(null);
    setMatched(new Set());
    setWrongPair(null);
    setCompleted(false);
    setLoading(false);
  }, [moduleId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (selectedConcept && selectedDef) {
      if (selectedConcept === selectedDef) {
        const newMatched = new Set(matched);
        newMatched.add(selectedConcept);
        setMatched(newMatched);
        setSelectedConcept(null);
        setSelectedDef(null);
        if (newMatched.size === pairs.length) {
          setCompleted(true);
        }
      } else {
        setWrongPair([selectedConcept, selectedDef]);
        setTimeout(() => {
          setWrongPair(null);
          setSelectedConcept(null);
          setSelectedDef(null);
        }, 800);
      }
    }
  }, [selectedConcept, selectedDef, matched, pairs.length]);

  const reset = () => {
    setShuffledDefs(shuffle(pairs));
    setSelectedConcept(null);
    setSelectedDef(null);
    setMatched(new Set());
    setWrongPair(null);
    setCompleted(false);
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center">
        <div className="w-7 h-7 border-3 border-gray-200 border-t-current rounded-full animate-spin mx-auto" style={{ color: accentColor }} />
        <p className="text-gray-400 text-sm mt-3">Cargando juego...</p>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <Confetti />
        <div className="px-5 pt-6 pb-6 text-center space-y-4">
          <div className="flex justify-center">
            <img
              src={esperanzaCelebrando}
              alt="Esperanza, mascota de la Liga Contra el Cáncer"
              className="object-contain"
              style={{ height: 120, maxWidth: 100 }}
            />
          </div>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: accentColor + '15' }}>
            <Trophy size={32} style={{ color: accentColor }} />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">¡Felicidades!</p>
            <p className="text-gray-500 text-sm mt-1">Has emparejado todos los conceptos correctamente.</p>
          </div>
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-white font-semibold text-sm active:scale-95 transition-transform"
            style={{ backgroundColor: accentColor }}
          >
            <RotateCcw size={16} />
            Reiniciar juego
          </button>
        </div>
      </div>
    );
  }

  const cardBase = 'w-full text-left p-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 min-h-[60px] flex items-center';

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      <div className="px-5 pt-5 pb-3">
        <div
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-2"
          style={{ backgroundColor: accentColor + '18', color: accentColor }}
        >
          <Shuffle size={12} />
          Empareja conceptos
        </div>
        <p className="text-gray-500 text-xs leading-relaxed">
          Toca un concepto y luego su definición correspondiente. ¡Empareja todos para ganar!
        </p>
      </div>

      <div className="px-5 pb-5">
        <div className="grid grid-cols-2 gap-3">
          {/* Concepts column */}
          <div className="space-y-2.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">Concepto</p>
            {pairs.map(pair => {
              const isMatched = matched.has(pair.id);
              const isSelected = selectedConcept === pair.id;
              const isWrong = wrongPair?.[0] === pair.id;
              let cls = 'border-gray-200 bg-white text-gray-700';
              if (isMatched) cls = 'border-green-400 bg-green-50 text-green-700 cursor-default';
              else if (isWrong) cls = 'border-red-400 bg-red-50 text-red-700 animate-shake';
              else if (isSelected) cls = 'border-transparent text-white';
              return (
                <button
                  key={pair.id}
                  disabled={isMatched}
                  onClick={() => !isMatched && setSelectedConcept(pair.id)}
                  className={`${cardBase} ${cls} ${!isMatched && !isSelected ? 'active:scale-[0.98] hover:border-gray-300' : ''}`}
                  style={isSelected ? { backgroundColor: accentColor } : undefined}
                >
                  <span className="flex-1 leading-snug">{pair.concept}</span>
                  {isMatched && <CheckCircle2 size={16} className="text-green-500 flex-shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>

          {/* Definitions column (shuffled) */}
          <div className="space-y-2.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">Definición</p>
            {shuffledDefs.map(pair => {
              const isMatched = matched.has(pair.id);
              const isSelected = selectedDef === pair.id;
              const isWrong = wrongPair?.[1] === pair.id;
              let cls = 'border-gray-200 bg-white text-gray-700';
              if (isMatched) cls = 'border-green-400 bg-green-50 text-green-700 cursor-default';
              else if (isWrong) cls = 'border-red-400 bg-red-50 text-red-700 animate-shake';
              else if (isSelected) cls = 'border-transparent text-white';
              return (
                <button
                  key={pair.id}
                  disabled={isMatched}
                  onClick={() => !isMatched && setSelectedDef(pair.id)}
                  className={`${cardBase} ${cls} ${!isMatched && !isSelected ? 'active:scale-[0.98] hover:border-gray-300' : ''}`}
                  style={isSelected ? { backgroundColor: accentColor } : undefined}
                >
                  <span className="flex-1 leading-snug">{pair.definition}</span>
                  {isMatched && <CheckCircle2 size={16} className="text-green-500 flex-shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Progress + reset */}
        <div className="mt-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-24 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(matched.size / pairs.length) * 100}%`, backgroundColor: accentColor }}
              />
            </div>
            <span className="text-xs text-gray-400 font-medium">{matched.size}/{pairs.length}</span>
          </div>
          <button
            onClick={reset}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors"
          >
            <RotateCcw size={13} />
            Reiniciar
          </button>
        </div>
      </div>
    </div>
  );
}
