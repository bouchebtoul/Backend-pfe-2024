import config from '../config.js';

class RolesManager {
    constructor() {
        this.rolesTableBody = document.getElementById('rolesTableBody');
        this.roleModal = document.getElementById('roleModal');
        this.roleForm = document.getElementById('roleForm');
        this.addRoleBtn = document.getElementById('addRoleBtn');
        this.closeModalBtn = this.roleModal.querySelector('.close-modal');
        this.modalTitle = document.getElementById('roleModalTitle');
        
        this.currentRoleId = null;
        this.isEditing = false;
        
        this.initializeEventListeners();
        this.loadRoles();
    }

    initializeEventListeners() {
        this.addRoleBtn.addEventListener('click', () => this.showAddModal());
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        this.roleForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.roleModal) {
                this.closeModal();
            }
        });
    }

    async loadRoles() {
        try {
            const response = await fetch(`${config.backendUrl}/api/roles`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const roles = await response.json();
            
            this.rolesTableBody.innerHTML = '';
            roles.forEach(role => this.addRoleToTable(role));
        } catch (error) {
            console.error('Error loading roles:', error);
            alert('Failed to load roles. Please try again.');
        }
    }

    addRoleToTable(role) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${role.name}</td>
            <td>${role.description || '-'}</td>
            <td>
                <div class="permission-tags">
                    ${this.formatPermissions(role.permissions)}
                </div>
            </td>
            <td>
                <button class="btn-edit" data-id="${role._id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" data-id="${role._id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

        // Add event listeners for edit and delete buttons
        const editBtn = row.querySelector('.btn-edit');
        const deleteBtn = row.querySelector('.btn-delete');
        
        editBtn.addEventListener('click', () => this.showEditModal(role));
        deleteBtn.addEventListener('click', () => this.deleteRole(role._id));

        this.rolesTableBody.appendChild(row);
    }

    formatPermissions(permissions) {
        if (!permissions || !permissions.length) return '<span class="permission-tag">No permissions</span>';
        
        return permissions.map(perm => `
            <span class="permission-tag">${this.formatPermissionName(perm)}</span>
        `).join('');
    }

    formatPermissionName(permission) {
        return permission
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    showAddModal() {
        this.isEditing = false;
        this.currentRoleId = null;
        this.modalTitle.textContent = 'Add New Role';
        this.roleForm.reset();
        this.roleModal.classList.add('show');
    }

    showEditModal(role) {
        this.isEditing = true;
        this.currentRoleId = role._id;
        this.modalTitle.textContent = 'Edit Role';
        
        // Fill form with role data
        document.getElementById('name').value = role.name;
        document.getElementById('description').value = role.description || '';
        
        // Reset all checkboxes
        this.roleForm.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Check the permissions that the role has
        role.permissions.forEach(permission => {
            const checkbox = this.roleForm.querySelector(`input[value="${permission}"]`);
            if (checkbox) checkbox.checked = true;
        });
        
        this.roleModal.classList.add('show');
    }

    closeModal() {
        this.roleModal.classList.remove('show');
        this.roleForm.reset();
        this.currentRoleId = null;
        this.isEditing = false;
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.roleForm);
        const roleData = {
            name: formData.get('name'),
            description: formData.get('description'),
            permissions: Array.from(formData.getAll('permissions'))
        };

        try {
            let response;
            if (this.isEditing) {
                response = await fetch(`${config.backendUrl}/api/roles/${this.currentRoleId}`, {
                    method: 'PUT',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(roleData)
                });
            } else {
                response = await fetch(`${config.backendUrl}/api/roles`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(roleData)
                });
            }

            if (!response.ok) {
                throw new Error('Failed to save role');
            }

            this.closeModal();
            this.loadRoles();
        } catch (error) {
            console.error('Error saving role:', error);
            alert('Failed to save role. Please try again.');
        }
    }

    async deleteRole(id) {
        if (!confirm('Are you sure you want to delete this role?')) {
            return;
        }

        try {
            const response = await fetch(`${config.backendUrl}/api/roles/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete role');
            }

            this.loadRoles();
        } catch (error) {
            console.error('Error deleting role:', error);
            alert('Failed to delete role. Please try again.');
        }
    }
}

export default RolesManager; 