const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const Role = require('../models/Role');
const jwt = require('jsonwebtoken');
const googleConfig = require('../config/googleAuth');

const client = new OAuth2Client(googleConfig.clientId);

exports.handleGoogleCallback = async (req, res) => {
    try {
        const { credential } = req.body;

        // Verify the Google token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: googleConfig.clientId
        });

        const payload = ticket.getPayload();
        const email = payload.email;

        // Check if email is from the university domain
        if (!email.endsWith('@univ-constantine2.dz')) {
            return res.status(401).json({ 
                message: 'Only @univ-constantine2.dz email addresses are allowed' 
            });
        }

        // Find or create user
        let user = await User.findOne({ email: email }).populate('role');
        
        if (!user) {
            // For new users, assign a default role (e.g., 'teacher')
            const defaultRole = await Role.findOne({ name: 'teacher' });
            if (!defaultRole) {
                return res.status(500).json({ 
                    message: 'Default role not found. Please contact administrator.' 
                });
            }

            // Create new user
            user = await User.create({
                email,
                firstName: payload.given_name,
                lastName: payload.family_name,
                password: Math.random().toString(36).slice(-8), // Random password
                role: defaultRole._id,
                isActive: true
            });

            user = await User.findById(user._id).populate('role');
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({ 
                message: 'Your account is inactive. Please contact administrator.' 
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user._id,
                role: user.role.name,
                permissions: user.role.permissions
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({ token, user });
    } catch (error) {
        console.error('Google authentication error:', error);
        res.status(500).json({ 
            message: 'Authentication failed. Please try again.' 
        });
    }
}; 