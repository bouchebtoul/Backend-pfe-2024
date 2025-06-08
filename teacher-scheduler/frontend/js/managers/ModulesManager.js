import config from '../config.js';

class ModulesManager {
    constructor() {
        this.modulesTableBody = document.getElementById('modulesTableBody');
        this.moduleModal = document.getElementById('moduleModal');
        this.moduleForm = document.getElementById('moduleForm');
        this.addModuleBtn = document.getElementById('addModuleBtn');
        this.closeModalBtn = this.moduleModal.querySelector('.close-modal');
        this.modalTitle = document.getElementById('moduleModalTitle');
        
        // Selection elements
        this.departmentSelect = document.getElementById('departmentId');
        this.specialitySelect = document.getElementById('specialityId');
        this.levelSelect = document.getElementById('levelId');
        
        this.currentModuleId = null;
        this.isEditing = false;
        
        // Data storage for all entities
        this.departments = [];
        this.specialities = [];
        this.levels = [];
        
        // Filtered data for dropdowns
        this.filteredSpecialities = [];
        this.filteredLevels = [];
        
        // Store all modules and filtered modules
        this.allModules = [];
        this.filterValues = {};
        
        this.initializeEventListeners();
        this.initializeData();
    }

    initializeEventListeners() {
        this.addModuleBtn.addEventListener('click', () => this.showAddModal());
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        this.moduleForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Hierarchical selection listeners
        this.departmentSelect.addEventListener('change', () => this.handleDepartmentChange());
        this.specialitySelect.addEventListener('change', () => this.handleSpecialityChange());
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.moduleModal) {
                this.closeModal();
            }
        });

        // Add filter input listeners
        const filterInputs = document.querySelectorAll('.filter-input');
        filterInputs.forEach(input => {
            input.addEventListener('input', () => this.handleFilter(input));
        });
    }

    async initializeData() {
        try {
            // Load all data in parallel
            const [departmentsResponse, specialitiesResponse, levelsResponse] = await Promise.all([
                fetch(`${config.backendUrl}/api/departments`),
                fetch(`${config.backendUrl}/api/specialities`),
                fetch(`${config.backendUrl}/api/levels`)
            ]);

            // Store all data
            this.departments = await departmentsResponse.json();
            this.specialities = await specialitiesResponse.json();
            this.levels = await levelsResponse.json();

            // Update departments dropdown (others will be updated on selection)
            this.updateDepartmentsDropdown();

            // Now load modules after we have all the necessary data
            await this.loadModules();
        } catch (error) {
            console.error('Error initializing data:', error);
            alert('Failed to initialize data. Please refresh the page.');
        }
    }

    updateDepartmentsDropdown() {
        this.departmentSelect.innerHTML = `
            <option value="">Select a department</option>
            ${this.departments.map(dept => `
                <option value="${dept._id}">${dept.name}</option>
            `).join('')}
        `;
    }

    async loadSpecialities(departmentId) {
        // Filter without modifying the original array
        this.filteredSpecialities = this.specialities.filter(s => s.departmentid._id === departmentId);
        this.updateSpecialitiesDropdown();
    }

    async loadLevels(specialityId) {
        // Filter without modifying the original array
        this.filteredLevels = this.levels.filter(l => l.specialityid._id === specialityId);
        this.updateLevelsDropdown();
    }

    updateSpecialitiesDropdown() {
        this.specialitySelect.innerHTML = `
            <option value="">Select a speciality</option>
            ${this.filteredSpecialities.map(spec => `
                <option value="${spec._id}">${spec.name}</option>
            `).join('')}
        `;
        this.specialitySelect.disabled = false;
        this.levelSelect.disabled = true;
        this.levelSelect.innerHTML = '<option value="">Select a level</option>';
    }

    updateLevelsDropdown() {
        this.levelSelect.innerHTML = `
            <option value="">Select a level</option>
            ${this.filteredLevels.map(level => `
                <option value="${level._id}">${level.name}</option>
            `).join('')}
        `;
        this.levelSelect.disabled = false;
    }

    handleDepartmentChange() {
        const departmentId = this.departmentSelect.value;
        if (departmentId) {
            this.loadSpecialities(departmentId);
        } else {
            this.specialitySelect.disabled = true;
            this.levelSelect.disabled = true;
            this.specialitySelect.innerHTML = '<option value="">Select a speciality</option>';
            this.levelSelect.innerHTML = '<option value="">Select a level</option>';
        }
    }

    handleSpecialityChange() {
        const specialityId = this.specialitySelect.value;
        if (specialityId) {
            this.loadLevels(specialityId);
        } else {
            this.levelSelect.disabled = true;
            this.levelSelect.innerHTML = '<option value="">Select a level</option>';
        }
    }

    getLevelInfo(levelId) {
        const level = this.levels.find(l => l._id === levelId);
        if (!level) return { levelName: 'N/A', specialityName: 'N/A', departmentName: 'N/A' };

        const speciality = this.specialities.find(s => s._id === level.specialityid._id);
        if (!speciality) return { levelName: level.name, specialityName: 'N/A', departmentName: 'N/A' };

        const department = this.departments.find(d => d._id === speciality.departmentid._id);
        return {
            levelName: level.name,
            specialityName: speciality.name,
            departmentName: department ? department.name : 'N/A'
        };
    }

    handleFilter(input) {
        const column = input.dataset.column;
        const value = input.value.trim().toLowerCase();
        
        if (value === '') {
            delete this.filterValues[column];
        } else {
            this.filterValues[column] = value;
        }
        
        this.applyFilters();
    }

    applyFilters() {
        let filteredModules = this.allModules;

        for (const [column, value] of Object.entries(this.filterValues)) {
            filteredModules = filteredModules.filter(module => {
                switch (column) {
                    case 'code':
                        return module.code.toLowerCase().includes(value);
                    case 'name':
                        return module.name.toLowerCase().includes(value);
                    case 'level': {
                        const levelInfo = this.getLevelInfo(module.levelid._id);
                        const levelText = `${levelInfo.levelName} ${levelInfo.specialityName} ${levelInfo.departmentName}`.toLowerCase();
                        return levelText.includes(value);
                    }
                    case 'semester':
                        return module.semester.toString() === value;
                    case 'credits':
                        return module.credits.toString() === value;
                    case 'coefficient':
                        return module.coefficient.toString() === value;
                    case 'teachingUnit':
                        return module.teachingUnitCode.toLowerCase().includes(value);
                    case 'hours': {
                        const hoursText = `${module.lects}/${module.tuts}/${module.wkshs}`;
                        return hoursText.includes(value);
                    }
                    default:
                        return true;
                }
            });
        }

        this.updateModulesTable(filteredModules);
    }

    updateModulesTable(modules) {
        this.modulesTableBody.innerHTML = '';
        modules.forEach(module => this.addModuleToTable(module));
    }

    async loadModules() {
        try {
            const response = await fetch(`${config.backendUrl}/api/modules`);
            this.allModules = await response.json();
            this.updateModulesTable(this.allModules);
        } catch (error) {
            console.error('Error loading modules:', error);
            alert('Failed to load modules. Please try again.');
        }
    }

    addModuleToTable(module) {
        const row = document.createElement('tr');
        const levelInfo = this.getLevelInfo(module.levelid._id);
        
        row.innerHTML = `
            <td>${module.code}</td>
            <td>${module.name}</td>
            <td>${levelInfo.levelName} (${levelInfo.specialityName} - ${levelInfo.departmentName})</td>
            <td>${module.semester}</td>
            <td>${module.credits}</td>
            <td>${module.coefficient}</td>
            <td>${module.teachingUnitCode}</td>
            <td>${module.lects}/${module.tuts}/${module.wkshs}</td>
            <td>
                <button class="btn-edit" data-id="${module._id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" data-id="${module._id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

        // Add event listeners for edit and delete buttons
        const editBtn = row.querySelector('.btn-edit');
        const deleteBtn = row.querySelector('.btn-delete');
        
        editBtn.addEventListener('click', () => this.showEditModal(module));
        deleteBtn.addEventListener('click', () => this.deleteModule(module._id));

        this.modulesTableBody.appendChild(row);
    }

    showAddModal() {
        this.isEditing = false;
        this.currentModuleId = null;
        this.modalTitle.textContent = 'Add New Module';
        this.moduleForm.reset();
        
        // Reset and enable department selection
        this.departmentSelect.disabled = false;
        this.specialitySelect.disabled = true;
        this.levelSelect.disabled = true;
        
        // Reset all dropdowns to initial state
        this.departmentSelect.value = '';
        this.specialitySelect.innerHTML = '<option value="">Select a speciality</option>';
        this.levelSelect.innerHTML = '<option value="">Select a level</option>';
        
        this.moduleModal.classList.add('show');
    }

    async showEditModal(module) {
        this.isEditing = true;
        this.currentModuleId = module._id;
        this.modalTitle.textContent = 'Edit Module';
        
        // Load the full hierarchy for the module's level
        const level = await this.getLevel(module.levelid._id);
        const speciality = await this.getSpeciality(level.specialityid._id);
        
        // Set department and load its specialities
        this.departmentSelect.value = speciality.departmentid._id;
        await this.loadSpecialities(speciality.departmentid._id);
        
        // Set speciality and load its levels
        this.specialitySelect.value = speciality._id;
        await this.loadLevels(speciality._id);
        
        // Fill form with module data
        document.getElementById('code').value = module.code;
        document.getElementById('name').value = module.name;
        document.getElementById('levelId').value = module.levelid._id;
        document.getElementById('semester').value = module.semester;
        document.getElementById('credits').value = module.credits;
        document.getElementById('coefficient').value = module.coefficient;
        document.getElementById('teachingUnitCode').value = module.teachingUnitCode;
        document.getElementById('lects').value = module.lects;
        document.getElementById('tuts').value = module.tuts;
        document.getElementById('wkshs').value = module.wkshs;
        
        this.moduleModal.classList.add('show');
    }

    async getLevel(levelId) {
        const response = await fetch(`${config.backendUrl}/api/levels/${levelId}`);
        return await response.json();
    }

    async getSpeciality(specialityId) {
        const response = await fetch(`${config.backendUrl}/api/specialities/${specialityId}`);
        return await response.json();
    }

    closeModal() {
        this.moduleModal.classList.remove('show');
        this.moduleForm.reset();
        this.currentModuleId = null;
        this.isEditing = false;
        
        // Reset and disable cascading selects
        this.specialitySelect.disabled = true;
        this.levelSelect.disabled = true;
        this.specialitySelect.innerHTML = '<option value="">Select a speciality</option>';
        this.levelSelect.innerHTML = '<option value="">Select a level</option>';
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.moduleForm);
        const moduleData = {
            code: formData.get('code'),
            name: formData.get('name'),
            levelid: formData.get('levelId'),
            semester: parseInt(formData.get('semester')),
            credits: parseInt(formData.get('credits')),
            coefficient: parseFloat(formData.get('coefficient')),
            teachingUnitCode: formData.get('teachingUnitCode'),
            lects: parseInt(formData.get('lects')),
            tuts: parseInt(formData.get('tuts')),
            wkshs: parseInt(formData.get('wkshs'))
        };

        try {
            let response;
            if (this.isEditing) {
                response = await fetch(`${config.backendUrl}/api/modules/${this.currentModuleId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(moduleData)
                });
            } else {
                response = await fetch(`${config.backendUrl}/api/modules`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(moduleData)
                });
            }

            if (!response.ok) {
                throw new Error('Failed to save module');
            }

            this.closeModal();
            this.loadModules();
        } catch (error) {
            console.error('Error saving module:', error);
            alert('Failed to save module. Please try again.');
        }
    }

    async deleteModule(id) {
        if (!confirm('Are you sure you want to delete this module?')) {
            return;
        }

        try {
            const response = await fetch(`${config.backendUrl}/api/modules/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete module');
            }

            this.loadModules();
        } catch (error) {
            console.error('Error deleting module:', error);
            alert('Failed to delete module. Please try again.');
        }
    }
}

// Export for use in other modules
export default ModulesManager; 