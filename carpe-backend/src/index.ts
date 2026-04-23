import express, { Request, Response } from 'express';
import cors from 'cors';
import { pool } from './infrastructure/persistence/PostgreSQLConfig.js';
import usuarioRoutes from './infrastructure/routes/usuarioRoutes.js';
import rutinaRoutes from './infrastructure/routes/rutinaRoutes.js';
import evolucionRoutes from './infrastructure/routes/evolucionRoutes.js';
import seguridadRoutes from './infrastructure/routes/seguridadRoutes.js';
import videoRoutes from './infrastructure/routes/videoRoutes.js';
import calificacionRoutes from './infrastructure/routes/calificacionRoutes.js';
import ownerRoutes from './infrastructure/routes/ownerRoutes.js';
import mensajeRoutes from './infrastructure/routes/mensajeRoutes.js';
import productoRoutes from './infrastructure/routes/productoRoutes.js';
import ventaRoutes from './infrastructure/routes/ventaRoutes.js';
import cron from 'node-cron';
import configuracionRoutes from './infrastructure/routes/configuracionRoutes.js';
import claseRoutes from './infrastructure/routes/claseRoutes.js';
import fotoRoutes from './infrastructure/routes/fotoRoutes.js';


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://carpediem.visionrs.com.ar' 
    : 'http://localhost:5173',
  credentials: true,
}));

//app.use(cors({
  //origin: '*',
  //credentials: false,
//}));
app.use(express.json());

app.use('/api/usuarios', usuarioRoutes);
app.use('/api/rutinas', rutinaRoutes);
app.use('/api/evolucion', evolucionRoutes);
app.use('/api/seguridad', seguridadRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/calificaciones', calificacionRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/mensajes', mensajeRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/ventas', ventaRoutes);
app.use('/api/configuracion', configuracionRoutes);
app.use('/api/clases', claseRoutes);
app.use('/api/perfil', fotoRoutes);


app.get('/', (req: Request, res: Response) => {
  res.send('¡El servidor de Carpediem está vivo y corriendo con TypeScript!');
});

cron.schedule('0 3 * * 0', async () => {
  try {
    await pool.query(`DELETE FROM mensajes WHERE fecha < NOW() - INTERVAL '7 days'`);
    console.log('🧹 Mensajes antiguos eliminados.');
  } catch (error) {
    console.error('Error en limpieza de mensajes:', error);
  }
});

app.listen(PORT, async () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Conexión a PostgreSQL exitosa:', result.rows[0].now);
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error);
  }
});