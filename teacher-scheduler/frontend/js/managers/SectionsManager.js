import config from '../config.js';

class SectionsManager {
    constructor() {
        this.sections = [];
        this.groups = [];
        this.levels = [];
        this.currentSection = null;
        this.currentGroup = null;
        this.sectionModal = null;
        this.groupModal = null;
        this.initialize();
    }

    async initialize() {
        await this.loadLevels();
        await Promise.all([
            this.loadSections(),
            this.loadGroups()
        ]);
        this.sectionModal = document.getElementById('sectionModal');
        this.groupModal = document.getElementById('groupModal');
        this.setupEventListeners();
    }

    async loadLevels() {
        try {
            const response = await fetch('http://localhost:5000/api/levels', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            this.levels = await response.json();
            this.updateLevelDropdowns();
        } catch (error) {
            console.error('Error loading levels:', error);
        }
    }

    updateLevelDropdowns() {
        const levelSelects = document.querySelectorAll('#levelId');
        levelSelects.forEach(select => {
            select.innerHTML = '<option value="">Select Level</option>' +
                this.levels.map(level => 
                    `<option value="${level._id}">${level.name}</option>`
                ).join('');
        });
    }

    async loadSections() {
        try {
            const response = await fetch('http://localhost:5000/api/sections', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            this.sections = await response.json();
            this.renderSectionsAccordion();
        } catch (error) {
            console.error('Error loading sections:', error);
        }
    }

    async loadGroups() {
        try {
            const response = await fetch('http://localhost:5000/api/groups', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            this.groups = await response.json();
            this.renderSectionsAccordion();
        } catch (error) {
            console.error('Error loading groups:', error);
        }
    }

    renderSectionsAccordion() {
        const accordion = document.getElementById('sectionsAccordion');
        accordion.innerHTML = this.sections.map(section => {
            const sectionGroups = this.groups.filter(group => group.sectionid && group.sectionid._id === section._id);
            return `
                <div class="accordion-item" data-section-id="${section._id}">
                    <div class="accordion-header">
                        <div class="section-info">
                            <span class="section-number">Section ${section.number}</span>
                            <span class="section-level">${section.levelid ? section.levelid.name : 'N/A'}</span>
                        </div>
                        <div class="section-actions">
                            <button class="btn-add-group" data-section-id="${section._id}">
                                <i class="fas fa-plus"></i> Add Group
                            </button>
                            <button class="btn-edit-section" data-id="${section._id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-delete-section" data-id="${section._id}">
                                <i class="fas fa-trash"></i>
                            </button>
                            <button class="accordion-toggle">
                                <i class="fas fa-chevron-down"></i>
                            </button>
                        </div>
                    </div>
                    <div class="accordion-content">
                        <div class="groups-table-container">
                            <table class="groups-table">
                                <thead>
                                    <tr>
                                        <th>Group Name</th>
                                        <th>Capacity</th>
                                        <th>Description</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${sectionGroups.map(group => `
                                        <tr>
                                            <td>${group.name}</td>
                                            <td>${group.capacity}</td>
                                            <td>${group.description || 'N/A'}</td>
                                            <td>
                                                <button class="btn-edit-group" data-id="${group._id}">
                                                    <i class="fas fa-edit"></i>
                                                </button>
                                                <button class="btn-delete-group" data-id="${group._id}">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Add click handlers for accordion toggles
        document.querySelectorAll('.accordion-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                const item = e.target.closest('.accordion-item');
                item.classList.toggle('expanded');
                const icon = toggle.querySelector('i');
                icon.classList.toggle('fa-chevron-down');
                icon.classList.toggle('fa-chevron-up');
            });
        });
    }

    setupEventListeners() {
        // Section buttons
        document.getElementById('addSectionBtn').addEventListener('click', () => {
            this.currentSection = null;
            document.getElementById('sectionForm').reset();
            document.querySelector('#sectionModal .modal-title').textContent = 'Add New Section';
            this.showModal(this.sectionModal);
        });

        document.getElementById('closeSectionModal').addEventListener('click', () => {
            this.hideModal(this.sectionModal);
        });

        // Group buttons
        document.getElementById('closeGroupModal').addEventListener('click', () => {
            this.hideModal(this.groupModal);
        });

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.sectionModal) {
                this.hideModal(this.sectionModal);
            }
            if (e.target === this.groupModal) {
                this.hideModal(this.groupModal);
            }
        });

