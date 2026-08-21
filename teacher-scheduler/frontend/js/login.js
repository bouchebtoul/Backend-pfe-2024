document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('error-message');
    const API_URL = 'http://localhost:5001/api/auth/login';

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            const response = await fetch(API_URL, {
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

            // Store tokens in localStorage
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            localStorage.setItem('userData', JSON.stringify(data.user));

            // Redirect based on user role
            if (data.user.role === 'ADMIN') {
                window.location.href = '/pages/admin-dashboard.html';
            } else {
                window.location.href = '/pages/dashboard.html';
            }

        } catch (error) {
            errorMessage.textContent = error.message || 'An error occurred during login';
            errorMessage.style.display = 'block';
        }
    });
});