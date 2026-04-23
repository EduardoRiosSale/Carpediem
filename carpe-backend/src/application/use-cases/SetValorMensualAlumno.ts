// src/application/use-cases/SetValorMensualAlumno.ts
import { pool } from '../../infrastructure/persistence/PostgreSQLConfig.js';

export class SetValorMensualAlumnoUseCase {
  async ejecutar(id_alumno: number, valor: number): Promise<void> {
    if (valor < 0) throw new Error('El valor no puede ser negativo.');
    await pool.query(
      `UPDATE usuarios SET valor_mensual = $1 WHERE id_usuario = $2 AND rol = 'ALUMNO'`,
      [valor, id_alumno]
    );
  }
}