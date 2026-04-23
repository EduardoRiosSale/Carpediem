import { Router } from 'express';
import { verificarToken, verificarRol } from '../middlewares/authMiddleware.js';
import { pool } from '../persistence/PostgreSQLConfig.js';
import type { AuthRequest } from '../middlewares/authMiddleware.js';
import { Response } from 'express';

const router = Router();

// Obtener conversación entre dos usuarios
router.get('/:id_otro', verificarToken, verificarRol(['PROFE', 'ALUMNO', 'OWNER']), async (req: AuthRequest, res: Response) => {
  try {
    const id_yo = req.usuario?.id_usuario;
    const id_otro = Number(req.params.id_otro);

    await pool.query(
      `UPDATE mensajes SET leido = true 
       WHERE id_destinatario = $1 AND id_remitente = $2 AND leido = false`,
      [id_yo, id_otro]
    );

    const result = await pool.query(
      `SELECT m.*, 
         u.nombre_completo AS nombre_remitente
       FROM mensajes m
       JOIN usuarios u ON u.id_usuario = m.id_remitente
       WHERE (m.id_remitente = $1 AND m.id_destinatario = $2)
          OR (m.id_remitente = $2 AND m.id_destinatario = $1)
       ORDER BY m.fecha ASC`,
      [id_yo, id_otro]
    );
    res.status(200).json(result.rows);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Enviar mensaje
router.post('/:id_destinatario', verificarToken, verificarRol(['PROFE', 'ALUMNO', 'OWNER']), async (req: AuthRequest, res: Response) => {
  try {
    const id_remitente = req.usuario?.id_usuario;
    const id_destinatario = Number(req.params.id_destinatario);
    const { contenido } = req.body;

    if (!contenido?.trim()) {
      res.status(400).json({ error: 'El mensaje no puede estar vacío.' });
      return;
    }

    const result = await pool.query(
      `INSERT INTO mensajes (id_remitente, id_destinatario, contenido)
       VALUES ($1, $2, $3) RETURNING *`,
      [id_remitente, id_destinatario, contenido.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Cantidad de mensajes no leídos
router.get('/no-leidos/count', verificarToken, verificarRol(['PROFE', 'ALUMNO', 'OWNER']), async (req: AuthRequest, res: Response) => {
  try {
    const id_yo = req.usuario?.id_usuario;
    const result = await pool.query(
      `SELECT COUNT(*) AS total FROM mensajes 
       WHERE id_destinatario = $1 AND leido = false`,
      [id_yo]
    );
    res.status(200).json({ total: Number(result.rows[0].total) });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;