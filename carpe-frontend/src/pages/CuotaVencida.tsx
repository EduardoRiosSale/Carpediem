import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../img/carpe1.jfif';

const CuotaVencida = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-slate-950">
      
      {/* Luces de fondo ambientales (Rojo/Rosa y Púrpura para indicar bloqueo) */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 animate-fade-in text-center">

        {/* Sección Logo y Título */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="relative group">
            <div className="absolute inset-0 rounded-full bg-rose-500/20 blur-2xl transition-all duration-500"></div>
            <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 overflow-hidden border-2 border-rose-500/30 shadow-[0_0_30px_rgba(244,63,94,0.2)]">
              <img src={logo} alt="Carpe Diem" className="w-full h-full object-cover scale-110" />
            </div>
          </div>
          <h1 className="text-white text-3xl md:text-4xl font-black uppercase tracking-tighter drop-shadow-[0_0_15px_rgba(244,63,94,0.5)] mb-2">
            Acceso bloqueado
          </h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] m-0">
            Tu cuota mensual ha vencido
          </p>
        </div>

        {/* Tarjeta de Bloqueo (Marco Neón Rosa/Rojo) */}
        <div className="rounded-3xl border-2 border-rose-500/30 p-8 mb-8 shadow-[0_0_30px_rgba(244,63,94,0.15)] backdrop-blur-2xl bg-slate-900/70 relative overflow-hidden">
          
          {/* Brillo sutil interior */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-rose-500/5 to-transparent pointer-events-none"></div>

          {/* Ícono del candado */}
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(244,63,94,0.2)] relative z-10">
            <span className="text-2xl">🔒</span>
          </div>

          <div className="relative z-10">
            <p className="text-white font-black text-lg mb-2 tracking-tight uppercase">
              Tu acceso está pausado
            </p>
            <p className="text-slate-400 text-xs leading-relaxed mb-6 font-medium">
              Para volver a usar la app necesitás renovar tu cuota. Contactá al administrador del gimnasio para que reactive tu cuenta.
            </p>

            {/* Etiqueta de estado */}
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 mb-8">
              <p className="text-rose-400 text-[10px] font-black uppercase tracking-[0.2em] m-0">
                Cuota vencida
              </p>
            </div>

            {/* Botón de salir */}
            <button
              onClick={handleLogout}
              className="w-full py-4 rounded-xl text-[13px] font-black uppercase tracking-[0.2em] text-white transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(244,63,94,0.3)] bg-gradient-to-r from-rose-500 to-purple-600 hover:brightness-110"
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* Footer sutil */}
        <p className="text-slate-600 text-[9px] font-black uppercase tracking-[0.3em]">
          Carpe Diem · Salud & Estética
        </p>
      </div>
    </div>
  );
};

export default CuotaVencida;