import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Note from '#models/note'
import User from '#models/user'
import CommentReaction from '#models/comment_reaction'

export default class NoteComment extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare noteId: number

  @column()
  declare userId: number

  @column()
  declare content: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Note, { foreignKey: 'noteId' })
  declare note: BelongsTo<typeof Note>

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>

  @hasMany(() => CommentReaction, { foreignKey: 'commentId' })
  declare reactions: HasMany<typeof CommentReaction>
}
