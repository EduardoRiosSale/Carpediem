import { Router } from 'express';
import { UsuarioController } from '../controllers/UsuarioController.js';
import { PostgresUsuarioRepository } from '../persistence/repositories/PostgresUsuarioRepository.js';
import { RegistrarUsuarioUseCase } from '../../application/use-cases/RegistrarUsuario.js';
import { LoginUsuarioUseCase } from '../../application/use-cases/LoginUsuario.js';
import { verificarToken, verificarRol } from '../middlewares/authMiddleware.js';
import { EmailService } from '../services/EmailService.js';

const router = Router();

const usuarioRepository = new PostgresUsuarioRepository();
const emailService = new EmailService();
const registrarUsuarioUseCase = new RegistrarUsuarioUseCase(usuarioRepository, emailService);
const loginUsuarioUseCase = new LoginUsuarioUseCase(usuarioRepository, emailService);
const usuarioController = new UsuarioController(registrarUsuarioUseCase, loginUsuarioUseCase);

router.post('/login', usuarioController.login);
router.post('/registro', verificarToken, verificarRol(['OWNER']), usuarioController.registrar);
router.get('/roles', verificarToken, verificarRol(['OWNER']), (req, res) => {
  res.json(['PROFE', 'ALUMNO']);
});
router.get('/alumnos', verificarToken, verificarRol(['OWNER']), usuarioController.listarAlumnos);
router.get('/profes', verificarToken, verificarRol(['OWNER', 'PROFE']), usuarioController.listarProfes);
router.get('/mis-alumnos', verificarToken, verificarRol(['PROFE']), usuarioController.listarMisAlumnos);
router.post('/reenviar-codigo/:id', verificarToken, verificarRol(['OWNER']), usuarioController.reenviarCodigo);
router.get('/profe/:id/alumnos', verificarToken, verificarRol(['OWNER']), usuarioController.alumnosDeProfe);
router.put('/:id/renovar-cuota', verificarToken, verificarRol(['OWNER']), usuarioController.renovarCuota);
router.put('/:id/editar', verificarToken, verificarRol(['OWNER']), usuarioController.editarUsuario);
router.delete('/:id', verificarToken, verificarRol(['OWNER']), usuarioController.eliminarUsuario);
router.get('/:id', verificarToken, verificarRol(['PROFE', 'OWNER', 'ALUMNO']), usuarioController.obtenerPorId);

export default router;