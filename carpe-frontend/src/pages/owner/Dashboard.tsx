import { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import api from '../../services/api';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';

interface DashboardData {
  alumnos: { activos: number; inactivos: number; total: number; };
  ganancia_mensual_estimada: number;
  proximos_vencimientos: {
    nombre_completo: string;
    email: string;
    fecha_vencimiento_cuota: string;
  }[];
}

interface VentaStats {
  hoy: { total_hoy: number; ganancia_hoy: number; cantidad_hoy: number; };
  semana: { total_semana: number; ganancia_semana: number; cantidad_semana: number; };
  mes: { total_mes: number; ganancia_mes: number; cantidad_mes: number; };
  por_metodo: { metodo_pago: string; cantidad: number; total: number; }[];
  por_dia: { dia: string; total: number; ganancia: number; }[];
}

const StatCard = ({ label, value, colorClass }: { label: string; value: string | number; colorClass: string }) => (
  <div className="rounded-3xl border border-white/5 p-6 md:p-8 shadow-xl backdrop-blur-xl bg-slate-900/60 hover:bg-slate-800/80 hover:border-cyan-400/30 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)] transition-all duration-300 group flex flex-col justify-center relative overflow-hidden">
    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/10 transition-all"></div>
    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 relative z-10">{label}</p>
    <p className={`text-4xl md:text-5xl font-black ${colorClass} transition-transform duration-300 group-hover:scale-105 origin-left relative z-10`}>{value}</p>
  </div>
);

type Tab = 'alumnos' | 'ventas' | 'vencimientos';

const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [ventas, setVentas] = useState<VentaStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtroVentas, setFiltroVentas] = useState<'hoy' | 'semana' | 'mes'>('hoy');
  const [tabActiva, setTabActiva] = useState<Tab>('alumnos');

  useEffect(() => {
    Promise.all([
      api.get('/owner/dashboard'),
      api.get('/ventas/stats'),
    ])
      .then(([dashRes, ventasRes]) => {
        setData(dashRes.data);
        setVentas(ventasRes.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const graficoAlumnos = [
    { mes: 'Nov', alumnos: 0 },
    { mes: 'Dic', alumnos: 0 },
    { mes: 'Ene', alumnos: 0 },
    { mes: 'Feb', alumnos: 0 },
    { mes: 'Mar', alumnos: 0 },
    { mes: 'Abr', alumnos: data?.alumnos.activos || 0 },
  ];

  const totalVentas = filtroVentas === 'hoy'
    ? Number(ventas?.hoy.total_hoy || 0)
    : filtroVentas === 'semana'
      ? Number(ventas?.semana.total_semana || 0)
      : Number(ventas?.mes.total_mes || 0);

  const gananciaVentas = filtroVentas === 'hoy'
    ? Number(ventas?.hoy.ganancia_hoy || 0)
    : filtroVentas === 'semana'
      ? Number(ventas?.semana.ganancia_semana || 0)
      : Number(ventas?.mes.ganancia_mes || 0);

  const cantidadVentas = filtroVentas === 'hoy'
    ? Number(ventas?.hoy.cantidad_hoy || 0)
    : filtroVentas === 'semana'
      ? Number(ventas?.semana.cantidad_semana || 0)
      : Number(ventas?.mes.cantidad_mes || 0);

  const graficoVentas = (ventas?.por_dia || []).map(d => ({
    dia: new Date(d.dia).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }),
    Total: Number(d.total),
    Ganancia: Number(d.ganancia),
  }));

  const metodoPagoLabel: Record<string, string> = {
    EFECTIVO: '💵 Efectivo',
    TARJETA: '💳 Tarjeta',
    MERCADOPAGO: '📱 MP',
  };

  const tabs: { id: Tab; label: string; icon: string; color: string; activeColor: string }[] = [
    { id: 'alumnos', label: 'Alumnos', icon: '👥', color: 'border-cyan-500/30 text-cyan-400', activeColor: 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(34,211,238,0.4)]' },
    { id: 'ventas', label: 'Ventas', icon: '💰', color: 'border-emerald-500/30 text-emerald-400', activeColor: 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]' },
    { id: 'vencimientos', label: 'Vencimientos', icon: '⏰', color: 'border-purple-500/30 text-purple-400', activeColor: 'bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]' },
  ];

  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-full min-h-[50vh]">
          <div className="w-12 h-12 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin mb-4"></div>
          <div className="text-cyan-400 text-xs font-bold tracking-[0.3em] uppercase animate-pulse">Sincronizando datos...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl w-full mx-auto p-4 md:p-8 animate-fade-in">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-2">Dashboard</h1>
          <div className="flex items-center gap-2">
            <span className="w-8 h-[2px] bg-cyan-400"></span>
            <p className="text-slate-400 text-xs md:text-sm font-bold uppercase tracking-[0.2em]">Resumen general del gimnasio</p>
          </div>
        </div>

        {/* Stats alumnos — siempre visibles arriba */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
          <StatCard label="Alumnos activos" value={data?.alumnos.activos || 0} colorClass="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.4)]" />
          <StatCard label="Alumnos inactivos" value={data?.alumnos.inactivos || 0} colorClass="text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.4)]" />
          <StatCard label="Total alumnos" value={data?.alumnos.total || 0} colorClass="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
          <StatCard label="Ganancia estimada" value={`$${(data?.ganancia_mensual_estimada || 0).toLocaleString('es-AR')}`} colorClass="text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.4)]" />
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-6 flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setTabActiva(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-200 border ${
                tabActiva === tab.id
                  ? tab.activeColor + ' border-transparent'
                  : 'bg-slate-900/60 backdrop-blur-xl ' + tab.color + ' hover:bg-slate-800/80'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
              {tab.id === 'vencimientos' && (data?.proximos_vencimientos?.length ?? 0) > 0 && (
                <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                  {data!.proximos_vencimientos.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab: Alumnos */}
        {tabActiva === 'alumnos' && (
          <div className="rounded-3xl border-2 border-cyan-400/30 p-6 md:p-8 shadow-[0_0_20px_rgba(34,211,238,0.15)] backdrop-blur-2xl bg-slate-900/60 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-3 relative z-10">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              Alumnos activos por mes
            </h3>
            <div className="h-[250px] md:h-[300px] w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={graficoAlumnos} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="mes" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid rgba(34,211,238,0.2)',
                      borderRadius: '16px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                      backdropFilter: 'blur(10px)'
                    }}
                    itemStyle={{ color: '#22d3ee', fontWeight: 'bold' }}
                    cursor={{ stroke: 'rgba(34,211,238,0.1)', strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="alumnos"
                    stroke="#22d3ee"
                    strokeWidth={4}
                    dot={{ fill: '#0f172a', stroke: '#22d3ee', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 8, fill: '#22d3ee', stroke: '#0f172a', strokeWidth: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tab: Ventas */}
        {tabActiva === 'ventas' && (
          <div className="rounded-3xl border-2 border-emerald-500/30 p-6 md:p-8 shadow-[0_0_20px_rgba(16,185,129,0.1)] backdrop-blur-2xl bg-slate-900/60 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

            {/* Header + filtros */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 relative z-10">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] m-0 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Resumen de ventas
              </h3>
              <div className="flex gap-2">
                {(['hoy', 'semana', 'mes'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFiltroVentas(f)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      filtroVentas === f
                        ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                        : 'bg-slate-800/50 text-slate-500 hover:text-white border border-white/5'
                    }`}
                  >
                    {f === 'hoy' ? 'Hoy' : f === 'semana' ? 'Esta semana' : 'Este mes'}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats ventas */}
            <div className="grid grid-cols-3 gap-4 mb-8 relative z-10">
              <div className="bg-slate-800/40 rounded-2xl p-5 border border-white/5">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Total vendido</p>
                <p className="text-white font-black text-2xl md:text-3xl">${totalVentas.toLocaleString('es-AR')}</p>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5">
                <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-2">Ganancia</p>
                <p className="text-emerald-400 font-black text-2xl md:text-3xl">${gananciaVentas.toLocaleString('es-AR')}</p>
              </div>
              <div className="bg-slate-800/40 rounded-2xl p-5 border border-white/5">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Transacciones</p>
                <p className="text-white font-black text-2xl md:text-3xl">{cantidadVentas}</p>
              </div>
            </div>

            {/* Gráfico */}
            {graficoVentas.length > 0 ? (
              <div className="relative z-10 mb-6">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4">Últimos 7 días</p>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={graficoVentas} margin={{ top: 5, right: 10, left: -20, bottom: 5 }} barSize={24} barCategoryGap="40%">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                      <XAxis dataKey="dia" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          border: '1px solid rgba(16,185,129,0.2)',
                          borderRadius: '12px',
                        }}
                        formatter={(value) => [`$${Number(value).toLocaleString('es-AR')}`, '']}
                      />
                      <Legend wrapperStyle={{ fontSize: '10px', color: '#64748b' }} />
                      <Bar dataKey="Total" fill="rgba(34,211,238,0.6)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Ganancia" fill="rgba(16,185,129,0.6)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="bg-slate-800/30 rounded-2xl p-8 text-center relative z-10 mb-6">
                <p className="text-slate-500 text-xs italic">No hay ventas registradas todavía.</p>
              </div>
            )}

            {/* Métodos de pago */}
            {ventas?.por_metodo && ventas.por_metodo.length > 0 && (
              <div className="relative z-10">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-3">Por método de pago (este mes)</p>
                <div className="flex flex-wrap gap-3">
                  {ventas.por_metodo.map(m => (
                    <div key={m.metodo_pago} className="bg-slate-800/40 border border-white/5 rounded-2xl px-4 py-3 flex items-center gap-3">
                      <span className="text-white font-bold text-sm">{metodoPagoLabel[m.metodo_pago] || m.metodo_pago}</span>
                      <span className="text-slate-500 text-xs">{m.cantidad} ventas</span>
                      <span className="text-emerald-400 font-black text-sm">${Number(m.total).toLocaleString('es-AR')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Vencimientos */}
        {tabActiva === 'vencimientos' && (
          <div className="rounded-3xl border-2 border-purple-500/30 p-6 md:p-8 shadow-[0_0_20px_rgba(168,85,247,0.15)] backdrop-blur-2xl bg-slate-900/60 relative overflow-hidden">
            <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] m-0">Próximos Vencimientos (7 días)</h3>
              {data?.proximos_vencimientos && data.proximos_vencimientos.length > 0 && (
                <span className="bg-rose-500/10 text-rose-400 text-[10px] font-black px-3 py-1 rounded-md border border-rose-500/20">
                  {data.proximos_vencimientos.length} ALERTAS
                </span>
              )}
            </div>

            {!data?.proximos_vencimientos || data.proximos_vencimientos.length === 0 ? (
              <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-10 text-center relative z-10">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest m-0 italic">¡Todo al día! No hay vencimientos próximos.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                {data.proximos_vencimientos.map((alumno, i) => (
                  <div key={i} className="flex items-center justify-between p-5 bg-slate-800/40 rounded-2xl border border-white/5 hover:border-purple-500/30 hover:bg-slate-800/60 transition-all duration-300 group">
                    <div>
                      <p className="text-white text-sm font-bold tracking-wide m-0 mb-1 group-hover:text-purple-400 transition-colors">{alumno.nombre_completo}</p>
                      <p className="text-slate-500 text-[10px] font-medium m-0 uppercase tracking-tighter">{alumno.email}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-purple-400 text-[10px] font-black uppercase tracking-tighter block mb-1">Vence</span>
                      <span className="text-white text-xs font-bold">{new Date(alumno.fecha_vencimiento_cuota).toLocaleDateString('es-AR')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </AppLayout>
  );
};

export default Dashboard;