import LogEntry from '#models/log_entry'
import type { HttpContext } from '@adonisjs/core/http'
import { createLogEntryValidator, updateLogEntryValidator } from '#validators/log_entry'
import LogEntryTransformer from '#transformers/log_entry_transformer'
import SubscriptionService from '#services/subscription_service'

export default class LogEntriesController {
  async index({ auth, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const logEntries = await LogEntry.query().where('userId', user.id).orderBy('createdAt', 'desc')

    return serialize({
      logEntries: LogEntryTransformer.transform(logEntries),
    })
  }

  async store({ request, auth, serialize, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const data = await request.validateUsing(createLogEntryValidator)

    const usage = await SubscriptionService.getUsage(user, 'logEntries')
    if (usage.limit !== null && usage.used >= usage.limit) {
      return response.tooManyRequests({
        message: SubscriptionService.limitMessage(usage.plan.name, 'actividades', usage.limit),
        code: 'DAILY_LIMIT',
        resource: 'logEntries',
        used: usage.used,
        limit: usage.limit,
      })
    }

    const logEntry = await LogEntry.create({
      ...data,
      userId: user.id,
    })

    return serialize({
      logEntry: LogEntryTransformer.transform(logEntry),
    })
  }

  async show({ params, auth, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const logEntry = await LogEntry.query()
      .where('id', params.id)
      .where('userId', user.id)
      .firstOrFail()

    return serialize({
      logEntry: LogEntryTransformer.transform(logEntry),
    })
  }

  async update({ params, request, auth, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const logEntry = await LogEntry.query()
      .where('id', params.id)
      .where('userId', user.id)
      .firstOrFail()

    const data = await request.validateUsing(updateLogEntryValidator)
    logEntry.merge(data)
    await logEntry.save()

    return serialize({
      logEntry: LogEntryTransformer.transform(logEntry),
    })
  }

  async destroy({ params, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const logEntry = await LogEntry.query()
      .where('id', params.id)
      .where('userId', user.id)
      .firstOrFail()

    await logEntry.delete()

    return response.noContent()
  }
}
