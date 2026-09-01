import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class UserSetting extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column.dateTime()
  declare startDate: DateTime

  @column.dateTime()
  declare endDate: DateTime

  @column({
    prepare: (value: number[] | null) => (value ? JSON.stringify(value) : value),
    consume: (value: string | null) => (value ? JSON.parse(value) : value),
  })
  declare skippedWeeks: number[] | null

  @column()
  declare ci: string | null

  @column()
  declare workType: 'full' | 'partial' | null

  @column()
  declare workHoursPerDay: number | null

  @column()
  declare daysPerWeek: number | null

  @column()
  declare workStartTime: string | null

  @column()
  declare workEndTime: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>
}
