const mongoose = require('mongoose');

module.exports = {
    async up(mongoose) {
        const db = mongoose.connection.db;
        
        try {
            // Drop the existing index on email field if it exists
            await db.collection('teachers').dropIndex('email_1');
            console.log('Successfully dropped the unique index on Teacher email field');
        } catch (error) {
            // If the index doesn't exist, that's fine
            if (!error.message.includes('index not found')) {
                throw error;
            }
            console.log('Index was already removed or did not exist');
        }

        // No need to update the schema since we're working directly with the collection
        console.log('Successfully removed unique constraint from Teacher email field');
    },

    async down(mongoose) {
        const db = mongoose.connection.db;
        
        try {
            // Recreate the unique index
            await db.collection('teachers').createIndex({ email: 1 }, { unique: true });
            console.log('Successfully restored unique index on Teacher email field');
        } catch (error) {
            console.error('Error restoring unique index:', error);
            throw error;
        }
    }
}; 