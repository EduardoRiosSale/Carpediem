// src/infrastructure/controllers/CalificacionController.ts
import { Response } from 'express';
import { CalificarProfeUseCase } from '../../application/use-cases/CalificarProfe.js';
import { ObtenerCalificacionesProfeUseCase } from '../../application/use-cases/ObtenerCalificacionesProfe.js';
import { AuthRequest } from '../middlewares/authMiddleware.js';

export class CalificacionController {
  constructor(
    private calificarUseCase: CalificarProfeUseCase,
    private obtenerUseCase: ObtenerCalificacionesProfeUseCase
  ) {}

  calificar = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id_alumno = req.usuario?.id_usuario!;
      const id_profe = Number(req.params.id_profe);
      const { puntaje, comentario } = req.body;

      await this.calificarUseCase.ejecutar(id_alumno, id_profe, puntaje, comentario);
      res.status(200).json({ mensaje: 'Calificación enviada.' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  obtener = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id_profe = Number(req.params.id_profe);
      const resultado = await this.obtenerUseCase.ejecutar(id_profe);
      res.status(200).json(resultado);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };
}