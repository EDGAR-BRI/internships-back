import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_settings'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('work_type', 10).nullable()
      table.integer('work_hours_per_day').unsigned().nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('work_type')
      table.dropColumn('work_hours_per_day')
    })
  }
}
