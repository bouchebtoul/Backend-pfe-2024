import config from './config.js';

class Auth {
    constructor() {
        this.loginForm = document.getElementById('loginForm');
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        window.handleGoogleCallback = this.handleGoogleCallback.bind(this);
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch(`${config.backendUrl}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            localStorage.setItem('token', data.accessToken);
            window.location.href = 'dashboard.html';
        } catch (error) {
            this.showError(error.message);
        }
    }

    async handleGoogleCallback(response) {
        try {
            // Make sure we have a credential
            if (!response || !response.credential) {
                throw new Error('No credential received from Google');
            }

            console.log('Received Google credential');

            const googleResponse = await fetch(`${config.backendUrl}/api/auth/google/callback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ 
                    credential: response.credential
                })
            });

            const data = await googleResponse.json();

            if (!googleResponse.ok) {
                throw new Error(data.message || 'Google login failed');
            }

            // Store the token and redirect
            localStorage.setItem('token', data.token);
            window.location.href = 'dashboard.html';
        } catch (error) {
            console.error('Google auth error:', error);
            this.showError(error.message || 'Authentication failed');
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;

        // Remove any existing error message
        const existingError = this.loginForm.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Add new error message after the form
        this.loginForm.appendChild(errorDiv);
        this.loginForm.classList.add('error');
    }
}

// Initialize auth when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Auth();
}); 