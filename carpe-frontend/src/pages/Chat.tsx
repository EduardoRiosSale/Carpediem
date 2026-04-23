import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';

interface Mensaje {
  id_mensaje: number;
  id_remitente: number;
  id_destinatario: number;
  contenido: string;
  leido: boolean;
  fecha: string;
  nombre_remitente: string;
}

const Chat = () => {
  const { id } = useParams();
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nombreOtro, setNombreOtro] = useState('');
  const [texto, setTexto] = useState('');
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [fotoOtro, setFotoOtro] = useState<string | null>(null);

  const cargarMensajes = async () => {
    try {
      const [mensajesRes, usuarioRes] = await Promise.all([
        api.get(`/mensajes/${id}`),
        api.get(`/usuarios/${id}`),
      ]);
      setMensajes(mensajesRes.data);
      setNombreOtro(usuarioRes.data.nombre_completo);
      setFotoOtro(usuarioRes.data.foto_url || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarMensajes(); }, [id]);

  // Auto-scroll al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  // Polling cada 5 segundos para simular "casi tiempo real"
  useEffect(() => {
    const interval = setInterval(cargarMensajes, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const enviar = async () => {
    if (!texto.trim() || enviando) return;
    setEnviando(true);
    const textoGuardado = texto;
    setTexto('');
    try {
      await api.post(`/mensajes/${id}`, { contenido: textoGuardado });
      cargarMensajes();
      inputRef.current?.focus();
    } catch (err) {
      setTexto(textoGuardado);
      console.error(err);
    } finally {
      setEnviando(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  };

  const formatearFecha = (fecha: string) => {
    const d = new Date(fecha);
    const hoy = new Date();
    const esHoy = d.toDateString() === hoy.toDateString();
    if (esHoy) return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }) + ' ' +
      d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  };

  const getVolverUrl = () => {
  if (usuario?.rol === 'PROFE') return `/profe/alumno/${id}`;
  if (usuario?.rol === 'OWNER') return '/owner/calificaciones';
  return '/alumno/perfil';
};

  return (
    <AppLayout>
      <div className="max-w-2xl w-full mx-auto flex flex-col p-4 md:p-8 animate-fade-in" style={{ height: 'calc(100vh - 80px)' }}>

        {/* Header - Actualizado al estilo Slate/Cyan/Purple */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(getVolverUrl())}
            className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all shrink-0"
          >
            ←
          </button>
          
          {/* Aquí estaba el color viejo, ahora es el gradiente nuevo */}
          <Avatar foto_url={fotoOtro} nombre={nombreOtro} size="md" />
          
          <div>
            <p className="text-white font-black text-lg m-0 tracking-tight">{nombreOtro}</p>
            <p className="text-cyan-400/80 text-[10px] font-black uppercase tracking-[0.2em] m-0">
              {usuario?.rol === 'ALUMNO' ? 'Tu profesor' : 'Alumno'}
            </p>
          </div>
        </div>

        {/* Contenedor Mensajes - Ahora con estilo Slate y Glassmorphism */}
        <div className="flex-1 overflow-y-auto bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/5 p-4 md:p-6 flex flex-col gap-2 mb-2 shadow-2xl relative custom-scrollbar">
          {/* Brillo de fondo sutil */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-full relative z-10">
              <div className="w-8 h-8 border-4 border-cyan-400/10 border-t-cyan-400 rounded-full animate-spin mb-4"></div>
              <p className="text-cyan-400 text-[10px] font-black tracking-[0.3em] uppercase animate-pulse">
                Cargando mensajes...
              </p>
            </div>
          ) : mensajes.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center relative z-10 opacity-60">
              <span className="text-4xl mb-4">💬</span>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest text-center">
                No hay mensajes todavía.<br/>¡Enviá el primero!
              </p>
            </div>
          ) : (
            <div className="relative z-10">
              {mensajes.map((msg, i) => {
                const esMio = msg.id_remitente === usuario?.id_usuario;
                const anterior = i > 0 ? mensajes[i - 1] : null;
                const mismoRemitente = anterior?.id_remitente === msg.id_remitente;
                const fechaAnterior = anterior ? new Date(anterior.fecha).toDateString() : null;
                const fechaActual = new Date(msg.fecha).toDateString();
                const mostrarFecha = fechaAnterior !== fechaActual;

                return (
                  <div key={msg.id_mensaje}>
                    {/* Separador de fecha */}
                    {mostrarFecha && (
                      <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/10" />
                        <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] text-center bg-slate-900/80 px-3 py-1 rounded-full border border-white/5">
                          {new Date(msg.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'long' })}
                        </p>
                        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/10" />
                      </div>
                    )}

                    <div className={`flex ${esMio ? 'justify-end' : 'justify-start'} ${mismoRemitente && !mostrarFecha ? 'mt-1' : 'mt-4'}`}>
                      <div
                        className={`max-w-[85%] sm:max-w-[70%] px-5 py-3.5 rounded-2xl text-[14px] leading-relaxed shadow-lg backdrop-blur-md ${
                          esMio
                            ? 'bg-gradient-to-br from-cyan-500/20 to-purple-600/20 border border-cyan-400/30 text-white rounded-br-sm shadow-[0_0_15px_rgba(34,211,238,0.1)]'
                            : 'bg-slate-800/80 border border-white/5 text-slate-200 rounded-bl-sm'
                        }`}
                      >
                        <p className="m-0 whitespace-pre-wrap">{msg.contenido}</p>
                        <p className={`text-[9px] font-black uppercase tracking-wider mt-2 m-0 flex items-center ${esMio ? 'text-cyan-400/70 justify-end' : 'text-slate-500 justify-start'}`}>
                          {formatearFecha(msg.fecha)}
                          {esMio && (
                            <span className={`ml-2 text-xs ${msg.leido ? 'text-cyan-400' : 'text-cyan-400/50'}`}>
                              {msg.leido ? '✓✓' : '✓'}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input con marco Neón sutil */}
        <div className="flex gap-3 items-center mt-2 relative z-10">
          <input
            ref={inputRef}
            type="text"
            value={texto}
            onChange={e => setTexto(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribí un mensaje..."
            className="flex-1 px-5 py-4 rounded-2xl border border-white/5 bg-slate-900/60 text-white text-sm focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 transition-all placeholder-slate-600 shadow-inner backdrop-blur-xl"
          />
          <button
            onClick={enviar}
            disabled={!texto.trim() || enviando}
            className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-cyan-500 to-purple-600 text-white font-black text-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-105 hover:brightness-110 shadow-[0_0_20px_rgba(34,211,238,0.2)] shrink-0"
          >
            ↑
          </button>
        </div>

      </div>
    </AppLayout>
  );
};

export default Chat;