import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'notes'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.timestamp('date').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('date')
    })
  }
}
