import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import env from '#start/env'

function getAllowedOrigins(): string[] {
  return (env.get('CORS_ORIGINS') || env.get('FRONTEND_URL') || '')
    .split(',')
    .map((s) => s.trim().replace(/\/$/, ''))
    .filter(Boolean)
}

function resolveCallbackUrl(
  queryRedirect: string | undefined,
  defaultOrigin: string
): string {
  const fallback = `${defaultOrigin.replace(/\/$/, '')}/auth/callback`
  if (!queryRedirect) return fallback
  try {
    const requested = new URL(queryRedirect)
    const isAllowed = getAllowedOrigins().some((origin) => {
      try {
        return new URL(origin).origin === requested.origin
      } catch {
        return false
      }
    })
    if (isAllowed) return requested.toString()
  } catch {}
  return fallback
}

export default class GoogleAuthController {
  async redirect({ ally, request, session, logger }: HttpContext) {
    const redirectUri = request.qs().redirect_uri
    if (typeof redirectUri === 'string' && redirectUri) {
      session.put('post_login_redirect', redirectUri)
    }
    const appUrl = env.get('APP_URL')
    const callbackUrl = `${appUrl.replace(/\/$/, '')}/api/v1/auth/google/callback`
    logger.info(
      `Google OAuth start | APP_URL="${appUrl}" | callback="${callbackUrl}" | frontend_redirect_uri="${redirectUri ?? 'none'}"`
    )
    return ally.use('google').redirect()
  }

  async callback({ ally, response, session }: HttpContext) {
    const provider = ally.use('google')
    const defaultOrigin = env.get('FRONTEND_URL', 'http://localhost:5173')
    const storedRedirect = session.get('post_login_redirect') as string | undefined
    const frontendUrl = resolveCallbackUrl(storedRedirect, defaultOrigin)
    session.forget('post_login_redirect')

    if (provider.hasError()) {
      return response.redirect(`${frontendUrl}?error=${provider.getError()}`)
    }

    const googleUser = await provider.user()

    let user = await User.query()
      .where('email', googleUser.email)
      .orWhere('provider_id', googleUser.id)
      .first()

    if (user) {
      if (!user.provider) {
        user.provider = 'google'
        user.providerId = googleUser.id
        await user.save()
      }
    } else {
      user = await User.create({
        fullName: googleUser.name,
        email: googleUser.email,
        provider: 'google',
        providerId: googleUser.id,
      })
    }

    const token = await User.accessTokens.create(user)

    const params = new URLSearchParams({
      token: token.value!.release(),
      user: JSON.stringify({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
      }),
    })

    return response.redirect(`${frontendUrl}/auth/callback?${params.toString()}`, false)
  }
}
}
