import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Note from '#models/note'

export default class LogEntry extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare name: string

  @column()
  declare status: string

  @column()
  declare week: number | null

  @column()
  declare area: string | null

  @column()
  declare theory: string | null

  @column()
  declare attitudes: string | null

  @column()
  declare impact: string | null

  @column()
  declare resources: string | null

  @column.dateTime()
  declare datStart: DateTime

  @column.dateTime()
  declare datEnd: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>

  @hasMany(() => Note)
  declare notes: HasMany<typeof Note>
}
