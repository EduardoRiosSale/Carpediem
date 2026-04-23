import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { IUsuarioRepository } from '../../domain/repositories/IUsuarioRepository.js';
import { EmailService } from '../../infrastructure/services/EmailService.js';

export class LoginUsuarioUseCase {
  constructor(
    private usuarioRepository: IUsuarioRepository,
    private emailService: EmailService
  ) {}

  async ejecutar(email: string, passwordPlana: string) {
    const usuario = await this.usuarioRepository.buscarPorEmail(email);
    if (!usuario) throw new Error('Credenciales inválidas');

    // Si está inactivo y no es alumno, bloqueamos
    if (!usuario.estado_activo && usuario.rol !== 'ALUMNO') {
      throw new Error('Cuenta inactiva');
    }

    const passwordCorrecta = await bcrypt.compare(passwordPlana, usuario.password_hash);
    if (!passwordCorrecta) throw new Error('Credenciales inválidas');

    // Si es alumno inactivo por cuota vencida, lo dejamos pasar pero con estado especial
    if (!usuario.estado_activo && usuario.rol === 'ALUMNO') {
      const token = jwt.sign(
        {
          id_usuario: usuario.id_usuario,
          rol: usuario.rol,
          fecha_vencimiento_cuota: usuario.fecha_vencimiento_cuota,
        },
        process.env.JWT_SECRET as string,
        { expiresIn: '1h' }
      );
      const { password_hash, codigo_verificacion, vencimiento_codigo, ...usuarioSinPassword } = usuario;
      return {
        estado: 'CUOTA_VENCIDA',
        token,
        usuario: usuarioSinPassword,
      };
    }

    // 🛑 EL PATOVICA DEL 2FA: ¿Tiene que cambiar la clave?
    if (usuario.debe_cambiar_password) {
      const codigo = Math.floor(100000 + Math.random() * 900000).toString();
      const vencimiento = new Date();
      vencimiento.setMinutes(vencimiento.getMinutes() + 15);

      await this.usuarioRepository.guardarCodigoVerificacion(usuario.id_usuario!, codigo, vencimiento);
      this.emailService.enviarCodigoVerificacion(usuario.email, codigo)
        .catch(err => console.log('Aviso: No se pudo enviar el mail, pero el código es:', codigo));

      return {
        estado: 'REQUIERE_VERIFICACION',
        mensaje: 'Hemos enviado un código de seguridad a tu email.',
        id_usuario: usuario.id_usuario
      };
    }

    // ✅ SI LLEGA ACÁ, ES PORQUE YA CAMBIÓ LA CLAVE ANTES
    const token = jwt.sign(
      { 
        id_usuario: usuario.id_usuario, 
        rol: usuario.rol,
        fecha_vencimiento_cuota: usuario.fecha_vencimiento_cuota 
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );

    const { password_hash, codigo_verificacion, vencimiento_codigo, ...usuarioSinPassword } = usuario;
    
    return {
      estado: 'OK',
      token,
      usuario: usuarioSinPassword
    };
  }
}