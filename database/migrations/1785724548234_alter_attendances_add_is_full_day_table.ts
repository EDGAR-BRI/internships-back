import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'attendances'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('is_full_day').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('is_full_day')
    })
  }
}
