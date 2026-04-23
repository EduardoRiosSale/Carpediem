import { Router } from 'express';
import { verificarToken, verificarRol } from '../middlewares/authMiddleware.js';
import { pool } from '../persistence/PostgreSQLConfig.js';
import type { AuthRequest } from '../middlewares/authMiddleware.js';
import { Response } from 'express';

const router = Router();

// Listar todas las clases activas (todos los roles)
router.get('/', verificarToken, verificarRol(['OWNER', 'PROFE', 'ALUMNO']), async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT c.*,
        COUNT(i.id_inscripcion) AS inscriptos
      FROM clases c
      LEFT JOIN inscripciones_clase i ON i.id_clase = c.id_clase
      WHERE c.activa = true
      GROUP BY c.id_clase
      ORDER BY 
        CASE c.dia_semana
          WHEN 'LUNES' THEN 1 WHEN 'MARTES' THEN 2 WHEN 'MIERCOLES' THEN 3
          WHEN 'JUEVES' THEN 4 WHEN 'VIERNES' THEN 5 WHEN 'SABADO' THEN 6 WHEN 'DOMINGO' THEN 7
        END, c.hora_inicio ASC
    `);
    res.status(200).json(result.rows);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Listar todas las clases incluyendo inactivas (OWNER)
router.get('/admin', verificarToken, verificarRol(['OWNER']), async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT c.*,
        COUNT(i.id_inscripcion) AS inscriptos
      FROM clases c
      LEFT JOIN inscripciones_clase i ON i.id_clase = c.id_clase
      GROUP BY c.id_clase
      ORDER BY 
        CASE c.dia_semana
          WHEN 'LUNES' THEN 1 WHEN 'MARTES' THEN 2 WHEN 'MIERCOLES' THEN 3
          WHEN 'JUEVES' THEN 4 WHEN 'VIERNES' THEN 5 WHEN 'SABADO' THEN 6 WHEN 'DOMINGO' THEN 7
        END, c.hora_inicio ASC
    `);
    res.status(200).json(result.rows);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Crear clase (OWNER)
router.post('/', verificarToken, verificarRol(['OWNER']), async (req: AuthRequest, res: Response) => {
  try {
    const { nombre, descripcion, dia_semana, hora_inicio, hora_fin, capacidad, url_video } = req.body;
    const result = await pool.query(`
      INSERT INTO clases (nombre, descripcion, dia_semana, hora_inicio, hora_fin, capacidad, url_video)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [nombre, descripcion || null, dia_semana, hora_inicio, hora_fin, capacidad || 0, url_video || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Editar clase (OWNER)
router.put('/:id', verificarToken, verificarRol(['OWNER']), async (req: AuthRequest, res: Response) => {
  try {
    const { nombre, descripcion, dia_semana, hora_inicio, hora_fin, capacidad, url_video, activa } = req.body;
    const result = await pool.query(`
      UPDATE clases SET nombre=$1, descripcion=$2, dia_semana=$3, hora_inicio=$4, hora_fin=$5,
        capacidad=$6, url_video=$7, activa=$8
      WHERE id_clase=$9 RETURNING *`,
      [nombre, descripcion || null, dia_semana, hora_inicio, hora_fin, capacidad || 0, url_video || null, activa ?? true, req.params.id]
    );
    res.status(200).json(result.rows[0]);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Eliminar clase (OWNER)
router.delete('/:id', verificarToken, verificarRol(['OWNER']), async (req: AuthRequest, res: Response) => {
  try {
    await pool.query(`UPDATE clases SET activa = false WHERE id_clase = $1`, [req.params.id]);
    res.status(200).json({ mensaje: 'Clase desactivada.' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Inscribirse a una clase (ALUMNO)
router.post('/:id/inscribir', verificarToken, verificarRol(['ALUMNO']), async (req: AuthRequest, res: Response) => {
  try {
    const id_alumno = req.usuario?.id_usuario;
    const id_clase = Number(req.params.id);

    const clase = await pool.query(`
      SELECT c.*, COUNT(i.id_inscripcion) AS inscriptos
      FROM clases c
      LEFT JOIN inscripciones_clase i ON i.id_clase = c.id_clase
      WHERE c.id_clase = $1
      GROUP BY c.id_clase`, [id_clase]
    );

    if (clase.rows.length === 0) {
      res.status(404).json({ error: 'Clase no encontrada.' });
      return;
    }

    const c = clase.rows[0];
    if (c.capacidad > 0 && Number(c.inscriptos) >= c.capacidad) {
      res.status(400).json({ error: 'La clase está llena.' });
      return;
    }

    await pool.query(
      `INSERT INTO inscripciones_clase (id_clase, id_alumno) VALUES ($1, $2)`,
      [id_clase, id_alumno]
    );
    res.status(201).json({ mensaje: 'Inscripción exitosa.' });
  } catch (error: any) {
    if (error.code === '23505') {
      res.status(400).json({ error: 'Ya estás inscripto en esta clase.' });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
});

// Desinscribirse de una clase (ALUMNO)
router.delete('/:id/inscribir', verificarToken, verificarRol(['ALUMNO']), async (req: AuthRequest, res: Response) => {
  try {
    const id_alumno = req.usuario?.id_usuario;
    await pool.query(
      `DELETE FROM inscripciones_clase WHERE id_clase = $1 AND id_alumno = $2`,
      [req.params.id, id_alumno]
    );
    res.status(200).json({ mensaje: 'Desinscripción exitosa.' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Mis inscripciones (ALUMNO)
router.get('/mis-inscripciones', verificarToken, verificarRol(['ALUMNO']), async (req: AuthRequest, res: Response) => {
  try {
    const id_alumno = req.usuario?.id_usuario;
    const result = await pool.query(
      `SELECT id_clase FROM inscripciones_clase WHERE id_alumno = $1`,
      [id_alumno]
    );
    res.status(200).json(result.rows.map(r => r.id_clase));
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});
// Inscripciones nuevas no vistas (OWNER)
router.get('/notificaciones', verificarToken, verificarRol(['OWNER']), async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT i.*, 
        u.nombre_completo, u.email,
        c.nombre AS nombre_clase, c.dia_semana, c.hora_inicio
      FROM inscripciones_clase i
      JOIN usuarios u ON u.id_usuario = i.id_alumno
      JOIN clases c ON c.id_clase = i.id_clase
      WHERE i.visto = false
      ORDER BY i.fecha_inscripcion DESC
    `);
    res.status(200).json({ total: result.rows.length, inscripciones: result.rows });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Marcar notificaciones como vistas (OWNER)
router.put('/notificaciones/visto', verificarToken, verificarRol(['OWNER']), async (req: AuthRequest, res: Response) => {
  try {
    await pool.query(`UPDATE inscripciones_clase SET visto = true WHERE visto = false`);
    res.status(200).json({ mensaje: 'Notificaciones marcadas como vistas.' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;