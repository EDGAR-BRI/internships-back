import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'note_comments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('note_id').unsigned().references('id').inTable('notes').onDelete('CASCADE')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.text('content').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
      table.index(['note_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
