import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import logo from '../../img/carpe1.jfif';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [modoReset, setModoReset] = useState(false);
  const [emailReset, setEmailReset] = useState('');
  const [loadingReset, setLoadingReset] = useState(false);
  const [exitoReset, setExitoReset] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/usuarios/login', {
        email,
        password_plana: password,
      });

      if (data.estado === 'REQUIERE_VERIFICACION') {
        localStorage.setItem('temp_id_usuario', data.id_usuario);
        navigate('/auth/verificar-codigo');
        return;
      }

      if (data.estado === 'CUOTA_VENCIDA') {
  login(data.token, data.usuario);
  navigate('/cuota-vencida');
  return;
}

      login(data.token, data.usuario);
      if (data.usuario.rol === 'OWNER') navigate('/owner/dashboard');
      else if (data.usuario.rol === 'PROFE') navigate('/profe/alumnos');
      else navigate('/alumno/rutina');

    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingReset(true);
    try {
      const { data } = await api.post('/seguridad/solicitar-reset', { email: emailReset });
      localStorage.setItem('temp_id_usuario', data.id_usuario);
      setExitoReset('Te enviamos un código a tu email. Revisá tu bandeja.');
      setTimeout(() => {
        navigate('/auth/verificar-codigo');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al enviar el código');
    } finally {
      setLoadingReset(false);
    }
  };

 return (
    /* FONDO: Gradiente radial slate profundo para dar atmósfera */
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-slate-950">
      
      {/* LUCES DE FONDO AMBIENTALES */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        
        {/* LOGO SECCIÓN */}
        <div className="text-center mb-10 flex flex-col items-center">
          <div className="relative group">
            <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-2xl group-hover:bg-cyan-400/30 transition-all duration-500"></div>
            <div className="relative inline-flex items-center justify-center w-32 h-32 rounded-full mb-4 overflow-hidden border-2 border-cyan-400/30 shadow-[0_0_30px_rgba(34,211,238,0.2)]">
              <img src={logo} alt="Carpe Diem" className="w-full h-full object-cover scale-110" />
            </div>
          </div>
          <h1 className="text-white text-4xl font-bold tracking-tight">Carpe Diem</h1>
          <p className="text-cyan-400/80 text-[10px] tracking-[0.4em] font-black uppercase mt-1">
            Salud & Estética
          </p>
        </div>

        {/* CARD CON MARCO NEÓN REFORZADO */}
        <div className="rounded-3xl border-2 border-cyan-400/40 p-8 shadow-[0_0_25px_rgba(34,211,238,0.2)] backdrop-blur-2xl bg-slate-900/70 relative overflow-hidden">
          
          {/* Reflejo sutil de luz en la esquina de la tarjeta */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-400/5 to-transparent pointer-events-none"></div>

          {!modoReset ? (
            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-2 ml-1 uppercase tracking-widest">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-white/5 bg-slate-800/50 text-white text-[15px] focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 transition-all placeholder-slate-600 shadow-inner"
                  placeholder="tu-email@"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-2 ml-1 uppercase tracking-widest">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={mostrarPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border border-white/5 bg-slate-800/50 text-white text-[15px] focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all placeholder-slate-600 pr-12 shadow-inner"
                    placeholder="••••••••"
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
                {loading ? 'Iniciando...' : 'Ingresar'}
              </button>

              <button
                type="button"
                onClick={() => { setModoReset(true); setError(''); }}
                className="w-full text-center text-[10px] font-bold tracking-widest text-slate-500 hover:text-white transition-colors mt-4 uppercase"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </form>

          ) : (
            /* FORMULARIO DE RESET (Mismo estilo de marco neón) */
            <form onSubmit={handleReset} className="space-y-6 animate-fade-in relative z-10">
              <div className="mb-6 text-center">
                <h3 className="text-white text-xl font-black mb-2 uppercase tracking-wide">Recuperar acceso</h3>
                <p className="text-slate-400 text-xs leading-relaxed font-medium">
                  Ingresá tu email y te mandamos un código para resetear tu contraseña.
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-2 ml-1 uppercase tracking-widest">
                  Email
                </label>
                <input
                  type="email"
                  value={emailReset}
                  onChange={e => setEmailReset(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-white/5 bg-slate-800/50 text-white text-[15px] focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all placeholder-slate-600 shadow-inner"
                  placeholder="tu@email.com"
                  required
                />
              </div>

              {exitoReset && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl px-4 py-3 text-center font-bold tracking-wide animate-pulse">
                  {exitoReset}
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium rounded-xl px-4 py-3 text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loadingReset}
                className="w-full py-4 mt-2 rounded-xl text-[14px] font-bold uppercase tracking-widest text-white transition-all disabled:opacity-50 hover:brightness-110 shadow-[0_0_20px_rgba(168,85,247,0.3)] bg-gradient-to-r from-purple-600 to-cyan-500"
              >
                {loadingReset ? 'Enviando...' : 'Enviar código'}
              </button>

              <button
                type="button"
                onClick={() => { setModoReset(false); setError(''); setExitoReset(''); }}
                className="w-full text-center text-[10px] font-bold tracking-widest text-slate-500 hover:text-white transition-colors mt-6 flex items-center justify-center gap-2 uppercase"
              >
                <span>←</span> Volver al login
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-[9px] font-medium text-slate-600 mt-8 tracking-[0.3em] uppercase">
          Solo el administrador puede crear cuentas
        </p>
      </div>
    </div>
  );
};

export default Login;