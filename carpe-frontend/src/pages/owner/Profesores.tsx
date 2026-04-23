import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import api from '../../services/api';
import Avatar from '../../components/Avatar';

interface Profe {
  id_usuario: number;
  nombre_completo: string;
  email: string;
  estado_activo: boolean;
  fecha_inicio?: string;
  total_alumnos: number;
  foto_url?: string | null;
}

const Profesores = () => {
  const [profes, setProfes] = useState<Profe[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalEditar, setModalEditar] = useState<Profe | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const navigate = useNavigate();

  const cargarProfes = async () => {
    try {
      const { data } = await api.get('/usuarios/profes');
      setProfes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarProfes(); }, []);

  const profesFiltrados = profes.filter(p =>
    p.nombre_completo.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.email.toLowerCase().includes(busqueda.toLowerCase())
  );

  const totalAlumnos = profes.reduce((acc, p) => acc + Number(p.total_alumnos), 0);
  const profeConMasAlumnos = profes.length > 0
    ? profes.reduce((a, b) => Number(a.total_alumnos) > Number(b.total_alumnos) ? a : b)
    : null;

  const guardarEdicion = async () => {
    if (!modalEditar) return;
    setError('');
    try {
      await api.put(`/usuarios/${modalEditar.id_usuario}/editar`, {
        nombre_completo: modalEditar.nombre_completo,
        email: modalEditar.email,
        fecha_inicio: modalEditar.fecha_inicio,
      });
      setExito('Profesor actualizado correctamente.');
      setModalEditar(null);
      cargarProfes();
      setTimeout(() => setExito(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al actualizar');
    }
  };

  const confirmarEliminar = async (id: number, nombre: string) => {
    if (!window.confirm(`¿Seguro que querés eliminar a ${nombre}?`)) return;
    try {
      await api.delete(`/usuarios/${id}`);
      setExito('Profesor eliminado correctamente.');
      cargarProfes();
      setTimeout(() => setExito(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al eliminar');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getAntiguedad = (fecha?: string) => {
    if (!fecha) return 'Sin fecha';
    const meses = Math.floor((Date.now() - new Date(fecha).getTime()) / (1000 * 60 * 60 * 24 * 30));
    if (meses < 1) return 'Menos de 1 mes';
    if (meses < 12) return `${meses} mes${meses !== 1 ? 'es' : ''}`;
    const años = Math.floor(meses / 12);
    return `${años} año${años !== 1 ? 's' : ''}`;
  };

  return (
    <AppLayout>
      <div className="max-w-6xl w-full mx-auto animate-fade-in">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 mb-8 mt-2">
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-2">
              Profesores
            </h1>
            <div className="flex items-center gap-2">
              <span className="w-8 h-[2px] bg-cyan-400"></span>
              <p className="text-slate-400 text-xs md:text-sm font-bold uppercase tracking-[0.2em]">
                {profes.length} profesor{profes.length !== 1 ? 'es' : ''} registrado{profes.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={cargarProfes}
            className="px-6 py-4 rounded-xl text-[13px] font-black uppercase tracking-widest border border-white/5 bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50 hover:border-cyan-400/30 transition-all shadow-sm"
          >
            Actualizar
          </button>
        </div>

        {/* Mini dashboard (Tarjetas Slate con brillo interior) */}
        {profes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full blur-xl pointer-events-none"></div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-3 relative z-10">Total profesores</p>
              <p className="text-white font-black text-3xl m-0 relative z-10">
                {profes.length}
              </p>
            </div>
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-cyan-400/30 transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-cyan-500/20 transition-all"></div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-3 relative z-10">Total alumnos asignados</p>
              <p className="text-cyan-400 font-black text-3xl m-0 drop-shadow-[0_0_15px_rgba(34,211,238,0.3)] relative z-10">
                {totalAlumnos}
              </p>
            </div>
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-purple-500/30 transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-600/10 rounded-full blur-xl pointer-events-none group-hover:bg-purple-600/20 transition-all"></div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-3 relative z-10">Más alumnos</p>
              <p className="text-purple-400 font-black text-xl m-0 drop-shadow-[0_0_15px_rgba(168,85,247,0.3)] truncate relative z-10">
                {profeConMasAlumnos ? `${profeConMasAlumnos.nombre_completo} (${profeConMasAlumnos.total_alumnos})` : '—'}
              </p>
            </div>
          </div>
        )}

        {/* Buscador - Estilo Slate */}
        <div className="relative mb-8 group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm group-focus-within:text-cyan-400 transition-colors">🔍</span>
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/5 bg-slate-900/50 text-white text-sm focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/10 transition-all placeholder-slate-600 shadow-inner"
          />
        </div>

        {/* Notificaciones */}
        {exito && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-4 py-4 mb-6 text-sm font-bold tracking-wide animate-fade-in">
            {exito}
          </div>
        )}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl px-4 py-4 mb-6 text-sm font-bold tracking-wide animate-pulse">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-cyan-400/10 border-t-cyan-400 rounded-full animate-spin mb-4"></div>
            <p className="text-cyan-400 text-[10px] font-black tracking-[0.3em] uppercase animate-pulse">Cargando profesores...</p>
          </div>
        ) : profesFiltrados.length === 0 ? (
          <div className="bg-slate-900/60 border-2 border-white/5 rounded-3xl p-16 text-center backdrop-blur-xl">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest m-0 italic">
              {busqueda ? 'No se encontraron resultados.' : 'No hay profesores registrados todavía.'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {profesFiltrados.map(profe => (
              <div
                key={profe.id_usuario}
                // CAMBIO RESPONSIVE AQUÍ: flex-col y xl:flex-row para que apile bien en móviles/tablets
                className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-5 md:p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-5 md:gap-6 hover:border-cyan-400/30 hover:shadow-[0_0_20px_rgba(34,211,238,0.1)] transition-all duration-300 group"
              >
                {/* Info */}
                {/* Agregado min-w-0 para que el truncate funcione sin deformar el flex */}
                <div className="flex items-center gap-4 md:gap-5 flex-1 min-w-0">
                  <Avatar foto_url={profe.foto_url} nombre={profe.nombre_completo} size="md" />
                  <div className="min-w-0">
                    <p className="text-white font-black text-base md:text-lg m-0 tracking-tight group-hover:text-cyan-400 transition-colors truncate">{profe.nombre_completo}</p>
                    <p className="text-slate-500 text-[10px] md:text-xs font-medium m-0 mt-0.5 uppercase tracking-tighter truncate">{profe.email}</p>
                  </div>
                </div>

                {/* Contenedor de Stats y Acciones que se adapta */}
                <div className="flex flex-col md:flex-row md:items-center gap-5 md:gap-8 shrink-0 w-full xl:w-auto border-t border-white/5 pt-4 xl:border-none xl:pt-0">
                  {/* Stats */}
                  <div className="flex items-center justify-around md:justify-center gap-6 md:gap-8 w-full md:w-auto">
                    <div className="text-center">
                      <p className="text-cyan-400 font-black text-xl md:text-2xl m-0 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">
                        {profe.total_alumnos}
                      </p>
                      <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest m-0 mt-1">Alumnos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white font-bold text-xs md:text-sm m-0">{getAntiguedad(profe.fecha_inicio)}</p>
                      <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest m-0 mt-1">Antigüedad</p>
                    </div>
                  </div>

                  {/* Acciones */}
                  {/* Agregado flex-wrap y w-full para que los botones se adapten si no hay espacio */}
                  <div className="flex flex-wrap md:flex-nowrap items-center gap-2 w-full md:w-auto">
                    <button
                      onClick={() => navigate(`/owner/profe/${profe.id_usuario}/alumnos`)}
                      className="flex-1 md:flex-none px-3 md:px-4 py-2.5 md:py-3 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-cyan-400/30 text-cyan-400 bg-cyan-400/5 hover:bg-cyan-400/10 transition-all text-center"
                    >
                      Ver alumnos
                    </button>
                    <button
                      onClick={() => setModalEditar(profe)}
                      className="flex-1 md:flex-none px-3 md:px-4 py-2.5 md:py-3 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-purple-500/30 text-purple-400 bg-purple-500/5 hover:bg-purple-500/10 transition-all text-center"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => confirmarEliminar(profe.id_usuario, profe.nombre_completo)}
                      className="flex-1 md:flex-none px-3 md:px-4 py-2.5 md:py-3 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-rose-500/30 text-rose-500 bg-rose-500/5 hover:bg-rose-500/10 transition-all text-center"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal editar (Marco Neón Púrpura) */}
        {modalEditar && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border-2 border-purple-400/40 rounded-3xl p-8 w-full max-w-md shadow-[0_0_25px_rgba(168,85,247,0.2)] relative overflow-hidden animate-fade-in">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500 rounded-full mix-blend-screen filter blur-[80px] opacity-20 pointer-events-none"></div>
              <h2 className="text-white text-xl font-black mb-6 uppercase tracking-wide relative z-10">Editar profesor</h2>
              <div className="flex flex-col gap-5 relative z-10">
                <div>
                  <label className="block text-[9px] font-black text-slate-500 mb-2 ml-1 uppercase tracking-[0.2em]">Nombre completo</label>
                  <input
                    type="text"
                    value={modalEditar.nombre_completo}
                    onChange={e => setModalEditar(prev => prev ? { ...prev, nombre_completo: e.target.value } : null)}
                    className="w-full px-4 py-3.5 rounded-xl border border-white/5 bg-slate-800/50 text-white text-sm focus:outline-none focus:border-purple-400/50 focus:ring-1 focus:ring-purple-400/20 transition-all shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-500 mb-2 ml-1 uppercase tracking-[0.2em]">Email</label>
                  <input
                    type="email"
                    value={modalEditar.email}
                    onChange={e => setModalEditar(prev => prev ? { ...prev, email: e.target.value } : null)}
                    className="w-full px-4 py-3.5 rounded-xl border border-white/5 bg-slate-800/50 text-white text-sm focus:outline-none focus:border-purple-400/50 focus:ring-1 focus:ring-purple-400/20 transition-all shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-500 mb-2 ml-1 uppercase tracking-[0.2em]">Fecha de inicio</label>
                  <input
                    type="date"
                    value={modalEditar.fecha_inicio ? modalEditar.fecha_inicio.split('T')[0] : ''}
                    onChange={e => setModalEditar(prev => prev ? { ...prev, fecha_inicio: e.target.value } : null)}
                    className="w-full px-4 py-3.5 rounded-xl border border-white/5 bg-slate-800/50 text-white text-sm focus:outline-none focus:border-purple-400/50 focus:ring-1 focus:ring-purple-400/20 transition-all shadow-inner"
                  />
                </div>
                {error && <p className="text-rose-400 text-xs font-bold text-center bg-rose-500/10 py-2 rounded-lg border border-rose-500/20">{error}</p>}
              </div>
              <div className="flex gap-4 mt-8 relative z-10">
                <button onClick={() => { setModalEditar(null); setError(''); }} className="flex-1 py-3.5 rounded-xl text-[13px] font-bold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-white/5 transition-all">Cancelar</button>
                <button onClick={guardarEdicion} className="flex-1 py-3.5 rounded-xl text-[13px] font-black uppercase tracking-wider text-white shadow-lg transition-all hover:brightness-110 bg-purple-600 hover:bg-purple-500">Guardar</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
};

export default Profesores;