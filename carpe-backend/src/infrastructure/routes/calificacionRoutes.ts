// src/infrastructure/routes/calificacionRoutes.ts
import { Router } from 'express';
import { CalificacionController } from '../controllers/CalificacionController.js';
import { CalificarProfeUseCase } from '../../application/use-cases/CalificarProfe.js';
import { ObtenerCalificacionesProfeUseCase } from '../../application/use-cases/ObtenerCalificacionesProfe.js';
import { verificarToken, verificarRol } from '../middlewares/authMiddleware.js';

const router = Router();
const controller = new CalificacionController(
  new CalificarProfeUseCase(),
  new ObtenerCalificacionesProfeUseCase()
);

// Alumno califica a su profe
router.post(
  '/profe/:id_profe',
  verificarToken,
  verificarRol(['ALUMNO']),
  controller.calificar
);

// Owner ve las calificaciones de un profe
router.get(
  '/profe/:id_profe',
  verificarToken,
  verificarRol(['OWNER']),
  controller.obtener
);

export default router;