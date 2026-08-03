import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { BaseModel, column, computed, hasMany, hasOne } from '@adonisjs/lucid/orm'
import { type AccessToken, DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import type { HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import type { HashManager } from '@adonisjs/core/hash'
import Attendance from '#models/attendance'
import LogEntry from '#models/log_entry'
import Note from '#models/note'
import UserSetting from '#models/user_setting'

const AuthFinder = withAuthFinder(hash as unknown as HashManager<any>, {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends AuthFinder(BaseModel) {
  static accessTokens = DbAccessTokensProvider.forModel(User)
  declare currentAccessToken?: AccessToken

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare fullName: string | null

  @column()
  declare email: string

  @column()
  declare role: string

  @column({ serializeAs: null })
  declare provider: string | null

  @column({ serializeAs: null })
  declare providerId: string | null

  @column({ serializeAs: null })
  declare password: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @computed()
  get initials() {
    const [first, last] = this.fullName ? this.fullName.split(' ') : this.email.split('@')
    if (first && last) {
      return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
    }
    return first.slice(0, 2).toUpperCase()
  }

  @computed()
  get isAdmin() {
    return this.role === 'admin'
  }

  @hasMany(() => Attendance)
  declare attendances: HasMany<typeof Attendance>

  @hasMany(() => LogEntry)
  declare logEntries: HasMany<typeof LogEntry>

  @hasMany(() => Note)
  declare notes: HasMany<typeof Note>

  @hasOne(() => UserSetting)
  declare settings: HasOne<typeof UserSetting>
}
