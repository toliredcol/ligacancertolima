import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAppConfig } from '../../lib/AppConfigContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { logoUrl } = useAppConfig();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError('Credenciales incorrectas. Verifica tu email y contraseña.');
      setLoading(false);
    } else {
      navigate('/admin/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 w-full max-w-sm p-6 space-y-6 animate-fade-in">
        <div className="text-center">
          <img src={logoUrl} alt="Logo" className="h-16 mx-auto mb-4 object-contain" />
          <h1 className="font-bold text-gray-900 text-xl">Panel de Administración</h1>
          <p className="text-gray-500 text-sm mt-1">Liga Contra el Cáncer - Zonal Tolima</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Correo electrónico</label>
            <div className="flex items-center border-2 border-gray-200 rounded-xl focus-within:border-red-400 transition-colors overflow-hidden">
              <div className="pl-3"><Mail size={18} className="text-gray-400" /></div>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@ejemplo.com"
                className="flex-1 p-3 text-sm outline-none"
                required
                autoComplete="email"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Contraseña</label>
            <div className="flex items-center border-2 border-gray-200 rounded-xl focus-within:border-red-400 transition-colors overflow-hidden">
              <div className="pl-3"><Lock size={18} className="text-gray-400" /></div>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="flex-1 p-3 text-sm outline-none"
                required
                autoComplete="current-password"
              />
              <button type="button" onClick={() => setShowPass(s => !s)} className="pr-3 text-gray-400">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white font-semibold py-3.5 rounded-xl text-sm disabled:opacity-60 transition-all active:scale-95"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400">
          Acceso exclusivo para administradores autorizados
        </p>
      </div>
    </div>
  );
}
