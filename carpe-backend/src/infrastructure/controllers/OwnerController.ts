// src/infrastructure/controllers/OwnerController.ts
import { Response } from 'express';
import { ObtenerDashboardOwnerUseCase } from '../../application/use-cases/ObtenerDashboardOwner.js';
import { SetValorMensualAlumnoUseCase } from '../../application/use-cases/SetValorMensualAlumno.js';
import { AuthRequest } from '../middlewares/authMiddleware.js';

export class OwnerController {
  constructor(
    private dashboardUseCase: ObtenerDashboardOwnerUseCase,
    private setValorUseCase: SetValorMensualAlumnoUseCase
  ) {}

  dashboard = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const data = await this.dashboardUseCase.ejecutar();
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  setValorMensual = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id_alumno = Number(req.params.id);
      const { valor_mensual } = req.body;

      await this.setValorUseCase.ejecutar(id_alumno, valor_mensual);
      res.status(200).json({ mensaje: 'Valor mensual actualizado.' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };
}