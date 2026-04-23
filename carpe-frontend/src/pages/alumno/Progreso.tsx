import { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import api from '../../services/api';
import type { Ejercicio } from '../../types';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';

interface PuntoHistorial {
  fecha: string;
  peso_real_kg: number;
}

const Progreso = () => {
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [historial, setHistorial] = useState<PuntoHistorial[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [ejercicioSeleccionado, setEjercicioSeleccionado] = useState<Ejercicio | null>(null);
  const [semanas, setSemanas] = useState<any[]>([]);
  const [semanaActiva, setSemanaActiva] = useState<any | null>(null);

  useEffect(() => {
  api.get('/rutinas/mis-rutinas')
    .then(res => {
      setSemanas(res.data);
      if (res.data.length > 0) {
        const primera = res.data[0];
        setSemanaActiva(primera);
        const ejerciciosDeSemana: Ejercicio[] = [];
        primera.dias?.forEach((dia: any) => {
          dia.ejercicios?.forEach((ej: any) => {
            if (!ejerciciosDeSemana.find(e => e.id_ejercicio === ej.id_ejercicio)) {
              ejerciciosDeSemana.push(ej);
            }
          });
        });
        setEjercicios(ejerciciosDeSemana);
        if (ejerciciosDeSemana.length > 0) seleccionarEjercicio(ejerciciosDeSemana[0]);
      }
    })
    .catch(err => console.error(err));
}, []);

const cambiarSemana = (semana: any) => {
  setSemanaActiva(semana);
  setHistorial([]);
  setEjercicioSeleccionado(null);
  const ejerciciosDeSemana: Ejercicio[] = [];
  semana.dias?.forEach((dia: any) => {
    dia.ejercicios?.forEach((ej: any) => {
      if (!ejerciciosDeSemana.find(e => e.id_ejercicio === ej.id_ejercicio)) {
        ejerciciosDeSemana.push(ej);
      }
    });
  });
  setEjercicios(ejerciciosDeSemana);
};

  const seleccionarEjercicio = async (ej: Ejercicio) => {
    setEjercicioSeleccionado(ej);
    setLoadingHistorial(true);
    try {
      const { data } = await api.get(`/evolucion/historial/${ej.id_ejercicio}`);
      setHistorial(data);
    } catch (err) {
      console.error(err);
      setHistorial([]);
    } finally {
      setLoadingHistorial(false);
    }
  };

  const maxPeso = historial.length > 0 ? Math.max(...historial.map(h => h.peso_real_kg)) : 0;
  const ultimoPeso = historial.length > 0 ? historial[historial.length - 1].peso_real_kg : 0;
  const primerPeso = historial.length > 0 ? historial[0].peso_real_kg : 0;
  const diferencia = ultimoPeso - primerPeso;

return (
    <AppLayout>
      <div className="max-w-5xl w-full mx-auto animate-fade-in p-4 md:p-8">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-2">
            Mi progreso
          </h1>
          <div className="flex items-center gap-2">
            <span className="w-8 h-[2px] bg-cyan-400"></span>
            <p className="text-slate-400 text-xs md:text-sm font-bold uppercase tracking-[0.2em] m-0">
              Evolución de peso por ejercicio
            </p>
          </div>
        </div>
        {/* Tabs semanas */}
{semanas.length > 0 && (
  <div className="flex gap-2 mb-6 flex-wrap">
    {semanas.map(s => (
      <button key={s.id_rutina}
        onClick={() => cambiarSemana(s)}
        className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
          semanaActiva?.id_rutina === s.id_rutina
            ? 'bg-cyan-400 text-black shadow-[0_0_15px_rgba(34,211,238,0.3)]'
            : 'bg-slate-900/60 border border-white/5 text-slate-400 hover:text-white'
        }`}>
        {s.titulo}
      </button>
    ))}
  </div>
)}

        {/* Selector de ejercicio (Botones estilo "Píldora Neón") */}
        {ejercicios.length > 0 && (
  <div className="flex gap-3 flex-wrap mb-10">
    {ejercicios.map((ej: Ejercicio) => {
              const isSelected = ejercicioSeleccionado?.id_ejercicio === ej.id_ejercicio;
              return (
                <button
                  key={ej.id_ejercicio}
                  onClick={() => seleccionarEjercicio(ej)}
                  className={`px-4 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                    isSelected
                      ? 'border-2 border-cyan-400/50 bg-cyan-400/10 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)] scale-105'
                      : 'border border-white/5 bg-slate-900/50 text-slate-500 hover:text-white hover:bg-slate-800/50 hover:border-white/20'
                  }`}
                >
                  {ej.nombre_ejercicio}
                </button>
              );
            })}
          </div>
        )}

        {/* Cards de stats (Estilo Glassmorphism) */}
        {historial.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-10">
            {[
              { label: 'Peso máximo', value: `${maxPeso} kg`, colorClass: 'text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.4)]' },
              { label: 'Último registro', value: `${ultimoPeso} kg`, colorClass: 'text-white' },
              { label: 'Progreso total', value: `${diferencia >= 0 ? '+' : ''}${diferencia.toFixed(1)} kg`, colorClass: diferencia >= 0 ? 'text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.4)]' : 'text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.4)]' },
            ].map((stat, i) => (
              <div key={i} className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-cyan-400/30 transition-all duration-300">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full blur-xl pointer-events-none group-hover:bg-cyan-500/10 transition-all"></div>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-3 relative z-10">
                  {stat.label}
                </p>
                <p className={`font-black text-3xl md:text-4xl m-0 relative z-10 ${stat.colorClass}`}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Gráfico principal (Marco Neón) */}
        <div className="bg-slate-900/60 backdrop-blur-2xl border-2 border-cyan-400/30 rounded-3xl p-6 md:p-8 shadow-[0_0_30px_rgba(34,211,238,0.15)] relative overflow-hidden animate-fade-in">
          <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <h3 className="text-white text-xl font-black tracking-tight m-0 mb-8 relative z-10 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            {ejercicioSeleccionado?.nombre_ejercicio || 'Seleccioná un ejercicio'}
          </h3>

          {loadingHistorial ? (
            <div className="flex flex-col items-center justify-center py-20 relative z-10">
              <div className="w-8 h-8 border-4 border-cyan-400/10 border-t-cyan-400 rounded-full animate-spin mb-4"></div>
              <p className="text-cyan-400 text-[9px] font-black tracking-[0.3em] uppercase animate-pulse">Cargando datos...</p>
            </div>
          ) : historial.length === 0 ? (
            <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-10 text-center relative z-10">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest m-0 italic">
                Todavía no hay registros para este ejercicio. ¡Empezá a entrenar!
              </p>
            </div>
          ) : (
            <div className="h-[250px] md:h-[350px] w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historial.map(h => ({
                  fecha: new Date(h.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }),
                  peso: h.peso_real_kg,
                }))} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  
                  <XAxis 
                    dataKey="fecha" 
                    stroke="#475569" 
                    fontSize={10} 
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  
                  <YAxis 
                    stroke="#475569" 
                    fontSize={10} 
                    unit=" kg" 
                    tickLine={false}
                    axisLine={false}
                  />
                  
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      border: '1px solid rgba(34,211,238,0.2)', 
                      borderRadius: '16px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                      backdropFilter: 'blur(10px)'
                    }}
                    labelStyle={{ color: '#94a3b8', fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                    itemStyle={{ color: '#22d3ee', fontWeight: 'black', fontSize: '14px' }}
                    formatter={(value) => [`${value} kg`, 'Peso']}
                    cursor={{ stroke: 'rgba(34,211,238,0.1)', strokeWidth: 2 }}
                  />
                  
                  <Line
                    type="monotone"
                    dataKey="peso"
                    stroke="#22d3ee"
                    strokeWidth={4}
                    dot={{ fill: '#0f172a', stroke: '#22d3ee', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 8, fill: '#22d3ee', stroke: '#0f172a', strokeWidth: 3 }}
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

      </div>
    </AppLayout>
  );
};

export default Progreso;