import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import api from '../../services/api';

interface Ejercicio {
  id_ejercicio: number;
  nombre_ejercicio: string;
  series_sugeridas: number;
  repes_sugeridas: string;
  peso_sugerido_kg?: number;
}

interface Dia {
  id_dia: number;
  nombre: string;
  ejercicios: Ejercicio[];
}

interface RegistroEjercicio {
  id_ejercicio_rutina: number;
  series_reales: number | string;
  repes_reales: string;
  peso_real_kg: number | string;
  sensaciones: string;
}

const RegistrarEntrenamiento = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dia: Dia | undefined = location.state?.dia;
  const id_rutina: number | undefined = location.state?.id_rutina;

  const [registros, setRegistros] = useState<RegistroEjercicio[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
  if (dia?.ejercicios) {
    setRegistros(dia.ejercicios.map(ej => ({
      id_ejercicio_rutina: ej.id_ejercicio, // ← usar id_ejercicio
      series_reales: ej.series_sugeridas,
      repes_reales: ej.repes_sugeridas,
      peso_real_kg: ej.peso_sugerido_kg || 0,
      sensaciones: '',
    })));
  }
}, []);

  const actualizar = (i: number, campo: keyof RegistroEjercicio, valor: string | number) => {
    setRegistros(prev => {
      const nuevo = [...prev];
      nuevo[i] = { ...nuevo[i], [campo]: valor };
      return nuevo;
    });
  };

  const guardar = async () => {
    setGuardando(true);
    setError('');
    try {
      await api.post('/evolucion/registrar', { id_rutina, registros });
      navigate('/alumno/rutina');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setGuardando(false);
    }
  };

  if (!dia) return (
    <AppLayout>
      <div className="max-w-3xl w-full mx-auto p-8 text-center">
        <p className="text-rose-400 font-bold text-sm uppercase mb-4">No se encontró el día de entrenamiento.</p>
        <button onClick={() => navigate('/alumno/rutina')}
          className="px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest border border-white/10 text-slate-400 hover:text-white transition-all">
          Volver a mi rutina
        </button>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="max-w-3xl w-full mx-auto animate-fade-in p-4 md:p-8">

        {/* Header */}
        <div className="mb-8">
          <button onClick={() => navigate('/alumno/rutina')}
            className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors mb-6 group">
            <span className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white/5 transition-all">←</span>
            Volver a mi rutina
          </button>
          <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-2">Registrar entreno</h1>
          <div className="flex items-center gap-2">
            <span className="w-8 h-[2px] bg-cyan-400"></span>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] m-0">{dia.nombre}</p>
          </div>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl p-5 mb-8 text-sm font-bold text-center">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-6 mb-10">
          {dia.ejercicios.map((ej, i) => (
            <div key={ej.id_ejercicio} className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden group hover:border-cyan-400/30 transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/10 transition-all"></div>

              <div className="flex items-center gap-4 mb-6 relative z-10 border-b border-white/5 pb-4">
                <span className="w-10 h-10 rounded-full bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 flex items-center justify-center font-black text-sm shrink-0">{i + 1}</span>
                <p className="text-white text-lg font-bold m-0">{ej.nombre_ejercicio}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 relative z-10">
                {[
                  { label: 'Series', campo: 'series_reales', type: 'number', placeholder: ej.series_sugeridas.toString(), unit: '' },
                  { label: 'Repeticiones', campo: 'repes_reales', type: 'text', placeholder: ej.repes_sugeridas, unit: '' },
                  { label: 'Peso', campo: 'peso_real_kg', type: 'number', placeholder: ej.peso_sugerido_kg?.toString() || '0', unit: 'kg' },
                ].map(field => (
                  <div key={field.campo}>
                    <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">{field.label}</label>
                    <div className="relative">
                      <input type={field.type} placeholder={field.placeholder}
                        value={registros[i]?.[field.campo as keyof RegistroEjercicio] ?? ''}
                        onChange={e => actualizar(i, field.campo as keyof RegistroEjercicio, e.target.value)}
                        className="w-full pl-4 pr-10 py-3.5 rounded-xl border border-white/5 bg-slate-800/50 text-white text-base font-bold focus:outline-none focus:border-cyan-400/50 transition-all placeholder-slate-600 shadow-inner text-center [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                      {field.unit && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs pointer-events-none">{field.unit}</span>}
                    </div>
                  </div>
                ))}
              </div>

              <div className="relative z-10">
                <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Notas / Sensaciones</label>
                <input type="text" placeholder="Opcional: Subí el peso en la última serie..."
                  value={registros[i]?.sensaciones || ''}
                  onChange={e => actualizar(i, 'sensaciones', e.target.value)}
                  className="w-full px-5 py-3.5 rounded-xl border border-white/5 bg-slate-800/30 text-white text-sm focus:outline-none focus:border-purple-400/50 transition-all placeholder-slate-600 italic"
                />
              </div>
            </div>
          ))}
        </div>

        <button onClick={guardar} disabled={guardando}
          className="w-full py-5 rounded-2xl text-[14px] font-black uppercase tracking-[0.2em] text-white shadow-[0_0_25px_rgba(168,85,247,0.3)] bg-gradient-to-r from-purple-600 to-cyan-500 transition-all hover:brightness-110 disabled:opacity-50">
          {guardando ? 'Guardando datos...' : 'Finalizar y Guardar'}
        </button>

      </div>
    </AppLayout>
  );
};

export default RegistrarEntrenamiento;