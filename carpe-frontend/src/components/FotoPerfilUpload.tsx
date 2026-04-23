import { useState, useRef } from 'react';
import api from '../services/api';

interface Props {
  fotoActual?: string | null;
  nombre: string;
  onActualizar: (url: string | null) => void;
}

const CLOUD_NAME = 'dtmfcl7tp';
const UPLOAD_PRESET = 'carpediem_avatars';

const FotoPerfilUpload = ({ fotoActual, nombre, onActualizar }: Props) => {
  const [subiendo, setSubiendo] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const subirFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    // Validar tamaño (max 2MB)
    if (archivo.size > 2 * 1024 * 1024) {
      setError('La imagen no puede superar los 2MB.');
      return;
    }

    // Validar tipo
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(archivo.type)) {
      setError('Solo se aceptan imágenes JPG, PNG o WebP.');
      return;
    }

    setSubiendo(true);
    setError('');

    try {
      // Subir directo a Cloudinary desde el frontend
      const formData = new FormData();
      formData.append('file', archivo);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('folder', 'carpediem/avatars');

      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );

      if (!cloudRes.ok) throw new Error('Error al subir imagen.');
      const cloudData = await cloudRes.json();

      // Guardar URL en nuestra base de datos
      await api.put('/perfil/foto', { foto_url: cloudData.secure_url });
      onActualizar(cloudData.secure_url);
    } catch (err: any) {
      setError('Error al subir la foto. Intentá de nuevo.');
    } finally {
      setSubiendo(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const eliminarFoto = async () => {
    if (!window.confirm('¿Eliminar tu foto de perfil?')) return;
    setEliminando(true);
    try {
      await api.delete('/perfil/foto');
      onActualizar(null);
    } catch (err) {
      setError('Error al eliminar la foto.');
    } finally {
      setEliminando(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Avatar */}
      <div className="relative group">
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-cyan-400/30 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
          {fotoActual ? (
            <img
              src={fotoActual}
              alt={nombre}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center text-white font-black text-3xl">
              {nombre.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Overlay al hacer hover */}
        <button
          onClick={() => inputRef.current?.click()}
          disabled={subiendo}
          className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
        >
          <span className="text-white text-xs font-black">
            {subiendo ? '⏳' : '📷'}
          </span>
        </button>
      </div>

      {/* Input oculto */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={subirFoto}
        className="hidden"
      />

      {/* Botones */}
      <div className="flex gap-2">
        <button
          onClick={() => inputRef.current?.click()}
          disabled={subiendo}
          className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-cyan-400/20 text-cyan-400 hover:bg-cyan-400/10 transition-all disabled:opacity-50"
        >
          {subiendo ? 'Subiendo...' : fotoActual ? 'Cambiar foto' : 'Subir foto'}
        </button>
        {fotoActual && (
          <button
            onClick={eliminarFoto}
            disabled={eliminando}
            className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 transition-all disabled:opacity-50"
          >
            {eliminando ? '...' : '🗑️'}
          </button>
        )}
      </div>

      {error && (
        <p className="text-rose-400 text-[10px] font-bold text-center">{error}</p>
      )}

      <p className="text-slate-600 text-[9px] text-center">
        JPG, PNG o WebP · Máx 2MB
      </p>
    </div>
  );
};

export default FotoPerfilUpload;