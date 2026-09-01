import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

const MEXICO_CITY_ZONE = 'America/Mexico_City'

function toMexicoCity(value: DateTime | null): string | null {
  if (!value) return null
  return value.setZone(MEXICO_CITY_ZONE).toSQL()
}

function fromMexicoCity(value: string | null): DateTime | null {
  if (!value) return null
  return DateTime.fromSQL(value, { zone: MEXICO_CITY_ZONE })
}

export default class Attendance extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column.date()
  declare date: DateTime

  @column.dateTime({
    prepare: toMexicoCity,
    consume: fromMexicoCity,
  })
  declare checkIn: DateTime | null

  @column.dateTime({
    prepare: toMexicoCity,
    consume: fromMexicoCity,
  })
  declare checkOut: DateTime | null

  @column()
  declare isFullDay: boolean | null

  @column()
  declare hours: number | null

  @column()
  declare mode: 'on_site' | 'remote' | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
