import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import env from '#start/env'

export default class GoogleAuthController {
  async redirect({ ally }: HttpContext) {
    return ally.use('google').redirect()
  }

  async callback({ ally, response }: HttpContext) {
    const provider = ally.use('google')
    const frontendUrl = env.get('FRONTEND_URL', 'http://localhost:5173')

    if (provider.hasError()) {
      return response.redirect(`${frontendUrl}/login?error=${provider.getError()}`)
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
      }
      if (googleUser.avatarUrl) {
        user.avatarUrl = googleUser.avatarUrl
      }
      await user.save()
    } else {
      user = await User.create({
        fullName: googleUser.name,
        email: googleUser.email,
        provider: 'google',
        providerId: googleUser.id,
        avatarUrl: googleUser.avatarUrl ?? null,
      })
    }

    const token = await User.accessTokens.create(user)

    const params = new URLSearchParams({
      token: token.value!.release(),
      user: JSON.stringify({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      }),
    })

    return response.redirect(`${frontendUrl}/auth/callback?${params.toString()}`, false)
  }
}
