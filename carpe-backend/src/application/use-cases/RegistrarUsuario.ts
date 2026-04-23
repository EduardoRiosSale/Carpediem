// src/application/use-cases/RegistrarUsuario.ts
import bcrypt from 'bcrypt';
import { IUsuarioRepository } from '../../domain/repositories/IUsuarioRepository.js';
import { EmailService } from '../../infrastructure/services/EmailService.js';
import { Usuario } from '../../domain/Usuario.js';

export class RegistrarUsuarioUseCase {
  constructor(
    private usuarioRepository: IUsuarioRepository,
    private emailService: EmailService
  ) {}

  private generarPasswordTemporal(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  }

  async ejecutar(datos: Omit<Usuario, 'id_usuario'>): Promise<Usuario> {
    const usuarioExistente = await this.usuarioRepository.buscarPorEmail(datos.email);
    if (usuarioExistente) throw new Error('Email ya registrado.');

    // Generamos la contraseña temporal acá, no la recibimos del frontend
    const passwordTemporal = this.generarPasswordTemporal();
console.log('Password temporal generada:', passwordTemporal); // ← agregá esto
const passwordEncriptada = await bcrypt.hash(passwordTemporal, 10);

    const fechaVencimiento = new Date();
    fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);

    const nuevoUsuario: Usuario = {
    ...datos,
    password_hash: passwordEncriptada,
    fecha_vencimiento_cuota: datos.rol === 'ALUMNO' ? fechaVencimiento : null,
    debe_cambiar_password: true,
};

    const usuarioCreado = await this.usuarioRepository.crear(nuevoUsuario);

    // Mandamos el mail con la contraseña temporal en texto plano
    this.emailService.enviarBienvenida(datos.email, datos.nombre_completo, passwordTemporal)
      .catch(err => console.error('Error enviando mail:', err));

    return usuarioCreado;
  }
}