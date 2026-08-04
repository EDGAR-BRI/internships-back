import { createHash, randomBytes } from 'node:crypto'
import { DateTime } from 'luxon'
import User from '#models/user'
import PasswordResetToken from '#models/password_reset_token'
import { forgotPasswordValidator, resetPasswordValidator } from '#validators/password_reset'
import type { HttpContext } from '@adonisjs/core/http'
import env from '#start/env'
import logger from '@adonisjs/core/services/logger'
import mail from '@adonisjs/mail/services/main'

const TOKEN_TTL_MINUTES = 30

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export default class PasswordResetController {
  async forgot({ request, response }: HttpContext) {
    const { email } = await request.validateUsing(forgotPasswordValidator)

    const user = await User.findBy('email', email)

    // Respuesta genérica para no revelar si el email está registrado
    if (!user || !user.password) {
      return response.ok({
        message:
          'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.',
      })
    }

    await PasswordResetToken.query().where('userId', user.id).delete()

    const rawToken = randomBytes(32).toString('hex')

    await PasswordResetToken.create({
      userId: user.id,
      tokenHash: hashToken(rawToken),
      expiresAt: DateTime.now().plus({ minutes: TOKEN_TTL_MINUTES }),
    })

    const resetUrl = `${env.get('FRONTEND_URL', 'http://localhost:5173')}/reset-password?token=${rawToken}`

    try {
      await mail.send((message) => {
        message.from(env.get('MAIL_FROM')).to(email).subject('Restablece tu contraseña').html(`
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
              <h2 style="color: #111827; margin-bottom: 16px;">Hola ${user.fullName || ''}</h2>
              <p style="color: #374151; line-height: 1.6;">
                Recibimos una solicitud para restablecer tu contraseña. Haz clic en el botón de abajo para continuar.
                El enlace expira en ${TOKEN_TTL_MINUTES} minutos.
              </p>
              <p style="margin: 24px 0;">
                <a href="${resetUrl}" style="background: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Restablecer contraseña
                </a>
              </p>
              <p style="color: #6b7280; font-size: 13px; line-height: 1.5;">
                Si no solicitaste este cambio, ignora este correo. Si el botón no funciona, copia y pega este enlace en tu navegador:
                <br /><a href="${resetUrl}" style="color: #4f46e5; word-break: break-all;">${resetUrl}</a>
              </p>
            </div>
          `)
      })
    } catch (error) {
      logger.error(error, 'Error sending password reset email')
      if (env.get('NODE_ENV') === 'development') {
        logger.info(`[dev] Password reset link: ${resetUrl}`)
      } else {
        throw error
      }
    }

    return response.ok({
      message: 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.',
    })
  }

  async reset({ request, response }: HttpContext) {
    const { token, password } = await request.validateUsing(resetPasswordValidator)

    const record = await PasswordResetToken.query()
      .where('tokenHash', hashToken(token))
      .whereNull('usedAt')
      .first()

    if (!record) {
      return response.badRequest({ message: 'El enlace no es válido o ya fue utilizado.' })
    }

    if (record.isExpired) {
      return response.badRequest({ message: 'El enlace ha expirado. Solicita uno nuevo.' })
    }

    const user = await User.find(record.userId)
    if (!user) {
      return response.badRequest({ message: 'El enlace no es válido.' })
    }

    user.password = password
    await user.save()

    record.usedAt = DateTime.now()
    await record.save()

    await User.accessTokens.deleteAll(user)

    return response.ok({ message: 'Tu contraseña fue actualizada. Ya puedes iniciar sesión.' })
  }
}
