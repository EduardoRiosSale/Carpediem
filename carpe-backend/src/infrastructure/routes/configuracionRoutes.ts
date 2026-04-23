import { Router } from 'express';
import { verificarToken, verificarRol } from '../middlewares/authMiddleware.js';
import { pool } from '../persistence/PostgreSQLConfig.js';
import type { AuthRequest } from '../middlewares/authMiddleware.js';
import { Response } from 'express';

const router = Router();

// Obtener todas las configuraciones
router.get('/', verificarToken, verificarRol(['OWNER']), async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(`SELECT * FROM configuracion ORDER BY id ASC`);
    const config: Record<string, string> = {};
    result.rows.forEach(row => {
      config[row.clave] = row.valor;
    });
    res.status(200).json(config);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Actualizar una configuración
router.put('/:clave', verificarToken, verificarRol(['OWNER']), async (req: AuthRequest, res: Response) => {
  try {
    const { clave } = req.params;
    const { valor } = req.body;
    await pool.query(
      `UPDATE configuracion SET valor = $1, fecha_actualizacion = NOW() WHERE clave = $2`,
      [valor, clave]
    );
    res.status(200).json({ mensaje: 'Configuración actualizada.' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Actualizar múltiples configuraciones de una vez
router.post('/bulk', verificarToken, verificarRol(['OWNER']), async (req: AuthRequest, res: Response) => {
  try {
    const config: Record<string, string> = req.body;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const [clave, valor] of Object.entries(config)) {
        await client.query(
          `UPDATE configuracion SET valor = $1, fecha_actualizacion = NOW() WHERE clave = $2`,
          [valor, clave]
        );
      }
      await client.query('COMMIT');
      res.status(200).json({ mensaje: 'Configuración guardada.' });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;