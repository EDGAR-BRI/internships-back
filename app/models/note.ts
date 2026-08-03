import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import LogEntry from '#models/log_entry'

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
}
