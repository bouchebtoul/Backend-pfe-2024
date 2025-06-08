class TeachersManager {
    constructor() {
        this.teachers = [];
        this.departments = [];
        this.grades = [];
        this.currentTeacher = null;
        this.modal = null;
    }

    async initialize() {
        await Promise.all([
            this.loadDepartments(),
            this.loadGrades()
        ]);
        await this.loadTeachers();
        this.modal = document.getElementById('teacherModal');
        this.setupEventListeners();
    }

    async loadDepartments() {
        try {
            const response = await fetch('http://localhost:5000/api/departments', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            this.departments = await response.json();
            this.updateDepartmentDropdowns();
        } catch (error) {
            console.error('Error loading departments:', error);
        }
    }

    async loadGrades() {
        try {
            const response = await fetch('http://localhost:5000/api/grades', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            this.grades = await response.json();
            this.updateGradeDropdowns();
        } catch (error) {
            console.error('Error loading grades:', error);
        }
    }

    async loadTeachers() {
        try {
            const response = await fetch('http://localhost:5000/api/teachers', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            this.teachers = await response.json();
            this.renderTeachersTable();
        } catch (error) {
            console.error('Error loading teachers:', error);
        }
    }

    updateDepartmentDropdowns() {
        const departmentSelects = document.querySelectorAll('.department-select');
        departmentSelects.forEach(select => {
            select.innerHTML = `
                <option value="">Select Department</option>
                ${this.departments.map(dept => `
                    <option value="${dept._id}">${dept.name}</option>
                `).join('')}
            `;
        });
    }

    updateGradeDropdowns() {
        const gradeSelects = document.querySelectorAll('.grade-select');
        gradeSelects.forEach(select => {
            select.innerHTML = `
                <option value="">Select Grade</option>
                ${this.grades.map(grade => `
                    <option value="${grade._id}">${grade.code}</option>
                `).join('')}
            `;
        });
    }

    renderTeachersTable() {
        const tableBody = document.getElementById('teachersTableBody');
        tableBody.innerHTML = this.teachers.map(teacher => `
            <tr>
                <td>${teacher.firstName}</td>
                <td>${teacher.lastName}</td>
                <td>${this.getGradeName(teacher.gradeid)}</td>
                <td>${this.getDepartmentName(teacher.departmentid)}</td>
                <td>
                    <button class="btn-edit" data-id="${teacher._id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" data-id="${teacher._id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    getGradeName(gradeId) {
        const grade = this.grades.find(g => g._id === gradeId);
        return grade ? grade.code : 'N/A';
    }

    getDepartmentName(departmentId) {
        const department = this.departments.find(d => d._id === departmentId);
        return department ? department.name : 'N/A';
    }

    setupEventListeners() {
        // Add teacher button
        document.getElementById('addTeacherBtn').addEventListener('click', () => {
            this.currentTeacher = null;
            document.getElementById('teacherForm').reset();
            document.getElementById('teacherModalTitle').textContent = 'Add New Teacher';
            this.showModal();
        });

        // Close modal button
        document.querySelector('.close-modal').addEventListener('click', () => {
            this.hideModal();
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hideModal();
            }
        });

        // Form submission
        document.getElementById('teacherForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTeacher();
        });

        // Edit and Delete buttons
        document.getElementById('teachersTableBody').addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (!button) return;

            const teacherId = button.dataset.id;
            if (button.classList.contains('btn-edit')) {
                this.editTeacher(teacherId);
            } else if (button.classList.contains('btn-delete')) {
                this.deleteTeacher(teacherId);
            }
        });
    }

    showModal() {
        if (this.modal) {
            this.modal.classList.add('show');
        }
    }

    hideModal() {
        if (this.modal) {
            this.modal.classList.remove('show');
        }
    }

    async saveTeacher() {
        const formData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            gradeid: document.getElementById('gradeid').value,
            departmentid: document.getElementById('departmentid').value
        };

        try {
            const url = 'http://localhost:5000/api/teachers' + (this.currentTeacher ? `/${this.currentTeacher._id}` : '');
            const response = await fetch(url, {
                method: this.currentTeacher ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                await this.loadTeachers();
                this.hideModal();
            } else {
                const error = await response.json();
                alert(error.message || 'Error saving teacher');
            }
        } catch (error) {
            console.error('Error saving teacher:', error);
            alert('Error saving teacher');
        }
    }

    async editTeacher(teacherId) {
        this.currentTeacher = this.teachers.find(t => t._id === teacherId);
        if (!this.currentTeacher) return;

        document.getElementById('firstName').value = this.currentTeacher.firstName;
        document.getElementById('lastName').value = this.currentTeacher.lastName;
        document.getElementById('gradeid').value = this.currentTeacher.gradeid;
        document.getElementById('departmentid').value = this.currentTeacher.departmentid;

        document.getElementById('teacherModalTitle').textContent = 'Edit Teacher';
        this.showModal();
    }

    async deleteTeacher(teacherId) {
        if (!confirm('Are you sure you want to delete this teacher?')) return;

        try {
            const response = await fetch(`http://localhost:5000/api/teachers/${teacherId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                await this.loadTeachers();
            } else {
                const error = await response.json();
                alert(error.message || 'Error deleting teacher');
            }
        } catch (error) {
            console.error('Error deleting teacher:', error);
            alert('Error deleting teacher');
        }
    }
}

// Initialize when the section is loaded
window.teachersManager = new TeachersManager(); 