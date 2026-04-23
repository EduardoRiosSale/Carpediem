import { pool } from '../PostgreSQLConfig.js';

export class PostgresRutinaRepository {

  // Crear semana con días y ejercicios
  async crearSemana(data: {
    id_profe_creador: number;
    id_alumno: number;
    titulo: string;
    dias: { nombre: string; orden: number; ejercicios: any[] }[];
  }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Verificar si ya hay 3 semanas — si hay, borrar la más vieja
      const countRes = await client.query(
        `SELECT id_rutina FROM rutinas WHERE id_alumno = $1 ORDER BY fecha_creacion ASC`,
        [data.id_alumno]
      );
      if (countRes.rows.length >= 3) {
        const masVieja = countRes.rows[0].id_rutina;
        await client.query(`DELETE FROM rutinas WHERE id_rutina = $1`, [masVieja]);
      }

      // Crear la rutina (semana)
      const rutinaRes = await client.query(
        `INSERT INTO rutinas (id_profe_creador, id_alumno, titulo)
         VALUES ($1, $2, $3) RETURNING *`,
        [data.id_profe_creador, data.id_alumno, data.titulo]
      );
      const id_rutina = rutinaRes.rows[0].id_rutina;

      // Crear días y ejercicios
      for (const dia of data.dias) {
        const diaRes = await client.query(
          `INSERT INTO dias_rutina (id_rutina, nombre, orden) VALUES ($1, $2, $3) RETURNING *`,
          [id_rutina, dia.nombre, dia.orden]
        );
        const id_dia = diaRes.rows[0].id_dia;

        for (const ej of dia.ejercicios) {
          await client.query(
            `INSERT INTO ejercicios_rutina (id_rutina, id_dia, nombre_ejercicio, series_sugeridas, repes_sugeridas, peso_sugerido_kg, notas_profe)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [id_rutina, id_dia, ej.nombre_ejercicio, ej.series_sugeridas, ej.repes_sugeridas, ej.peso_sugerido_kg || null, ej.notas_profe || null]
          );
        }
      }

      await client.query('COMMIT');
      return rutinaRes.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Obtener todas las semanas de un alumno con días y ejercicios
  async obtenerSemanasAlumno(id_alumno: number) {
    const rutinasRes = await pool.query(
      `SELECT * FROM rutinas WHERE id_alumno = $1 ORDER BY fecha_creacion DESC LIMIT 3`,
      [id_alumno]
    );

    if (rutinasRes.rows.length === 0) return [];

    const rutinas = await Promise.all(rutinasRes.rows.map(async (rutina) => {
      const diasRes = await pool.query(
        `SELECT * FROM dias_rutina WHERE id_rutina = $1 ORDER BY orden ASC`,
        [rutina.id_rutina]
      );

      const dias = await Promise.all(diasRes.rows.map(async (dia) => {
        const ejerciciosRes = await pool.query(
          `SELECT * FROM ejercicios_rutina WHERE id_dia = $1`,
          [dia.id_dia]
        );
        return { ...dia, ejercicios: ejerciciosRes.rows };
      }));

      return { ...rutina, dias };
    }));

    return rutinas;
  }

  // Agregar día a una semana existente
  async agregarDia(id_rutina: number, nombre: string, orden: number) {
    const res = await pool.query(
      `INSERT INTO dias_rutina (id_rutina, nombre, orden) VALUES ($1, $2, $3) RETURNING *`,
      [id_rutina, nombre, orden]
    );
    return res.rows[0];
  }

  // Agregar ejercicio a un día
  async agregarEjercicioADia(id_dia: number, id_rutina: number, ejercicio: any) {
    await pool.query(
      `INSERT INTO ejercicios_rutina (id_rutina, id_dia, nombre_ejercicio, series_sugeridas, repes_sugeridas, peso_sugerido_kg, notas_profe)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id_rutina, id_dia, ejercicio.nombre_ejercicio, ejercicio.series_sugeridas, ejercicio.repes_sugeridas, ejercicio.peso_sugerido_kg || null, ejercicio.notas_profe || null]
    );
  }

  // Eliminar semana
  async eliminarSemana(id_rutina: number) {
    await pool.query(`DELETE FROM rutinas WHERE id_rutina = $1`, [id_rutina]);
  }

  // Eliminar día
  async eliminarDia(id_dia: number) {
    await pool.query(`DELETE FROM dias_rutina WHERE id_dia = $1`, [id_dia]);
  }

  // Actualizar comentario general
  async actualizarComentario(id_rutina: number, comentario: string) {
    await pool.query(
      `UPDATE rutinas SET observaciones_generales = $1 WHERE id_rutina = $2`,
      [comentario, id_rutina]
    );
  }
}