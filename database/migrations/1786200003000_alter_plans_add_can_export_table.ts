import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'plans'

  async up() {
    this.schema.alterTable('plans', (table) => {
      table.boolean('can_export').notNullable().defaultTo(true)
    })

    this.defer(async () => {
      await this.db.rawQuery(`UPDATE plans SET can_export = 0 WHERE slug = 'free'`)
      await this.db.rawQuery(`UPDATE plans SET can_export = 1 WHERE slug = 'pro'`)
    })
  }

  async down() {
    this.schema.alterTable('plans', (table) => {
      table.dropColumn('can_export')
    })
  }
}
