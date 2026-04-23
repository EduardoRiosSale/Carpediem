// src/infrastructure/routes/videoRoutes.ts
import { Router } from 'express';
import { VideoController } from '../controllers/VideoController.js';
import { verificarToken, verificarRol } from '../middlewares/authMiddleware.js';
import { pool } from '../persistence/PostgreSQLConfig.js';

const router = Router();
const controller = new VideoController(pool);

router.get(
  '/ejercicio/:id',
  verificarToken,
  verificarRol(['ALUMNO', 'PROFE', 'OWNER']),
  (req, res) => controller.getVideo(req, res)
);

router.put(
  '/ejercicio/:id',
  verificarToken,
  verificarRol(['PROFE', 'OWNER']),
  (req, res) => controller.setVideo(req, res)
);

export default router;