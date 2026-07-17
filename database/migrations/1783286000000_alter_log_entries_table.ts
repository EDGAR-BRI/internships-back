import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'log_entries'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('title')
      table.dropColumn('description')
      table.dropColumn('status')
      table.dropColumn('priority')
      table.dropColumn('due_date')

      table.string('name').notNullable()
      table.string('status').notNullable().defaultTo('pending')
      table.text('theory').nullable()
      table.text('attitudes').nullable()
      table.text('resources').nullable()
      table.datetime('dat_start').notNullable()
      table.datetime('dat_end').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('name')
      table.dropColumn('theory')
      table.dropColumn('attitudes')
      table.dropColumn('resources')
      table.dropColumn('dat_start')
      table.dropColumn('dat_end')

      table.string('title').notNullable()
      table.text('description').nullable()
      table.string('priority').notNullable().defaultTo('medium')
      table.date('due_date').nullable()
    })
  }
}
