import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'comment_reactions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('comment_id')
        .unsigned()
        .references('id')
        .inTable('note_comments')
        .onDelete('CASCADE')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.string('emoji', 16).notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
      table.unique(['comment_id', 'user_id', 'emoji'])
      table.index(['comment_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