        // Form submissions
        document.getElementById('sectionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSection();
        });

        document.getElementById('groupForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveGroup();
        });

        // Accordion event delegation
        document.getElementById('sectionsAccordion').addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (!button) return;

            if (button.classList.contains('btn-add-group')) {
                const sectionId = button.dataset.sectionId;
                this.addGroup(sectionId);
            } else if (button.classList.contains('btn-edit-section')) {
                const sectionId = button.dataset.id;
                this.editSection(sectionId);
            } else if (button.classList.contains('btn-delete-section')) {
                const sectionId = button.dataset.id;
                this.deleteSection(sectionId);
            } else if (button.classList.contains('btn-edit-group')) {
                const groupId = button.dataset.id;
                this.editGroup(groupId);
            } else if (button.classList.contains('btn-delete-group')) {
                const groupId = button.dataset.id;
                this.deleteGroup(groupId);
            }
        });
    }

    showModal(modal) {
        if (modal) {
            modal.classList.add('show');
        }
    }

    hideModal(modal) {
        if (modal) {
            modal.classList.remove('show');
        }
    }

    async saveSection() {
        const formData = {
            number: parseInt(document.getElementById('number').value),
            levelid: document.getElementById('levelId').value,
            capacity: parseInt(document.getElementById('sectionCapacity').value)
        };

        try {
            const url = 'http://localhost:5000/api/sections' + (this.currentSection ? `/${this.currentSection._id}` : '');
            const response = await fetch(url, {
                method: this.currentSection ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                await this.loadSections();
                this.hideModal(this.sectionModal);
            } else {
                const error = await response.json();
                alert(error.message || 'Error saving section');
            }
        } catch (error) {
            console.error('Error saving section:', error);
            alert('Error saving section');
        }
    }

    addGroup(sectionId) {
        this.currentGroup = null;
        document.getElementById('groupForm').reset();
        document.getElementById('groupSectionId').value = sectionId;
        document.querySelector('#groupModal .modal-title').textContent = 'Add New Group';
        this.showModal(this.groupModal);
    }

    async saveGroup() {
        const formData = {
            name: document.getElementById('name').value,
            sectionid: document.getElementById('groupSectionId').value,
            capacity: parseInt(document.getElementById('groupCapacity').value),
            description: document.getElementById('description').value
        };

        try {
            const url = 'http://localhost:5000/api/groups' + (this.currentGroup ? `/${this.currentGroup._id}` : '');
            const response = await fetch(url, {
                method: this.currentGroup ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                await this.loadGroups();
                this.hideModal(this.groupModal);
            } else {
                const error = await response.json();
                alert(error.message || 'Error saving group');
            }
        } catch (error) {
            console.error('Error saving group:', error);
            alert('Error saving group');
        }
    }

    async editSection(sectionId) {
        this.currentSection = this.sections.find(s => s._id === sectionId);
        if (!this.currentSection) return;

        document.getElementById('number').value = this.currentSection.number;
        document.getElementById('levelId').value = this.currentSection.levelid._id;
        document.getElementById('sectionCapacity').value = this.currentSection.capacity;

        document.querySelector('#sectionModal .modal-title').textContent = 'Edit Section';
        this.showModal(this.sectionModal);
    }

    async editGroup(groupId) {
        this.currentGroup = this.groups.find(g => g._id === groupId);
        if (!this.currentGroup) return;

        document.getElementById('name').value = this.currentGroup.name;
        document.getElementById('groupSectionId').value = this.currentGroup.sectionid._id;
        document.getElementById('groupCapacity').value = this.currentGroup.capacity;
        document.getElementById('description').value = this.currentGroup.description || '';

        document.querySelector('#groupModal .modal-title').textContent = 'Edit Group';
        this.showModal(this.groupModal);
    }

    async deleteSection(sectionId) {
        if (!confirm('Are you sure you want to delete this section? This will also delete all associated groups.')) return;

        try {
            const response = await fetch(`http://localhost:5000/api/sections/${sectionId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                await Promise.all([
                    this.loadSections(),
                    this.loadGroups()
                ]);
            } else {
                const error = await response.json();
                alert(error.message || 'Error deleting section');
            }
        } catch (error) {
            console.error('Error deleting section:', error);
            alert('Error deleting section');
        }
    }

    async deleteGroup(groupId) {
        if (!confirm('Are you sure you want to delete this group?')) return;

        try {
            const response = await fetch(`http://localhost:5000/api/groups/${groupId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                await this.loadGroups();
            } else {
                const error = await response.json();
                alert(error.message || 'Error deleting group');
            }
        } catch (error) {
            console.error('Error deleting group:', error);
            alert('Error deleting group');
        }
    }
}

export default SectionsManager; 