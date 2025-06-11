import config from '../config.js';

export default class AffectationsManager {
    constructor() {
        this.modal = document.getElementById('affectationModal');
        this.form = document.getElementById('affectationForm');
        this.addButton = document.getElementById('addAffectationBtn');
        this.closeButton = this.modal.querySelector('.close-btn');
        this.cancelButton = document.getElementById('cancelBtn');
        this.affectationsList = document.getElementById('affectationsList');
        this.template = document.getElementById('affectationTemplate');
        
        this.filterYear = document.getElementById('filterAcademicYear');
        this.filterSemester = document.getElementById('filterSemester');

        this.currentAffectation = null;
        this.initializeEventListeners();
        this.loadData();
    }

    initializeEventListeners() {
        this.addButton.addEventListener('click', () => this.showModal());
        this.closeButton.addEventListener('click', () => this.hideModal());
        this.cancelButton.addEventListener('click', () => this.hideModal());
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        this.filterYear.addEventListener('change', () => this.loadAffectations());
        this.filterSemester.addEventListener('change', () => this.loadAffectations());
    }

    async loadData() {
        await Promise.all([
            this.loadTeachers(),
            this.loadModules()
        ]);
        await this.loadAffectations();
    }

    async loadTeachers() {
        try {
            const response = await fetch(`${config.backendUrl}/api/teachers`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const teachers = await response.json();
            
            const teacherSelect = document.getElementById('teacher');
            teacherSelect.innerHTML = '<option value="">Select Teacher</option>';
            teachers.forEach(teacher => {
                const option = document.createElement('option');
                option.value = teacher._id;
                option.textContent = teacher.fullname;
                teacherSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading teachers:', error);
        }
    }

    async loadModules() {
        try {
            const response = await fetch(`${config.backendUrl}/api/modules`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const modules = await response.json();
            
            const moduleSelect = document.getElementById('module');
            moduleSelect.innerHTML = '<option value="">Select Module</option>';
            modules.forEach(module => {
                const option = document.createElement('option');
                option.value = module._id;
                option.textContent = module.name;
                moduleSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading modules:', error);
        }
    }

    async loadAffectations() {
        try {
            const year = this.filterYear.value;
            const semester = this.filterSemester.value;
            
            const response = await fetch(`${config.backendUrl}/api/affectations`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            const affectations = await response.json();
            this.renderAffectations(affectations.filter(a => 
                (!year || a.affectations.some(aff => aff.academicYear === year)) &&
                (!semester || a.affectations.some(aff => aff.semester === parseInt(semester)))
            ));
        } catch (error) {
            console.error('Error loading affectations:', error);
        }
    }

    renderAffectations(affectations) {
        this.affectationsList.innerHTML = '';
        
        affectations.forEach(teacherAff => {
            const clone = this.template.content.cloneNode(true);
            
            // Set teacher name and totals
            clone.querySelector('.teacher-name').textContent = teacherAff.teacherName;
            clone.querySelector('.total-lectures span').textContent = teacherAff.totalLectures;
            clone.querySelector('.total-tutorials span').textContent = teacherAff.totalTutorials;
            clone.querySelector('.total-workshops span').textContent = teacherAff.totalWorkshops;

            // Add module affectations
            const tbody = clone.querySelector('tbody');
            teacherAff.affectations.forEach(aff => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${aff.module.name}</td>
                    <td>${aff.academicYear}</td>
                    <td>S${aff.semester}</td>
                    <td>${aff.lectures}</td>
                    <td>${aff.tutorials}</td>
                    <td>${aff.workshops}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-edit" data-id="${aff._id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-delete" data-id="${aff._id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                `;

                // Add event listeners for edit and delete
                row.querySelector('.btn-edit').addEventListener('click', () => this.editAffectation(aff));
                row.querySelector('.btn-delete').addEventListener('click', () => this.deleteAffectation(aff._id));
                
                tbody.appendChild(row);
            });

            // Add accordion functionality
            const accordionItem = clone.querySelector('.accordion-item');
            const toggleBtn = clone.querySelector('.toggle-btn');
            toggleBtn.addEventListener('click', () => {
                accordionItem.classList.toggle('active');
            });

            this.affectationsList.appendChild(clone);
        });
    }

    showModal(affectation = null) {
        this.currentAffectation = affectation;
        document.getElementById('modalTitle').textContent = affectation ? 'Edit Affectation' : 'Add New Affectation';
        
        if (affectation) {
            this.form.teacher.value = affectation.teacher._id;
            this.form.module.value = affectation.module._id;
            this.form.academicYear.value = affectation.academicYear;
            this.form.semester.value = affectation.semester;
            this.form.lectures.value = affectation.lectures;
            this.form.tutorials.value = affectation.tutorials;
            this.form.workshops.value = affectation.workshops;
        } else {
            this.form.reset();
        }
        
        this.modal.classList.add('show');
    }

    hideModal() {
        this.modal.classList.remove('show');
        this.form.reset();
        this.currentAffectation = null;
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.form);
        const data = {
            teacher: formData.get('teacher'),
            module: formData.get('module'),
            academicYear: formData.get('academicYear'),
            semester: parseInt(formData.get('semester')),
            lectures: parseInt(formData.get('lectures')),
            tutorials: parseInt(formData.get('tutorials')),
            workshops: parseInt(formData.get('workshops'))
        };

        try {
            const url = `${config.backendUrl}/api/affectations${this.currentAffectation ? `/${this.currentAffectation._id}` : ''}`;
            const method = this.currentAffectation ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }

            this.hideModal();
            await this.loadAffectations();
        } catch (error) {
            console.error('Error saving affectation:', error);
            alert(error.message);
        }
    }

    async editAffectation(affectation) {
        try {
            const response = await fetch(`${config.backendUrl}/api/affectations/${affectation._id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const fullAffectation = await response.json();
            this.showModal(fullAffectation);
        } catch (error) {
            console.error('Error loading affectation details:', error);
        }
    }

    async deleteAffectation(id) {
        if (!confirm('Are you sure you want to delete this affectation?')) {
            return;
        }

        try {
            const response = await fetch(`${config.backendUrl}/api/affectations/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete affectation');
            }

            await this.loadAffectations();
        } catch (error) {
            console.error('Error deleting affectation:', error);
            alert('Failed to delete affectation');
        }
    }
} 