import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'log_entries'

  async up() {
    await this.db.rawQuery(`
      ALTER TABLE ${this.tableName}
        DROP COLUMN IF EXISTS title,
        DROP COLUMN IF EXISTS description,
        DROP COLUMN IF EXISTS priority,
        DROP COLUMN IF EXISTS due_date
    `)

    await this.db.rawQuery(`
      ALTER TABLE ${this.tableName}
        ADD COLUMN IF NOT EXISTS name varchar(255) NOT NULL,
        ADD COLUMN IF NOT EXISTS theory text NULL,
        ADD COLUMN IF NOT EXISTS attitudes text NULL,
        ADD COLUMN IF NOT EXISTS resources text NULL,
        ADD COLUMN IF NOT EXISTS dat_start timestamptz NOT NULL,
        ADD COLUMN IF NOT EXISTS dat_end timestamptz NULL
    `)
  }

  async down() {
    await this.db.rawQuery(`
      ALTER TABLE ${this.tableName}
        DROP COLUMN IF EXISTS name,
        DROP COLUMN IF EXISTS theory,
        DROP COLUMN IF EXISTS attitudes,
        DROP COLUMN IF EXISTS resources,
        DROP COLUMN IF EXISTS dat_start,
        DROP COLUMN IF EXISTS dat_end
    `)

    await this.db.rawQuery(`
      ALTER TABLE ${this.tableName}
        ADD COLUMN IF NOT EXISTS title varchar(255) NOT NULL,
        ADD COLUMN IF NOT EXISTS description text NULL,
        ADD COLUMN IF NOT EXISTS priority varchar(255) NOT NULL DEFAULT 'medium',
        ADD COLUMN IF NOT EXISTS due_date date NULL
    `)
  }
}
