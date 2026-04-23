import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import api from '../../services/api';

const getEmbedUrl = (url: string): string | null => {
  try {
    if (url.includes('youtube.com/shorts/')) return `https://www.youtube.com/embed/${url.split('/shorts/')[1].split('?')[0]}`;
    if (url.includes('youtube.com/watch')) return `https://www.youtube.com/embed/${new URL(url).searchParams.get('v')}`;
    if (url.includes('youtu.be/')) return `https://www.youtube.com/embed/${url.split('youtu.be/')[1].split('?')[0]}`;
    if (url.includes('vimeo.com/')) return `https://player.vimeo.com/video/${url.split('vimeo.com/')[1].split('?')[0]}`;
  } catch { return null; }
  return null;
};

interface Ejercicio {
  id_ejercicio: number;
  nombre_ejercicio: string;
  series_sugeridas: number;
  repes_sugeridas: string;
  peso_sugerido_kg?: number;
  notas_profe?: string;
  url_video?: string;
}

interface Dia {
  id_dia: number;
  nombre: string;
  orden: number;
  ejercicios: Ejercicio[];
}

interface Semana {
  id_rutina: number;
  titulo: string;
  fecha_creacion: string;
  observaciones_generales?: string;
  dias: Dia[];
}

const RutinaPage = () => {
  const [semanas, setSemanas] = useState<Semana[]>([]);
  const [semanaActiva, setSemanaActiva] = useState<Semana | null>(null);
  const [diaActivo, setDiaActivo] = useState<Dia | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoAbierto, setVideoAbierto] = useState<Ejercicio | null>(null);
  const navigate = useNavigate();
 


  useEffect(() => {
    api.get('/rutinas/mis-rutinas')
      .then(res => {
        setSemanas(res.data);
        if (res.data.length > 0) {
          setSemanaActiva(res.data[0]);
          if (res.data[0].dias?.length > 0) setDiaActivo(res.data[0].dias[0]);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AppLayout><p className="text-slate-500 p-8">Cargando...</p></AppLayout>;

  return (
    <AppLayout>
      <div className="max-w-4xl w-full mx-auto animate-fade-in p-4 md:p-8">

        <div className="mb-8">
          <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-2">Mi rutina</h1>
          <div className="flex items-center gap-2">
            <span className="w-8 h-[2px] bg-cyan-400"></span>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] m-0">Tu plan de entrenamiento</p>
          </div>
        </div>

        {semanas.length === 0 ? (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-3xl p-8 text-center">
            <p className="text-sm font-bold uppercase">Aún no tenés ninguna rutina asignada. ¡Hablá con tu profe!</p>
          </div>
        ) : (
          <>
            {/* Tabs semanas */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {semanas.map(s => (
                <button key={s.id_rutina}
                  onClick={() => { setSemanaActiva(s); setDiaActivo(s.dias?.[0] || null); }}
                  className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                    semanaActiva?.id_rutina === s.id_rutina
                      ? 'bg-cyan-400 text-black shadow-[0_0_15px_rgba(34,211,238,0.3)]'
                      : 'bg-slate-900/60 border border-white/5 text-slate-400 hover:text-white'
                  }`}>
                  {s.titulo}
                </button>
              ))}
            </div>

            {semanaActiva && (
              <>
                {/* Comentario del profe */}
                {semanaActiva.observaciones_generales && (
                  <div className="bg-purple-500/10 border-l-4 border-purple-500 rounded-r-2xl p-4 mb-4">
                    <p className="text-purple-400 text-[9px] font-black uppercase tracking-widest mb-1">Comentario del profe</p>
                    <p className="text-white text-sm italic m-0">"{semanaActiva.observaciones_generales}"</p>
                  </div>
                )}

                {/* Tabs días */}
                {semanaActiva.dias?.length > 0 && (
                  <div className="flex gap-2 mb-4 overflow-x-auto pb-1 flex-wrap">
                    {semanaActiva.dias.map(dia => (
                      <button key={dia.id_dia}
                        onClick={() => setDiaActivo(dia)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${
                          diaActivo?.id_dia === dia.id_dia
                            ? 'bg-purple-500 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}>
                        {dia.nombre}
                      </button>
                    ))}
                  </div>
                )}

                {/* Ejercicios del día */}
                {diaActivo && (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-white font-black text-lg">{diaActivo.nombre}</p>
                      <button
  onClick={() => navigate('/alumno/registrar', { state: { dia: diaActivo, id_rutina: semanaActiva?.id_rutina } })}
                        className="px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-white bg-gradient-to-r from-cyan-500 to-purple-600 hover:brightness-110 transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                        Iniciar entrenamiento
                      </button>
                    </div>

                    <div className="flex flex-col gap-4">
                      {diaActivo.ejercicios?.length === 0 ? (
                        <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-8 text-center">
                          <p className="text-slate-500 text-xs italic">Este día no tiene ejercicios todavía.</p>
                        </div>
                      ) : diaActivo.ejercicios?.map((ej, i) => (
                        <div key={ej.id_ejercicio} className="bg-slate-800/40 border border-white/5 rounded-2xl p-5 hover:border-cyan-400/30 transition-all group">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="w-8 h-8 rounded-full bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 flex items-center justify-center font-black text-xs shrink-0">{i + 1}</span>
                                <p className="text-white text-base font-bold group-hover:text-cyan-400 transition-colors">{ej.nombre_ejercicio}</p>
                              </div>
                              <div className="flex flex-wrap gap-3 pl-11">
                                <span className="text-slate-500 text-[10px] font-black uppercase">Series <span className="text-white bg-slate-950/50 px-2 py-0.5 rounded">{ej.series_sugeridas}</span></span>
                                <span className="text-slate-500 text-[10px] font-black uppercase">Reps <span className="text-white bg-slate-950/50 px-2 py-0.5 rounded">{ej.repes_sugeridas}</span></span>
                                {ej.peso_sugerido_kg && <span className="text-slate-500 text-[10px] font-black uppercase">Peso <span className="text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/20">{ej.peso_sugerido_kg}kg</span></span>}
                              </div>
                              {ej.notas_profe && <p className="text-slate-400 text-xs italic mt-2 pl-11 border-l-2 border-slate-700 ml-11 px-2">{ej.notas_profe}</p>}
                            </div>
                            {ej.url_video && (
                              <button onClick={() => setVideoAbierto(ej)}
                                className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 transition-all flex items-center gap-2">
                                ▶ Ver video
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}

        {/* Modal video */}
        {videoAbierto && (
          <div onClick={() => setVideoAbierto(null)} className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div onClick={e => e.stopPropagation()} className="w-full max-w-3xl bg-slate-900 border-2 border-purple-400/40 rounded-3xl p-6">
              <div className="flex justify-between items-center mb-4">
                <p className="text-white text-xl font-black uppercase">{videoAbierto.nombre_ejercicio}</p>
                <button onClick={() => setVideoAbierto(null)} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all">✕</button>
              </div>
              <div className="bg-black rounded-2xl overflow-hidden">
                {videoAbierto.url_video && getEmbedUrl(videoAbierto.url_video) ? (
                  <iframe src={getEmbedUrl(videoAbierto.url_video)!} className="w-full h-[300px] md:h-[400px] border-none" allowFullScreen />
                ) : (
                  <div className="w-full h-[300px] flex items-center justify-center">
                    <p className="text-slate-500 text-sm">No se pudo cargar el video.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default RutinaPage;