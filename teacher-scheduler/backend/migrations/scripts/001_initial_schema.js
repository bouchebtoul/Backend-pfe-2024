const initialSchemas = {
    User: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, ref: 'Role', required: true }
    },
    Role: {
        name: { type: String, required: true, unique: true },
        permissions: [{ type: String }]
    },
    Teacher: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        department: { type: String, ref: 'Department', required: true }
    },
    Department: {
        name: { type: String, required: true, unique: true },
        description: String
    },
    Module: {
        name: { type: String, required: true },
        code: { type: String, required: true, unique: true },
        semester: { type: String, ref: 'Semester', required: true }
    },
    Semester: {
        name: { type: String, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        isActive: { type: Boolean, default: false }
    },
    Schedule: {
        teacher: { type: String, ref: 'Teacher', required: true },
        module: { type: String, ref: 'Module', required: true },
        room: { type: String, required: true },
        startTime: { type: Date, required: true },
        endTime: { type: Date, required: true }
    }
};

module.exports = {
    async up(mongoose) {
        for (const [modelName, schema] of Object.entries(initialSchemas)) {
            // Check if collection exists
            const collections = await mongoose.connection.db.listCollections().toArray();
            const collectionExists = collections.some(c => c.name === modelName.toLowerCase() + 's');
            
            if (!collectionExists) {
                // Create new collection with schema
                const Schema = new mongoose.Schema(schema, { timestamps: true });
                const Model = mongoose.model(modelName, Schema);
                await Model.createCollection();
                console.log(`Created collection for ${modelName}`);
            } else {
                console.log(`Collection for ${modelName} already exists, skipping...`);
            }
        }
    },

    async down(mongoose) {
        for (const modelName of Object.keys(initialSchemas)) {
            try {
                await mongoose.connection.db.dropCollection(modelName.toLowerCase() + 's');
                console.log(`Dropped collection ${modelName}`);
            } catch (error) {
                console.log(`Error dropping collection ${modelName}:`, error.message);
            }
        }
    }
}; 