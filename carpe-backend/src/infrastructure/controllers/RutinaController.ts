import { Request, Response } from 'express';
import { CrearRutinaUseCase } from '../../application/use-cases/CrearRutina.js';
import { ObtenerRutinaAlumnoUseCase } from '../../application/use-cases/ObtenerRutinaAlumno.js';
import { ComentarRutinaUseCase } from '../../application/use-cases/ComentarRutina.js';
import type { AuthRequest } from '../middlewares/authMiddleware.js';

export class RutinaController {
  constructor(
    private crearRutinaUseCase: CrearRutinaUseCase,
    private obtenerRutinaAlumnoUseCase: ObtenerRutinaAlumnoUseCase,
    private comentarRutinaUseCase: ComentarRutinaUseCase
  ) {}

  crear = async (req: Request, res: Response): Promise<void> => {
    try {
      const datosRutina = req.body;
      const nuevaRutina = await this.crearRutinaUseCase.ejecutar(datosRutina);
      res.status(201).json({ mensaje: 'Rutina guardada', rutina: nuevaRutina });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  obtenerMiRutina = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const idAlumno = req.usuario?.id_usuario;
      if (!idAlumno) {
        res.status(400).json({ error: 'No se pudo identificar al usuario.' });
        return;
      }
      const rutina = await this.obtenerRutinaAlumnoUseCase.ejecutar(idAlumno);
      res.status(200).json(rutina);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  };

  comentar = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id_rutina = Number(req.params.id);
      const { comentario } = req.body;
      const id_profe = req.usuario?.id_usuario!;
      if (!comentario) {
        res.status(400).json({ error: 'El comentario no puede estar vacío.' });
        return;
      }
      await this.comentarRutinaUseCase.ejecutar(id_rutina, comentario, id_profe);
      res.status(200).json({ mensaje: 'Comentario guardado.' });
    } catch (error: any) {
      res.status(403).json({ error: error.message });
    }
  };

 obtenerRutinasAlumno = async (req: Request, res: Response): Promise<void> => {
  try {
    const idAlumno = Number(req.params.id);
    const rutinas = await this.obtenerRutinaAlumnoUseCase.ejecutar(idAlumno, true);
    res.status(200).json(rutinas);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};
editarEjercicio = async (req: Request, res: Response): Promise<void> => {
  try {
    const id_ejercicio = Number(req.params.id_ejercicio);
    const { nombre_ejercicio, series_sugeridas, repes_sugeridas, peso_sugerido_kg, notas_profe } = req.body;
    const { pool } = await import('../../infrastructure/persistence/PostgreSQLConfig.js');
    await pool.query(
      `UPDATE ejercicios_rutina SET 
        nombre_ejercicio = $1, series_sugeridas = $2, 
        repes_sugeridas = $3, peso_sugerido_kg = $4, notas_profe = $5
       WHERE id_ejercicio = $6`,
      [nombre_ejercicio, series_sugeridas, repes_sugeridas, peso_sugerido_kg || null, notas_profe || null, id_ejercicio]
    );
    res.status(200).json({ mensaje: 'Ejercicio actualizado.' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

agregarEjercicio = async (req: Request, res: Response): Promise<void> => {
  try {
    const id_rutina = Number(req.params.id);
    const { nombre_ejercicio, series_sugeridas, repes_sugeridas, peso_sugerido_kg, notas_profe } = req.body;
    const { pool } = await import('../../infrastructure/persistence/PostgreSQLConfig.js');
    await pool.query(
      `INSERT INTO ejercicios_rutina 
        (id_rutina, nombre_ejercicio, series_sugeridas, repes_sugeridas, peso_sugerido_kg, notas_profe)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id_rutina, nombre_ejercicio, series_sugeridas, repes_sugeridas, peso_sugerido_kg || null, notas_profe || null]
    );
    res.status(201).json({ mensaje: 'Ejercicio agregado.' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

eliminarEjercicio = async (req: Request, res: Response): Promise<void> => {
  try {
    const id_ejercicio = Number(req.params.id_ejercicio);
    const { pool } = await import('../../infrastructure/persistence/PostgreSQLConfig.js');
    await pool.query('DELETE FROM ejercicios_rutina WHERE id_ejercicio = $1', [id_ejercicio]);
    res.status(200).json({ mensaje: 'Ejercicio eliminado.' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

eliminarRutina = async (req: Request, res: Response): Promise<void> => {
  try {
    const id_rutina = Number(req.params.id);
    const { pool } = await import('../../infrastructure/persistence/PostgreSQLConfig.js');
    await pool.query('DELETE FROM rutinas WHERE id_rutina = $1', [id_rutina]);
    res.status(200).json({ mensaje: 'Rutina eliminada.' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
eliminarVideo = async (req: Request, res: Response): Promise<void> => {
  try {
    const id_ejercicio = Number(req.params.id_ejercicio);
    const { pool } = await import('../../infrastructure/persistence/PostgreSQLConfig.js');
    await pool.query(
      'UPDATE ejercicios_rutina SET url_video = NULL WHERE id_ejercicio = $1',
      [id_ejercicio]
    );
    res.status(200).json({ mensaje: 'Video eliminado.' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};}