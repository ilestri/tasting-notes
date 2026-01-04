import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { resolve } from 'node:path'
import { db } from './index'

const migrationsFolder = resolve(process.cwd(), 'server/db/migrations')

migrate(db, { migrationsFolder })

console.log('Migrations completed')
