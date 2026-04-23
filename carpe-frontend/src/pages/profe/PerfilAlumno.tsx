import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import api from '../../services/api';
import Avatar from '../../components/Avatar';

interface AlumnoInfo {
  id_usuario: number;
  nombre_completo: string;
  email: string;
  foto_url?: string | null;
}

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

interface NuevoEjercicio {
  nombre_ejercicio: string;
  series_sugeridas: number | string;
  repes_sugeridas: string;
  peso_sugerido_kg: string;
  notas_profe: string;
}

const ejercicioVacio = (): NuevoEjercicio => ({
  nombre_ejercicio: '', series_sugeridas: 3,
  repes_sugeridas: '10-12', peso_sugerido_kg: '', notas_profe: ''
});

const PerfilAlumno = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [alumno, setAlumno] = useState<AlumnoInfo | null>(null);
  const [semanas, setSemanas] = useState<Semana[]>([]);
  const [semanaActiva, setSemanaActiva] = useState<Semana | null>(null);
  const [diaActivo, setDiaActivo] = useState<Dia | null>(null);
  const [loading, setLoading] = useState(true);
  const [exito, setExito] = useState('');
  const [error, setError] = useState('');
  const [comentario, setComentario] = useState('');
  const [guardandoComentario, setGuardandoComentario] = useState(false);

  // Modales
  const [modalNuevaSemana, setModalNuevaSemana] = useState(false);
  const [modalNuevoDia, setModalNuevoDia] = useState(false);
  const [modalAgregarEjercicio, setModalAgregarEjercicio] = useState<number | null>(null); // id_dia
  const [ejercicioEditando, setEjercicioEditando] = useState<Ejercicio | null>(null);
  const [videoEjercicio, setVideoEjercicio] = useState<{ id: number; url: string } | null>(null);

  const [tituloSemana, setTituloSemana] = useState('');
  const [nombreDia, setNombreDia] = useState('');
  const [nuevoEjercicio, setNuevoEjercicio] = useState<NuevoEjercicio>(ejercicioVacio());

  const mostrarExito = (msg: string) => { setExito(msg); setTimeout(() => setExito(''), 3000); };
  const mostrarError = (msg: string) => { setError(msg); setTimeout(() => setError(''), 3000); };

  const cargarDatos = async () => {
    try {
      const [alumnoRes, semanasRes] = await Promise.all([
        api.get(`/usuarios/${id}`),
        api.get(`/rutinas/alumno/${id}`),
      ]);
      setAlumno(alumnoRes.data);
      setSemanas(semanasRes.data);
      if (semanasRes.data.length > 0) {
        setSemanaActiva(semanasRes.data[0]);
        setComentario(semanasRes.data[0].observaciones_generales || '');
        if (semanasRes.data[0].dias?.length > 0) {
          setDiaActivo(semanasRes.data[0].dias[0]);
        }
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { cargarDatos(); }, [id]);

  const crearSemana = async () => {
    if (!tituloSemana.trim()) { mostrarError('Ingresá un título.'); return; }
    try {
      await api.post('/rutinas/crear', { id_alumno: Number(id), titulo: tituloSemana });
      setModalNuevaSemana(false);
      setTituloSemana('');
      cargarDatos();
      mostrarExito('Semana creada.');
    } catch (err: any) { mostrarError(err.response?.data?.error || 'Error al crear semana.'); }
  };

  const agregarDia = async () => {
    if (!nombreDia.trim() || !semanaActiva) { mostrarError('Ingresá un nombre para el día.'); return; }
    try {
      const orden = (semanaActiva.dias?.length || 0) + 1;
      await api.post(`/rutinas/${semanaActiva.id_rutina}/dia`, { nombre: nombreDia, orden });
      setModalNuevoDia(false);
      setNombreDia('');
      cargarDatos();
      mostrarExito('Día agregado.');
    } catch (err: any) { mostrarError(err.response?.data?.error || 'Error al agregar día.'); }
  };

  const agregarEjercicio = async () => {
    if (!modalAgregarEjercicio || !semanaActiva) return;
    try {
      await api.post(`/rutinas/dia/${modalAgregarEjercicio}/ejercicio`, {
        id_rutina: semanaActiva.id_rutina,
        ...nuevoEjercicio,
        peso_sugerido_kg: nuevoEjercicio.peso_sugerido_kg ? Number(nuevoEjercicio.peso_sugerido_kg) : null,
      });
      setModalAgregarEjercicio(null);
      setNuevoEjercicio(ejercicioVacio());
      cargarDatos();
      mostrarExito('Ejercicio agregado.');
    } catch (err: any) { mostrarError(err.response?.data?.error || 'Error al agregar.'); }
  };

  const guardarEdicion = async () => {
    if (!ejercicioEditando) return;
    try {
      await api.put(`/rutinas/ejercicio/${ejercicioEditando.id_ejercicio}`, ejercicioEditando);
      setEjercicioEditando(null);
      cargarDatos();
      mostrarExito('Ejercicio actualizado.');
    } catch (err: any) { mostrarError(err.response?.data?.error || 'Error al actualizar.'); }
  };

  const eliminarEjercicio = async (id_ejercicio: number) => {
    if (!window.confirm('¿Eliminar este ejercicio?')) return;
    try {
      await api.delete(`/rutinas/ejercicio/${id_ejercicio}`);
      cargarDatos();
      mostrarExito('Ejercicio eliminado.');
    } catch (err: any) { mostrarError('Error al eliminar.'); }
  };

  const eliminarDia = async (id_dia: number) => {
    if (!window.confirm('¿Eliminar este día y todos sus ejercicios?')) return;
    try {
      await api.delete(`/rutinas/dia/${id_dia}`);
      cargarDatos();
      mostrarExito('Día eliminado.');
    } catch (err: any) { mostrarError('Error al eliminar día.'); }
  };

  const eliminarSemana = async (id_rutina: number) => {
    if (!window.confirm('¿Eliminar esta semana completa?')) return;
    try {
      await api.delete(`/rutinas/${id_rutina}`);
      cargarDatos();
      mostrarExito('Semana eliminada.');
    } catch (err: any) { mostrarError('Error al eliminar semana.'); }
  };

  const guardarComentario = async () => {
    if (!semanaActiva) return;
    setGuardandoComentario(true);
    try {
      await api.put(`/rutinas/${semanaActiva.id_rutina}/comentario`, { comentario });
      mostrarExito('Comentario guardado.');
    } catch (err: any) { mostrarError('Error al guardar.'); }
    finally { setGuardandoComentario(false); }
  };

  const guardarVideo = async () => {
    if (!videoEjercicio) return;
    try {
      await api.put(`/videos/ejercicio/${videoEjercicio.id}`, { video_url: videoEjercicio.url });
      mostrarExito('Video guardado.');
      setVideoEjercicio(null);
      cargarDatos();
    } catch (err: any) { mostrarError('Error al guardar video.'); }
  };

  if (loading) return <AppLayout><p className="text-slate-500 p-8">Cargando...</p></AppLayout>;

  return (
    <AppLayout>
      <div className="max-w-6xl w-full mx-auto p-4 md:p-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Avatar foto_url={alumno?.foto_url} nombre={alumno?.nombre_completo || ''} size="lg" />
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight m-0">{alumno?.nombre_completo}</h1>
              <p className="text-slate-400 text-xs uppercase tracking-widest m-0">{alumno?.email}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate(`/chat/${id}`)}
              className="px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 transition-all">
              💬 Chat
            </button>
            <button onClick={() => setModalNuevaSemana(true)}
              className="px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-black bg-gradient-to-r from-cyan-400 to-purple-600 hover:brightness-110 transition-all">
              + Nueva semana
            </button>
          </div>
        </div>

        {exito && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-5 py-3 mb-6 text-xs font-bold">{exito}</div>}
        {error && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl px-5 py-3 mb-6 text-xs font-bold">{error}</div>}

        {semanas.length === 0 ? (
          <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-16 text-center">
            <p className="text-slate-500 text-sm italic">No hay semanas creadas todavía.</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">

            {/* Panel izquierdo */}
            <div className="flex-1">

              {/* Tabs semanas */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {semanas.map(s => (
                  <button key={s.id_rutina}
                    onClick={() => { setSemanaActiva(s); setComentario(s.observaciones_generales || ''); setDiaActivo(s.dias?.[0] || null); }}
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
                  {/* Acciones semana */}
                  <div className="flex gap-2 mb-4 flex-wrap">
                    <button onClick={() => setModalNuevoDia(true)}
                      className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 transition-all">
                      + Agregar día
                    </button>
                    <button onClick={() => eliminarSemana(semanaActiva.id_rutina)}
                      className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-all">
                      Eliminar semana
                    </button>
                  </div>

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

                  {/* Ejercicios del día activo */}
                  {diaActivo && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-white font-black text-base">{diaActivo.nombre}</p>
                        <div className="flex gap-2">
                          <button onClick={() => setModalAgregarEjercicio(diaActivo.id_dia)}
                            className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 transition-all">
                            + Ejercicio
                          </button>
                          <button onClick={() => eliminarDia(diaActivo.id_dia)}
                            className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-all">
                            Eliminar día
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        {diaActivo.ejercicios?.length === 0 ? (
                          <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-8 text-center">
                            <p className="text-slate-500 text-xs italic">No hay ejercicios en este día.</p>
                          </div>
                        ) : diaActivo.ejercicios?.map(ej => (
                          <div key={ej.id_ejercicio} className="bg-slate-900/60 border border-white/5 rounded-2xl p-5 hover:border-cyan-400/20 transition-all">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                              <div className="flex-1">
                                <p className="text-white font-bold text-base m-0 mb-2">{ej.nombre_ejercicio}</p>
                                <div className="flex flex-wrap gap-2 mb-2">
                                  <span className="text-[10px] font-bold bg-slate-800 text-slate-400 px-2 py-1 rounded-md">{ej.series_sugeridas} series</span>
                                  <span className="text-[10px] font-bold bg-slate-800 text-slate-400 px-2 py-1 rounded-md">{ej.repes_sugeridas} reps</span>
                                  {ej.peso_sugerido_kg && <span className="text-[10px] font-bold bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 px-2 py-1 rounded-md">{ej.peso_sugerido_kg}kg</span>}
                                </div>
                                {ej.notas_profe && <p className="text-slate-400 text-xs italic border-l-2 border-slate-700 pl-2">{ej.notas_profe}</p>}
                                <div className="flex gap-2 mt-3 flex-wrap">
                                  {ej.url_video
                                    ? <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-md">Video ✓</span>
                                    : <span className="text-[10px] font-black bg-slate-800 text-slate-500 px-2 py-1 rounded-md">Sin video</span>
                                  }
                                  <button onClick={() => setVideoEjercicio({ id: ej.id_ejercicio, url: ej.url_video || '' })}
                                    className="text-[10px] font-black border border-white/10 text-slate-400 hover:text-white px-2 py-1 rounded-md transition-all">
                                    {ej.url_video ? 'Cambiar' : 'Agregar video'}
                                  </button>
                                  {ej.url_video && (
                                    <button onClick={async () => { await api.delete(`/rutinas/ejercicio/${ej.id_ejercicio}/video`); cargarDatos(); }}
                                      className="text-[10px] font-black border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 px-2 py-1 rounded-md transition-all">
                                      Borrar video
                                    </button>
                                  )}
                                  <button onClick={() => setEjercicioEditando(ej)}
                                    className="text-[10px] font-black border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 px-2 py-1 rounded-md transition-all">
                                    Editar
                                  </button>
                                  <button onClick={() => eliminarEjercicio(ej.id_ejercicio)}
                                    className="text-[10px] font-black border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 px-2 py-1 rounded-md transition-all">
                                    Eliminar
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!diaActivo && semanaActiva.dias?.length === 0 && (
                    <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-8 text-center">
                      <p className="text-slate-500 text-xs italic">Esta semana no tiene días. Agregá uno.</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Panel derecho — comentario y video */}
            <div className="w-full lg:w-72 shrink-0 flex flex-col gap-4">
              <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-5">
                <p className="text-white text-sm font-black uppercase tracking-widest mb-3">Comentario general</p>
                <textarea value={comentario} onChange={e => setComentario(e.target.value)}
                  placeholder="Escribí un consejo..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-white/5 bg-slate-800/50 text-white text-sm focus:outline-none focus:border-purple-400/50 transition-all placeholder-slate-600 resize-none"
                />
                <button onClick={guardarComentario} disabled={guardandoComentario}
                  className="w-full mt-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 transition-all disabled:opacity-50">
                  {guardandoComentario ? 'Guardando...' : 'Guardar comentario'}
                </button>
              </div>

              {videoEjercicio && (
                <div className="bg-slate-900/60 border border-cyan-400/30 rounded-3xl p-5">
                  <p className="text-white text-sm font-black uppercase tracking-widest mb-3">URL del video</p>
                  <input type="url" value={videoEjercicio.url}
                    onChange={e => setVideoEjercicio(prev => prev ? { ...prev, url: e.target.value } : null)}
                    placeholder="https://youtube.com/..."
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-800/50 text-white text-sm focus:outline-none focus:border-cyan-400/50 transition-all placeholder-slate-600 mb-3"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setVideoEjercicio(null)} className="flex-1 py-2.5 rounded-xl text-[10px] font-bold text-slate-400 hover:text-white border border-white/5 transition-all">Cancelar</button>
                    <button onClick={guardarVideo} className="flex-1 py-2.5 rounded-xl text-[10px] font-black text-black bg-gradient-to-r from-cyan-400 to-purple-600 hover:brightness-110 transition-all">Guardar</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal nueva semana */}
        {modalNuevaSemana && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-950 border-2 border-cyan-400/40 rounded-3xl p-6 w-full max-w-md">
              <h2 className="text-white text-xl font-black mb-4 uppercase">Nueva semana</h2>
              <input type="text" value={tituloSemana} onChange={e => setTituloSemana(e.target.value)}
                placeholder="Ej: Semana 1 - Fuerza"
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-900 text-white text-sm focus:outline-none focus:border-cyan-400/50 transition-all placeholder-slate-600 mb-4"
              />
              <p className="text-slate-500 text-[10px] mb-4">Máximo 3 semanas por alumno. Si hay 3, se borrará la más antigua automáticamente.</p>
              <div className="flex gap-3">
                <button onClick={() => setModalNuevaSemana(false)} className="flex-1 py-3 rounded-xl text-[11px] font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all">Cancelar</button>
                <button onClick={crearSemana} className="flex-1 py-3 rounded-xl text-[11px] font-black text-black bg-gradient-to-r from-cyan-400 to-purple-600 hover:brightness-110 transition-all">Crear</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal nuevo día */}
        {modalNuevoDia && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-950 border-2 border-purple-400/40 rounded-3xl p-6 w-full max-w-md">
              <h2 className="text-white text-xl font-black mb-4 uppercase">Nuevo día</h2>
              <input type="text" value={nombreDia} onChange={e => setNombreDia(e.target.value)}
                placeholder="Ej: Día 1 - Pecho y Bíceps"
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-900 text-white text-sm focus:outline-none focus:border-purple-400/50 transition-all placeholder-slate-600 mb-4"
              />
              <div className="flex gap-3">
                <button onClick={() => setModalNuevoDia(false)} className="flex-1 py-3 rounded-xl text-[11px] font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all">Cancelar</button>
                <button onClick={agregarDia} className="flex-1 py-3 rounded-xl text-[11px] font-black text-black bg-gradient-to-r from-purple-400 to-cyan-400 hover:brightness-110 transition-all">Agregar</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal agregar ejercicio */}
        {modalAgregarEjercicio && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-950 border-2 border-cyan-400/40 rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-white text-xl font-black mb-4 uppercase">Agregar ejercicio</h2>
              <div className="flex flex-col gap-3">
                {[
                  { label: 'Nombre', campo: 'nombre_ejercicio', type: 'text', placeholder: 'Sentadilla' },
                  { label: 'Series', campo: 'series_sugeridas', type: 'number', placeholder: '3' },
                  { label: 'Repeticiones', campo: 'repes_sugeridas', type: 'text', placeholder: '10-12' },
                  { label: 'Peso (kg)', campo: 'peso_sugerido_kg', type: 'number', placeholder: '60' },
                  { label: 'Nota', campo: 'notas_profe', type: 'text', placeholder: 'Opcional' },
                ].map(f => (
                  <div key={f.campo}>
                    <label className="block text-[9px] font-black text-slate-500 mb-1 uppercase tracking-[0.2em]">{f.label}</label>
                    <input type={f.type} placeholder={f.placeholder}
                      value={nuevoEjercicio[f.campo as keyof NuevoEjercicio]}
                      onChange={e => setNuevoEjercicio(prev => ({ ...prev, [f.campo]: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-900 text-white text-sm focus:outline-none focus:border-cyan-400/50 transition-all placeholder-slate-600"
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => { setModalAgregarEjercicio(null); setNuevoEjercicio(ejercicioVacio()); }}
                  className="flex-1 py-3 rounded-xl text-[11px] font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all">Cancelar</button>
                <button onClick={agregarEjercicio}
                  className="flex-1 py-3 rounded-xl text-[11px] font-black text-black bg-gradient-to-r from-cyan-400 to-purple-600 hover:brightness-110 transition-all">Agregar</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal editar ejercicio */}
        {ejercicioEditando && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-950 border-2 border-blue-500/40 rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-white text-xl font-black mb-4 uppercase">Editar ejercicio</h2>
              <div className="flex flex-col gap-3">
                {[
                  { label: 'Nombre', campo: 'nombre_ejercicio', type: 'text' },
                  { label: 'Series', campo: 'series_sugeridas', type: 'number' },
                  { label: 'Repeticiones', campo: 'repes_sugeridas', type: 'text' },
                  { label: 'Peso (kg)', campo: 'peso_sugerido_kg', type: 'number' },
                  { label: 'Nota', campo: 'notas_profe', type: 'text' },
                ].map(f => (
                  <div key={f.campo}>
                    <label className="block text-[9px] font-black text-slate-500 mb-1 uppercase tracking-[0.2em]">{f.label}</label>
                    <input type={f.type}
                      value={ejercicioEditando[f.campo as keyof Ejercicio] as string || ''}
                      onChange={e => setEjercicioEditando(prev => prev ? { ...prev, [f.campo]: e.target.value } : null)}
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-900 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all"
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setEjercicioEditando(null)} className="flex-1 py-3 rounded-xl text-[11px] font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all">Cancelar</button>
                <button onClick={guardarEdicion} className="flex-1 py-3 rounded-xl text-[11px] font-black text-white bg-blue-600 hover:bg-blue-500 transition-all">Guardar</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
};

export default PerfilAlumno;