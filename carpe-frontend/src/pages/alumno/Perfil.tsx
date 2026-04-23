import { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import FotoPerfilUpload from '../../components/FotoPerfilUpload';

interface DatosAlumno {
  nombre_completo: string;
  email: string;
  fecha_vencimiento_cuota?: string;
  estado_activo: boolean;
  foto_url?: string | null;
}

interface CalificacionEnviada {
  puntaje: number;
  comentario: string;
}

const Perfil = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [datos, setDatos] = useState<DatosAlumno | null>(null);
  const [calificacion, setCalificacion] = useState<CalificacionEnviada>({ puntaje: 0, comentario: '' });
  const [puntajeHover, setPuntajeHover] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState('');
  const [error, setError] = useState('');
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);

  useEffect(() => {
  if (!usuario?.id_usuario) return;
  api.get(`/usuarios/${usuario.id_usuario}`)
    .then(res => {
      setDatos(res.data);
      setFotoUrl(res.data.foto_url || null);
    })
    .catch(err => console.error(err));
}, [usuario?.id_usuario]);

  const getDiasRestantes = () => {
    if (!datos?.fecha_vencimiento_cuota) return null;
    const dias = Math.ceil((new Date(datos.fecha_vencimiento_cuota).getTime() - Date.now()) / 86400000);
    return dias;
  };

  const getCuotaEstado = () => {
    const dias = getDiasRestantes();
    if (dias === null) return { label: 'Sin fecha asignada', color: '#6B7280', bg: 'rgba(107,114,128,0.1)' };
    if (dias < 0) return { label: 'Cuota vencida', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' };
    if (dias <= 7) return { label: `Vence en ${dias} días`, color: '#EAB308', bg: 'rgba(234,179,8,0.1)' };
    return { label: `Vence en ${dias} días`, color: '#39FF14', bg: 'rgba(57,255,20,0.1)' };
  };

  const enviarCalificacion = async () => {
    if (calificacion.puntaje === 0) {
      setError('Seleccioná un puntaje antes de enviar.');
      setTimeout(() => setError(''), 3000);
      return;
    }
    setEnviando(true);
    try {
      await api.post(`/calificaciones/profe/${usuario?.id_profe_titular}`, {
        puntaje: calificacion.puntaje,
        comentario: calificacion.comentario,
      });
      setExito('Calificación enviada. ¡Gracias!');
      setCalificacion({ puntaje: 0, comentario: '' });
      setTimeout(() => setExito(''), 4000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al enviar');
      setTimeout(() => setError(''), 3000);
    } finally {
      setEnviando(false);
    }
  };

  const cuota = getCuotaEstado();
  const dias = getDiasRestantes();

  return (
    <AppLayout>
      <div className="max-w-2xl w-full mx-auto animate-fade-in p-4 md:p-8">

        {/* Header */}
<div className="mb-10 flex flex-col items-center gap-4">
  <FotoPerfilUpload
  fotoActual={fotoUrl}
  nombre={usuario?.nombre_completo || ''}
  onActualizar={(url) => setFotoUrl(url)}
/>
  <div className="text-center">
    <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-2">
      Mi perfil
    </h1>
    <div className="flex items-center justify-center gap-2">
      <span className="w-8 h-[2px] bg-cyan-400"></span>
      <p className="text-slate-400 text-xs md:text-sm font-bold uppercase tracking-[0.2em] m-0">
        Tu información y estado de cuenta
      </p>
    </div>
  </div>
</div>

        {/* Info personal (Tarjeta Slate con aura sutil) */}
        <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/5 rounded-3xl p-6 md:p-8 mb-8 shadow-2xl relative overflow-hidden group hover:border-cyan-400/30 transition-all duration-300">
          {/* Brillo de fondo decorativo */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/20 transition-all"></div>

          <div className="flex items-center gap-6 mb-8 relative z-10">
            {/* Avatar Neón */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center text-white font-black text-2xl shrink-0 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
              {datos?.nombre_completo.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-white text-xl md:text-2xl font-black tracking-tight m-0 group-hover:text-cyan-400 transition-colors">
                {datos?.nombre_completo}
              </p>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest m-0 mt-1">
                {datos?.email}
              </p>
            </div>
          </div>

          {/* Estado cuota */}
          <div className="border-t border-white/5 pt-8 relative z-10">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4">Estado de cuota</p>
            <div className="flex items-center justify-between">
              <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 shadow-sm`} style={{ backgroundColor: cuota.bg, color: cuota.color, borderColor: cuota.color.replace(')', ', 0.3)').replace('rgb', 'rgba') }}>
                {cuota.label}
              </span>
              {datos?.fecha_vencimiento_cuota && (
                <div className="text-right">
                  <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest m-0 mb-1">Vence el</p>
                  <p className="text-white text-sm font-bold m-0">
                    {new Date(datos.fecha_vencimiento_cuota).toLocaleDateString('es-AR')}
                  </p>
                </div>
              )}
            </div>

            {/* Barra de progreso Neón */}
            {dias !== null && dias > 0 && dias <= 30 && (
              <div className="mt-6">
                <div className="bg-slate-800/50 rounded-full height-1.5 overflow-hidden border border-white/5">
                  <div 
                    className="h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_currentColor]"
                    style={{
                      width: `${Math.min((dias / 30) * 100, 100)}%`,
                      backgroundColor: dias <= 7 ? '#f59e0b' : '#22d3ee', // yellow-500 : cyan-400
                      color: dias <= 7 ? '#f59e0b' : '#22d3ee' // Para el shadow currentColor
                    }} 
                  />
                </div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest m-0 mt-3 text-right">
                  {dias} días restantes de 30
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Calificar profe (Tarjeta con borde púrpura si interactúa) */}
        {usuario?.id_profe_titular && (
          <div className="bg-slate-900/60 backdrop-blur-2xl border-2 border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden focus-within:border-purple-400/40 focus-within:shadow-[0_0_25px_rgba(168,85,247,0.15)] transition-all duration-300">
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="relative z-10">
              <h3 className="text-white text-xl font-black tracking-tight m-0 mb-1">
                Calificá a tu profe
              </h3>
              <p className="text-slate-400 text-xs font-medium tracking-wide m-0 mb-6">
                Tu opinión ayuda a mejorar el servicio
              </p>

              {/* Estrellas interactivas */}
              <div className="flex gap-2 mb-6">
                {[1, 2, 3, 4, 5].map(n => (
                  <span
                    key={n}
                    onClick={() => setCalificacion(prev => ({ ...prev, puntaje: n }))}
                    onMouseEnter={() => setPuntajeHover(n)}
                    onMouseLeave={() => setPuntajeHover(0)}
                    className="text-4xl cursor-pointer transition-all duration-200"
                    style={{
                      color: n <= (puntajeHover || calificacion.puntaje) ? '#f59e0b' : '#334155', // yellow-500 : slate-700
                      transform: n <= puntajeHover ? 'scale(1.2)' : 'scale(1)',
                      filter: n <= (puntajeHover || calificacion.puntaje) ? 'drop-shadow(0 0 8px rgba(245,158,11,0.5))' : 'none'
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>

              {/* Textarea estilo Slate */}
              <div className="relative group mb-6">
                <textarea
                  value={calificacion.comentario}
                  onChange={e => setCalificacion(prev => ({ ...prev, comentario: e.target.value }))}
                  placeholder="Dejanos tu comentario (opcional)..."
                  rows={3}
                  className="w-full px-5 py-4 rounded-2xl border border-white/5 bg-slate-800/50 text-white text-sm focus:outline-none focus:border-purple-400/50 focus:ring-1 focus:ring-purple-400/20 transition-all placeholder-slate-600 shadow-inner resize-none custom-scrollbar"
                />
              </div>

              {/* Alertas */}
              {exito && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-4 py-3 mb-6 text-xs font-bold tracking-wide animate-fade-in text-center">
                  {exito}
                </div>
              )}
              {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl px-4 py-3 mb-6 text-xs font-bold tracking-wide animate-pulse text-center">
                  {error}
                </div>
              )}

              {/* Botón de envío Neón */}
              <button
                onClick={enviarCalificacion}
                disabled={enviando}
                className="w-full py-4 rounded-xl text-[13px] font-black uppercase tracking-widest text-white transition-all disabled:opacity-50 hover:brightness-110 shadow-[0_0_20px_rgba(168,85,247,0.3)] bg-gradient-to-r from-purple-600 to-cyan-500"
              >
                {enviando ? 'Enviando...' : 'Enviar calificación'}
              </button>
            </div>
          </div>
          
        )}
       {/* Chat con el profe */}
        {usuario?.id_profe_titular && (
          <div className="bg-slate-900/60 backdrop-blur-2xl border-2 border-white/5 rounded-3xl p-6 md:p-8 mt-8 shadow-2xl relative overflow-hidden group hover:border-purple-400/40 hover:shadow-[0_0_25px_rgba(168,85,247,0.15)] transition-all duration-300">
            {/* Brillo de fondo que reacciona al hover */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-500/20 transition-all duration-300"></div>
            
            <div className="relative z-10">
              <h3 className="text-white text-xl font-black tracking-tight m-0 mb-1">
                Mensajes
              </h3>
              <p className="text-slate-400 text-xs font-medium tracking-wide m-0 mb-6">
                Comunicate con tu profe
              </p>
              <button
                onClick={() => navigate(`/chat/${usuario.id_profe_titular}`)}
                className="w-full py-4 rounded-xl text-[13px] font-black uppercase tracking-widest text-white transition-all hover:brightness-110 shadow-[0_0_20px_rgba(168,85,247,0.3)] bg-gradient-to-r from-purple-600 to-cyan-500 flex justify-center items-center gap-2"
              >
                <span className="text-lg">💬</span> Abrir chat con mi profe
              </button>
            </div>
          </div>
        )}
        

      </div>
    </AppLayout>
  );
};

export default Perfil;