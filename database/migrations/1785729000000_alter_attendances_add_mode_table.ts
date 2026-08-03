import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'attendances'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('mode', 20).nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('mode')
    })
  }
}
