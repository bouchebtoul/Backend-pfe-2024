const mongoose = require('mongoose');

const config = {
    // Collection to store migration state
    migrationCollection: 'migrations',
    
    // MongoDB connection options
    mongooseOptions: {
        useNewUrlParser: true,
        useUnifiedTopology: true
    },

    // Migration files directory
    migrationsDir: __dirname + '/scripts',

    // Function to get mongoose connection
    getConnection: async () => {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI environment variable is not set');
        }
        return mongoose.connection;
    }
};

module.exports = config; 