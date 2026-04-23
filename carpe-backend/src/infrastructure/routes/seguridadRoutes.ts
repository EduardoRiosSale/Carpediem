// src/infrastructure/routes/seguridadRoutes.ts
import { Router } from 'express';
import { SeguridadController } from '../controllers/SeguridadController.js';
import { PostgresUsuarioRepository } from '../persistence/repositories/PostgresUsuarioRepository.js';
import { VerificarCodigoUseCase } from '../../application/use-cases/VerificarCodigo.js';
import { CambiarPasswordUseCase } from '../../application/use-cases/CambiarPassword.js';
import { verificarToken, verificarRol } from '../middlewares/authMiddleware.js';
import { pool } from '../persistence/PostgreSQLConfig.js';
import bcrypt from 'bcrypt';
import type { AuthRequest } from '../middlewares/authMiddleware.js';
import { Response } from 'express';

const router = Router();

// Instanciamos el Repositorio y los Casos de Uso
const repo = new PostgresUsuarioRepository();
const verificarUseCase = new VerificarCodigoUseCase(repo);
const cambiarUseCase = new CambiarPasswordUseCase(repo);

// Instanciamos el Controlador
const seguridadController = new SeguridadController(verificarUseCase, cambiarUseCase);

// RUTA 1: Para mandar el código del mail (Devuelve Token Temporal)
router.post('/verificar-codigo', seguridadController.verificar);

// RUTA 2: Para guardar la clave. ¡Le ponemos el Patovica para que exija el Token Temporal!
router.post('/cambiar-password', verificarToken, seguridadController.cambiar);
router.post('/solicitar-reset', seguridadController.solicitarReset);
// Cambiar contraseña con verificación de la actual (para usuarios ya logueados)
router.post('/cambiar-password-actual', verificarToken, verificarRol(['OWNER', 'PROFE', 'ALUMNO']), async (req: AuthRequest, res: Response) => {
  try {
    const id_usuario = req.usuario?.id_usuario;
    const { password_actual, password_nueva } = req.body;

    if (!password_actual || !password_nueva) {
      res.status(400).json({ error: 'Todos los campos son requeridos.' });
      return;
    }

    if (password_nueva.length < 6) {
      res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
      return;
    }

    const result = await pool.query(
      `SELECT password_hash FROM usuarios WHERE id_usuario = $1`,
      [id_usuario]
    );

    const correcta = await bcrypt.compare(password_actual, result.rows[0].password_hash);
    if (!correcta) {
      res.status(400).json({ error: 'La contraseña actual es incorrecta.' });
      return;
    }

    const nuevoHash = await bcrypt.hash(password_nueva, 10);
    await pool.query(
      `UPDATE usuarios SET password_hash = $1 WHERE id_usuario = $2`,
      [nuevoHash, id_usuario]
    );

    res.status(200).json({ mensaje: 'Contraseña actualizada correctamente.' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;