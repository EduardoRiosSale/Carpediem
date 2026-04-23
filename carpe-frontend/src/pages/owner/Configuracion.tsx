import { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import api from '../../services/api';

interface Config {
  gimnasio_nombre: string;
  gimnasio_direccion: string;
  gimnasio_telefono: string;
  gimnasio_instagram: string;
  mp_access_token: string;
  mp_activo: string;
}

const Configuracion = () => {
  const [config, setConfig] = useState<Config>({
    gimnasio_nombre: '',
    gimnasio_direccion: '',
    gimnasio_telefono: '',
    gimnasio_instagram: '',
    mp_access_token: '',
    mp_activo: 'false',
  });
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState('');
  const [error, setError] = useState('');
  const [mostrarToken, setMostrarToken] = useState(false);
  const [testando, setTestando] = useState(false);
  const [estadoMp, setEstadoMp] = useState<'idle' | 'ok' | 'error'>('idle');

  useEffect(() => {
    api.get('/configuracion')
      .then(res => setConfig(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const mostrarExito = (msg: string) => { setExito(msg); setTimeout(() => setExito(''), 3000); };
  const mostrarError = (msg: string) => { setError(msg); setTimeout(() => setError(''), 3000); };

  const guardar = async (seccion: Partial<Config>) => {
    setGuardando(true);
    try {
      await api.post('/configuracion/bulk', seccion);
      setConfig(prev => ({ ...prev, ...seccion }));
      mostrarExito('Configuración guardada correctamente.');
    } catch (err: any) {
      mostrarError(err.response?.data?.error || 'Error al guardar.');
    } finally {
      setGuardando(false);
    }
  };

  const testearMp = async () => {
    if (!config.mp_access_token) {
      mostrarError('Ingresá el Access Token primero.');
      return;
    }
    setTestando(true);
    setEstadoMp('idle');
    try {
      // Intentamos guardar el token y activar MP
      await api.post('/configuracion/bulk', {
        mp_access_token: config.mp_access_token,
        mp_activo: 'true',
      });
      setConfig(prev => ({ ...prev, mp_activo: 'true' }));
      setEstadoMp('ok');
      mostrarExito('Mercado Pago conectado correctamente.');
    } catch (err: any) {
      setEstadoMp('error');
      mostrarError('No se pudo conectar con Mercado Pago.');
    } finally {
      setTestando(false);
    }
  };

  if (loading) return (
    <AppLayout>
      <p className="text-cyan-400 text-sm font-bold tracking-widest uppercase animate-pulse text-center py-20">Cargando...</p>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="max-w-3xl w-full mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-2">Configuración</h1>
          <div className="flex items-center gap-2">
            <span className="w-8 h-[2px] bg-cyan-400"></span>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] m-0">Ajustes del gimnasio</p>
          </div>
        </div>

        {exito && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-5 py-4 mb-6 text-xs font-bold">{exito}</div>}
        {error && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl px-5 py-4 mb-6 text-xs font-bold">{error}</div>}

        {/* Sección: Info del gimnasio */}
        <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-6 md:p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-xl">🏋️</div>
            <div>
              <p className="text-white font-black text-base m-0">Información del gimnasio</p>
              <p className="text-slate-500 text-xs m-0">Datos generales visibles en la app</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-[9px] font-black text-slate-500 mb-1.5 uppercase tracking-[0.2em]">Nombre del gimnasio</label>
              <input
                type="text"
                value={config.gimnasio_nombre}
                onChange={e => setConfig(prev => ({ ...prev, gimnasio_nombre: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-800/50 text-white text-sm focus:outline-none focus:border-cyan-400/50 transition-all placeholder-slate-600"
                placeholder="Ej: Carpe Diem"
              />
            </div>
            <div>
              <label className="block text-[9px] font-black text-slate-500 mb-1.5 uppercase tracking-[0.2em]">Dirección</label>
              <input
                type="text"
                value={config.gimnasio_direccion}
                onChange={e => setConfig(prev => ({ ...prev, gimnasio_direccion: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-800/50 text-white text-sm focus:outline-none focus:border-cyan-400/50 transition-all placeholder-slate-600"
                placeholder="Ej: Av. Siempreviva 742"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-black text-slate-500 mb-1.5 uppercase tracking-[0.2em]">Teléfono</label>
                <input
                  type="text"
                  value={config.gimnasio_telefono}
                  onChange={e => setConfig(prev => ({ ...prev, gimnasio_telefono: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-800/50 text-white text-sm focus:outline-none focus:border-cyan-400/50 transition-all placeholder-slate-600"
                  placeholder="Ej: 11-1234-5678"
                />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-500 mb-1.5 uppercase tracking-[0.2em]">Instagram</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">@</span>
                  <input
                    type="text"
                    value={config.gimnasio_instagram}
                    onChange={e => setConfig(prev => ({ ...prev, gimnasio_instagram: e.target.value }))}
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-white/10 bg-slate-800/50 text-white text-sm focus:outline-none focus:border-cyan-400/50 transition-all placeholder-slate-600"
                    placeholder="carpediem.gym"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => guardar({
              gimnasio_nombre: config.gimnasio_nombre,
              gimnasio_direccion: config.gimnasio_direccion,
              gimnasio_telefono: config.gimnasio_telefono,
              gimnasio_instagram: config.gimnasio_instagram,
            })}
            disabled={guardando}
            className="mt-6 w-full py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-black bg-gradient-to-r from-cyan-400 to-purple-600 hover:brightness-110 transition-all disabled:opacity-50"
          >
            {guardando ? 'Guardando...' : 'Guardar información'}
          </button>
        </div>

        {/* Sección: Mercado Pago */}
        <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-6 md:p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xl">📱</div>
              <div>
                <p className="text-white font-black text-base m-0">Mercado Pago</p>
                <p className="text-slate-500 text-xs m-0">Configurá los pagos online</p>
              </div>
            </div>
            <span className={`text-[10px] font-black px-3 py-1.5 rounded-full ${
              config.mp_activo === 'true'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                : 'bg-slate-700 text-slate-500 border border-white/5'
            }`}>
              {config.mp_activo === 'true' ? '✓ Conectado' : 'Desconectado'}
            </span>
          </div>

          <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 mb-4">
            <p className="text-blue-400 text-xs font-medium leading-relaxed">
              Para obtener tu Access Token entrá a <span className="font-black">mercadopago.com.ar/developers</span> → Tu aplicación → Credenciales → Access Token de producción.
            </p>
          </div>

          <div>
            <label className="block text-[9px] font-black text-slate-500 mb-1.5 uppercase tracking-[0.2em]">Access Token</label>
            <div className="relative">
              <input
                type={mostrarToken ? 'text' : 'password'}
                value={config.mp_access_token}
                onChange={e => setConfig(prev => ({ ...prev, mp_access_token: e.target.value }))}
                className="w-full px-4 py-3 pr-12 rounded-xl border border-white/10 bg-slate-800/50 text-white text-sm focus:outline-none focus:border-blue-400/50 transition-all placeholder-slate-600 font-mono"
                placeholder="APP_USR-xxxxxxxxxxxxxxxxx"
              />
              <button
                onClick={() => setMostrarToken(!mostrarToken)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-all text-xs"
              >
                {mostrarToken ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {estadoMp === 'ok' && (
            <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 text-emerald-400 text-xs font-bold">
              ✓ Mercado Pago conectado y activo
            </div>
          )}
          {estadoMp === 'error' && (
            <div className="mt-4 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 text-rose-400 text-xs font-bold">
              ✕ No se pudo verificar la conexión
            </div>
          )}

          <div className="flex gap-3 mt-6">
            {config.mp_activo === 'true' && (
              <button
                onClick={() => guardar({ mp_activo: 'false' })}
                className="flex-1 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-rose-400 border border-rose-500/20 hover:bg-rose-500/10 transition-all"
              >
                Desactivar MP
              </button>
            )}
            <button
              onClick={testearMp}
              disabled={testando || !config.mp_access_token}
              className="flex-1 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-black bg-gradient-to-r from-blue-400 to-cyan-400 hover:brightness-110 transition-all disabled:opacity-50"
            >
              {testando ? 'Verificando...' : config.mp_activo === 'true' ? 'Actualizar token' : 'Conectar MP'}
            </button>
          </div>
        </div>

        {/* Sección: Mantenimiento */}
        <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-xl">🧹</div>
            <div>
              <p className="text-white font-black text-base m-0">Mantenimiento</p>
              <p className="text-slate-500 text-xs m-0">Limpieza automática de datos</p>
            </div>
          </div>

          <div className="bg-slate-800/40 border border-white/5 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-bold m-0">Limpieza de mensajes</p>
                <p className="text-slate-500 text-xs m-0 mt-1">Los mensajes de más de 7 días se eliminan automáticamente todos los domingos a las 3am.</p>
              </div>
              <span className="text-emerald-400 text-[10px] font-black px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 shrink-0 ml-4">
                ✓ Activo
              </span>
            </div>
          </div>
        </div>

      </div>
    </AppLayout>
  );
};

export default Configuracion;