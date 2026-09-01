import UpgradeRequest from '#models/upgrade_request'
import Subscription from '#models/subscription'
import SubscriptionService from '#services/subscription_service'
import CacheService from '#services/cache_service'
import type { HttpContext } from '@adonisjs/core/http'

export default class SubscriptionController {
  async show({ auth, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const cacheKey = CacheService.userKey(user.id, 'subscription')

    const cached = await CacheService.get(cacheKey)
    if (cached) {
      return serialize(cached)
    }

    const plan = await SubscriptionService.getPlanFor(user.id)
    const sub = await Subscription.query().where('userId', user.id).first()

    const payload = {
      subscription: {
        planSlug: plan.slug,
        planName: plan.name,
        canExport: user.isAdmin || !!plan.canExport,
        canExportAttendance: user.isAdmin || !!plan.canExportAttendance,
        canUseAi: user.isAdmin || !!plan.canUseAi,
        expiresAt: sub?.expiresAt ?? null,
      },
    }
    await CacheService.set(cacheKey, payload)
    return serialize(payload)
  }

  async requestUpgrade({ auth, response, serialize }: HttpContext) {
    const user = auth.getUserOrFail()

    if (user.isAdmin) {
      return response.badRequest({ message: 'Los administradores no necesitan un plan superior' })
    }

    const existing = await UpgradeRequest.query()
      .where('user_id', user.id)
      .where('status', 'pending')
      .first()

    if (existing) {
      return response.conflict({ message: 'Ya tienes una solicitud pendiente para el plan Pro' })
    }

    const request = await UpgradeRequest.create({
      userId: user.id,
      planSlug: 'pro',
      status: 'pending',
    })

    return serialize({
      upgradeRequest: {
        id: request.id,
        planSlug: request.planSlug,
        status: request.status,
        createdAt: request.createdAt,
      },
    })
  }
}
