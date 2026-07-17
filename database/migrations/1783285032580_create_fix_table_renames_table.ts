import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // Drop the broken users_new table
    this.schema.dropTableIfExists('users_new')

    // Create users table with password nullable
    this.schema.createTable('users', (table) => {
      table.increments('id').notNullable()
      table.string('full_name').nullable()
      table.string('email', 254).notNullable().unique()
      table.string('password').nullable()
      table.string('provider').nullable()
      table.string('provider_id').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable('users')
  }
}
