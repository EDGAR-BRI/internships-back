import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Subscription from '#models/subscription'

export default class Plan extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare slug: string

  @column()
  declare name: string

  @column()
  declare notesPerDay: number | null

  @column()
  declare logEntriesPerDay: number | null

  @column()
  declare attendancesPerDay: number | null

  @column()
  declare attendancesPerDayFirstDay: number | null

  @column()
  declare canExport: boolean

  @column()
  declare canExportAttendance: boolean

  @column()
  declare canUseAi: boolean

  @column()
  declare isDefault: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => Subscription)
  declare subscriptions: HasMany<typeof Subscription>

  get isUnlimited() {
    return (
      this.notesPerDay === null && this.logEntriesPerDay === null && this.attendancesPerDay === null
    )
  }
}
