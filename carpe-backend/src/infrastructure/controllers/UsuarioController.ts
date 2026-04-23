import { Request, Response } from 'express';
import { RegistrarUsuarioUseCase } from '../../application/use-cases/RegistrarUsuario.js';
import { LoginUsuarioUseCase } from '../../application/use-cases/LoginUsuario.js';
import { PostgresUsuarioRepository } from '../persistence/repositories/PostgresUsuarioRepository.js';
import type { AuthRequest } from '../middlewares/authMiddleware.js';

export class UsuarioController {
  constructor(
    private registrarUsuarioUseCase: RegistrarUsuarioUseCase,
    private loginUsuarioUseCase: LoginUsuarioUseCase
  ) {}

  registrar = async (req: Request, res: Response): Promise<void> => {
    try {
      const nuevoUsuario = await this.registrarUsuarioUseCase.ejecutar(req.body);
      const { password_hash, ...usuarioSinPassword } = nuevoUsuario;
      res.status(201).json({ mensaje: 'Usuario creado', usuario: usuarioSinPassword });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password_plana } = req.body;
    const resultado = await this.loginUsuarioUseCase.ejecutar(email, password_plana);
    res.status(200).json(resultado);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
};

  listarAlumnos = async (req: Request, res: Response): Promise<void> => {
    try {
      const repo = new PostgresUsuarioRepository();
      const alumnos = await repo.listarAlumnos();
      res.status(200).json(alumnos);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  listarProfes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { pool } = await import('../../infrastructure/persistence/PostgreSQLConfig.js');
    const result = await pool.query(
      `SELECT 
         u.id_usuario, u.nombre_completo, u.email, u.estado_activo, u.fecha_inicio,u.foto_url,
         COUNT(a.id_usuario) AS total_alumnos
       FROM usuarios u
       LEFT JOIN usuarios a ON a.id_profe_titular = u.id_usuario AND a.rol = 'ALUMNO'
       WHERE u.rol = 'PROFE'
       GROUP BY u.id_usuario
       ORDER BY u.nombre_completo ASC`
    );
    res.status(200).json(result.rows);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

  renovarCuota = async (req: Request, res: Response): Promise<void> => {
    try {
      const id_alumno = Number(req.params.id);
      const repo = new PostgresUsuarioRepository();
      await repo.renovarCuota(id_alumno);
      res.status(200).json({ mensaje: 'Cuota renovada por 30 días.' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };
listarMisAlumnos = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id_profe = req.usuario?.id_usuario;
    const { pool } = await import('../../infrastructure/persistence/PostgreSQLConfig.js');
    const result = await pool.query(
      `SELECT id_usuario, nombre_completo, email, estado_activo, fecha_vencimiento_cuota,foto_url
       FROM usuarios
       WHERE rol = 'ALUMNO' AND id_profe_titular = $1
       ORDER BY nombre_completo ASC`,
      [id_profe]
    );
    res.status(200).json(result.rows);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
obtenerPorId = async (req: Request, res: Response): Promise<void> => {
  try {
    const repo = new PostgresUsuarioRepository();
    const usuario = await repo.buscarPorId(Number(req.params.id));
    if (!usuario) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }
    const { password_hash, ...sinPassword } = usuario;
    res.status(200).json(sinPassword);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
reenviarCodigo = async (req: Request, res: Response): Promise<void> => {
  try {
    const id_usuario = Number(req.params.id);
    const repo = new PostgresUsuarioRepository();
    const usuario = await repo.buscarPorId(id_usuario);
    if (!usuario) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }
    const { pool } = await import('../../infrastructure/persistence/PostgreSQLConfig.js');
    
    // Generamos nueva contraseña temporal
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let passwordTemporal = '';
    for (let i = 0; i < 10; i++) {
      passwordTemporal += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const bcrypt = await import('bcrypt');
    const passwordHash = await bcrypt.default.hash(passwordTemporal, 10);

    // Actualizamos la contraseña y reseteamos el flag
    await pool.query(
      `UPDATE usuarios SET password_hash = $1, debe_cambiar_password = true WHERE id_usuario = $2`,
      [passwordHash, id_usuario]
    );

    // Reenviamos el mail
    const { EmailService } = await import('../../infrastructure/services/EmailService.js');
    const emailService = new EmailService();
    await emailService.enviarBienvenida(usuario.email, usuario.nombre_completo, passwordTemporal);

    res.status(200).json({ mensaje: 'Credenciales reenviadas correctamente.' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
eliminarUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const id_usuario = Number(req.params.id);
    const { pool } = await import('../../infrastructure/persistence/PostgreSQLConfig.js');
    await pool.query('DELETE FROM usuarios WHERE id_usuario = $1', [id_usuario]);
    res.status(200).json({ mensaje: 'Usuario eliminado correctamente.' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
editarUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const id_usuario = Number(req.params.id);
    const { nombre_completo, email, fecha_vencimiento_cuota, id_profe_titular, valor_mensual, fecha_inicio } = req.body;
    const { pool } = await import('../../infrastructure/persistence/PostgreSQLConfig.js');
    await pool.query(
      `UPDATE usuarios SET 
        nombre_completo = $1, email = $2, fecha_vencimiento_cuota = $3,
        id_profe_titular = $4, valor_mensual = $5, fecha_inicio = $6
       WHERE id_usuario = $7`,
      [nombre_completo, email, fecha_vencimiento_cuota || null, id_profe_titular || null, valor_mensual || null, fecha_inicio || null, id_usuario]
    );
    res.status(200).json({ mensaje: 'Usuario actualizado correctamente.' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
alumnosDeProfe = async (req: Request, res: Response): Promise<void> => {
  try {
    const id_profe = Number(req.params.id);
    const { pool } = await import('../../infrastructure/persistence/PostgreSQLConfig.js');
    const result = await pool.query(
      `SELECT id_usuario, nombre_completo, email, estado_activo, fecha_vencimiento_cuota,foto_url
       FROM usuarios
       WHERE rol = 'ALUMNO' AND id_profe_titular = $1
       ORDER BY nombre_completo ASC`,
      [id_profe]
    );
    res.status(200).json(result.rows);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};}