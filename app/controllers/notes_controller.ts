import Note from '#models/note'
import type { HttpContext } from '@adonisjs/core/http'
import { createNoteValidator, updateNoteValidator } from '#validators/note'
import NoteTransformer from '#transformers/note_transformer'

export default class NotesController {
  async index({ auth, request, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const logEntryId = request.input('logEntryId')

    const query = Note.query().where('userId', user.id).orderBy('createdAt', 'desc')

    if (logEntryId) {
      query.where('logEntryId', logEntryId)
    }

    const notes = await query

    return serialize({
      notes: NoteTransformer.transform(notes),
    })
  }

  async store({ request, auth, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const data = await request.validateUsing(createNoteValidator)

    const note = await Note.create({
      ...data,
      userId: user.id,
    })

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

    return serialize({
      note: NoteTransformer.transform(note),
    })
  }

  async destroy({ params, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const note = await Note.query().where('id', params.id).where('userId', user.id).firstOrFail()

    await note.delete()

    return response.noContent()
  }
}
