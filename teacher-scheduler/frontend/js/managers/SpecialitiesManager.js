class SpecialitiesManager {
    constructor() {
        this.specialitiesTableBody = document.getElementById('specialitiesTableBody');
        this.specialityModal = document.getElementById('specialityModal');
        this.specialityForm = document.getElementById('specialityForm');
        this.addSpecialityBtn = document.getElementById('addSpecialityBtn');
        this.closeModalBtn = this.specialityModal.querySelector('.close-modal');
        this.modalTitle = document.getElementById('specialityModalTitle');
        this.departmentSelect = document.getElementById('departmentid');
        
        this.currentSpecialityId = null;
        this.isEditing = false;
        
        this.initializeEventListeners();
        this.loadDepartments();
        this.loadSpecialities();
    }

    initializeEventListeners() {
        this.addSpecialityBtn.addEventListener('click', () => this.showAddModal());
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        this.specialityForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.specialityModal) {
                this.closeModal();
            }
        });
    }

    async loadDepartments() {
        try {
            const response = await fetch('http://localhost:5000/api/departments');
            const departments = await response.json();
            
            this.departmentSelect.innerHTML = '<option value="">Select Department</option>';
            departments.forEach(dept => {
                const option = document.createElement('option');
                option.value = dept._id;
                option.textContent = dept.name;
                this.departmentSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading departments:', error);
            alert('Failed to load departments. Please try again.');
        }
    }

    async loadSpecialities() {
        try {
            const response = await fetch('http://localhost:5000/api/specialities');
            const specialities = await response.json();
            
            this.specialitiesTableBody.innerHTML = '';
            specialities.forEach(speciality => this.addSpecialityToTable(speciality));
        } catch (error) {
            console.error('Error loading specialities:', error);
            alert('Failed to load specialities. Please try again.');
        }
    }

    addSpecialityToTable(speciality) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${speciality.code}</td>
            <td>${speciality.name}</td>
            <td>${speciality.description || ''}</td>
            <td>${speciality.departmentid ? speciality.departmentid.name : ''}</td>
            <td>
                <button class="btn-edit" data-id="${speciality._id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" data-id="${speciality._id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

        // Add event listeners for edit and delete buttons
        const editBtn = row.querySelector('.btn-edit');
        const deleteBtn = row.querySelector('.btn-delete');
        
        editBtn.addEventListener('click', () => this.showEditModal(speciality));
        deleteBtn.addEventListener('click', () => this.deleteSpeciality(speciality._id));

        this.specialitiesTableBody.appendChild(row);
    }

    showAddModal() {
        this.isEditing = false;
        this.currentSpecialityId = null;
        this.modalTitle.textContent = 'Add New Speciality';
        this.specialityForm.reset();
        this.specialityModal.classList.add('show');
    }

    showEditModal(speciality) {
        this.isEditing = true;
        this.currentSpecialityId = speciality._id;
        this.modalTitle.textContent = 'Edit Speciality';
        
        // Fill form with speciality data
        document.getElementById('code').value = speciality.code;
        document.getElementById('name').value = speciality.name;
        document.getElementById('description').value = speciality.description || '';
        document.getElementById('departmentid').value = speciality.departmentid;
        
        this.specialityModal.classList.add('show');
    }

    closeModal() {
        this.specialityModal.classList.remove('show');
        this.specialityForm.reset();
        this.currentSpecialityId = null;
        this.isEditing = false;
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.specialityForm);
        const specialityData = {
            code: formData.get('code'),
            name: formData.get('name'),
            description: formData.get('description'),
            departmentid: formData.get('departmentid')
        };

        try {
            let response;
            if (this.isEditing) {
                response = await fetch(`http://localhost:5000/api/specialities/${this.currentSpecialityId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(specialityData)
                });
            } else {
                response = await fetch('http://localhost:5000/api/specialities', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(specialityData)
                });
            }

            if (!response.ok) {
                throw new Error('Failed to save speciality');
            }

            this.closeModal();
            this.loadSpecialities();
        } catch (error) {
            console.error('Error saving speciality:', error);
            alert('Failed to save speciality. Please try again.');
        }
    }

    async deleteSpeciality(id) {
        if (!confirm('Are you sure you want to delete this speciality?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/specialities/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete speciality');
            }

            this.loadSpecialities();
        } catch (error) {
            console.error('Error deleting speciality:', error);
            alert('Failed to delete speciality. Please try again.');
        }
    }
}

// Export for use in other modules
export default SpecialitiesManager; 