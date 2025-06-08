class DepartmentsManager {
    constructor() {
        this.departmentsTableBody = document.getElementById('departmentsTableBody');
        this.departmentModal = document.getElementById('departmentModal');
        this.departmentForm = document.getElementById('departmentForm');
        this.addDepartmentBtn = document.getElementById('addDepartmentBtn');
        this.closeModalBtn = this.departmentModal.querySelector('.close-modal');
        this.modalTitle = document.getElementById('departmentModalTitle');
        
        this.currentDepartmentId = null;
        this.isEditing = false;
        
        this.initializeEventListeners();
        this.loadDepartments();
    }

    initializeEventListeners() {
        this.addDepartmentBtn.addEventListener('click', () => this.showAddModal());
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        this.departmentForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.departmentModal) {
                this.closeModal();
            }
        });
    }

    async loadDepartments() {
        try {
            const response = await fetch('http://localhost:5000/api/departments');
            const departments = await response.json();
            
            this.departmentsTableBody.innerHTML = '';
            departments.forEach(department => this.addDepartmentToTable(department));
        } catch (error) {
            console.error('Error loading departments:', error);
            alert('Failed to load departments. Please try again.');
        }
    }

    addDepartmentToTable(department) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${department.code}</td>
            <td>${department.name}</td>
            <td>${department.description || ''}</td>
            <td>
                <button class="btn-edit" data-id="${department._id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" data-id="${department._id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

        // Add event listeners for edit and delete buttons
        const editBtn = row.querySelector('.btn-edit');
        const deleteBtn = row.querySelector('.btn-delete');
        
        editBtn.addEventListener('click', () => this.showEditModal(department));
        deleteBtn.addEventListener('click', () => this.deleteDepartment(department._id));

        this.departmentsTableBody.appendChild(row);
    }

    showAddModal() {
        this.isEditing = false;
        this.currentDepartmentId = null;
        this.modalTitle.textContent = 'Add New Department';
        this.departmentForm.reset();
        this.departmentModal.classList.add('show');
    }

    showEditModal(department) {
        this.isEditing = true;
        this.currentDepartmentId = department._id;
        this.modalTitle.textContent = 'Edit Department';
        
        // Fill form with department data
        document.getElementById('code').value = department.code;
        document.getElementById('name').value = department.name;
        document.getElementById('description').value = department.description || '';
        
        this.departmentModal.classList.add('show');
    }

    closeModal() {
        this.departmentModal.classList.remove('show');
        this.departmentForm.reset();
        this.currentDepartmentId = null;
        this.isEditing = false;
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.departmentForm);
        const departmentData = {
            code: formData.get('code'),
            name: formData.get('name'),
            description: formData.get('description')
        };

        try {
            let response;
            if (this.isEditing) {
                response = await fetch(`http://localhost:5000/api/departments/${this.currentDepartmentId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(departmentData)
                });
            } else {
                response = await fetch('http://localhost:5000/api/departments', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(departmentData)
                });
            }

            if (!response.ok) {
                throw new Error('Failed to save department');
            }

            this.closeModal();
            this.loadDepartments();
        } catch (error) {
            console.error('Error saving department:', error);
            alert('Failed to save department. Please try again.');
        }
    }

    async deleteDepartment(id) {
        if (!confirm('Are you sure you want to delete this department?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/departments/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete department');
            }

            this.loadDepartments();
        } catch (error) {
            console.error('Error deleting department:', error);
            alert('Failed to delete department. Please try again.');
        }
    }
}

// Export for use in other modules
export default DepartmentsManager; 