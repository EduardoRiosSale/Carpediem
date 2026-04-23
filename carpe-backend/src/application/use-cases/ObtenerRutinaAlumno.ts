import { PostgresRutinaRepository } from '../../infrastructure/persistence/repositories/PostgresRutinaRepository.js';

export class ObtenerRutinaAlumnoUseCase {
  constructor(private rutinaRepository: PostgresRutinaRepository) {}

  async ejecutar(id_alumno: number, todas = false) {
    if (todas) {
      return await this.rutinaRepository.buscarTodasPorAlumno(id_alumno);
    }

    const rutina = await this.rutinaRepository.buscarPorAlumno(id_alumno);
    if (!rutina) {
      throw new Error('Aún no tenés ninguna rutina asignada. ¡Hablá con tu profe!');
    }
    return rutina;
  }
}