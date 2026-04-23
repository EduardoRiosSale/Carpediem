// src/infrastructure/routes/evolucionRoutes.ts
import { Router } from 'express';
import { EvolucionController } from '../controllers/EvolucionController.js';
import { PostgresEvolucionRepository } from '../persistence/repositories/PostgresEvolucionRepository.js';
import { RegistrarEntrenamientoUseCase } from '../../application/use-cases/RegistrarEntrenamiento.js';
import { ObtenerHistorialEjercicioUseCase } from '../../application/use-cases/ObtenerHistorialEjercicio.js';
import { verificarToken, verificarRol } from '../middlewares/authMiddleware.js';

const router = Router();

// Instanciamos el repositorio único para evolución
const evolucionRepo = new PostgresEvolucionRepository();

// Instanciamos los dos Casos de Uso
const registrarUseCase = new RegistrarEntrenamientoUseCase(evolucionRepo);
const obtenerHistorialUseCase = new ObtenerHistorialEjercicioUseCase(evolucionRepo);

// Pasamos ambos al controlador
const evolucionController = new EvolucionController(registrarUseCase, obtenerHistorialUseCase);

// RUTA 1: Guardar lo que hizo hoy (POST)
router.post('/registrar', verificarToken, verificarRol(['ALUMNO', 'OWNER']), evolucionController.registrar);

// RUTA 2: Ver historial para el gráfico (GET)
// Usamos :id_ejercicio como parámetro dinámico
router.get('/historial/:id_ejercicio', verificarToken, verificarRol(['ALUMNO', 'OWNER']), evolucionController.obtenerHistorial);

export default router;