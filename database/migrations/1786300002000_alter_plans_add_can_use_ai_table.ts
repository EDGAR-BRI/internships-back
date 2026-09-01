import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'plans'

  async up() {
    this.schema.alterTable('plans', (table) => {
      table.boolean('can_use_ai').notNullable().defaultTo(false)
    })

    this.defer(async () => {
      await this.db.rawQuery(`UPDATE plans SET can_use_ai = false WHERE slug = 'free'`)
      await this.db.rawQuery(`UPDATE plans SET can_use_ai = true WHERE slug = 'pro'`)
    })
  }

  async down() {
    this.schema.alterTable('plans', (table) => {
      table.dropColumn('can_use_ai')
    })
  }
}
