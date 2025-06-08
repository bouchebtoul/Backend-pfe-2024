require('dotenv').config();
const mongoose = require('mongoose');
const Migrator = require('./migrator');
const config = require('./config');

async function main() {
    const command = process.argv[2] || 'up';
    const steps = parseInt(process.argv[3]) || 1;

    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI, config.mongooseOptions);
        console.log('📦 Connected to MongoDB');

        const migrator = new Migrator(mongoose);

        if (command === 'up') {
            console.log('🚀 Running migrations...');
            await migrator.migrate();
            console.log('✨ All migrations completed successfully');
        } else if (command === 'down') {
            console.log(`🔄 Rolling back ${steps} migration(s)...`);
            await migrator.rollback(steps);
            console.log('✨ Rollback completed successfully');
        } else {
            console.error('❌ Invalid command. Use "up" or "down"');
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ Migration error:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Disconnected from MongoDB');
    }
}

main(); 