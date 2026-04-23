import { Resend } from 'resend';

export class EmailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async enviarBienvenida(email: string, nombre: string, passwordTemporal: string) {
    await this.resend.emails.send({
      from: 'Carpe Diem <noresponder@visionrs.com.ar>',
      to: email,
      subject: '¡¡Bienvenido a Carpe Diem!!',
      html: `
        <!DOCTYPE html>
        <html>
        <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: Arial, sans-serif;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0f172a; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" max-width="500" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; background-color: #1e293b; border: 2px solid #22d3ee; border-radius: 16px; padding: 40px 30px;">
                  <tr>
                    <td align="center">
                      <h1 style="color: #ffffff; margin: 0 0 5px 0; font-size: 32px; font-weight: bold; letter-spacing: 2px;">CARPE DIEM</h1>
                      <p style="color: #22d3ee; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 4px; margin: 0 0 30px 0;">Salud & Estética</p>
                    </td>
                  </tr>
                  <tr>
                    <td align="center">
                      <h2 style="color: #ffffff; font-size: 20px; margin: 0 0 15px 0;">¡Bienvenido, ${nombre.split(' ')[0]}!</h2>
                      <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 25px 0;">Tu cuenta fue creada exitosamente. Estas son tus credenciales de acceso temporal:</p>
                    </td>
                  </tr>
                  <tr>
                    <td align="center">
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0f172a; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
                        <tr>
                          <td style="padding-bottom: 15px; text-align: left;">
                            <span style="color: #64748b; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; font-size: 11px; display: block; margin-bottom: 5px;">Email</span>
                            <span style="color: #ffffff; font-weight: bold; font-size: 14px;">${email}</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="text-align: left;">
                            <span style="color: #64748b; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; font-size: 11px; display: block; margin-bottom: 5px;">Contraseña temporal</span>
                            <span style="color: #a855f7; font-weight: bold; letter-spacing: 2px; font-size: 14px;">${passwordTemporal}</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td align="center">
                      <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; margin: 0 0 30px 0;">Al ingresar por primera vez, te vamos a pedir que verifiques tu identidad y cambies tu contraseña.</p>
                    </td>
                  </tr>
                  <tr>
                    <td align="center">
                      <a href="https://carpediem.visionrs.com.ar/login" style="display: inline-block; background-color: #a855f7; color: #ffffff; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">
                        Ingresar a la App
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td align="center">
                      <p style="color: #475569; font-size: 11px; margin: 35px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">Si no esperabas este mail, por favor ignoralo.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });
  }

  async enviarCodigoVerificacion(email: string, codigo: string) {
    await this.resend.emails.send({
      from: 'Carpe Diem <noresponder@visionrs.com.ar>',
      to: email,
      subject: 'Tu código de verificación',
      html: `
        <!DOCTYPE html>
        <html>
        <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: Arial, sans-serif;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0f172a; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" max-width="500" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; background-color: #1e293b; border: 2px solid #a855f7; border-radius: 16px; padding: 40px 30px;">
                  <tr>
                    <td align="center">
                      <h1 style="color: #ffffff; margin: 0 0 5px 0; font-size: 32px; font-weight: bold; letter-spacing: 2px;">CARPE DIEM</h1>
                      <p style="color: #a855f7; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 4px; margin: 0 0 30px 0;">Seguridad</p>
                    </td>
                  </tr>
                  <tr>
                    <td align="center">
                      <h2 style="color: #ffffff; font-size: 20px; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 1px;">Verificá tu identidad</h2>
                      <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 25px 0;">Ingresá este código de 6 dígitos en la aplicación para continuar:</p>
                    </td>
                  </tr>
                  <tr>
                    <td align="center">
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0f172a; border-radius: 12px; padding: 30px 20px; margin-bottom: 25px;">
                        <tr>
                          <td align="center">
                            <h1 style="color: #22d3ee; font-size: 42px; font-weight: bold; letter-spacing: 12px; margin: 0;">${codigo}</h1>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td align="center">
                      <p style="color: #64748b; font-size: 13px; margin: 0;">Este código vence en <strong style="color: #cbd5e1;">15 minutos</strong>.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });
  }
}
