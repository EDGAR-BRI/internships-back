import Note from '#models/note'
import type { HttpContext } from '@adonisjs/core/http'
import { createNoteValidator, updateNoteValidator } from '#validators/note'
import NoteTransformer from '#transformers/note_transformer'
import SubscriptionService from '#services/subscription_service'
import CacheService from '#services/cache_service'

export default class NotesController {
  async index({ auth, request, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const logEntryId = request.input('logEntryId')
    const cacheKey = CacheService.userKey(user.id, `notes:${logEntryId ?? 'all'}`)

    const cached = await CacheService.get(cacheKey)
    if (cached) {
      return serialize(cached)
    }

    const query = Note.query().where('userId', user.id).orderBy('createdAt', 'desc')

    if (logEntryId) {
      query.where('logEntryId', logEntryId)
    }

    const notes = await query
    const payload = { notes: notes.map((n) => new NoteTransformer(n).toObject()) }

    await CacheService.set(cacheKey, payload)
    return serialize(payload)
  }

  async store({ request, auth, serialize, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const data = await request.validateUsing(createNoteValidator)

    const usage = await SubscriptionService.getUsage(user, 'notes')
    if (usage.limit !== null && usage.used >= usage.limit) {
      return response.tooManyRequests({
        message: SubscriptionService.limitMessage(usage.plan.name, 'notas', usage.limit),
        code: 'DAILY_LIMIT',
        resource: 'notes',
        used: usage.used,
        limit: usage.limit,
      })
    }

    const note = await Note.create({
      ...data,
      userId: user.id,
    })

    await CacheService.invalidateUser(user.id)

    return serialize({
      note: NoteTransformer.transform(note),
    })
  }

  async show({ params, auth, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const note = await Note.query().where('id', params.id).where('userId', user.id).firstOrFail()

    return serialize({
      note: NoteTransformer.transform(note),
    })
  }

  async update({ params, request, auth, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const note = await Note.query().where('id', params.id).where('userId', user.id).firstOrFail()

    const data = await request.validateUsing(updateNoteValidator)
    note.merge(data)
    await note.save()

    await CacheService.invalidateUser(user.id)

    return serialize({
      note: NoteTransformer.transform(note),
    })
  }

  async destroy({ params, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const note = await Note.query().where('id', params.id).where('userId', user.id).firstOrFail()

    await note.delete()
    await CacheService.invalidateUser(user.id)

    return response.noContent()
  }
}
