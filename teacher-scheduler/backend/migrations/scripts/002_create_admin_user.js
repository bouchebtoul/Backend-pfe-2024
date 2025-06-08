const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const adminUser = {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@ntic.com',
    password: 'admin123', // This will be hashed before saving
};

const adminRole = {
    name: 'ADMIN',
    permissions: [
        'manage_users',
        'manage_teachers',
        'manage_departments',
        'manage_modules',
        'manage_schedules',
        'manage_semesters',
        'manage_roles'
    ]
};

// Define schemas outside to reuse them
const RoleSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    permissions: [{ type: String }]
});

const UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true }
});

module.exports = {
    async up(mongoose) {
        // Create Role model if it doesn't exist
        const Role = mongoose.models.Role || mongoose.model('Role', RoleSchema);

        // Create User model if it doesn't exist
        const User = mongoose.models.User || mongoose.model('User', UserSchema);

        try {
            // Create or get admin role
            let adminRoleDoc = await Role.findOne({ name: adminRole.name });
            if (!adminRoleDoc) {
                adminRoleDoc = await Role.create(adminRole);
                console.log('✅ Admin role created successfully');
            } else {
                console.log('ℹ️ Admin role already exists');
            }

            // Create admin user with role reference
            const existingUser = await User.findOne({ email: adminUser.email });
            if (!existingUser) {
                // Hash the password
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(adminUser.password, salt);

                // Create the admin user with hashed password and role reference
                await User.create({
                    ...adminUser,
                    password: hashedPassword,
                    role: adminRoleDoc._id // Link to role using ObjectId
                });
                console.log('✅ Admin user created successfully');
                console.log('Email:', adminUser.email);
                console.log('Password:', adminUser.password);
            } else {
                // Update existing admin user's role if needed
                if (!existingUser.role.equals(adminRoleDoc._id)) {
                    await User.updateOne(
                        { _id: existingUser._id },
                        { role: adminRoleDoc._id }
                    );
                    console.log('✅ Updated admin user role reference');
                }
                console.log('ℹ️ Admin user already exists');
            }
        } catch (error) {
            console.error('Error creating admin user or role:', error);
            throw error;
        }
    },

    async down(mongoose) {
        try {
            // Get models using the same schemas
            const User = mongoose.models.User || mongoose.model('User', UserSchema);
            const Role = mongoose.models.Role || mongoose.model('Role', RoleSchema);

            // Remove admin user
            await User.deleteOne({ email: adminUser.email });
            console.log('✅ Admin user removed');

            // Remove admin role
            await Role.deleteOne({ name: adminRole.name });
            console.log('✅ Admin role removed');
        } catch (error) {
            console.error('Error removing admin user or role:', error);
            throw error;
        }
    }
}; 