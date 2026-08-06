import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import LogEntry from '#models/log_entry'
import NoteComment from '#models/note_comment'

export default class Note extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare logEntryId: number | null

  @column()
  declare title: string | null

  @column()
  declare content: string

  @column()
  declare tag: string

  @column.dateTime()
  declare date: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>

  @belongsTo(() => LogEntry, { foreignKey: 'logEntryId' })
  declare logEntry: BelongsTo<typeof LogEntry>

  @hasMany(() => NoteComment, { foreignKey: 'noteId' })
  declare comments: HasMany<typeof NoteComment>
}
