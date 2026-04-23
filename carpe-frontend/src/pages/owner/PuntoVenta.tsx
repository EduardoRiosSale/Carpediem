import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import api from '../../services/api';

interface Producto {
  id_producto: number;
  nombre: string;
  descripcion: string;
  precio_venta: number;
  precio_costo: number;
  stock: number;
}

interface ItemCarrito {
  id_producto: number;
  nombre: string;
  precio_venta: number;
  ganancia: number;
  cantidad: number;
  stock: number;
}

interface Venta {
  id_venta: number;
  total: number;
  ganancia: number;
  metodo_pago: string;
  fecha: string;
  detalle: { nombre: string; cantidad: number; precio_unitario: number }[];
}

const PuntoVenta = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [metodoPago, setMetodoPago] = useState<'EFECTIVO' | 'TARJETA' | 'MERCADOPAGO'>('EFECTIVO');
  const [historial, setHistorial] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [mpUrl, setMpUrl] = useState('');
  const [modalMp, setModalMp] = useState(false);
  const [exito, setExito] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const cargarDatos = async () => {
    try {
      const [prodRes, histRes] = await Promise.all([
        api.get('/productos'),
        api.get('/ventas/historial'),
      ]);
      setProductos(prodRes.data);
      setHistorial(histRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { cargarDatos(); }, []);

  const mostrarExito = (msg: string) => { setExito(msg); setTimeout(() => setExito(''), 3000); };
  const mostrarError = (msg: string) => { setError(msg); setTimeout(() => setError(''), 3000); };

  const agregarAlCarrito = (producto: Producto) => {
    if (producto.stock === 0) return;
    setCarrito(prev => {
      const existe = prev.find(i => i.id_producto === producto.id_producto);
      if (existe) {
        if (existe.cantidad >= producto.stock) return prev;
        return prev.map(i => i.id_producto === producto.id_producto ? { ...i, cantidad: i.cantidad + 1 } : i);
      }
      return [...prev, {
        id_producto: producto.id_producto,
        nombre: producto.nombre,
        precio_venta: producto.precio_venta,
        ganancia: producto.precio_venta - producto.precio_costo,
        cantidad: 1,
        stock: producto.stock,
      }];
    });
  };

  const cambiarCantidad = (id: number, delta: number) => {
    setCarrito(prev => prev.map(item => {
      if (item.id_producto !== id) return item;
      const nueva = item.cantidad + delta;
      if (nueva <= 0 || nueva > item.stock) return item;
      return { ...item, cantidad: nueva };
    }));
  };

  const quitarDelCarrito = (id: number) => {
    setCarrito(prev => prev.filter(i => i.id_producto !== id));
  };

  const totalCarrito = carrito.reduce((acc, i) => acc + i.precio_venta * i.cantidad, 0);
  const gananciaCarrito = carrito.reduce((acc, i) => acc + i.ganancia * i.cantidad, 0);

  const confirmarVenta = async () => {
    if (carrito.length === 0) return;

    if (metodoPago === 'MERCADOPAGO') {
      setProcesando(true);
      try {
        const { data } = await api.post('/ventas/mp-link', {
          items: carrito.map(i => ({ id_producto: i.id_producto, cantidad: i.cantidad })),
        });
        setMpUrl(data.checkout_url);
        setModalMp(true);
      } catch (err: any) {
        mostrarError(err.response?.data?.error || 'Error al generar link de MP.');
      } finally {
        setProcesando(false);
      }
      return;
    }

    setProcesando(true);
    try {
      await api.post('/ventas/vender', {
        items: carrito.map(i => ({ id_producto: i.id_producto, cantidad: i.cantidad })),
        metodo_pago: metodoPago,
      });
      setCarrito([]);
      cargarDatos();
      mostrarExito('✅ Venta registrada con éxito.');
    } catch (err: any) {
      mostrarError(err.response?.data?.error || 'Error al procesar la venta.');
    } finally {
      setProcesando(false);
    }
  };

  const totalHoy = historial.reduce((acc, v) => acc + Number(v.total), 0);
  const gananciaHoy = historial.reduce((acc, v) => acc + Number(v.ganancia), 0);

  return (
    <AppLayout>
      <div className="max-w-6xl w-full mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-2">Punto de Venta</h1>
            <div className="flex items-center gap-2">
              <span className="w-8 h-[2px] bg-cyan-400"></span>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] m-0">Registrá ventas y generá cobros</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/owner/productos')}
            className="px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest border border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10 transition-all"
          >
            Gestionar productos
          </button>
        </div>

        {exito && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-5 py-4 mb-6 text-xs font-bold">{exito}</div>}
        {error && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl px-5 py-4 mb-6 text-xs font-bold">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">

          {/* Grilla productos */}
          <div className="lg:col-span-2">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">Productos disponibles</p>
            {loading ? (
              <p className="text-cyan-400 text-sm font-bold animate-pulse">Cargando...</p>
            ) : productos.length === 0 ? (
              <div className="border-2 border-dashed border-slate-700/50 rounded-3xl p-12 text-center">
                <p className="text-slate-500 text-sm">No hay productos disponibles.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {productos.map(producto => {
                  const enCarrito = carrito.find(i => i.id_producto === producto.id_producto);
                  const sinStock = producto.stock === 0;
                  return (
                    <button
                      key={producto.id_producto}
                      onClick={() => agregarAlCarrito(producto)}
                      disabled={sinStock}
                      className={`relative bg-slate-900/60 border rounded-2xl p-4 text-left transition-all active:scale-95 ${
                        sinStock ? 'border-slate-800 opacity-50 cursor-not-allowed' :
                        enCarrito ? 'border-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.1)]' :
                        'border-white/5 hover:border-cyan-400/30'
                      }`}
                    >
                      {enCarrito && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center text-black text-xs font-black">
                          {enCarrito.cantidad}
                        </div>
                      )}
                      <div className="w-10 h-10 bg-cyan-400/10 rounded-xl flex items-center justify-center mb-3 text-lg">
                        🛍️
                      </div>
                      <p className="text-white font-bold text-sm leading-tight mb-1">{producto.nombre}</p>
                      <p className="text-cyan-400 font-black text-lg">${producto.precio_venta.toLocaleString('es-AR')}</p>
                      <span className={`mt-2 text-[10px] font-black px-2 py-0.5 rounded-full inline-block ${
                        producto.stock === 0 ? 'bg-red-500/20 text-red-400' :
                        producto.stock <= 5 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {producto.stock === 0 ? 'Sin stock' : `${producto.stock} disp.`}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Carrito */}
          <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-5 flex flex-col h-fit sticky top-4">
            <p className="text-white font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
              🛒 Carrito
              {carrito.length > 0 && (
                <span className="ml-auto bg-cyan-400 text-black text-xs font-black px-2 py-0.5 rounded-full">{carrito.length}</span>
              )}
            </p>

            {carrito.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm border-2 border-dashed border-slate-700/50 rounded-2xl">
                Tocá un producto para agregarlo
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-1">
                  {carrito.map(item => (
                    <div key={item.id_producto} className="flex items-center gap-3 bg-slate-800/40 rounded-2xl p-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-sm truncate">{item.nombre}</p>
                        <p className="text-cyan-400 text-xs">${(item.precio_venta * item.cantidad).toLocaleString('es-AR')}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button onClick={() => cambiarCantidad(item.id_producto, -1)} className="w-6 h-6 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-white transition-colors text-xs">−</button>
                        <span className="text-white font-bold text-sm w-5 text-center">{item.cantidad}</span>
                        <button onClick={() => cambiarCantidad(item.id_producto, 1)} className="w-6 h-6 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-white transition-colors text-xs">+</button>
                        <button onClick={() => quitarDelCarrito(item.id_producto)} className="w-6 h-6 rounded-lg bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center text-red-400 transition-colors ml-1 text-xs">✕</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-800/50 rounded-2xl p-4 mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Total</span>
                    <span className="text-white font-black text-lg">${totalCarrito.toLocaleString('es-AR')}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Ganancia</span>
                    <span className="text-emerald-400 font-bold">${gananciaCarrito.toLocaleString('es-AR')}</span>
                  </div>
                </div>

                {/* Método de pago */}
                <div className="mb-4">
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Método de pago</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'EFECTIVO', label: 'Efectivo', icon: '💵' },
                      { value: 'TARJETA', label: 'Tarjeta', icon: '💳' },
                      { value: 'MERCADOPAGO', label: 'MP', icon: '📱' },
                    ].map(m => (
                      <button
                        key={m.value}
                        onClick={() => setMetodoPago(m.value as any)}
                        className={`py-2.5 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                          metodoPago === m.value ? 'bg-cyan-400 text-black' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        <span>{m.icon}</span>
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={confirmarVenta}
                  disabled={procesando}
                  className="w-full py-4 rounded-2xl font-black text-black bg-gradient-to-r from-cyan-400 to-purple-600 hover:brightness-110 transition-all disabled:opacity-50 text-sm uppercase tracking-widest"
                >
                  {procesando ? '...' : metodoPago === 'MERCADOPAGO' ? '🔗 Generar link MP' : '✅ Confirmar venta'}
                </button>

                <button onClick={() => setCarrito([])} className="w-full mt-2 py-2.5 text-sm font-bold text-slate-500 hover:text-red-400 transition-colors">
                  Limpiar carrito
                </button>
              </>
            )}
          </div>
        </div>

        {/* Historial del día */}
        <div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <p className="text-white font-black text-sm uppercase tracking-widest">Ventas de hoy</p>
            <div className="flex gap-4 text-sm">
              <span className="text-slate-400">Total: <span className="text-white font-bold">${totalHoy.toLocaleString('es-AR')}</span></span>
              <span className="text-slate-400">Ganancia: <span className="text-emerald-400 font-bold">${gananciaHoy.toLocaleString('es-AR')}</span></span>
              <span className="text-slate-400">Ventas: <span className="text-white font-bold">{historial.length}</span></span>
            </div>
          </div>

          {historial.length === 0 ? (
            <div className="border-2 border-dashed border-slate-700/50 rounded-3xl p-10 text-center">
              <p className="text-slate-500 text-sm">No hay ventas registradas hoy.</p>
            </div>
          ) : (
            <div className="bg-slate-900/60 border border-white/5 rounded-3xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left text-slate-400 text-[10px] uppercase tracking-wider p-4">Productos</th>
                    <th className="text-left text-slate-400 text-[10px] uppercase tracking-wider p-4">Método</th>
                    <th className="text-right text-slate-400 text-[10px] uppercase tracking-wider p-4">Total</th>
                    <th className="text-right text-slate-400 text-[10px] uppercase tracking-wider p-4">Ganancia</th>
                    <th className="text-right text-slate-400 text-[10px] uppercase tracking-wider p-4">Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map(venta => (
                    <tr key={venta.id_venta} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <p className="text-white text-sm font-bold">
                          {venta.detalle.map(d => `${d.nombre} x${d.cantidad}`).join(', ')}
                        </p>
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] font-black px-2 py-1 rounded-full ${
                          venta.metodo_pago === 'EFECTIVO' ? 'bg-emerald-500/20 text-emerald-400' :
                          venta.metodo_pago === 'TARJETA' ? 'bg-cyan-500/20 text-cyan-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {venta.metodo_pago === 'EFECTIVO' ? '💵 Efectivo' : venta.metodo_pago === 'TARJETA' ? '💳 Tarjeta' : '📱 MP'}
                        </span>
                      </td>
                      <td className="p-4 text-right text-white font-bold">${Number(venta.total).toLocaleString('es-AR')}</td>
                      <td className="p-4 text-right text-emerald-400 font-bold">${Number(venta.ganancia).toLocaleString('es-AR')}</td>
                      <td className="p-4 text-right text-slate-400 text-sm">
                        {new Date(venta.fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal MP */}
        {modalMp && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-950 border-2 border-blue-500/40 rounded-3xl p-6 w-full max-w-sm shadow-[0_0_30px_rgba(59,130,246,0.2)] relative">
              <h2 className="text-white text-xl font-black mb-1">Link de pago generado</h2>
              <p className="text-slate-400 text-sm mb-6">Compartilo con tu cliente para que pague</p>

              <div className="bg-slate-800/50 rounded-2xl p-4 mb-4 break-all">
                <p className="text-blue-400 text-sm font-mono">{mpUrl}</p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => { navigator.clipboard.writeText(mpUrl); mostrarExito('Link copiado!'); }}
                  className="w-full py-3 rounded-2xl font-bold text-black bg-gradient-to-r from-cyan-400 to-purple-600 hover:brightness-110 transition-all"
                >
                  📋 Copiar link
                </button>
                <a href={mpUrl} target="_blank" rel="noopener noreferrer"
                  className="w-full py-3 rounded-2xl font-bold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition-all flex items-center justify-center"
                >
                  🔗 Abrir en Mercado Pago
                </a>
                <button onClick={() => setModalMp(false)} className="text-slate-500 text-sm hover:text-white transition-all py-2">
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
};

export default PuntoVenta;