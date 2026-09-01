import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_settings'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('tutor_name', 100).nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('tutor_name')
    })
  }
}
