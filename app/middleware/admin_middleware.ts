import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Admin middleware is used to deny access to non-admin users.
 */
export default class AdminMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const user = await ctx.auth.authenticate()

    if (!user.isAdmin) {
      return ctx.response.forbidden({ message: 'No tienes permisos de administrador' })
    }

    return next()
  }
}
