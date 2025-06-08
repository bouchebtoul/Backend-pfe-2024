const fs = require('fs').promises;
const path = require('path');

async function createMigration() {
    const name = process.argv[2];
    if (!name) {
        console.error('❌ Please provide a migration name');
        process.exit(1);
    }

    const timestamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
    const filename = `${timestamp}_${name}.js`;
    const filepath = path.join(__dirname, 'scripts', filename);

    const template = `module.exports = {
    async up(mongoose) {
        // Add your migration code here
        // Example:
        // const Model = mongoose.model('ModelName');
        // await Model.updateMany({ /* query */ }, { /* update */ });
    },

    async down(mongoose) {
        // Add your rollback code here
        // This should undo what up() does
    }
};
`;

    try {
        await fs.writeFile(filepath, template);
        console.log(`✅ Created migration file: ${filename}`);
    } catch (error) {
        console.error('❌ Error creating migration file:', error);
        process.exit(1);
    }
}

createMigration(); 