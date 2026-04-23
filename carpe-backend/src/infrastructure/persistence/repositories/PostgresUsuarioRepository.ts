import { pool } from '../PostgreSQLConfig.js';
import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository.js';
import { Usuario } from '../../../domain/Usuario.js';

export class PostgresUsuarioRepository implements IUsuarioRepository {
  
  async crear(usuario: Usuario): Promise<Usuario> {
    const query = `
      INSERT INTO usuarios (
        rol, nombre_completo, email, password_hash, estado_activo, fecha_vencimiento_cuota, id_profe_titular
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;

    const values = [
      usuario.rol,
      usuario.nombre_completo,
      usuario.email,
      usuario.password_hash,
      usuario.estado_activo,
      usuario.fecha_vencimiento_cuota || null,
      usuario.id_profe_titular || null
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    const query = 'SELECT * FROM usuarios WHERE email = $1';
    const result = await pool.query(query, [email]);
    
    if (result.rows.length === 0) {
      return null;
    }
    return result.rows[0];
  }

// Lista todos los alumnos para el panel del admin
  async listarAlumnos(): Promise<Usuario[]> {
    const query = `
      SELECT id_usuario, nombre_completo, email, estado_activo, fecha_vencimiento_cuota 
      FROM usuarios 
      WHERE rol = 'ALUMNO' 
      ORDER BY nombre_completo ASC;
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  // Le suma 30 días a partir de HOY
  async renovarCuota(id_alumno: number): Promise<void> {
    const query = `
      UPDATE usuarios 
      SET fecha_vencimiento_cuota = CURRENT_DATE + INTERVAL '30 days',
          estado_activo = true
      WHERE id_usuario = $1;
    `;
    await pool.query(query, [id_alumno]);
  }
// --- NUEVAS FUNCIONES PARA EL FLUJO 2FA ---

  // 1. Busca a un usuario por su ID (lo necesitamos para verificar el código)
  async buscarPorId(id_usuario: number): Promise<Usuario | null> {
    const query = 'SELECT * FROM usuarios WHERE id_usuario = $1';
    const result = await pool.query(query, [id_usuario]);
    
    if (result.rows.length === 0) {
      return null;
    }
    return result.rows[0];
  }

  // 2. Guarda el código random de 6 números que le mandamos por mail
  async guardarCodigoVerificacion(id_usuario: number, codigo: string, vencimiento: Date): Promise<void> {
    const query = `
      UPDATE usuarios 
      SET codigo_verificacion = $1, vencimiento_codigo = $2 
      WHERE id_usuario = $3;
    `;
    await pool.query(query, [codigo, vencimiento, id_usuario]);
  }

  // 3. Guarda la nueva clave, pone "debe_cambiar_password" en FALSE y limpia los códigos
  async actualizarPasswordSegura(id_usuario: number, passwordHash: string): Promise<void> {
    const query = `
      UPDATE usuarios 
      SET password_hash = $1, 
          debe_cambiar_password = false,
          codigo_verificacion = null,
          vencimiento_codigo = null
      WHERE id_usuario = $2;
    `;
    await pool.query(query, [passwordHash, id_usuario]);
  }
}