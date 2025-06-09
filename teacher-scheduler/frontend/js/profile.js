import config from './config.js';

class Profile {
    constructor() {
        this.form = document.getElementById('profileForm');
        this.logoutBtn = document.getElementById('logoutBtn');
        this.initializeEventListeners();
        this.loadUserProfile();
    }

    initializeEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.logoutBtn.addEventListener('click', () => this.handleLogout());
    }

    async loadUserProfile() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = 'index.html';
                return;
            }

            const response = await fetch(`${config.backendUrl}/api/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load profile');
            }

            const user = await response.json();
            console.log('Loaded user data:', user); // Debug log

            // Split fullname into firstName and lastName if needed
            if (user.fullname && !user.firstName) {
                const names = user.fullname.split(' ');
                user.firstName = names[0] || '';
                user.lastName = names.slice(1).join(' ') || '';
            }

            this.populateForm(user);
        } catch (error) {
            this.showError('Failed to load profile data');
            console.error('Profile load error:', error);
        }
    }

    populateForm(user) {
        console.log('Populating form with:', user); // Debug log
        const firstNameInput = document.getElementById('firstName');
        const lastNameInput = document.getElementById('lastName');
        const emailInput = document.getElementById('email');

        if (firstNameInput) firstNameInput.value = user.firstName || '';
        if (lastNameInput) lastNameInput.value = user.lastName || '';
        if (emailInput) emailInput.value = user.email || '';
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        try {
            const formData = new FormData(this.form);
            const updates = {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName')
            };

            // Only include password if it's provided
            const password = formData.get('password');
            const confirmPassword = formData.get('confirmPassword');
            
            if (password) {
                if (password !== confirmPassword) {
                    this.showError('Passwords do not match');
                    return;
                }
                updates.password = password;
            }

            const token = localStorage.getItem('token');
            const response = await fetch(`${config.backendUrl}/api/users/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updates)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update profile');
            }

            this.showSuccess('Profile updated successfully');
            
            // Update the profile name in localStorage for the dashboard
            const userData = await response.json();
            localStorage.setItem('userName', `${userData.firstName} ${userData.lastName}`);
            
        } catch (error) {
            this.showError(error.message || 'Failed to update profile');
            console.error('Profile update error:', error);
        }
    }

    handleLogout() {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        window.location.href = 'index.html';
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        this.showMessage(errorDiv);
    }

    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        this.showMessage(successDiv);
    }

    showMessage(messageDiv) {
        // Remove any existing messages
        const existingMessages = document.querySelectorAll('.error-message, .success-message');
        existingMessages.forEach(msg => msg.remove());

        // Add new message
        this.form.insertBefore(messageDiv, this.form.firstChild);

        // Remove message after 3 seconds
        setTimeout(() => messageDiv.remove(), 3000);
    }
}

// Initialize profile when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Profile();
}); 