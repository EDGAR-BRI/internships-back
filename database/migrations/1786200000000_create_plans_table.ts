import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'plans'

  async up() {
    this.schema.createTableIfNotExists(this.tableName, (table) => {
      table.increments('id')
      table.string('slug').notNullable().unique()
      table.string('name').notNullable()
      table.integer('notes_per_day').nullable()
      table.integer('log_entries_per_day').nullable()
      table.integer('attendances_per_day').nullable()
      table.integer('attendances_per_day_first_day').nullable()
      table.boolean('is_default').notNullable().defaultTo(false)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })

    this.defer(async () => {
      await this.db.rawQuery(`
        INSERT INTO plans
          (slug, name, notes_per_day, log_entries_per_day, attendances_per_day, attendances_per_day_first_day, is_default, created_at, updated_at)
        VALUES
          ('free', 'Gratis', 3, 4, 5, 15, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
          ('pro', 'Pro', NULL, NULL, NULL, NULL, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
