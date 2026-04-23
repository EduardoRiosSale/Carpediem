import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import logo from '../../img/carpe1.jfif';

const CambiarPassword = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmar) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    setLoading(true);
    try {
      const tempToken = localStorage.getItem('temp_token');
      const { data } = await api.post(
        '/seguridad/cambiar-password',
        { nueva_password: password },
        { headers: { Authorization: `Bearer ${tempToken}` } }
      );
      localStorage.removeItem('temp_token');
      localStorage.removeItem('temp_id_usuario');
      login(data.token, data.usuario);
      if (data.usuario.rol === 'OWNER') navigate('/owner/dashboard');
      else if (data.usuario.rol === 'PROFE') navigate('/profe/alumnos');
      else navigate('/alumno/rutina');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-slate-950">
      
      {/* Luces de fondo ambientales */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">

        {/* Cabecera / Logo */}
        <div className="text-center mb-10 flex flex-col items-center">
          <div className="relative group">
            <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-2xl group-hover:bg-purple-500/30 transition-all duration-500"></div>
            <div className="relative inline-flex items-center justify-center w-32 h-32 rounded-full mb-4 overflow-hidden border-2 border-purple-400/30 shadow-[0_0_30px_rgba(176,38,255,0.2)]">
              <img src={logo} alt="Carpe Diem" className="w-full h-full object-cover scale-110" />
            </div>
          </div>
          <p className="text-cyan-400 text-[10px] tracking-[0.4em] font-black uppercase mt-1 text-center">
            Salud & Estética
          </p>
        </div>

        {/* Tarjeta con MARCO NEÓN REFORZADO */}
        {/* Cambios: border-2, cyan-400/40 y shadow-cyan */}
        <div className="rounded-3xl border-2 border-cyan-400/40 p-8 shadow-[0_0_25px_rgba(34,211,238,0.2)] backdrop-blur-2xl bg-slate-900/70 relative overflow-hidden">
          
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-400/5 to-transparent pointer-events-none"></div>

          <div className="mb-8 text-center relative z-10">
            <h3 className="text-white text-2xl font-bold mb-2 tracking-tight">Activá tu cuenta</h3>
            <p className="text-slate-400 text-xs leading-relaxed font-medium">
              Elegí una contraseña segura para activar tu cuenta. Debe tener al menos 8 caracteres.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-2 ml-1 uppercase tracking-widest">
                Nueva contraseña
              </label>
              <div className="relative">
                <input
                  type={mostrarPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full px-4 py-3.5 rounded-xl border border-white/5 bg-slate-800/50 text-white text-[15px] focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all placeholder-slate-600 shadow-inner"
                  required
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {mostrarPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-2 ml-1 uppercase tracking-widest">
                Confirmar contraseña
              </label>
              <input
                type={mostrarPassword ? 'text' : 'password'}
                value={confirmar}
                onChange={e => setConfirmar(e.target.value)}
                placeholder="Repetí tu contraseña"
                className="w-full px-4 py-3.5 rounded-xl border border-white/5 bg-slate-800/50 text-white text-[15px] focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 transition-all placeholder-slate-600 shadow-inner"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium rounded-lg px-4 py-2 text-center animate-pulse">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-2 rounded-xl text-[14px] font-bold uppercase tracking-widest text-white transition-all disabled:opacity-50 hover:brightness-110 shadow-[0_0_20px_rgba(34,211,238,0.3)] bg-gradient-to-r from-cyan-500 to-purple-600"
            >
              {loading ? 'Activando...' : 'Activar cuenta'}
            </button>
          </form>
        </div>
        
        <p className="text-center text-[9px] font-medium text-slate-600 mt-8 tracking-[0.3em] uppercase">
          Paso de seguridad 2 de 2
        </p>
      </div>
    </div>
  );
};

export default CambiarPassword;