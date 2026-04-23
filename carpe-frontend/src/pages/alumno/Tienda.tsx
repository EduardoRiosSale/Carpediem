import { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import api from '../../services/api';

interface Producto {
  id_producto: number;
  nombre: string;
  descripcion: string;
  precio_venta: number;
  stock: number;
}

const Tienda = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/productos')
      .then(res => setProductos(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout>
      <div className="max-w-4xl w-full mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-2">Tienda</h1>
          <div className="flex items-center gap-2">
            <span className="w-8 h-[2px] bg-cyan-400"></span>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] m-0">Productos disponibles en el gimnasio</p>
          </div>
        </div>

        {loading ? (
          <p className="text-cyan-400 text-sm font-bold tracking-widest uppercase animate-pulse text-center py-20">Cargando...</p>
        ) : productos.length === 0 ? (
          <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-16 text-center">
            <p className="text-4xl mb-4">🛍️</p>
            <p className="text-white font-bold text-lg mb-2">No hay productos disponibles</p>
            <p className="text-slate-500 text-sm">Volvé a revisar más tarde.</p>
          </div>
        ) : (
          <>
            {/* Banner informativo */}
            <div className="bg-cyan-400/10 border border-cyan-400/20 rounded-2xl px-5 py-4 mb-6 flex items-center gap-3">
              <span className="text-2xl">ℹ️</span>
              <p className="text-cyan-400 text-sm font-medium">
                Acercate al mostrador del gimnasio para adquirir cualquiera de estos productos. Podés pagar en efectivo, con tarjeta o por Mercado Pago.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {productos.map(producto => (
                <div
                  key={producto.id_producto}
                  className={`bg-slate-900/60 border rounded-3xl p-5 flex flex-col gap-3 transition-all ${
                    producto.stock === 0
                      ? 'border-red-500/20 opacity-60'
                      : producto.stock <= 5
                        ? 'border-yellow-500/20 hover:border-yellow-500/40'
                        : 'border-white/5 hover:border-cyan-400/20'
                  }`}
                >
                  {/* Icono */}
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-400/20 to-purple-600/20 rounded-2xl flex items-center justify-center text-2xl border border-white/5">
                    🛍️
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <p className="text-white font-bold text-base leading-tight mb-1">{producto.nombre}</p>
                    {producto.descripcion && (
                      <p className="text-slate-400 text-xs leading-relaxed">{producto.descripcion}</p>
                    )}
                  </div>

                  {/* Precio y stock */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <p className="text-cyan-400 font-black text-2xl">
                      ${producto.precio_venta.toLocaleString('es-AR')}
                    </p>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                      producto.stock === 0
                        ? 'bg-red-500/20 text-red-400'
                        : producto.stock <= 5
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {producto.stock === 0 ? 'Sin stock' : producto.stock <= 5 ? `Últimas ${producto.stock} u.` : 'Disponible'}
                    </span>
                  </div>

                  {/* Botón */}
                  {producto.stock > 0 && (
                    <div className="bg-gradient-to-r from-cyan-400/10 to-purple-600/10 border border-cyan-400/20 rounded-xl px-4 py-2.5 text-center">
                      <p className="text-cyan-400 text-[11px] font-black uppercase tracking-widest">
                        Consultá en el mostrador
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default Tienda;