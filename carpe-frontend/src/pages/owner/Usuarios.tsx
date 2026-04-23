import { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import api from '../../services/api';
import type { Usuario } from '../../types';

const POR_PAGINA = 15;

const Usuarios = () => {
  const [alumnos, setAlumnos] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalEditar, setModalEditar] = useState<Usuario | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre_completo: '',
    email: '',
    rol: 'ALUMNO',
    id_profe_titular: '',
  });
  const [profes, setProfes] = useState<Usuario[]>([]);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  const cargarDatos = async () => {
    try {
      const [alumnosRes, profesRes] = await Promise.all([
        api.get('/usuarios/alumnos'),
        api.get('/usuarios/profes'),
      ]);
      setAlumnos(alumnosRes.data);
      setProfes(profesRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);
  useEffect(() => { setPagina(1); }, [busqueda]);

  const alumnosFiltrados = alumnos.filter(a =>
    a.nombre_completo.toLowerCase().includes(busqueda.toLowerCase()) ||
    a.email.toLowerCase().includes(busqueda.toLowerCase())
  );

  const totalPaginas = Math.ceil(alumnosFiltrados.length / POR_PAGINA);
  const alumnosPagina = alumnosFiltrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  const renovarCuota = async (id: number) => {
    try {
      await api.put(`/usuarios/${id}/renovar-cuota`);
      setExito('Cuota renovada correctamente');
      cargarDatos();
      setTimeout(() => setExito(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al renovar');
      setTimeout(() => setError(''), 3000);
    }
  };

  const setValorMensual = async (id: number, valor: number) => {
    try {
      await api.put(`/owner/alumnos/${id}/valor-mensual`, { valor_mensual: valor });
      setExito('Valor mensual actualizado');
      cargarDatos();
      setTimeout(() => setExito(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al actualizar');
      setTimeout(() => setError(''), 3000);
    }
  };

  const crearUsuario = async () => {
    setError('');
    try {
      await api.post('/usuarios/registro', {
        ...nuevoUsuario,
        id_profe_titular: nuevoUsuario.id_profe_titular ? Number(nuevoUsuario.id_profe_titular) : null,
      });
      setExito('Usuario creado. Le llegará el código por mail.');
      setModalAbierto(false);
      setNuevoUsuario({ nombre_completo: '', email: '', rol: 'ALUMNO', id_profe_titular: '' });
      cargarDatos();
      setTimeout(() => setExito(''), 4000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al crear usuario');
    }
  };

  const guardarEdicion = async () => {
    if (!modalEditar) return;
    setError('');
    try {
      await api.put(`/usuarios/${modalEditar.id_usuario}/editar`, {
        nombre_completo: modalEditar.nombre_completo,
        email: modalEditar.email,
        fecha_vencimiento_cuota: modalEditar.fecha_vencimiento_cuota,
        id_profe_titular: modalEditar.id_profe_titular,
        valor_mensual: modalEditar.valor_mensual,
      });
      setExito('Alumno actualizado correctamente.');
      setModalEditar(null);
      cargarDatos();
      setTimeout(() => setExito(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al actualizar');
    }
  };

  const reenviarCredenciales = async (id: number) => {
    try {
      await api.post(`/usuarios/reenviar-codigo/${id}`);
      setExito('Credenciales reenviadas al usuario.');
      setTimeout(() => setExito(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al reenviar');
      setTimeout(() => setError(''), 3000);
    }
  };

  const confirmarEliminar = async (id: number, nombre: string) => {
    if (!window.confirm(`¿Seguro que querés eliminar a ${nombre}? Esta acción no se puede deshacer.`)) return;
    try {
      await api.delete(`/usuarios/${id}`);
      setExito('Usuario eliminado correctamente.');
      cargarDatos();
      setTimeout(() => setExito(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al eliminar');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getEstadoBadge = (alumno: Usuario) => {
    if (!alumno.estado_activo) return { label: 'Inactivo', styleClass: 'bg-red-500/10 text-red-500 border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]' };
    if (!alumno.fecha_vencimiento_cuota) return { label: 'Sin cuota', styleClass: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.2)]' };
    const dias = Math.ceil((new Date(alumno.fecha_vencimiento_cuota).getTime() - Date.now()) / 86400000);
    if (dias <= 7) return { label: `Vence en ${dias}d`, styleClass: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.2)]' };
    return { label: 'Activo', styleClass: 'bg-[var(--carpe-green)]/10 text-[var(--carpe-green)] border border-[var(--carpe-green)]/30 shadow-[0_0_15px_rgba(57,255,20,0.3)]' };
  };

  return (
    <AppLayout>
      <div className="max-w-6xl w-full mx-auto animate-fade-in">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 mb-6 mt-2">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-wide drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] mb-1">
              Usuarios
            </h1>
            <p className="text-slate-400 text-sm md:text-base font-medium tracking-wide">
              Gestioná alumnos y profesores
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setModalAbierto(true)}
              className="px-6 py-3 rounded-xl text-[13px] font-black uppercase tracking-wider text-white transition-all hover:scale-[1.02] shadow-[0_0_15px_rgba(168,85,247,0.3)] bg-gradient-to-r from-purple-600 to-cyan-500"
            >
              + Nuevo usuario
            </button>
          </div>
        </div>

        {/* Buscador */}
        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/5 bg-slate-900/50 text-white text-sm focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/10 transition-all placeholder-slate-600 shadow-inner"
          />
        </div>

        {/* Notificaciones */}
        {exito && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-4 py-4 mb-6 text-sm font-bold tracking-wide">
            {exito}
          </div>
        )}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl px-4 py-4 mb-6 text-sm font-bold tracking-wide">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <p className="text-cyan-400 text-sm font-bold tracking-widest uppercase animate-pulse">Cargando usuarios...</p>
          </div>
        ) : alumnosFiltrados.length === 0 ? (
          <div className="bg-slate-900/60 border-2 border-white/5 rounded-3xl p-12 text-center backdrop-blur-xl">
            <p className="text-slate-500 text-sm font-medium italic m-0">
              {busqueda ? 'No se encontraron resultados.' : 'No hay alumnos registrados todavía.'}
            </p>
          </div>
        ) : (
          <>
            {/* Info paginación */}
            <div className="flex justify-between items-center mb-3 px-1">
              <p className="text-slate-500 text-xs font-medium">
                {alumnosFiltrados.length} resultado{alumnosFiltrados.length !== 1 ? 's' : ''}
              </p>
              {totalPaginas > 1 && (
                <p className="text-slate-500 text-xs font-medium">
                  Página {pagina} de {totalPaginas}
                </p>
              )}
            </div>

            {/* Vista móvil */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-4 mb-6">
              {alumnosPagina.map(alumno => {
                const badge = getEstadoBadge(alumno);
                return (
                  <div key={alumno.id_usuario} className="bg-slate-900/70 backdrop-blur-2xl border-2 border-white/5 rounded-3xl p-5 flex flex-col shadow-xl hover:border-cyan-400/30 transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <div className="pr-2">
                        <h3 className="text-white font-black text-[16px] m-0">{alumno.nombre_completo}</h3>
                        <p className="text-slate-400 text-[12px] font-medium m-0 mt-0.5">{alumno.email}</p>
                      </div>
                      <span className={`shrink-0 inline-block px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${badge.styleClass}`}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[13px] border-t border-white/5 py-3">
                      <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Vencimiento</span>
                      <span className="text-slate-200 font-medium">
                        {alumno.fecha_vencimiento_cuota ? new Date(alumno.fecha_vencimiento_cuota).toLocaleDateString('es-AR') : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[13px] border-b border-white/5 pb-4 mb-4">
                      <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Cuota</span>
                      <div className="relative w-24">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                        <input
                          type="number"
                          defaultValue={alumno.valor_mensual || ''}
                          placeholder="0"
                          onBlur={e => { const val = Number(e.target.value); if (val > 0) setValorMensual(alumno.id_usuario, val); }}
                          className="w-full pl-7 pr-2 py-1.5 rounded-lg border border-white/5 bg-slate-800/50 text-white text-[13px] font-bold focus:outline-none focus:border-cyan-400/50 transition-all shadow-inner"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => renovarCuota(alumno.id_usuario)} className="py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all">Renovar</button>
                      <button onClick={() => setModalEditar(alumno)} className="py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border border-cyan-500/20 text-cyan-400 bg-cyan-500/5 hover:bg-cyan-500/10 transition-all">Editar</button>
                      <button onClick={() => reenviarCredenciales(alumno.id_usuario)} className="py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border border-purple-500/20 text-purple-400 bg-purple-500/5 hover:bg-purple-500/10 transition-all">Email</button>
                      <button onClick={() => confirmarEliminar(alumno.id_usuario, alumno.nombre_completo)} className="py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border border-rose-500/20 text-rose-400 bg-rose-500/5 hover:bg-rose-500/10 transition-all">Eliminar</button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Vista desktop */}
            <div className="hidden lg:block rounded-3xl border-2 border-white/5 shadow-2xl backdrop-blur-2xl bg-slate-900/60 overflow-x-auto mb-6">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-white/5 bg-slate-800/30">
                    {['Nombre', 'Email', 'Estado', 'Vencimiento', 'Valor mensual', 'Acciones'].map(h => (
                      <th key={h} className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {alumnosPagina.map(alumno => {
                    const badge = getEstadoBadge(alumno);
                    return (
                      <tr key={alumno.id_usuario} className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200">
                        <td className="px-6 py-4 text-[14px] font-bold text-white whitespace-nowrap">{alumno.nombre_completo}</td>
                        <td className="px-6 py-4 text-[13px] text-slate-400 font-medium">{alumno.email}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${badge.styleClass}`}>{badge.label}</span>
                        </td>
                        <td className="px-6 py-4 text-[13px] font-medium text-slate-300">
                          {alumno.fecha_vencimiento_cuota ? new Date(alumno.fecha_vencimiento_cuota).toLocaleDateString('es-AR') : '—'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="relative w-24">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                            <input
                              type="number"
                              defaultValue={alumno.valor_mensual || ''}
                              placeholder="0"
                              onBlur={e => { const val = Number(e.target.value); if (val > 0) setValorMensual(alumno.id_usuario, val); }}
                              className="w-full pl-7 pr-3 py-2 rounded-xl border border-white/5 bg-slate-800/30 text-white text-[13px] font-bold focus:outline-none focus:border-cyan-400/50 transition-all placeholder-slate-600 shadow-inner"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => renovarCuota(alumno.id_usuario)} className="px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 transition-all">Renovar</button>
                            <button onClick={() => setModalEditar(alumno)} className="px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10 transition-all">Editar</button>
                            <button onClick={() => reenviarCredenciales(alumno.id_usuario)} className="px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-purple-500/20 text-purple-400 hover:bg-purple-500/10 transition-all">Email</button>
                            <button onClick={() => confirmarEliminar(alumno.id_usuario, alumno.nombre_completo)} className="px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 transition-all">X</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPaginas > 1 && (
              <div className="flex justify-center items-center gap-2">
                <button
                  onClick={() => setPagina(p => Math.max(1, p - 1))}
                  disabled={pagina === 1}
                  className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border border-white/5 text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  ← Anterior
                </button>
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    onClick={() => setPagina(n)}
                    className={`w-9 h-9 rounded-lg text-xs font-black transition-all ${
                      pagina === n
                        ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                        : 'border border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                  disabled={pagina === totalPaginas}
                  className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border border-white/5 text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </>
        )}

        {/* Modal crear usuario */}
        {modalAbierto && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border-2 border-purple-400/40 rounded-3xl p-8 w-full max-w-md shadow-[0_0_25px_rgba(168,85,247,0.2)] relative overflow-hidden animate-fade-in">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500 rounded-full mix-blend-screen filter blur-[80px] opacity-20 pointer-events-none"></div>
              <h2 className="text-white text-xl font-black mb-6 uppercase tracking-wide relative z-10">Nuevo usuario</h2>
              <div className="flex flex-col gap-5 relative z-10">
                {[
                  { label: 'Nombre completo', key: 'nombre_completo', type: 'text', placeholder: 'Juan Pérez' },
                  { label: 'Email', key: 'email', type: 'email', placeholder: 'juan@email.com' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="block text-[11px] font-bold text-slate-400 mb-2 ml-1 uppercase tracking-widest">{field.label}</label>
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      value={nuevoUsuario[field.key as keyof typeof nuevoUsuario]}
                      onChange={e => setNuevoUsuario(prev => ({ ...prev, [field.key]: e.target.value }))}
                      className="w-full px-4 py-3.5 rounded-xl border border-white/5 bg-slate-800/50 text-white text-[14px] font-medium focus:outline-none focus:border-purple-400/50 focus:ring-1 focus:ring-purple-400/20 transition-all placeholder-slate-600 shadow-inner"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-2 ml-1 uppercase tracking-widest">Rol</label>
                  <select
                    value={nuevoUsuario.rol}
                    onChange={e => setNuevoUsuario(prev => ({ ...prev, rol: e.target.value }))}
                    className="w-full px-4 py-3.5 rounded-xl border border-white/5 bg-slate-800/50 text-white text-[14px] font-bold focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 transition-all appearance-none cursor-pointer shadow-inner"
                  >
                    <option value="ALUMNO">Alumno</option>
                    <option value="PROFE">Profesor</option>
                  </select>
                </div>
                {nuevoUsuario.rol === 'ALUMNO' && profes.length > 0 && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-2 ml-1 uppercase tracking-widest">Profe titular</label>
                    <select
                      value={nuevoUsuario.id_profe_titular}
                      onChange={e => setNuevoUsuario(prev => ({ ...prev, id_profe_titular: e.target.value }))}
                      className="w-full px-4 py-3.5 rounded-xl border border-white/5 bg-slate-800/50 text-white text-[14px] font-bold focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 transition-all appearance-none cursor-pointer shadow-inner"
                    >
                      <option value="">Sin asignar</option>
                      {profes.map(p => (
                        <option key={p.id_usuario} value={p.id_usuario}>{p.nombre_completo}</option>
                      ))}
                    </select>
                  </div>
                )}
                {error && <p className="text-rose-400 text-xs font-bold text-center bg-rose-500/10 py-2 rounded-lg border border-rose-500/20">{error}</p>}
              </div>
              <div className="flex gap-4 mt-8 relative z-10">
                <button onClick={() => { setModalAbierto(false); setError(''); }} className="flex-1 py-3.5 rounded-xl text-[13px] font-bold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-white/5 transition-all">Cancelar</button>
                <button onClick={crearUsuario} className="flex-1 py-3.5 rounded-xl text-[13px] font-black uppercase tracking-wider text-white transition-all hover:scale-[1.02] shadow-[0_0_15px_rgba(168,85,247,0.3)] bg-gradient-to-r from-purple-600 to-cyan-500">Crear</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal editar alumno */}
        {modalEditar && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border-2 border-cyan-400/40 rounded-3xl p-8 w-full max-w-md shadow-[0_0_25px_rgba(34,211,238,0.2)] relative overflow-hidden animate-fade-in">
              <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-500 rounded-full mix-blend-screen filter blur-[80px] opacity-10 pointer-events-none"></div>
              <h2 className="text-white text-xl font-black mb-6 uppercase tracking-wide relative z-10">Editar alumno</h2>
              <div className="flex flex-col gap-4 relative z-10">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-2 ml-1 uppercase tracking-widest">Nombre completo</label>
                  <input
                    type="text"
                    value={modalEditar.nombre_completo}
                    onChange={e => setModalEditar(prev => prev ? { ...prev, nombre_completo: e.target.value } : null)}
                    className="w-full px-4 py-3 rounded-xl border border-white/5 bg-slate-800/50 text-white text-[14px] focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 transition-all shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-2 ml-1 uppercase tracking-widest">Email</label>
                  <input
                    type="email"
                    value={modalEditar.email}
                    onChange={e => setModalEditar(prev => prev ? { ...prev, email: e.target.value } : null)}
                    className="w-full px-4 py-3 rounded-xl border border-white/5 bg-slate-800/50 text-white text-[14px] focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 transition-all shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-2 ml-1 uppercase tracking-widest">Fecha vencimiento cuota</label>
                  <input
                    type="date"
                    value={modalEditar.fecha_vencimiento_cuota ? modalEditar.fecha_vencimiento_cuota.split('T')[0] : ''}
                    onChange={e => setModalEditar(prev => prev ? { ...prev, fecha_vencimiento_cuota: e.target.value } : null)}
                    className="w-full px-4 py-3 rounded-xl border border-white/5 bg-slate-800/50 text-white text-[14px] focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 transition-all shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-2 ml-1 uppercase tracking-widest">Valor mensual ($)</label>
                  <input
                    type="number"
                    value={modalEditar.valor_mensual || ''}
                    onChange={e => setModalEditar(prev => prev ? { ...prev, valor_mensual: Number(e.target.value) } : null)}
                    className="w-full px-4 py-3 rounded-xl border border-white/5 bg-slate-800/50 text-white text-[14px] focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 transition-all shadow-inner"
                  />
                </div>
                {profes.length > 0 && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-2 ml-1 uppercase tracking-widest">Profe titular</label>
                    <select
                      value={modalEditar.id_profe_titular || ''}
                      onChange={e => setModalEditar(prev => prev ? { ...prev, id_profe_titular: Number(e.target.value) || undefined } : null)}
                      className="w-full px-4 py-3 rounded-xl border border-white/5 bg-slate-800/50 text-white text-[14px] focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 transition-all appearance-none cursor-pointer shadow-inner"
                    >
                      <option value="">Sin asignar</option>
                      {profes.map(p => (
                        <option key={p.id_usuario} value={p.id_usuario}>{p.nombre_completo}</option>
                      ))}
                    </select>
                  </div>
                )}
                {error && <p className="text-rose-400 text-xs font-bold text-center bg-rose-500/10 py-2 rounded-lg border border-rose-500/20">{error}</p>}
              </div>
              <div className="flex gap-4 mt-8 relative z-10">
                <button onClick={() => { setModalEditar(null); setError(''); }} className="flex-1 py-3.5 rounded-xl text-[13px] font-bold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-white/5 transition-all">Cancelar</button>
                <button onClick={guardarEdicion} className="flex-1 py-3.5 rounded-xl text-[13px] font-black uppercase tracking-wider text-white transition-all hover:scale-[1.02] bg-cyan-600 hover:bg-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.2)]">Guardar</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
};

export default Usuarios;