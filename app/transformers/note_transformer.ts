import type Note from '#models/note'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class NoteTransformer extends BaseTransformer<Note> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'userId',
      'logEntryId',
      'content',
      'date',
      'createdAt',
      'updatedAt',
    ])
  }
}
