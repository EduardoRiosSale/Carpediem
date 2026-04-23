import { Router } from 'express';
import { verificarToken, verificarRol } from '../middlewares/authMiddleware.js';
import { pool } from '../persistence/PostgreSQLConfig.js';
import { PostgresRutinaRepository } from '../persistence/repositories/PostgresRutinaRepository.js';
import type { AuthRequest } from '../middlewares/authMiddleware.js';
import { Response } from 'express';

const router = Router();
const repo = new PostgresRutinaRepository();

// Obtener semanas de un alumno (PROFE/OWNER)
router.get('/alumno/:id', verificarToken, verificarRol(['PROFE', 'OWNER']), async (req: AuthRequest, res: Response) => {
  try {
    const rutinas = await repo.obtenerSemanasAlumno(Number(req.params.id));
    res.status(200).json(rutinas);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Obtener mis semanas (ALUMNO)
router.get('/mis-rutinas', verificarToken, verificarRol(['ALUMNO']), async (req: AuthRequest, res: Response) => {
  try {
    const id_alumno = req.usuario?.id_usuario!;
    const rutinas = await repo.obtenerSemanasAlumno(id_alumno);
    res.status(200).json(rutinas);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Crear semana nueva (PROFE/OWNER)
router.post('/crear', verificarToken, verificarRol(['PROFE', 'OWNER']), async (req: AuthRequest, res: Response) => {
  try {
    const { id_alumno, titulo } = req.body;
    const id_profe_creador = req.usuario?.id_usuario!;
    const rutina = await repo.crearSemana({ id_profe_creador, id_alumno, titulo, dias: [] });
    res.status(201).json(rutina);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Agregar día a una semana
router.post('/:id/dia', verificarToken, verificarRol(['PROFE', 'OWNER']), async (req: AuthRequest, res: Response) => {
  try {
    const id_rutina = Number(req.params.id);
    const { nombre, orden } = req.body;
    const dia = await repo.agregarDia(id_rutina, nombre, orden);
    res.status(201).json(dia);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Agregar ejercicio a un día
router.post('/dia/:id_dia/ejercicio', verificarToken, verificarRol(['PROFE', 'OWNER']), async (req: AuthRequest, res: Response) => {
  try {
    const id_dia = Number(req.params.id_dia);
    const { id_rutina, ...ejercicio } = req.body;
    await repo.agregarEjercicioADia(id_dia, id_rutina, ejercicio);
    res.status(201).json({ mensaje: 'Ejercicio agregado.' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Editar ejercicio
router.put('/ejercicio/:id', verificarToken, verificarRol(['PROFE', 'OWNER']), async (req: AuthRequest, res: Response) => {
  try {
    const { nombre_ejercicio, series_sugeridas, repes_sugeridas, peso_sugerido_kg, notas_profe } = req.body;
    await pool.query(
      `UPDATE ejercicios_rutina SET nombre_ejercicio=$1, series_sugeridas=$2, repes_sugeridas=$3, peso_sugerido_kg=$4, notas_profe=$5 WHERE id_ejercicio=$6`,
      [nombre_ejercicio, series_sugeridas, repes_sugeridas, peso_sugerido_kg || null, notas_profe || null, req.params.id]
    );
    res.status(200).json({ mensaje: 'Ejercicio actualizado.' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Eliminar ejercicio
router.delete('/ejercicio/:id', verificarToken, verificarRol(['PROFE', 'OWNER']), async (req: AuthRequest, res: Response) => {
  try {
    await pool.query(`DELETE FROM ejercicios_rutina WHERE id_ejercicio = $1`, [req.params.id]);
    res.status(200).json({ mensaje: 'Ejercicio eliminado.' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Eliminar día
router.delete('/dia/:id', verificarToken, verificarRol(['PROFE', 'OWNER']), async (req: AuthRequest, res: Response) => {
  try {
    await repo.eliminarDia(Number(req.params.id));
    res.status(200).json({ mensaje: 'Día eliminado.' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Eliminar semana
router.delete('/:id', verificarToken, verificarRol(['PROFE', 'OWNER']), async (req: AuthRequest, res: Response) => {
  try {
    await repo.eliminarSemana(Number(req.params.id));
    res.status(200).json({ mensaje: 'Semana eliminada.' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Actualizar comentario general
router.put('/:id/comentario', verificarToken, verificarRol(['PROFE', 'OWNER']), async (req: AuthRequest, res: Response) => {
  try {
    await repo.actualizarComentario(Number(req.params.id), req.body.comentario);
    res.status(200).json({ mensaje: 'Comentario guardado.' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Actualizar video de ejercicio
router.put('/ejercicio/:id/video', verificarToken, verificarRol(['PROFE', 'OWNER']), async (req: AuthRequest, res: Response) => {
  try {
    await pool.query(
      `UPDATE ejercicios_rutina SET url_video = $1 WHERE id_ejercicio = $2`,
      [req.body.video_url, req.params.id]
    );
    res.status(200).json({ mensaje: 'Video guardado.' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Eliminar video de ejercicio
router.delete('/ejercicio/:id/video', verificarToken, verificarRol(['PROFE', 'OWNER']), async (req: AuthRequest, res: Response) => {
  try {
    await pool.query(`UPDATE ejercicios_rutina SET url_video = NULL WHERE id_ejercicio = $1`, [req.params.id]);
    res.status(200).json({ mensaje: 'Video eliminado.' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;