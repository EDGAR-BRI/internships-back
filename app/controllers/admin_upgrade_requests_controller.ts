import UpgradeRequest from '#models/upgrade_request'
import Plan from '#models/plan'
import SubscriptionService from '#services/subscription_service'
import CacheService from '#services/cache_service'
import { DateTime } from 'luxon'
import type { HttpContext } from '@adonisjs/core/http'

export default class AdminUpgradeRequestsController {
  async index({ serialize }: HttpContext) {
    const requests = await UpgradeRequest.query().preload('user').orderBy('createdAt', 'asc')

    return serialize({
      upgradeRequests: requests.map((r) => ({
        id: r.id,
        planSlug: r.planSlug,
        status: r.status,
        createdAt: r.createdAt,
        user: {
          id: r.user.id,
          fullName: r.user.fullName,
          email: r.user.email,
          initials: r.user.initials,
        },
      })),
    })
  }

  async approve({ params, response, serialize }: HttpContext) {
    const request = await UpgradeRequest.query().where('id', params.id).first()
    if (!request) {
      return response.notFound({ message: 'Solicitud no encontrada' })
    }
    if (request.status !== 'pending') {
      return response.conflict({ message: 'La solicitud ya fue resuelta' })
    }

    const plan = await Plan.query().where('slug', request.planSlug).first()
    if (!plan) {
      return response.badRequest({ message: 'El plan solicitado ya no existe' })
    }

    await SubscriptionService.assignPlan(request.userId, request.planSlug)
    await CacheService.invalidateUser(request.userId)
    request.status = 'approved'
    request.resolvedAt = DateTime.now()
    await request.save()

    return serialize({
      upgradeRequest: {
        id: request.id,
        status: request.status,
        planSlug: request.planSlug,
      },
    })
  }

  async reject({ params, response, serialize }: HttpContext) {
    const request = await UpgradeRequest.query().where('id', params.id).first()
    if (!request) {
      return response.notFound({ message: 'Solicitud no encontrada' })
    }
    if (request.status !== 'pending') {
      return response.conflict({ message: 'La solicitud ya fue resuelta' })
    }

    request.status = 'rejected'
    request.resolvedAt = DateTime.now()
    await request.save()

    return serialize({
      upgradeRequest: {
        id: request.id,
        status: request.status,
        planSlug: request.planSlug,
      },
    })
  }
}
