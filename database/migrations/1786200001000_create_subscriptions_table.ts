import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'subscriptions'

  async up() {
    this.schema.createTableIfNotExists(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('user_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .unique()
      table
        .integer('plan_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('plans')
        .onDelete('CASCADE')
      table.string('status').notNullable().defaultTo('active')
      table.timestamp('started_at').notNullable()
      table.timestamp('expires_at').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })

    this.defer(async () => {
      await this.db.rawQuery(`
        INSERT INTO subscriptions (user_id, plan_id, status, started_at, created_at, updated_at)
        SELECT u.id, p.id, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        FROM users u
        JOIN plans p ON p.slug = 'free'
        WHERE NOT EXISTS (SELECT 1 FROM subscriptions s WHERE s.user_id = u.id)
      `)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
