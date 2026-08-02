import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'log_entries'

  async up() {
    this.schema.alterTable(this.tableName, (table) => table.dropColumn('title'))
    this.schema.alterTable(this.tableName, (table) => table.dropColumn('description'))
    this.schema.alterTable(this.tableName, (table) => table.dropColumn('priority'))
    this.schema.alterTable(this.tableName, (table) => table.dropColumn('due_date'))

    this.schema.alterTable(this.tableName, (table) =>
      table.string('name', 255).notNullable().defaultTo('')
    )
    this.schema.alterTable(this.tableName, (table) => table.text('theory').nullable())
    this.schema.alterTable(this.tableName, (table) => table.text('attitudes').nullable())
    this.schema.alterTable(this.tableName, (table) => table.text('resources').nullable())
    this.schema.alterTable(this.tableName, (table) => table.timestamp('dat_start').notNullable())
    this.schema.alterTable(this.tableName, (table) => table.timestamp('dat_end').nullable())
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => table.dropColumn('name'))
    this.schema.alterTable(this.tableName, (table) => table.dropColumn('theory'))
    this.schema.alterTable(this.tableName, (table) => table.dropColumn('attitudes'))
    this.schema.alterTable(this.tableName, (table) => table.dropColumn('resources'))
    this.schema.alterTable(this.tableName, (table) => table.dropColumn('dat_start'))
    this.schema.alterTable(this.tableName, (table) => table.dropColumn('dat_end'))

    this.schema.alterTable(this.tableName, (table) =>
      table.string('title', 255).notNullable().defaultTo('')
    )
    this.schema.alterTable(this.tableName, (table) => table.text('description').nullable())
    this.schema.alterTable(this.tableName, (table) =>
      table.string('priority', 255).notNullable().defaultTo('medium')
    )
    this.schema.alterTable(this.tableName, (table) => table.date('due_date').nullable())
  }
}
