import { Router } from 'express';
import { verificarToken, verificarRol } from '../middlewares/authMiddleware.js';
import { pool } from '../persistence/PostgreSQLConfig.js';
import type { AuthRequest } from '../middlewares/authMiddleware.js';
import { Response } from 'express';

const router = Router();

// Listar productos activos (todos los roles)
router.get('/', verificarToken, verificarRol(['OWNER', 'PROFE', 'ALUMNO']), async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT * FROM productos WHERE activo = true ORDER BY nombre ASC`
    );
    res.status(200).json(result.rows);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Listar todos los productos (OWNER)
router.get('/admin', verificarToken, verificarRol(['OWNER']), async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT * FROM productos ORDER BY nombre ASC`
    );
    res.status(200).json(result.rows);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Crear producto
router.post('/', verificarToken, verificarRol(['OWNER']), async (req: AuthRequest, res: Response) => {
  try {
    const { nombre, descripcion, precio_venta, precio_costo, stock } = req.body;
    const result = await pool.query(
      `INSERT INTO productos (nombre, descripcion, precio_venta, precio_costo, stock)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [nombre, descripcion || null, precio_venta, precio_costo || 0, stock || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Editar producto
router.put('/:id', verificarToken, verificarRol(['OWNER']), async (req: AuthRequest, res: Response) => {
  try {
    const { nombre, descripcion, precio_venta, precio_costo, stock, activo } = req.body;
    const result = await pool.query(
      `UPDATE productos SET nombre=$1, descripcion=$2, precio_venta=$3, precio_costo=$4, stock=$5, activo=$6
       WHERE id_producto=$7 RETURNING *`,
      [nombre, descripcion || null, precio_venta, precio_costo || 0, stock, activo ?? true, req.params.id]
    );
    res.status(200).json(result.rows[0]);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Ajustar stock
router.patch('/:id/stock', verificarToken, verificarRol(['OWNER']), async (req: AuthRequest, res: Response) => {
  try {
    const { cantidad, tipo } = req.body;
    const op = tipo === 'add' ? '+' : '-';
    const result = await pool.query(
      `UPDATE productos SET stock = GREATEST(0, stock ${op} $1) WHERE id_producto = $2 RETURNING *`,
      [cantidad, req.params.id]
    );
    res.status(200).json(result.rows[0]);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Eliminar producto
router.delete('/:id', verificarToken, verificarRol(['OWNER']), async (req: AuthRequest, res: Response) => {
  try {
    await pool.query(`UPDATE productos SET activo = false WHERE id_producto = $1`, [req.params.id]);
    res.status(200).json({ mensaje: 'Producto desactivado.' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;