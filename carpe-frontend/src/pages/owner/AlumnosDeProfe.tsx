import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import api from '../../services/api';
import type { Usuario } from '../../types';
import Avatar from '../../components/Avatar';

const AlumnosDeProfe = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [alumnos, setAlumnos] = useState<Usuario[]>([]);
  const [nombreProfe, setNombreProfe] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/usuarios/profe/${id}/alumnos`),
      api.get(`/usuarios/${id}`),
    ]).then(([alumnosRes, profeRes]) => {
      setAlumnos(alumnosRes.data);
      setNombreProfe(profeRes.data.nombre_completo);
    }).catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  // CORRECCIÓN VISUAL: Actualizadas las clases de colores al nuevo sistema
  const getEstadoBadge = (alumno: Usuario) => {
    if (!alumno.estado_activo) return { label: 'Inactivo', styleClass: 'bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]' };
    if (!alumno.fecha_vencimiento_cuota) return { label: 'Sin cuota', styleClass: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.1)]' };
    const dias = Math.ceil((new Date(alumno.fecha_vencimiento_cuota).getTime() - Date.now()) / 86400000);
    if (dias <= 7) return { label: `Vence en ${dias}d`, styleClass: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.1)]' };
    return { label: 'Activo', styleClass: 'bg-cyan-500/10 text-cyan-400 border border-cyan-400/20 shadow-[0_0_10px_rgba(34,211,238,0.1)]' };
  };

  return (
    <AppLayout>
      <div className="max-w-5xl w-full mx-auto animate-fade-in p-4 md:p-8">

        {/* Header - Estilo unificado con botón de volver circular */}
        <div className="mb-10">
          <button
            onClick={() => navigate('/owner/profesores')}
            className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors mb-6 group"
          >
            <span className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white/5 group-hover:border-white/20 transition-all">
              ←
            </span>
            Volver a profesores
          </button>
          
          <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-2">
            Alumnos de {nombreProfe.split(' ')[0]}
          </h1>
          <div className="flex items-center gap-2">
            <span className="w-8 h-[2px] bg-purple-500"></span>
            <p className="text-slate-400 text-xs md:text-sm font-bold uppercase tracking-[0.2em] m-0">
              {alumnos.length} alumno{alumnos.length !== 1 ? 's' : ''} asignado{alumnos.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Contenido Principal */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 relative z-10">
            <div className="w-8 h-8 border-4 border-cyan-400/10 border-t-cyan-400 rounded-full animate-spin mb-4"></div>
            <p className="text-cyan-400 text-[10px] font-black tracking-[0.3em] uppercase animate-pulse">
              Cargando alumnos...
            </p>
          </div>
        ) : alumnos.length === 0 ? (
          <div className="bg-slate-900/60 border-2 border-white/5 rounded-3xl p-16 text-center backdrop-blur-xl">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest m-0 italic">
              Este profesor no tiene alumnos asignados.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {alumnos.map(alumno => {
              const badge = getEstadoBadge(alumno);
              return (
                <div 
                  key={alumno.id_usuario} 
                  className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-5 hover:border-cyan-400/30 hover:shadow-[0_0_20px_rgba(34,211,238,0.1)] transition-all duration-300 group relative overflow-hidden"
                >
                  {/* Destello decorativo on hover */}
                  <div className="absolute top-0 left-0 w-20 h-20 bg-cyan-500/0 rounded-full blur-xl pointer-events-none group-hover:bg-cyan-500/10 transition-all duration-500"></div>

                  {/* Info Alumno */}
                  <div className="flex items-center gap-5 relative z-10">
                    <Avatar foto_url={alumno.foto_url} nombre={alumno.nombre_completo} size="lg" />
                    <div>
                      <p className="text-white font-black text-lg m-0 tracking-tight group-hover:text-cyan-400 transition-colors">
                        {alumno.nombre_completo}
                      </p>
                      <p className="text-slate-500 text-xs font-medium m-0 mt-0.5 uppercase tracking-tighter">
                        {alumno.email}
                      </p>
                    </div>
                  </div>

                  {/* Vencimiento y Estado */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 relative z-10 border-t border-white/5 pt-4 sm:border-none sm:pt-0">
                    {alumno.fecha_vencimiento_cuota && (
                      <div className="text-left sm:text-right hidden sm:block">
                        <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest m-0 mb-1">
                          Vence
                        </p>
                        <p className="text-slate-300 text-sm font-bold m-0">
                          {new Date(alumno.fecha_vencimiento_cuota).toLocaleDateString('es-AR')}
                        </p>
                      </div>
                    )}
                    <span className={`inline-block px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${badge.styleClass}`}>
                      {badge.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default AlumnosDeProfe;