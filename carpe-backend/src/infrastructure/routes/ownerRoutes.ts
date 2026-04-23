// src/infrastructure/routes/ownerRoutes.ts
import { Router } from 'express';
import { OwnerController } from '../controllers/OwnerController.js';
import { ObtenerDashboardOwnerUseCase } from '../../application/use-cases/ObtenerDashboardOwner.js';
import { SetValorMensualAlumnoUseCase } from '../../application/use-cases/SetValorMensualAlumno.js';
import { verificarToken, verificarRol } from '../middlewares/authMiddleware.js';

const router = Router();
const controller = new OwnerController(
  new ObtenerDashboardOwnerUseCase(),
  new SetValorMensualAlumnoUseCase()
);

router.get('/dashboard', verificarToken, verificarRol(['OWNER']), controller.dashboard);
router.put('/alumnos/:id/valor-mensual', verificarToken, verificarRol(['OWNER']), controller.setValorMensual);

export default router;