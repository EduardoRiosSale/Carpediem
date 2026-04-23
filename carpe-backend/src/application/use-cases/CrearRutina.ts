import { PostgresRutinaRepository } from '../../infrastructure/persistence/repositories/PostgresRutinaRepository.js';
import { Rutina } from '../../domain/Rutina.js';

export class CrearRutinaUseCase {
  constructor(private rutinaRepository: PostgresRutinaRepository) {}

  async ejecutar(datosRutina: Rutina): Promise<Rutina> {
    // Acá podríamos agregar reglas de negocio. Ejemplo:
    if (datosRutina.ejercicios.length === 0) {
      throw new Error('La rutina debe tener al menos un ejercicio.');
    }

    return await this.rutinaRepository.crearRutinaCompleta(datosRutina);
  }
}