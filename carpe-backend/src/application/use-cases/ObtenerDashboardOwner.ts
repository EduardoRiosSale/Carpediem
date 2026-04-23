// src/application/use-cases/ObtenerDashboardOwner.ts
import { pool } from '../../infrastructure/persistence/PostgreSQLConfig.js';

export class ObtenerDashboardOwnerUseCase {
  async ejecutar() {
    // Alumnos activos e inactivos
    const alumnos = await pool.query(
      `SELECT 
         COUNT(*) FILTER (WHERE estado_activo = true)  AS activos,
         COUNT(*) FILTER (WHERE estado_activo = false) AS inactivos,
         COUNT(*) AS total
       FROM usuarios WHERE rol = 'ALUMNO'`
    );

    // Ganancia mensual estimada (suma de valor_mensual de alumnos activos)
    const ganancias = await pool.query(
      `SELECT 
         COALESCE(SUM(valor_mensual), 0) AS ganancia_mensual_estimada
       FROM usuarios 
       WHERE rol = 'ALUMNO' AND estado_activo = true AND valor_mensual IS NOT NULL`
    );

    // Alumnos que vencen en los próximos 7 días (alerta para el owner)
    const proximos_vencimientos = await pool.query(
      `SELECT nombre_completo, email, fecha_vencimiento_cuota
       FROM usuarios
       WHERE rol = 'ALUMNO'
         AND estado_activo = true
         AND fecha_vencimiento_cuota BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
       ORDER BY fecha_vencimiento_cuota ASC`
    );

    return {
      alumnos: alumnos.rows[0],
      ganancia_mensual_estimada: Number(ganancias.rows[0].ganancia_mensual_estimada),
      proximos_vencimientos: proximos_vencimientos.rows
    };
  }
}