import { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import api from '../../services/api';

interface Producto {
  id_producto: number;
  nombre: string;
  descripcion: string;
  precio_venta: number;
  precio_costo: number;
  stock: number;
  activo: boolean;
}

const productoVacio = () => ({
  nombre: '',
  descripcion: '',
  precio_venta: '',
  precio_costo: '',
  stock: '',
});

const Productos = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [modalStock, setModalStock] = useState(false);
  const [editando, setEditando] = useState<Producto | null>(null);
  const [productoStock, setProductoStock] = useState<Producto | null>(null);
  const [ajusteStock, setAjusteStock] = useState({ cantidad: 1, tipo: 'add' });
  const [form, setForm] = useState(productoVacio());
  const [exito, setExito] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cargar = async () => {
    try {
      const { data } = await api.get('/productos/admin');
      setProductos(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { cargar(); }, []);

  const mostrarExito = (msg: string) => { setExito(msg); setTimeout(() => setExito(''), 3000); };
  const mostrarError = (msg: string) => { setError(msg); setTimeout(() => setError(''), 3000); };

  const abrirModal = (producto?: Producto) => {
    if (producto) {
      setEditando(producto);
      setForm({
        nombre: producto.nombre,
        descripcion: producto.descripcion || '',
        precio_venta: producto.precio_venta.toString(),
        precio_costo: producto.precio_costo.toString(),
        stock: producto.stock.toString(),
      });
    } else {
      setEditando(null);
      setForm(productoVacio());
    }
    setModal(true);
  };

  const guardar = async () => {
    setGuardando(true);
    try {
      if (editando) {
        await api.put(`/productos/${editando.id_producto}`, {
          ...form,
          precio_venta: Number(form.precio_venta),
          precio_costo: Number(form.precio_costo),
          stock: Number(form.stock),
          activo: editando.activo,
        });
      } else {
        await api.post('/productos', {
          ...form,
          precio_venta: Number(form.precio_venta),
          precio_costo: Number(form.precio_costo),
          stock: Number(form.stock),
        });
      }
      setModal(false);
      cargar();
      mostrarExito(editando ? 'Producto actualizado.' : 'Producto creado.');
    } catch (err: any) {
      mostrarError(err.response?.data?.error || 'Error al guardar.');
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (id: number) => {
    if (!window.confirm('¿Desactivar este producto?')) return;
    try {
      await api.delete(`/productos/${id}`);
      cargar();
      mostrarExito('Producto desactivado.');
    } catch (err: any) {
      mostrarError('Error al eliminar.');
    }
  };

  const abrirModalStock = (producto: Producto) => {
    setProductoStock(producto);
    setAjusteStock({ cantidad: 1, tipo: 'add' });
    setModalStock(true);
  };

  const ajustarStock = async () => {
    try {
      await api.patch(`/productos/${productoStock?.id_producto}/stock`, ajusteStock);
      setModalStock(false);
      cargar();
      mostrarExito('Stock actualizado.');
    } catch (err: any) {
      mostrarError('Error al ajustar stock.');
    }
  };

  const gananciaForm = form.precio_venta && form.precio_costo
    ? Number(form.precio_venta) - Number(form.precio_costo)
    : null;

  const totalProductos = productos.length;
  const stockBajo = productos.filter(p => p.stock <= 5 && p.activo).length;
  const valorCosto = productos.reduce((acc, p) => acc + p.precio_costo * p.stock, 0);
  const gananciaTotal = productos.reduce((acc, p) => acc + (p.precio_venta - p.precio_costo) * p.stock, 0);

  return (
    <AppLayout>
      <div className="max-w-6xl w-full mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-2">Productos</h1>
            <div className="flex items-center gap-2">
              <span className="w-8 h-[2px] bg-cyan-400"></span>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] m-0">Inventario y precios</p>
            </div>
          </div>
          <button
            onClick={() => abrirModal()}
            className="px-6 py-3 rounded-xl text-[12px] font-black uppercase tracking-widest text-black bg-gradient-to-r from-cyan-400 to-purple-600 shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:brightness-110 transition-all"
          >
            + Nuevo producto
          </button>
        </div>

        {/* Alertas */}
        {exito && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-5 py-4 mb-6 text-xs font-bold">{exito}</div>}
        {error && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl px-5 py-4 mb-6 text-xs font-bold">{error}</div>}

        {/* Métricas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-5">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Productos</p>
            <p className="text-white font-black text-3xl">{totalProductos}</p>
          </div>
          <div className={`bg-slate-900/60 border rounded-3xl p-5 ${stockBajo > 0 ? 'border-red-500/30' : 'border-white/5'}`}>
            <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${stockBajo > 0 ? 'text-red-400' : 'text-slate-500'}`}>
              Stock bajo
            </p>
            <p className={`font-black text-3xl ${stockBajo > 0 ? 'text-red-400' : 'text-white'}`}>{stockBajo}</p>
          </div>
          <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-5">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Valor costo</p>
            <p className="text-white font-black text-3xl">${valorCosto.toLocaleString('es-AR')}</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-5">
            <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-2">Ganancia potencial</p>
            <p className="text-emerald-400 font-black text-3xl">${gananciaTotal.toLocaleString('es-AR')}</p>
          </div>
        </div>

        {/* Lista */}
        {loading ? (
          <p className="text-cyan-400 text-sm font-bold tracking-widest uppercase animate-pulse text-center py-20">Cargando...</p>
        ) : productos.length === 0 ? (
          <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-16 text-center">
            <p className="text-slate-500 text-sm italic">No hay productos cargados todavía.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {productos.map(producto => (
              <div
                key={producto.id_producto}
                className={`bg-slate-900/60 border rounded-3xl p-5 flex flex-col gap-4 transition-all ${
                  !producto.activo ? 'opacity-50 border-white/5' :
                  producto.stock === 0 ? 'border-red-500/30' :
                  producto.stock <= 5 ? 'border-yellow-500/30' :
                  'border-white/5 hover:border-cyan-400/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-white font-bold text-base leading-tight">{producto.nombre}</p>
                    {producto.descripcion && (
                      <p className="text-slate-400 text-xs mt-1 line-clamp-2">{producto.descripcion}</p>
                    )}
                  </div>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ml-2 shrink-0 ${
                    !producto.activo ? 'bg-slate-700 text-slate-500' :
                    producto.stock === 0 ? 'bg-red-500/20 text-red-400' :
                    producto.stock <= 5 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {!producto.activo ? 'Inactivo' : producto.stock === 0 ? 'Sin stock' : `${producto.stock} u.`}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-slate-800/50 rounded-2xl p-3 text-center">
                    <p className="text-slate-500 text-[9px] uppercase tracking-wider mb-1">Costo</p>
                    <p className="text-white font-bold text-sm">${producto.precio_costo.toLocaleString('es-AR')}</p>
                  </div>
                  <div className="bg-cyan-400/10 border border-cyan-400/20 rounded-2xl p-3 text-center">
                    <p className="text-cyan-400 text-[9px] uppercase tracking-wider mb-1">Venta</p>
                    <p className="text-white font-bold text-sm">${producto.precio_venta.toLocaleString('es-AR')}</p>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 text-center">
                    <p className="text-emerald-400 text-[9px] uppercase tracking-wider mb-1">Ganancia</p>
                    <p className="text-emerald-400 font-bold text-sm">${(producto.precio_venta - producto.precio_costo).toLocaleString('es-AR')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                  <button
                    onClick={() => abrirModalStock(producto)}
                    className="flex-1 py-2 rounded-xl bg-slate-800/50 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all border border-slate-700/50"
                  >
                    Ajustar stock
                  </button>
                  <button
                    onClick={() => abrirModal(producto)}
                    className="px-3 py-2 rounded-xl hover:bg-cyan-400/10 text-slate-400 hover:text-cyan-400 transition-all border border-white/5"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => eliminar(producto.id_producto)}
                    className="px-3 py-2 rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all border border-white/5"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal crear/editar */}
        {modal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-950 border-2 border-cyan-400/40 rounded-3xl p-6 w-full max-w-md shadow-[0_0_30px_rgba(34,211,238,0.2)] relative max-h-[90vh] overflow-y-auto">
              <h2 className="text-white text-xl font-black mb-6 uppercase tracking-wide">
                {editando ? 'Editar producto' : 'Nuevo producto'}
              </h2>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-[9px] font-black text-slate-500 mb-1.5 uppercase tracking-[0.2em]">Nombre</label>
                  <input type="text" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })}
                    placeholder="Ej: Gaseosa 500ml"
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-900 text-white text-sm focus:outline-none focus:border-cyan-400/50 transition-all placeholder-slate-600" />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-500 mb-1.5 uppercase tracking-[0.2em]">Descripción (opcional)</label>
                  <textarea value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })}
                    placeholder="Descripción del producto..."
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-900 text-white text-sm focus:outline-none focus:border-cyan-400/50 transition-all placeholder-slate-600 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-black text-slate-500 mb-1.5 uppercase tracking-[0.2em]">Precio costo</label>
                    <input type="number" min="0" value={form.precio_costo} onChange={e => setForm({ ...form, precio_costo: e.target.value })}
                      placeholder="0"
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-900 text-white text-sm focus:outline-none focus:border-cyan-400/50 transition-all" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-500 mb-1.5 uppercase tracking-[0.2em]">Precio venta</label>
                    <input type="number" min="0" value={form.precio_venta} onChange={e => setForm({ ...form, precio_venta: e.target.value })}
                      placeholder="0"
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-900 text-white text-sm focus:outline-none focus:border-cyan-400/50 transition-all" />
                  </div>
                </div>

                {gananciaForm !== null && (
                  <div className={`rounded-2xl p-4 flex items-center justify-between ${gananciaForm >= 0 ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                    <div>
                      <p className={`text-[10px] font-black uppercase tracking-wider ${gananciaForm >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>Ganancia por unidad</p>
                      <p className={`text-2xl font-black ${gananciaForm >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>${gananciaForm.toLocaleString('es-AR')}</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[9px] font-black text-slate-500 mb-1.5 uppercase tracking-[0.2em]">Stock inicial</label>
                  <input type="number" min="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })}
                    placeholder="0"
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-900 text-white text-sm focus:outline-none focus:border-cyan-400/50 transition-all" />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button onClick={() => setModal(false)} className="flex-1 py-3.5 rounded-xl text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 transition-all">Cancelar</button>
                <button onClick={guardar} disabled={guardando} className="flex-1 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-black bg-gradient-to-r from-cyan-400 to-purple-600 hover:brightness-110 transition-all disabled:opacity-50">
                  {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear producto'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal ajuste stock */}
        {modalStock && productoStock && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-950 border-2 border-purple-400/40 rounded-3xl p-6 w-full max-w-sm shadow-[0_0_30px_rgba(168,85,247,0.2)] relative">
              <h2 className="text-white text-xl font-black mb-1">Ajustar stock</h2>
              <p className="text-slate-400 text-sm mb-6">{productoStock.nombre}</p>

              <div className="bg-slate-800/50 rounded-2xl p-4 text-center mb-6">
                <p className="text-slate-500 text-[10px] uppercase tracking-widest mb-1">Stock actual</p>
                <p className="text-white font-black text-4xl">{productoStock.stock}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  onClick={() => setAjusteStock({ ...ajusteStock, tipo: 'add' })}
                  className={`py-3 rounded-2xl font-bold text-sm transition-all ${ajusteStock.tipo === 'add' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'}`}
                >
                  ↑ Agregar
                </button>
                <button
                  onClick={() => setAjusteStock({ ...ajusteStock, tipo: 'remove' })}
                  className={`py-3 rounded-2xl font-bold text-sm transition-all ${ajusteStock.tipo === 'remove' ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-400'}`}
                >
                  ↓ Quitar
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-[9px] font-black text-slate-500 mb-1.5 uppercase tracking-[0.2em]">Cantidad</label>
                <input type="number" min="1" value={ajusteStock.cantidad}
                  onChange={e => setAjusteStock({ ...ajusteStock, cantidad: Number(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-900 text-white text-center text-2xl font-bold focus:outline-none focus:border-purple-400/50 transition-all" />
              </div>

              <div className="bg-slate-800/30 rounded-2xl p-3 text-center mb-4">
                <p className="text-slate-500 text-[10px] mb-1">Resultado</p>
                <p className="text-white font-black text-2xl">
                  {ajusteStock.tipo === 'add'
                    ? productoStock.stock + ajusteStock.cantidad
                    : Math.max(0, productoStock.stock - ajusteStock.cantidad)
                  } u.
                </p>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setModalStock(false)} className="flex-1 py-3.5 rounded-xl text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 transition-all">Cancelar</button>
                <button onClick={ajustarStock} className={`flex-1 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-white transition-all ${ajusteStock.tipo === 'add' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'}`}>
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
};

export default Productos;