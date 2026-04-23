import { pool } from '../PostgreSQLConfig.js';
import { RegistroEjercicioReal } from '../../../domain/RegistroEntrenamiento.js';

export class PostgresEvolucionRepository {
  
  async registrarSesionCompleta(id_alumno: number, id_rutina: number | null, registros: RegistroEjercicioReal[]) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const querySesion = `
      INSERT INTO sesiones_entrenamiento (id_alumno, id_rutina)
      VALUES ($1, $2)
      RETURNING id_sesion, fecha_inicio;
    `;
    const resSesion = await client.query(querySesion, [id_alumno, id_rutina || null]);
    const idSesionGenerado = resSesion.rows[0].id_sesion;

    const queryRegistro = `
      INSERT INTO registros_ejercicios 
      (id_sesion, id_ejercicio_rutina, series_reales, repes_reales, peso_real_kg, sensaciones)
      VALUES ($1, $2, $3, $4, $5, $6);
    `;
    for (const registro of registros) {
      await client.query(queryRegistro, [
        idSesionGenerado,
        registro.id_ejercicio_rutina,
        registro.series_reales,
        registro.repes_reales,
        registro.peso_real_kg,
        registro.sensaciones || null
      ]);
    }
    await client.query('COMMIT');
    return { mensaje: 'Entrenamiento guardado con éxito', id_sesion: idSesionGenerado };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
async obtenerHistorialEjercicio(id_alumno: number, id_ejercicio_rutina: number) {
    const query = `
      SELECT r.peso_real_kg, s.fecha_inicio as fecha, r.repes_reales
      FROM registros_ejercicios r
      JOIN sesiones_entrenamiento s ON r.id_sesion = s.id_sesion
      WHERE s.id_alumno = $1 AND r.id_ejercicio_rutina = $2
      ORDER BY s.fecha_inicio ASC;
    `;
    const result = await pool.query(query, [id_alumno, id_ejercicio_rutina]);
    return result.rows;
  }}
