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
  activa: boolean;
  inscriptos: number;
}

const DIAS = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];
const DIAS_LABEL: Record<string, string> = {
  LUNES: 'Lun', MARTES: 'Mar', MIERCOLES: 'Mié',
  JUEVES: 'Jue', VIERNES: 'Vie', SABADO: 'Sáb', DOMINGO: 'Dom'
};

const claseVacia = () => ({
  nombre: '', descripcion: '', dia_semana: 'LUNES',
  hora_inicio: '08:00', hora_fin: '09:00',
  capacidad: '0', url_video: '',
});

const Clases = () => {
  const [clases, setClases] = useState<Clase[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<Clase | null>(null);
  const [form, setForm] = useState(claseVacia());
  const [exito, setExito] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [diaActivo, setDiaActivo] = useState('LUNES');

  const cargar = async () => {
    try {
      const { data } = await api.get('/clases/admin');
      setClases(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

 useEffect(() => { 
  cargar();
  api.put('/clases/notificaciones/visto').catch(() => {});
}, []);

  const mostrarExito = (msg: string) => { setExito(msg); setTimeout(() => setExito(''), 3000); };
  const mostrarError = (msg: string) => { setError(msg); setTimeout(() => setError(''), 3000); };

  const abrirModal = (clase?: Clase) => {
    if (clase) {
      setEditando(clase);
      setForm({
        nombre: clase.nombre,
        descripcion: clase.descripcion || '',
        dia_semana: clase.dia_semana,
        hora_inicio: clase.hora_inicio.slice(0, 5),
        hora_fin: clase.hora_fin.slice(0, 5),
        capacidad: clase.capacidad.toString(),
        url_video: clase.url_video || '',
      });
    } else {
      setEditando(null);
      setForm({ ...claseVacia(), dia_semana: diaActivo });
    }
    setModal(true);
  };

  const guardar = async () => {
    if (!form.nombre || !form.hora_inicio || !form.hora_fin) {
      mostrarError('Completá los campos obligatorios.');
      return;
    }
    setGuardando(true);
    try {
      const payload = { ...form, capacidad: Number(form.capacidad) };
      if (editando) {
        await api.put(`/clases/${editando.id_clase}`, { ...payload, activa: editando.activa });
      } else {
        await api.post('/clases', payload);
      }
      setModal(false);
      cargar();
      mostrarExito(editando ? 'Clase actualizada.' : 'Clase creada.');
    } catch (err: any) {
      mostrarError(err.response?.data?.error || 'Error al guardar.');
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (id: number) => {
    if (!window.confirm('¿Desactivar esta clase?')) return;
    try {
      await api.delete(`/clases/${id}`);
      cargar();
      mostrarExito('Clase desactivada.');
    } catch (err: any) {
      mostrarError('Error al eliminar.');
    }
  };

  const clasesPorDia = (dia: string) => clases.filter(c => c.dia_semana === dia);

  return (
    <AppLayout>
      <div className="max-w-6xl w-full mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-2">Clases</h1>
            <div className="flex items-center gap-2">
              <span className="w-8 h-[2px] bg-cyan-400"></span>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] m-0">Horario semanal</p>
            </div>
          </div>
          <button
            onClick={() => abrirModal()}
            className="px-6 py-3 rounded-xl text-[12px] font-black uppercase tracking-widest text-black bg-gradient-to-r from-cyan-400 to-purple-600 shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:brightness-110 transition-all"
          >
            + Nueva clase
          </button>
        </div>

        {exito && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-5 py-4 mb-6 text-xs font-bold">{exito}</div>}
        {error && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl px-5 py-4 mb-6 text-xs font-bold">{error}</div>}

        {/* Tabs días */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {DIAS.map(dia => (
            <button
              key={dia}
              onClick={() => setDiaActivo(dia)}
              className={`px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shrink-0 ${
                diaActivo === dia
                  ? 'bg-cyan-400 text-black shadow-[0_0_15px_rgba(34,211,238,0.3)]'
                  : 'bg-slate-900/60 border border-white/5 text-slate-500 hover:text-white'
              }`}
            >
              {DIAS_LABEL[dia]}
              {clasesPorDia(dia).length > 0 && (
                <span className={`ml-2 text-[9px] px-1.5 py-0.5 rounded-full ${diaActivo === dia ? 'bg-black/20 text-black' : 'bg-cyan-400/20 text-cyan-400'}`}>
                  {clasesPorDia(dia).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Grilla del día */}
        {loading ? (
          <p className="text-cyan-400 text-sm font-bold animate-pulse text-center py-20">Cargando...</p>
        ) : clasesPorDia(diaActivo).length === 0 ? (
          <div className="border-2 border-dashed border-slate-700/50 rounded-3xl p-16 text-center">
            <p className="text-4xl mb-4">📅</p>
            <p className="text-white font-bold text-base mb-2">No hay clases el {DIAS_LABEL[diaActivo]}</p>
            <p className="text-slate-500 text-sm mb-6">Agregá una clase para este día.</p>
            <button
              onClick={() => abrirModal()}
              className="px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest text-black bg-gradient-to-r from-cyan-400 to-purple-600"
            >
              + Agregar clase
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {clasesPorDia(diaActivo)
              .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))
              .map(clase => (
                <div
                  key={clase.id_clase}
                  className={`bg-slate-900/60 border rounded-3xl p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4 transition-all ${
                    !clase.activa ? 'opacity-50 border-white/5' : 'border-white/5 hover:border-cyan-400/20'
                  }`}
                >
                  {/* Hora */}
                  <div className="bg-cyan-400/10 border border-cyan-400/20 rounded-2xl p-4 text-center shrink-0 w-full md:w-28">
                    <p className="text-cyan-400 font-black text-lg leading-tight">{clase.hora_inicio.slice(0, 5)}</p>
                    <p className="text-slate-500 text-[10px] font-bold">a</p>
                    <p className="text-cyan-400 font-black text-lg leading-tight">{clase.hora_fin.slice(0, 5)}</p>
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <p className="text-white font-black text-base">{clase.nombre}</p>
                      {!clase.activa && (
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-slate-700 text-slate-500">Inactiva</span>
                      )}
                    </div>
                    {clase.descripcion && (
                      <p className="text-slate-400 text-xs mb-2">{clase.descripcion}</p>
                    )}
                    <div className="flex items-center gap-3 flex-wrap">
                      {clase.capacidad > 0 && (
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                          Number(clase.inscriptos) >= clase.capacidad
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {clase.inscriptos}/{clase.capacidad} inscriptos
                        </span>
                      )}
                      {clase.url_video && (
                        
                          <a href={clase.url_video}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-black px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all"
                        >
                          ▶ Ver video
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => abrirModal(clase)}
                      className="px-4 py-2 rounded-xl border border-cyan-400/20 text-cyan-400 hover:bg-cyan-400/10 text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      ✏️ Editar
                    </button>
                    <button onClick={() => eliminar(clase.id_clase)}
                      className="px-4 py-2 rounded-xl border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 text-[10px] font-black uppercase tracking-widest transition-all">
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Modal */}
        {modal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-950 border-2 border-cyan-400/40 rounded-3xl p-6 w-full max-w-lg shadow-[0_0_30px_rgba(34,211,238,0.2)] relative max-h-[90vh] overflow-y-auto">
              <h2 className="text-white text-xl font-black mb-6 uppercase tracking-wide">
                {editando ? 'Editar clase' : 'Nueva clase'}
              </h2>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-[9px] font-black text-slate-500 mb-1.5 uppercase tracking-[0.2em]">Nombre *</label>
                  <input type="text" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })}
                    placeholder="Ej: Funcional, Yoga, Spinning..."
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-900 text-white text-sm focus:outline-none focus:border-cyan-400/50 transition-all placeholder-slate-600" />
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-500 mb-1.5 uppercase tracking-[0.2em]">Descripción (opcional)</label>
                  <textarea value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })}
                    placeholder="Breve descripción de la clase..."
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-900 text-white text-sm focus:outline-none focus:border-cyan-400/50 transition-all placeholder-slate-600 resize-none" />
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-500 mb-1.5 uppercase tracking-[0.2em]">Día *</label>
                  <div className="grid grid-cols-4 gap-2">
                    {DIAS.map(dia => (
                      <button
                        key={dia}
                        type="button"
                        onClick={() => setForm({ ...form, dia_semana: dia })}
                        className={`py-2 rounded-xl text-[10px] font-black transition-all ${
                          form.dia_semana === dia
                            ? 'bg-cyan-400 text-black'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {DIAS_LABEL[dia]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-black text-slate-500 mb-1.5 uppercase tracking-[0.2em]">Hora inicio *</label>
                    <input type="time" value={form.hora_inicio} onChange={e => setForm({ ...form, hora_inicio: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-900 text-white text-sm focus:outline-none focus:border-cyan-400/50 transition-all" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-500 mb-1.5 uppercase tracking-[0.2em]">Hora fin *</label>
                    <input type="time" value={form.hora_fin} onChange={e => setForm({ ...form, hora_fin: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-900 text-white text-sm focus:outline-none focus:border-cyan-400/50 transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-500 mb-1.5 uppercase tracking-[0.2em]">Capacidad máxima (0 = sin límite)</label>
                  <input type="number" min="0" value={form.capacidad} onChange={e => setForm({ ...form, capacidad: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-900 text-white text-sm focus:outline-none focus:border-cyan-400/50 transition-all" />
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-500 mb-1.5 uppercase tracking-[0.2em]">URL del video (opcional)</label>
                  <input type="url" value={form.url_video} onChange={e => setForm({ ...form, url_video: e.target.value })}
                    placeholder="https://youtube.com/..."
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-900 text-white text-sm focus:outline-none focus:border-cyan-400/50 transition-all placeholder-slate-600" />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button onClick={() => setModal(false)} className="flex-1 py-3.5 rounded-xl text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 transition-all">Cancelar</button>
                <button onClick={guardar} disabled={guardando} className="flex-1 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-black bg-gradient-to-r from-cyan-400 to-purple-600 hover:brightness-110 transition-all disabled:opacity-50">
                  {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear clase'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
};

export default Clases;