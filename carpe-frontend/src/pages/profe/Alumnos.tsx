import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { Usuario } from '../../types';
import FotoPerfilUpload from '../../components/FotoPerfilUpload';
import Avatar from '../../components/Avatar';

const Alumnos = () => {
  const [alumnos, setAlumnos] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const { usuario } = useAuth();
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/usuarios/mis-alumnos')
      .then(res => setAlumnos(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!usuario?.id_usuario) return;
    api.get(`/usuarios/${usuario.id_usuario}`)
      .then(res => setFotoUrl(res.data.foto_url || null))
      .catch(() => {});
  }, [usuario?.id_usuario]);

  const alumnosFiltrados = alumnos.filter(a =>
    a.nombre_completo.toLowerCase().includes(busqueda.toLowerCase()) ||
    a.email.toLowerCase().includes(busqueda.toLowerCase())
  );

  const activos = alumnos.filter(a => a.estado_activo).length;
  const inactivos = alumnos.length - activos;

  const getEstadoBadge = (alumno: Usuario) => {
    if (!alumno.estado_activo) return { label: 'Inactivo', styleClass: 'bg-red-500/10 text-red-500 border border-red-500/20' };
    return { label: 'Activo', styleClass: 'bg-[var(--carpe-green)]/10 text-[var(--carpe-green)] border border-[var(--carpe-green)]/30' };
  };

  return (
    <AppLayout>
      <div className="max-w-5xl w-full mx-auto animate-fade-in p-4 md:p-8">

        <div className="mb-8 mt-2 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <FotoPerfilUpload
            fotoActual={fotoUrl}
            nombre={usuario?.nombre_completo || ''}
            onActualizar={(url) => setFotoUrl(url)}
          />
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-wide drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] mb-1">
              Bienvenido, {usuario?.nombre_completo.split(' ')[0]}
            </h1>
            <p className="text-slate-400 text-sm font-medium">Tu panel de entrenadores</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-10">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-white/10 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl pointer-events-none group-hover:bg-white/10 transition-all"></div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-3 relative z-10">Mis alumnos</p>
            <p className="text-white font-black text-4xl m-0 relative z-10">{alumnos.length}</p>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-cyan-400/30 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/20 transition-all"></div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-3 relative z-10">Activos</p>
            <p className="text-cyan-400 font-black text-4xl m-0 drop-shadow-[0_0_15px_rgba(34,211,238,0.3)] relative z-10">{activos}</p>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-rose-500/30 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-rose-500/20 transition-all"></div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-3 relative z-10">Inactivos</p>
            <p className={`font-black text-4xl m-0 relative z-10 ${inactivos > 0 ? 'text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.3)]' : 'text-slate-600'}`}>{inactivos}</p>
          </div>
        </div>

        <div className="relative mb-8 group">
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 text-sm group-focus-within:text-cyan-400 transition-colors">🔍</span>
          <input
            type="text"
            placeholder="Buscar alumno por nombre o email..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="w-full pl-12 pr-5 py-4 rounded-2xl border border-white/5 bg-slate-900/50 text-white text-sm focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/10 transition-all placeholder-slate-600 shadow-inner"
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-cyan-400/10 border-t-cyan-400 rounded-full animate-spin mb-4"></div>
            <p className="text-cyan-400 text-[10px] font-black tracking-[0.3em] uppercase animate-pulse">Cargando...</p>
          </div>
        ) : alumnosFiltrados.length === 0 ? (
          <div className="bg-slate-900/60 border-2 border-white/5 rounded-3xl p-16 text-center backdrop-blur-xl">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest m-0 italic">
              {busqueda ? 'No se encontraron resultados.' : 'No tenés alumnos asignados todavía.'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {alumnosFiltrados.map(alumno => {
              const badge = getEstadoBadge(alumno);
              return (
                <div
                  key={alumno.id_usuario}
                  onClick={() => navigate(`/profe/alumno/${alumno.id_usuario}`)}
                  className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl px-6 py-5 flex items-center justify-between cursor-pointer hover:border-cyan-400/40 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)] transition-all duration-300 group"
                >
                  <div className="flex items-center gap-5">
                    <Avatar foto_url={alumno.foto_url} nombre={alumno.nombre_completo} size="lg" />
                    <div>
                      <p className="text-white font-black text-lg m-0 tracking-tight group-hover:text-cyan-400 transition-colors">{alumno.nombre_completo}</p>
                      <p className="text-slate-500 text-xs font-medium m-0 mt-0.5 uppercase tracking-tighter">{alumno.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className={`hidden sm:inline-block px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${badge.styleClass}`}>
                      {badge.label}
                    </span>
                    <span className="text-slate-600 text-2xl group-hover:text-cyan-400 transition-colors translate-x-0 group-hover:translate-x-1">›</span>
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

export default Alumnos;