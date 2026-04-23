import { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { useAuth } from '../../context/AuthContext';
import FotoPerfilUpload from '../../components/FotoPerfilUpload';
import api from '../../services/api';

const PerfilOwner = () => {
  const { usuario } = useAuth();
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [passwordForm, setPasswordForm] = useState({ actual: '', nueva: '', confirmar: '' });
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState('');
  const [error, setError] = useState('');
  const [mostrarActual, setMostrarActual] = useState(false);
  const [mostrarNueva, setMostrarNueva] = useState(false);

  useEffect(() => {
    if (!usuario?.id_usuario) return;
    api.get(`/usuarios/${usuario.id_usuario}`)
      .then(res => setFotoUrl(res.data.foto_url || null))
      .catch(() => {});
  }, [usuario?.id_usuario]);

  const mostrarExito = (msg: string) => { setExito(msg); setTimeout(() => setExito(''), 3000); };
  const mostrarError = (msg: string) => { setError(msg); setTimeout(() => setError(''), 3000); };

  const cambiarPassword = async () => {
    if (!passwordForm.actual || !passwordForm.nueva || !passwordForm.confirmar) {
      mostrarError('Completá todos los campos.');
      return;
    }
    if (passwordForm.nueva !== passwordForm.confirmar) {
      mostrarError('Las contraseñas nuevas no coinciden.');
      return;
    }
    if (passwordForm.nueva.length < 6) {
      mostrarError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setGuardando(true);
    try {
      await api.post('/seguridad/cambiar-password-actual', {
        password_actual: passwordForm.actual,
        password_nueva: passwordForm.nueva,
      });
      setPasswordForm({ actual: '', nueva: '', confirmar: '' });
      mostrarExito('Contraseña actualizada correctamente.');
    } catch (err: any) {
      mostrarError(err.response?.data?.error || 'Error al cambiar contraseña.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl w-full mx-auto">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-2">Mi perfil</h1>
          <div className="flex items-center gap-2">
            <span className="w-8 h-[2px] bg-cyan-400"></span>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] m-0">Administrador</p>
          </div>
        </div>

        {exito && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-5 py-4 mb-6 text-xs font-bold">{exito}</div>}
        {error && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl px-5 py-4 mb-6 text-xs font-bold">{error}</div>}

        {/* Info + foto */}
        <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/5 rounded-3xl p-6 md:p-8 mb-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
            <FotoPerfilUpload
              fotoActual={fotoUrl}
              nombre={usuario?.nombre_completo || ''}
              onActualizar={(url) => setFotoUrl(url)}
            />
            <div className="text-center sm:text-left">
              <p className="text-white text-2xl font-black tracking-tight mb-1">{usuario?.nombre_completo}</p>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">{usuario?.email}</p>
              <span className="text-[10px] font-black px-3 py-1.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/20">
                Administrador
              </span>
            </div>
          </div>
        </div>

        {/* Cambiar contraseña */}
        <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl">
          <h3 className="text-white text-xl font-black tracking-tight m-0 mb-1">Cambiar contraseña</h3>
          <p className="text-slate-400 text-xs font-medium m-0 mb-6">Actualizá tu contraseña de acceso</p>

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-[9px] font-black text-slate-500 mb-1.5 uppercase tracking-[0.2em]">Contraseña actual</label>
              <div className="relative">
                <input
                  type={mostrarActual ? 'text' : 'password'}
                  value={passwordForm.actual}
                  onChange={e => setPasswordForm(prev => ({ ...prev, actual: e.target.value }))}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-white/10 bg-slate-800/50 text-white text-sm focus:outline-none focus:border-cyan-400/50 transition-all"
                  placeholder="••••••••"
                />
                <button onClick={() => setMostrarActual(!mostrarActual)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-all text-xs">
                  {mostrarActual ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[9px] font-black text-slate-500 mb-1.5 uppercase tracking-[0.2em]">Nueva contraseña</label>
              <div className="relative">
                <input
                  type={mostrarNueva ? 'text' : 'password'}
                  value={passwordForm.nueva}
                  onChange={e => setPasswordForm(prev => ({ ...prev, nueva: e.target.value }))}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-white/10 bg-slate-800/50 text-white text-sm focus:outline-none focus:border-cyan-400/50 transition-all"
                  placeholder="••••••••"
                />
                <button onClick={() => setMostrarNueva(!mostrarNueva)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-all text-xs">
                  {mostrarNueva ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[9px] font-black text-slate-500 mb-1.5 uppercase tracking-[0.2em]">Confirmar nueva contraseña</label>
              <input
                type="password"
                value={passwordForm.confirmar}
                onChange={e => setPasswordForm(prev => ({ ...prev, confirmar: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-800/50 text-white text-sm focus:outline-none focus:border-cyan-400/50 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            onClick={cambiarPassword}
            disabled={guardando}
            className="mt-6 w-full py-4 rounded-xl text-[13px] font-black uppercase tracking-widest text-black bg-gradient-to-r from-cyan-400 to-purple-600 hover:brightness-110 transition-all disabled:opacity-50"
          >
            {guardando ? 'Guardando...' : 'Actualizar contraseña'}
          </button>
        </div>

      </div>
    </AppLayout>
  );
};

export default PerfilOwner;