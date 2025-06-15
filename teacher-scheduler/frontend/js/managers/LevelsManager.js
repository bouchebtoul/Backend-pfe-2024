import config from '../config.js';

class LevelsManager {
    constructor() {
        this.levelsTableBody = document.getElementById('levelsTableBody');
        this.levelModal = document.getElementById('levelModal');
        this.levelForm = document.getElementById('levelForm');
        this.addLevelBtn = document.getElementById('addLevelBtn');
        this.closeModalBtn = this.levelModal.querySelector('.close-modal');
        this.modalTitle = document.getElementById('levelModalTitle');
        this.specialitySelect = document.getElementById('specialityId');
        
        this.currentLevelId = null;
        this.isEditing = false;
        this.specialities = [];
        
        this.initializeEventListeners();
        this.loadSpecialities().then(() => {
            this.loadLevels();
        });
    }

    initializeEventListeners() {
        this.addLevelBtn.addEventListener('click', () => this.showAddModal());
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        this.levelForm.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.levelModal) {
                this.closeModal();
            }
        });

        // Add color picker sync
        const colorPicker = document.getElementById('color');
        const colorPreview = document.getElementById('colorPreview');
        
        colorPicker.addEventListener('input', (e) => {
            colorPreview.style.backgroundColor = e.target.value;
        });
    }

    async loadSpecialities() {
        try {
            const response = await fetch(`${config.backendUrl}/api/specialities`);
            this.specialities = await response.json();
            this.updateSpecialitiesDropdown();
        } catch (error) {
            console.error('Error loading specialities:', error);
            alert('Failed to load specialities. Please try again.');
        }
    }

    updateSpecialitiesDropdown() {
        this.specialitySelect.innerHTML = `
            <option value="">Select a speciality</option>
            ${this.specialities.map(speciality => `
                <option value="${speciality._id}">${speciality.name}</option>
            `).join('')}
        `;
    }

    getSpecialityName(specialityId) {
        const speciality = this.specialities.find(s => s._id === specialityId);
        return speciality ? speciality.name : 'N/A';
    }

    async loadLevels() {
        try {
            const response = await fetch(`${config.backendUrl}/api/levels`);
            const levels = await response.json();
            
            this.levelsTableBody.innerHTML = '';
            levels.forEach(level => this.addLevelToTable(level));
        } catch (error) {
            console.error('Error loading levels:', error);
            alert('Failed to load levels. Please try again.');
        }
    }

    addLevelToTable(level) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${level.code}</td>
            <td>${level.name}</td>
            <td>${this.getSpecialityName(level.specialityid._id)}</td>
            <td>${level.description || ''}</td>
            <td data-field="color">
                <div class="color-preview" style="background-color: ${level.color}"></div>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" data-id="${level._id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" data-id="${level._id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;

        // Add event listeners for edit and delete buttons
        const editBtn = row.querySelector('.btn-edit');
        const deleteBtn = row.querySelector('.btn-delete');
        
        editBtn.addEventListener('click', () => this.showEditModal(level));
        deleteBtn.addEventListener('click', () => this.deleteLevel(level._id));

        this.levelsTableBody.appendChild(row);
    }

    showAddModal() {
        this.isEditing = false;
        this.currentLevelId = null;
        this.modalTitle.textContent = 'Add New Level';
        this.levelForm.reset();
        const defaultColor = '#e3f2fd';
        const colorInput = document.getElementById('color');
        const colorPreview = document.getElementById('colorPreview');
        colorInput.value = defaultColor;
        colorPreview.style.backgroundColor = defaultColor;
        this.levelModal.classList.add('show');
    }

    showEditModal(level) {
        this.isEditing = true;
        this.currentLevelId = level._id;
        this.modalTitle.textContent = 'Edit Level';
        
        // Fill form with level data
        document.getElementById('code').value = level.code;
        document.getElementById('name').value = level.name;
        document.getElementById('specialityId').value = level.specialityid._id;
        const colorInput = document.getElementById('color');
        const colorPreview = document.getElementById('colorPreview');
        colorInput.value = level.color;
        colorPreview.style.backgroundColor = level.color;
        document.getElementById('description').value = level.description || '';
        
        this.levelModal.classList.add('show');
    }

    closeModal() {
        this.levelModal.classList.remove('show');
        this.levelForm.reset();
        this.currentLevelId = null;
        this.isEditing = false;
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.levelForm);
        const data = {
            code: formData.get('code'),
            name: formData.get('name'),
            specialityid: formData.get('specialityId'),
            color: formData.get('color'),
            description: formData.get('description')
        };

        try {
            const url = `${config.backendUrl}/api/levels${this.isEditing ? `/${this.currentLevelId}` : ''}`;
            const method = this.isEditing ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Failed to save level');
            }

            this.closeModal();
            await this.loadLevels();
        } catch (error) {
            console.error('Error saving level:', error);
            alert(error.message);
        }
    }

    async deleteLevel(id) {
        if (!confirm('Are you sure you want to delete this level?')) {
            return;
        }

        try {
            const response = await fetch(`${config.backendUrl}/api/levels/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete level');
            }

            this.loadLevels();
        } catch (error) {
            console.error('Error deleting level:', error);
            alert('Failed to delete level. Please try again.');
        }
    }
}

// Export for use in other modules
export default LevelsManager; 