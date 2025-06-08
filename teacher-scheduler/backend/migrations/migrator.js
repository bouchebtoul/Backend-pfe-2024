const fs = require('fs').promises;
const path = require('path');
const config = require('./config');

class Migrator {
    constructor(mongoose) {
        this.mongoose = mongoose;
        this.migrations = [];
    }

    async init() {
        // Create migrations collection if it doesn't exist
        const db = this.mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        if (!collections.find(c => c.name === config.migrationCollection)) {
            await db.createCollection(config.migrationCollection);
        }
        this.migrationsCollection = db.collection(config.migrationCollection);
    }

    async loadMigrations() {
        // Read migration files from the scripts directory
        const files = await fs.readdir(config.migrationsDir);
        const migrationFiles = files.filter(f => f.endsWith('.js')).sort();

        this.migrations = migrationFiles.map(file => ({
            name: file,
            path: path.join(config.migrationsDir, file)
        }));
    }

    async getExecutedMigrations() {
        return await this.migrationsCollection.find({}).sort({ timestamp: 1 }).toArray();
    }

    async migrate() {
        await this.init();
        await this.loadMigrations();

        const executedMigrations = await this.getExecutedMigrations();
        const executedNames = new Set(executedMigrations.map(m => m.name));

        for (const migration of this.migrations) {
            if (!executedNames.has(migration.name)) {
                console.log(`Executing migration: ${migration.name}`);
                try {
                    const script = require(migration.path);
                    await script.up(this.mongoose);

                    // Record successful migration
                    await this.migrationsCollection.insertOne({
                        name: migration.name,
                        timestamp: new Date(),
                        success: true
                    });

                    console.log(`✅ Migration ${migration.name} completed successfully`);
                } catch (error) {
                    console.error(`❌ Error executing migration ${migration.name}:`, error);
                    throw error; // Stop migration process on error
                }
            }
        }
    }

    async rollback(steps = 1) {
        await this.init();
        const executedMigrations = await this.getExecutedMigrations();
        
        // Get the last 'steps' number of migrations
        const toRollback = executedMigrations.slice(-steps);

        for (const migration of toRollback.reverse()) {
            console.log(`Rolling back migration: ${migration.name}`);
            try {
                const script = require(path.join(config.migrationsDir, migration.name));
                if (typeof script.down === 'function') {
                    await script.down(this.mongoose);
                    await this.migrationsCollection.deleteOne({ name: migration.name });
                    console.log(`✅ Rollback of ${migration.name} completed successfully`);
                } else {
                    console.warn(`⚠️ No rollback function defined for ${migration.name}`);
                }
            } catch (error) {
                console.error(`❌ Error rolling back migration ${migration.name}:`, error);
                throw error;
            }
        }
    }
}

module.exports = Migrator; 