import type LogEntry from '#models/log_entry'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class LogEntryTransformer extends BaseTransformer<LogEntry> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'userId',
      'name',
      'status',
      'theory',
      'attitudes',
      'resources',
      'datStart',
      'datEnd',
      'createdAt',
      'updatedAt',
    ])
  }
}
