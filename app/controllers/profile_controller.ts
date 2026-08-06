import UserTransformer from '#transformers/user_transformer'
import CacheService from '#services/cache_service'
import { updateProfileValidator, changePasswordValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class ProfileController {
  async show({ auth, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const cacheKey = CacheService.userKey(user.id, 'profile')

    const cached = await CacheService.get(cacheKey)
    if (cached) {
      return serialize(cached)
    }

    const payload = new UserTransformer(user).toObject()
    await CacheService.set(cacheKey, payload)
    return serialize(payload)
  }

  async update({ request, auth, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const data = await request.validateUsing(updateProfileValidator)

    user.merge(data)
    await user.save()
    await CacheService.invalidateUser(user.id)

    return serialize({
      user: new UserTransformer(user).toObject(),
    })
  }

  async changePassword({ request, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const { currentPassword, newPassword } = await request.validateUsing(changePasswordValidator)

    if (user.password) {
      if (!currentPassword) {
        return response.badRequest({ message: 'La contraseña actual es obligatoria' })
      }
      const valid = await user.verifyPassword(currentPassword)
      if (!valid) {
        return response.badRequest({ message: 'La contraseña actual es incorrecta' })
      }
    }

    user.password = newPassword
    await user.save()
    await CacheService.invalidateUser(user.id)

    return {
      message: 'Contraseña actualizada',
    }
  }
}
