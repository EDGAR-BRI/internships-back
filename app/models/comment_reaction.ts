import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import NoteComment from '#models/note_comment'
import User from '#models/user'

export default class CommentReaction extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare commentId: number

  @column()
  declare userId: number

  @column()
  declare emoji: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => NoteComment, { foreignKey: 'commentId' })
  declare comment: BelongsTo<typeof NoteComment>

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>
}
