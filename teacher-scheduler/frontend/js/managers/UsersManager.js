import config from '../config.js';

class UsersManager {
    constructor() {
        this.usersTableBody = document.getElementById('usersTableBody');
        this.userModal = document.getElementById('userModal');
        this.userForm = document.getElementById('userForm');
        this.addUserBtn = document.getElementById('addUserBtn');
        this.closeModalBtn = this.userModal.querySelector('.close-modal');
        this.modalTitle = document.getElementById('userModalTitle');
        this.roleSelect = document.getElementById('roleId');
        
        this.currentUserId = null;
        this.isEditing = false;
        
        this.initializeEventListeners();
        this.loadUsers();
        this.loadRoles();
    }

    initializeEventListeners() {
        this.addUserBtn.addEventListener('click', () => this.showAddModal());
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        this.userForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.userModal) {
                this.closeModal();
            }
        });
    }

    async loadUsers() {
        try {
            const response = await fetch(`${config.backendUrl}/api/users`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const users = await response.json();
            
            this.usersTableBody.innerHTML = '';
            users.forEach(user => this.addUserToTable(user));
        } catch (error) {
            console.error('Error loading users:', error);
            alert('Failed to load users. Please try again.');
        }
    }

    async loadRoles() {
        try {
            const response = await fetch(`${config.backendUrl}/api/roles`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const roles = await response.json();
            
            // Clear existing options except the first one
            this.roleSelect.innerHTML = '<option value="">Select a role</option>';
            
            // Add role options
            roles.forEach(role => {
                const option = document.createElement('option');
                option.value = role._id;
                option.textContent = role.name;
                this.roleSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading roles:', error);
            alert('Failed to load roles. Please try again.');
        }
    }

    addUserToTable(user) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.firstName} ${user.lastName}</td>
            <td>${user.email}</td>
            <td><span class="role-badge">${user.role.name}</span></td>
            <td>
                <span class="status-badge ${user.isActive ? 'status-active' : 'status-inactive'}">
                    ${user.isActive ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td>${user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</td>
            <td>
                <button class="btn-edit" data-id="${user._id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" data-id="${user._id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

        // Add event listeners for edit and delete buttons
        const editBtn = row.querySelector('.btn-edit');
        const deleteBtn = row.querySelector('.btn-delete');
        
        editBtn.addEventListener('click', () => this.showEditModal(user));
        deleteBtn.addEventListener('click', () => this.deleteUser(user._id));

        this.usersTableBody.appendChild(row);
    }

    showAddModal() {
        this.isEditing = false;
        this.currentUserId = null;
        this.modalTitle.textContent = 'Add New User';
        this.userForm.reset();
        this.userForm.classList.remove('edit-mode');
        document.getElementById('password').required = true;
        this.userModal.classList.add('show');
    }

    showEditModal(user) {
        this.isEditing = true;
        this.currentUserId = user._id;
        this.modalTitle.textContent = 'Edit User';
        
        // Fill form with user data
        document.getElementById('firstName').value = user.firstName;
        document.getElementById('lastName').value = user.lastName;
        document.getElementById('email').value = user.email;
        document.getElementById('roleId').value = user.role._id;
        document.getElementById('isActive').value = user.isActive.toString();
        
        // Password is not required when editing
        document.getElementById('password').required = false;
        this.userForm.classList.add('edit-mode');
        
        this.userModal.classList.add('show');
    }

    closeModal() {
        this.userModal.classList.remove('show');
        this.userForm.reset();
        this.currentUserId = null;
        this.isEditing = false;
        this.userForm.classList.remove('edit-mode');
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.userForm);
        const userData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            roleId: formData.get('roleId'),
            isActive: formData.get('isActive') === 'true'
        };

        // Only include password if it's provided
        const password = formData.get('password');
        if (password) {
            userData.password = password;
        }

        try {
            let response;
            if (this.isEditing) {
                response = await fetch(`${config.backendUrl}/api/users/${this.currentUserId}`, {
                    method: 'PUT',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(userData)
                });
            } else {
                response = await fetch(`${config.backendUrl}/api/users`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(userData)
                });
            }

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to save user');
            }

            this.closeModal();
            this.loadUsers();
        } catch (error) {
            console.error('Error saving user:', error);
            alert(error.message || 'Failed to save user. Please try again.');
        }
    }

    async deleteUser(id) {
        if (!confirm('Are you sure you want to delete this user?')) {
            return;
        }

        try {
            const response = await fetch(`${config.backendUrl}/api/users/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete user');
            }

            this.loadUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            alert(error.message || 'Failed to delete user. Please try again.');
        }
    }
}

export default UsersManager; 