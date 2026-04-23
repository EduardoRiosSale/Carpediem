import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import api from '../../services/api';
import type { Usuario, Calificacion } from '../../types';
import Avatar from '../../components/Avatar';

interface CalificacionesProfe {
  promedio: number | null;
  total_calificaciones: number;
  detalle: Calificacion[];
}

const Calificaciones = () => {
  const [profes, setProfes] = useState<Usuario[]>([]);
  const [seleccionado, setSeleccionado] = useState<number | null>(null);
  const [calificaciones, setCalificaciones] = useState<CalificacionesProfe | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingCal, setLoadingCal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/usuarios/profes')
      .then(res => setProfes(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const verCalificaciones = async (id: number) => {
    setSeleccionado(id);
    setLoadingCal(true);
    try {
      const { data } = await api.get(`/calificaciones/profe/${id}`);
      setCalificaciones(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCal(false);
    }
  };

  const renderEstrellas = (puntaje: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < puntaje ? '#EAB308' : '#2A2A2A', fontSize: '16px' }}>★</span>
    ));
  };

  const profeSeleccionado = profes.find(p => p.id_usuario === seleccionado);

  return (
    <AppLayout>
      <div className="max-w-5xl w-full mx-auto animate-fade-in">

        <div className="mb-8 mt-2">
          <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-2">
            Calificaciones
          </h1>
          <div className="flex items-center gap-2">
            <span className="w-8 h-[2px] bg-cyan-400"></span>
            <p className="text-slate-400 text-xs md:text-sm font-bold uppercase tracking-[0.2em] m-0">
              Opiniones de los alumnos sobre los profesores
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-cyan-400/10 border-t-cyan-400 rounded-full animate-spin mb-4"></div>
            <p className="text-cyan-400 text-[10px] font-black tracking-[0.3em] uppercase animate-pulse">Cargando profesores...</p>
          </div>
        ) : profes.length === 0 ? (
          <div className="bg-slate-900/60 border-2 border-white/5 rounded-3xl p-16 text-center backdrop-blur-xl">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest m-0 italic">
              No hay profesores registrados todavía.
            </p>
          </div>
        ) : (
          <div className={`grid gap-6 transition-all duration-500 ${seleccionado ? 'grid-cols-1 lg:grid-cols-[1fr_1.5fr]' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>

            {/* Lista de profes */}
            <div className="flex flex-col gap-4">
              {profes.map(profe => (
                <div
                  key={profe.id_usuario}
                  onClick={() => verCalificaciones(profe.id_usuario)}
                  className={`p-4 rounded-2xl flex items-center gap-4 cursor-pointer transition-all duration-300 group ${
                    seleccionado === profe.id_usuario
                      ? 'bg-slate-800/80 border-2 border-cyan-400/40 shadow-[0_0_20px_rgba(34,211,238,0.2)]'
                      : 'bg-slate-900/60 border border-white/5 hover:border-cyan-400/30 hover:bg-slate-800/40'
                  }`}
                >
                  <Avatar foto_url={profe.foto_url} nombre={profe.nombre_completo} size="md" />
                  <div className="min-w-0">
                    <p className={`text-base font-bold m-0 tracking-tight truncate transition-colors ${seleccionado === profe.id_usuario ? 'text-cyan-400' : 'text-white group-hover:text-cyan-400'}`}>
                      {profe.nombre_completo}
                    </p>
                    <p className="text-slate-500 text-[10px] font-medium m-0 uppercase tracking-widest truncate">
                      {profe.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Detalle calificaciones */}
            {seleccionado && (
              <div className="bg-slate-900/70 backdrop-blur-2xl border-2 border-cyan-400/30 rounded-3xl p-6 md:p-8 shadow-[0_0_30px_rgba(34,211,238,0.15)] relative overflow-hidden animate-fade-in flex flex-col h-fit">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>

                {loadingCal ? (
                  <div className="flex flex-col items-center justify-center py-20 relative z-10">
                    <div className="w-8 h-8 border-4 border-cyan-400/10 border-t-cyan-400 rounded-full animate-spin mb-4"></div>
                    <p className="text-cyan-400 text-[9px] font-black tracking-[0.3em] uppercase animate-pulse">Cargando...</p>
                  </div>
                ) : calificaciones ? (
                  <>
                    {/* Resumen */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 pb-8 border-b border-white/5 relative z-10">
                      <div className="text-center sm:text-left shrink-0">
                        <p className="text-cyan-400 text-5xl font-black m-0 drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                          {calificaciones.promedio?.toFixed(1) ?? '—'}
                        </p>
                        <div className="flex gap-1 justify-center sm:justify-start mt-2 bg-slate-950/50 px-3 py-1.5 rounded-xl border border-white/5">
                          {renderEstrellas(Math.round(calificaciones.promedio ?? 0))}
                        </div>
                      </div>
                      <div className="text-center sm:text-left mt-2 sm:mt-0 flex flex-col justify-center h-full">
                        <p className="text-white text-xl font-black m-0 tracking-tight">
                          {profeSeleccionado?.nombre_completo}
                        </p>
                        <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest m-0 mt-2">
                          {calificaciones.total_calificaciones} calificación{calificaciones.total_calificaciones !== 1 ? 'es' : ''}
                        </p>
                      </div>
                    </div>

                    {/* Detalle */}
                    {calificaciones.total_calificaciones === 0 ? (
                      <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-10 text-center relative z-10">
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest m-0 italic">
                          Este profe todavía no recibió calificaciones.
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4 relative z-10 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {calificaciones.detalle.map((cal, i) => (
                          <div key={i} className="bg-slate-800/40 rounded-2xl p-5 border border-white/5 hover:border-cyan-400/20 transition-all duration-300">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-3">
                              <p className="text-white text-sm font-bold m-0 tracking-wide">
                                {cal.nombre_alumno}
                              </p>
                              <div className="flex items-center gap-2">
                                <div className="flex gap-1 bg-slate-950/50 px-2 py-1 rounded-lg">
                                  {renderEstrellas(cal.puntaje)}
                                </div>
                                {/* Botón chat — solo si la calificación es baja */}
                                {cal.puntaje <= 3 && (
                                  <button
                                    onClick={() => navigate(`/chat/${cal.id_alumno}`)}
                                    className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border border-purple-500/20 text-purple-400 hover:bg-purple-500/10 transition-all"
                                  >
                                    💬 Consultar
                                  </button>
                                )}
                              </div>
                            </div>
                            {cal.comentario && (
                              <p className="text-slate-300 text-sm font-medium leading-relaxed italic m-0 mb-4">
                                "{cal.comentario}"
                              </p>
                            )}
                            <div className="flex items-center justify-between">
                              <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest m-0">
                                {new Date(cal.fecha).toLocaleDateString('es-AR')}
                              </p>
                              {/* Botón chat siempre visible pero diferente estilo según puntaje */}
                              {cal.puntaje > 3 && (
                                <button
                                  onClick={() => navigate(`/chat/${cal.id_alumno}`)}
                                  className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border border-white/10 text-slate-500 hover:text-cyan-400 hover:border-cyan-400/20 transition-all"
                                >
                                  💬 Chatear
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Calificaciones;