import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import logo from '../../img/carpe1.jfif';

const VerificarCodigo = () => {
  const navigate = useNavigate();
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const id_usuario = localStorage.getItem('temp_id_usuario');
      const { data } = await api.post('/seguridad/verificar-codigo', {
        id_usuario: Number(id_usuario),
        codigo,
      });
      localStorage.setItem('temp_token', data.tokenTemporal);
      navigate('/auth/cambiar-password');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Código incorrecto o expirado');
    } finally {
      setLoading(false);
    }
  };

  return (
    /* FONDO: Gradiente radial slate profundo */
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-slate-950">
      
      {/* Luces de fondo ambientales */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">

        {/* Cabecera / Logo con aura neón */}
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
          
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-400/5 to-transparent pointer-events-none"></div>

          <div className="mb-8 text-center relative z-10">
            <h3 className="text-white text-2xl font-bold mb-2 tracking-tight uppercase">Verificá tu identidad</h3>
            <p className="text-slate-400 text-xs leading-relaxed font-medium">
              Te enviamos un código de 6 dígitos a tu email. Ingresalo para continuar.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-3 ml-1 uppercase tracking-[0.2em] text-center">
                Código de verificación
              </label>
              
              {/* Input de código: Ajustado al nuevo estilo Slate con foco Cyan */}
              <input
                type="text"
                value={codigo}
                onChange={e => setCodigo(e.target.value)}
                maxLength={6}
                placeholder="000000"
                className="w-full px-4 py-5 rounded-xl border border-white/5 bg-slate-800/50 text-white text-[32px] tracking-[0.5em] text-center font-black focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 transition-all placeholder-slate-700 shadow-inner"
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
              {loading ? 'Verificando...' : 'Verificar código'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full text-center text-[10px] font-bold tracking-widest text-slate-500 hover:text-white transition-colors mt-4 uppercase"
            >
              Cancelar y volver
            </button>
          </form>
        </div>
        
        <p className="text-center text-[9px] font-medium text-slate-600 mt-8 tracking-[0.3em] uppercase">
          Paso de seguridad 1 de 2
        </p>
      </div>
    </div>
  );
};

export default VerificarCodigo;