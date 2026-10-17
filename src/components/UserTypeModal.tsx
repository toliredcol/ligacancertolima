import { useState, useEffect } from 'react';
import { GraduationCap, Users, BookOpen, HelpCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import esperanzaSaludando from '../assets/images/esperanza-saludando.png';

type UserType = 'estudiante' | 'padre_familia' | 'docente' | 'otro';

const OPTIONS: { value: UserType; label: string; icon: React.ElementType; color: string }[] = [
  { value: 'estudiante',    label: 'Estudiante',       icon: GraduationCap, color: '#5170ff' },
  { value: 'padre_familia', label: 'Padre de Familia', icon: Users,         color: '#E91E8C' },
  { value: 'docente',       label: 'Docente',          icon: BookOpen,      color: '#009688' },
  { value: 'otro',          label: 'Otro',             icon: HelpCircle,    color: '#FF9800' },
];

export default function UserTypeModal() {
  const [visible, setVisible] = useState(false);

  const EXPIRY_MS = 172_800_000; // 48 hours

  useEffect(() => {
    const raw = localStorage.getItem('userTypeSelection');
    if (raw) {
      try {
        const { timestamp } = JSON.parse(raw);
        if (Date.now() - timestamp < EXPIRY_MS) return;
      } catch {
        // malformed entry — show modal
      }
    }
    setVisible(true);
  }, []);

  const handleSelect = async (type: UserType) => {
    localStorage.setItem('userTypeSelection', JSON.stringify({ userType: type, timestamp: Date.now() }));
    setVisible(false);
    // Atomic increment through the server-side routine (the only allowed write path)
    const { error } = await supabase.rpc('increment_user_stat', { p_user_type: type });
    if (error) {
      console.error('No se pudo registrar la estadística de visitante.');
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-slide-up">
        {/* Esperanza welcome image */}
        <div className="flex justify-center pt-5 bg-white">
          <img
            src={esperanzaSaludando}
            alt="Esperanza, mascota de la Liga Contra el Cáncer"
            className="object-contain"
            style={{ height: 100, maxWidth: 80 }}
          />
        </div>
        {/* Header strip */}
        <div className="bg-[#5170ff] px-6 py-5 text-center">
          <h2 className="text-white font-bold text-xl leading-tight">¿Qué tipo de usuario eres?</h2>
          <p className="text-white/80 text-sm mt-1">Ayúdanos a conocerte mejor</p>
        </div>

        <div className="p-5 grid grid-cols-2 gap-3">
          {OPTIONS.map(({ value, label, icon: Icon, color }) => (
            <button
              key={value}
              onClick={() => handleSelect(value)}
              className="flex flex-col items-center gap-3 p-4 rounded-2xl border-2 border-gray-100 bg-white
                hover:border-current hover:shadow-md active:scale-95 transition-all duration-150"
              style={{ '--hover-color': color } as React.CSSProperties}
              onMouseEnter={e => (e.currentTarget.style.borderColor = color)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '')}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: color + '18' }}
              >
                <Icon size={24} style={{ color }} />
              </div>
              <span className="text-gray-800 font-semibold text-sm text-center leading-tight">{label}</span>
            </button>
          ))}
        </div>

        <p className="text-center text-gray-400 text-xs pb-4">
          Selecciona una opción para continuar
        </p>
      </div>
    </div>
  );
}
