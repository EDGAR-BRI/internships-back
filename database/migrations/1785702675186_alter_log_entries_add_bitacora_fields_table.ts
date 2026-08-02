import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'log_entries'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('week').nullable()
      table.string('area').nullable()
      table.text('impact').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('week')
      table.dropColumn('area')
      table.dropColumn('impact')
    })
  }
}
