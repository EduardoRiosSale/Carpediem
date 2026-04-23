import { PostgresEvolucionRepository } from '../../infrastructure/persistence/repositories/PostgresEvolucionRepository.js';
import { RegistroEjercicioReal } from '../../domain/RegistroEntrenamiento.js';

export class RegistrarEntrenamientoUseCase {
  constructor(private evolucionRepository: PostgresEvolucionRepository) {}

  async ejecutar(id_alumno: number, id_rutina: number | null, registros: RegistroEjercicioReal[]) {
  if (!registros || registros.length === 0) {
    throw new Error('Debes registrar al menos un ejercicio para guardar la sesión.');
  }
  return await this.evolucionRepository.registrarSesionCompleta(id_alumno, id_rutina, registros);
}
}