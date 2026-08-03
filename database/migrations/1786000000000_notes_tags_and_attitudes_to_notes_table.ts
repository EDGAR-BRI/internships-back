import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'notes'

  async up() {
    this.schema.alterTable('notes', (table) => {
      table.string('tag', 30).defaultTo('general').notNullable()
    })

    this.defer(async () => {
      await this.db.rawQuery(`
        INSERT INTO notes (user_id, log_entry_id, title, content, tag, date, created_at, updated_at)
        SELECT user_id, id, NULL, attitudes, 'aprendizaje', dat_start, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        FROM log_entries
        WHERE attitudes IS NOT NULL AND TRIM(attitudes) <> ''
      `)
    })

    this.schema.alterTable('log_entries', (table) => {
      table.dropColumn('attitudes')
    })
  }

  async down() {
    this.schema.alterTable('log_entries', (table) => {
      table.text('attitudes').nullable()
    })

    this.defer(async () => {
      await this.db.rawQuery(`
        UPDATE log_entries
        SET attitudes = (
          SELECT content FROM notes
          WHERE notes.log_entry_id = log_entries.id AND notes.tag = 'aprendizaje'
          ORDER BY notes.id ASC
          LIMIT 1
        )
      `)
    })

    this.schema.alterTable('notes', (table) => {
      table.dropColumn('tag')
    })
  }
}
