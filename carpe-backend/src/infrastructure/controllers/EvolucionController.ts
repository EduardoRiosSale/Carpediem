// src/infrastructure/controllers/EvolucionController.ts
import { Response } from 'express';
import { RegistrarEntrenamientoUseCase } from '../../application/use-cases/RegistrarEntrenamiento.js';
import { ObtenerHistorialEjercicioUseCase } from '../../application/use-cases/ObtenerHistorialEjercicio.js';
import { AuthRequest } from '../middlewares/authMiddleware.js';

export class EvolucionController {
  // 1. Agregamos el segundo caso de uso al constructor
  constructor(
    private registrarEntrenamientoUseCase: RegistrarEntrenamientoUseCase,
    private obtenerHistorialEjercicioUseCase: ObtenerHistorialEjercicioUseCase
  ) {}

  // Función para guardar el entrenamiento (la que ya tenías)
 registrar = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id_alumno = req.usuario?.id_usuario;
    const { registros } = req.body;

    if (!id_alumno) {
      res.status(400).json({ error: 'Usuario no identificado.' });
      return;
    }

    const resultado = await this.registrarEntrenamientoUseCase.ejecutar(id_alumno, 0, registros);
    res.status(201).json(resultado);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

  // 2. NUEVA FUNCIÓN: Obtener los datos para el gráfico
  obtenerHistorial = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id_alumno = req.usuario?.id_usuario;
      const id_ejercicio = Number(req.params.id_ejercicio); // Sacamos el ID de la URL

      if (!id_alumno) {
        res.status(400).json({ error: 'Usuario no identificado.' });
        return;
      }

      const historial = await this.obtenerHistorialEjercicioUseCase.ejecutar(id_alumno, id_ejercicio);
      
      res.status(200).json(historial);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };
}