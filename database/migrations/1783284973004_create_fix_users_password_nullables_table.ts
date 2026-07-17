import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    // Create temp table with correct schema (password nullable)
    this.schema.createTable('users_new', (table) => {
      table.increments('id').notNullable()
      table.string('full_name').nullable()
      table.string('email', 254).notNullable().unique()
      table.string('password').nullable()
      table.string('provider').nullable()
      table.string('provider_id').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })

    // Copy data from old table
    this.db.rawQuery(
      `INSERT INTO users_new (id, full_name, email, password, provider, provider_id, created_at, updated_at)
       SELECT id, full_name, email, password, provider, provider_id, created_at, updated_at FROM users`
    )

    // Drop old table
    this.schema.dropTable('users')

    // Rename new table
    this.db.rawQuery(`ALTER TABLE users_new RENAME TO users`)
  }

  async down() {
    // This migration is not easily reversible
    // Recreate original table with password NOT NULL
    this.schema.createTable('users_backup', (table) => {
      table.increments('id').notNullable()
      table.string('full_name').nullable()
      table.string('email', 254).notNullable().unique()
      table.string('password').notNullable()
      table.string('provider').nullable()
      table.string('provider_id').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })

    this.db.rawQuery(
      `INSERT INTO users_backup (id, full_name, email, password, provider, provider_id, created_at, updated_at)
       SELECT id, full_name, email, COALESCE(password, ''), provider, provider_id, created_at, updated_at FROM users`
    )

    this.schema.dropTable('users')
    this.db.rawQuery(`ALTER TABLE users_backup RENAME TO users`)
  }
}
