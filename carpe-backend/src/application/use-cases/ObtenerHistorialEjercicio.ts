import { PostgresEvolucionRepository } from '../../infrastructure/persistence/repositories/PostgresEvolucionRepository.js';

export class ObtenerHistorialEjercicioUseCase {
  constructor(private evolucionRepository: PostgresEvolucionRepository) {}

  async ejecutar(id_alumno: number, id_ejercicio_rutina: number) {
    return await this.evolucionRepository.obtenerHistorialEjercicio(id_alumno, id_ejercicio_rutina);
  }
}