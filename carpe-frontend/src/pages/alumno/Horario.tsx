import { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import api from '../../services/api';

interface Clase {
  id_clase: number;
  nombre: string;
  descripcion: string;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  capacidad: number;
  url_video: string;
  inscriptos: number;
}

const DIAS = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];
const DIAS_LABEL: Record<string, string> = {
  LUNES: 'Lunes', MARTES: 'Martes', MIERCOLES: 'Miércoles',
  JUEVES: 'Jueves', VIERNES: 'Viernes', SABADO: 'Sábado', DOMINGO: 'Domingo'
};
const DIAS_SHORT: Record<string, string> = {
  LUNES: 'Lun', MARTES: 'Mar', MIERCOLES: 'Mié',
  JUEVES: 'Jue', VIERNES: 'Vie', SABADO: 'Sáb', DOMINGO: 'Dom'
};

const Horario = () => {
  const [clases, setClases] = useState<Clase[]>([]);
  const [misInscripciones, setMisInscripciones] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [diaActivo, setDiaActivo] = useState('LUNES');
  const [procesando, setProcesando] = useState<number | null>(null);
  const [exito, setExito] = useState('');
  const [error, setError] = useState('');
  const [modalVideo, setModalVideo] = useState<Clase | null>(null);

  const cargar = async () => {
    try {
      const [clasesRes, inscripcionesRes] = await Promise.all([
        api.get('/clases'),
        api.get('/clases/mis-inscripciones'),
      ]);
      setClases(clasesRes.data);
      setMisInscripciones(inscripcionesRes.data);

      // Setear día actual como activo
      const diasSemana = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
      const hoy = diasSemana[new Date().getDay()];
      if (DIAS.includes(hoy)) setDiaActivo(hoy);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { cargar(); }, []);

  const mostrarExito = (msg: string) => { setExito(msg); setTimeout(() => setExito(''), 3000); };
  const mostrarError = (msg: string) => { setError(msg); setTimeout(() => setError(''), 3000); };

  const inscribirse = async (id_clase: number) => {
    setProcesando(id_clase);
    try {
      await api.post(`/clases/${id_clase}/inscribir`, {});
      setMisInscripciones(prev => [...prev, id_clase]);
      mostrarExito('¡Te inscribiste correctamente!');
    } catch (err: any) {
      mostrarError(err.response?.data?.error || 'Error al inscribirse.');
    } finally {
      setProcesando(null);
    }
  };

  const desinscribirse = async (id_clase: number) => {
    setProcesando(id_clase);
    try {
      await api.delete(`/clases/${id_clase}/inscribir`);
      setMisInscripciones(prev => prev.filter(id => id !== id_clase));
      mostrarExito('Desinscripción exitosa.');
    } catch (err: any) {
      mostrarError(err.response?.data?.error || 'Error al desinscribirse.');
    } finally {
      setProcesando(null);
    }
  };

  const clasesPorDia = (dia: string) => clases.filter(c => c.dia_semana === dia);
  const estaInscripto = (id: number) => misInscripciones.includes(id);
  const estaLlena = (clase: Clase) => clase.capacidad > 0 && Number(clase.inscriptos) >= clase.capacidad;

  return (
    <AppLayout>
      <div className="max-w-3xl w-full mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-2">Horarios</h1>
          <div className="flex items-center gap-2">
            <span className="w-8 h-[2px] bg-cyan-400"></span>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] m-0">Clases semanales disponibles</p>
          </div>
        </div>

        {exito && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-5 py-4 mb-6 text-xs font-bold">{exito}</div>}
        {error && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl px-5 py-4 mb-6 text-xs font-bold">{error}</div>}

        {/* Mis clases esta semana */}
        {misInscripciones.length > 0 && (
          <div className="bg-cyan-400/10 border border-cyan-400/20 rounded-2xl px-5 py-4 mb-6 flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <p className="text-cyan-400 text-sm font-bold">
              Estás inscripto en {misInscripciones.length} {misInscripciones.length === 1 ? 'clase' : 'clases'} esta semana.
            </p>
          </div>
        )}

        {/* Tabs días */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {DIAS.map(dia => {
            const tieneClases = clasesPorDia(dia).length > 0;
            const tieneInscripcion = clasesPorDia(dia).some(c => estaInscripto(c.id_clase));
            return (
              <button
                key={dia}
                onClick={() => setDiaActivo(dia)}
                className={`relative px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shrink-0 ${
                  diaActivo === dia
                    ? 'bg-cyan-400 text-black shadow-[0_0_15px_rgba(34,211,238,0.3)]'
                    : tieneClases
                      ? 'bg-slate-900/60 border border-white/10 text-white'
                      : 'bg-slate-900/40 border border-white/5 text-slate-600'
                }`}
              >
                {DIAS_SHORT[dia]}
                {tieneInscripcion && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-950"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* Clases del día */}
        <div className="mb-2">
          <p className="text-white font-black text-lg mb-4">{DIAS_LABEL[diaActivo]}</p>
        </div>

        {loading ? (
          <p className="text-cyan-400 text-sm font-bold animate-pulse text-center py-20">Cargando...</p>
        ) : clasesPorDia(diaActivo).length === 0 ? (
          <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-12 text-center">
            <p className="text-4xl mb-3">😴</p>
            <p className="text-white font-bold mb-1">No hay clases este día</p>
            <p className="text-slate-500 text-sm">Revisá otro día de la semana.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {clasesPorDia(diaActivo)
              .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))
              .map(item => {
                const inscripto = estaInscripto(item.id_clase);
                const llena = estaLlena(item);
                return (
                  <div
                    key={item.id_clase}
                    className={`bg-slate-900/60 border rounded-3xl p-5 transition-all ${
                      inscripto
                        ? 'border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                        : llena
                          ? 'border-red-500/20 opacity-75'
                          : 'border-white/5 hover:border-cyan-400/20'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">

                      {/* Hora */}
                      <div className={`rounded-2xl p-3 text-center shrink-0 w-full sm:w-24 ${
                        inscripto ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-cyan-400/10 border border-cyan-400/20'
                      }`}>
                        <p className={`font-black text-base leading-tight ${inscripto ? 'text-emerald-400' : 'text-cyan-400'}`}>
                          {item.hora_inicio.slice(0, 5)}
                        </p>
                        <p className="text-slate-500 text-[9px]">a</p>
                        <p className={`font-black text-base leading-tight ${inscripto ? 'text-emerald-400' : 'text-cyan-400'}`}>
                          {item.hora_fin.slice(0, 5)}
                        </p>
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="text-white font-black text-base">{item.nombre}</p>
                          {inscripto && (
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
                              ✓ Inscripto
                            </span>
                          )}
                          {llena && !inscripto && (
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
                              Llena
                            </span>
                          )}
                        </div>
                        {item.descripcion && (
                          <p className="text-slate-400 text-xs mb-2">{item.descripcion}</p>
                        )}
                        <div className="flex items-center gap-3 flex-wrap">
                          {item.capacidad > 0 && (
                            <span className={`text-[10px] font-bold ${
                              llena ? 'text-red-400' : 'text-slate-500'
                            }`}>
                              {item.inscriptos}/{item.capacidad} lugares
                            </span>
                          )}
                          {item.url_video && (
                            <button
                              onClick={() => setModalVideo(item)}
                              className="text-[10px] font-black px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all"
                            >
                              ▶ Ver video
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Botón inscripción */}
                      <div className="shrink-0">
                        {inscripto ? (
                          <button
                            onClick={() => desinscribirse(item.id_clase)}
                            disabled={procesando === item.id_clase}
                            className="px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 transition-all disabled:opacity-50"
                          >
                            {procesando === item.id_clase ? '...' : 'Cancelar'}
                          </button>
                        ) : (
                          <button
                            onClick={() => inscribirse(item.id_clase)}
                            disabled={llena || procesando === item.id_clase}
                            className="px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-black bg-gradient-to-r from-cyan-400 to-purple-600 hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {procesando === item.id_clase ? '...' : llena ? 'Sin lugar' : 'Anotarme'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* Modal video */}
        {modalVideo && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-950 border-2 border-blue-500/40 rounded-3xl p-6 w-full max-w-lg shadow-[0_0_30px_rgba(59,130,246,0.2)] relative">
              <h2 className="text-white text-xl font-black mb-1">{modalVideo.nombre}</h2>
              <p className="text-slate-400 text-sm mb-6">Vista previa de la clase</p>

              <div className="aspect-video bg-slate-800/50 rounded-2xl overflow-hidden mb-6 flex items-center justify-center border border-white/5">
                {modalVideo.url_video.includes('youtube') || modalVideo.url_video.includes('youtu.be') ? (
                  <iframe
                    src={modalVideo.url_video.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')}
                    className="w-full h-full"
                    allowFullScreen
                    title={modalVideo.nombre}
                  />
                ) : (
                  
                    <a href={modalVideo.url_video}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 font-bold text-sm hover:underline"
                  >
                    🔗 Abrir video
                  </a>
                )}
              </div>

              <button
                onClick={() => setModalVideo(null)}
                className="w-full py-3 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
};

export default Horario;