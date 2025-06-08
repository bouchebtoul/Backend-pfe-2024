// Import managers
//import TeachersManager from './managers/TeachersManager.js';
import SpecialitiesManager from './managers/SpecialitiesManager.js';
import DepartmentsManager from './managers/DepartmentsManager.js';
import LevelsManager from './managers/LevelsManager.js';
import ModulesManager from './managers/ModulesManager.js';
import config from './config.js';
import TeachersManager from './managers/TeachersManager.js';
import RoomsManager from './managers/RoomsManager.js';
import RolesManager from './managers/RolesManager.js';

class Dashboard {
    constructor() {
        this.mainContent = document.querySelector('.main-content');
        this.contentBody = document.querySelector('.content-body');
        this.logoutBtn = document.getElementById('logoutBtn');
        this.currentUser = null;
        
        this.initializeEventListeners();
        this.checkAuthentication();
    }

    initializeEventListeners() {
        // Handle main menu items
        document.querySelectorAll('.sidebar-menu > li > a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = e.currentTarget.getAttribute('href');
                
                // Special handling for submenus
                if (href === '#academic' || href === '#resources') {
                    // Toggle submenu visibility
                    const submenu = e.currentTarget.parentElement.querySelector('.submenu');
                    if (submenu) {
                        submenu.classList.toggle('show');
                        e.currentTarget.classList.toggle('active');
                    }
                } else {
                    // Load other sections directly
                    const section = href.substring(1);
                    this.loadSection(section);
                }
            });
        });

        // Handle submenu items separately
        document.querySelectorAll('.submenu a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation(); // Prevent triggering parent menu click
                const section = e.currentTarget.getAttribute('href').substring(1);
                this.loadSection(section);
            });
        });

        // Logout handler
        this.logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleLogout();
        });
    }

    async checkAuthentication() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = 'index.html';
                return;
            }

            const response = await fetch(`${config.backendUrl}/api/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Authentication failed');
            }

            this.currentUser = await response.json();
            this.setupUserInterface();
        } catch (error) {
            console.error('Authentication error:', error);
            localStorage.removeItem('token');
            window.location.href = 'index.html';
        }
    }

    setupUserInterface() {
        // Add admin class if user is admin
        if (this.currentUser.role === 'admin') {
            document.body.classList.add('is-admin');
        }

        // Show default section (dashboard stats)
        this.loadSection('dashboard');

        // Update UI based on user permissions
        this.updateUIBasedOnPermissions();
    }

    updateUIBasedOnPermissions() {
        const permissions = this.currentUser.permissions || [];
        
        // Hide/show menu items based on permissions
        const menuItems = {
            'teachers': 'manage_teachers',
            'departments': 'manage_departments',
            'specialities': 'manage_departments', // Part of departments management
            'levels': 'manage_departments',       // Part of departments management
            'modules': 'manage_modules',
            'rooms': 'manage_schedules',         // Part of schedule management
            'roles': 'manage_roles',
            'semester': 'manage_semesters',
            'academic-year': 'manage_semesters'  // Part of semester management
        };

        Object.entries(menuItems).forEach(([section, permission]) => {
            const menuItem = document.querySelector(`a[href="#${section}"]`);
            if (menuItem) {
                const hasPermission = permissions.includes(permission);
                menuItem.parentElement.style.display = hasPermission ? 'block' : 'none';
                
                // Also check parent menu visibility
                const parentMenu = menuItem.closest('li').parentElement.closest('li');
                if (parentMenu) {
                    const siblingLinks = parentMenu.querySelectorAll('.submenu li');
                    const allSiblingsHidden = Array.from(siblingLinks).every(li => li.style.display === 'none');
                    parentMenu.style.display = allSiblingsHidden ? 'none' : 'block';
                }
            }
        });
    }

    async loadSection(section) {
        try {
            // Remove active class from all links
            document.querySelectorAll('.sidebar-menu a').forEach(link => {
                link.classList.remove('active');
            });

            // Add active class to current section link
            const activeLink = document.querySelector(`.sidebar-menu a[href="#${section}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }

            // Load section content
            switch (section) {
                case 'dashboard':
                    await this.loadDashboardStats();
                    break;
                case 'teachers':
                    await this.loadTeachersSection();
                    break;
                case 'departments':
                    await this.loadDepartmentsSection();
                    break;
                case 'specialities':
                    await this.loadSpecialitiesSection();
                    break;
                case 'levels':
                    await this.loadLevelsSection();
                    break;
                case 'modules':
                    await this.loadModulesSection();
                    break;
                case 'rooms':
                    await this.loadRoomsSection();
                    break;
                case 'roles':
                    if (this.currentUser.role === 'ADMIN') {
                        await this.loadRolesSection();
                    } else {
                        this.showAccessDenied();
                    }
                    break;
                default:
                    this.showNotImplemented();
            }
        } catch (error) {
            console.error('Error loading section:', error);
            this.showError();
        }
    }

    async loadSectionContent(viewPath) {
        const response = await fetch(viewPath);
        const html = await response.text();
        this.contentBody.innerHTML = html;
    }

    async loadDashboardStats() {
        // Reset content to show dashboard stats
        this.contentBody.innerHTML = `
            <div class="dashboard-stats">
                <div class="stat-card">
                    <i class="fas fa-chalkboard-teacher"></i>
                    <h3>Total Teachers</h3>
                    <p id="teacherCount">Loading...</p>
                </div>
                <div class="stat-card">
                    <i class="fas fa-book"></i>
                    <h3>Total Modules</h3>
                    <p id="moduleCount">Loading...</p>
                </div>
                <div class="stat-card">
                    <i class="fas fa-door-open"></i>
                    <h3>Total Rooms</h3>
                    <p id="roomCount">Loading...</p>
                </div>
                <div class="stat-card">
                    <i class="fas fa-calendar-alt"></i>
                    <h3>Active Semester</h3>
                    <p id="currentSemester">Loading...</p>
                </div>
            </div>
        `;

        // Load actual stats
        await this.updateDashboardStats();
    }

    async updateDashboardStats() {
        try {
            const [teachers, modules, rooms] = await Promise.all([
                fetch(`${config.backendUrl}/api/teachers`),
                fetch(`${config.backendUrl}/api/modules`),
                fetch(`${config.backendUrl}/api/rooms`)
            ]);

            const [teachersData, modulesData, roomsData] = await Promise.all([
                teachers.json(),
                modules.json(),
                rooms.json()
            ]);

            document.getElementById('teacherCount').textContent = teachersData.length;
            document.getElementById('moduleCount').textContent = modulesData.length;
            document.getElementById('roomCount').textContent = roomsData.length;
            document.getElementById('currentSemester').textContent = '2024/2025 - S2';
        } catch (error) {
            console.error('Error updating dashboard stats:', error);
        }
    }

    async loadTeachersSection() {
        await this.loadSectionContent('views/teachers.html');
        new TeachersManager();
    }

    async loadDepartmentsSection() {
        await this.loadSectionContent('views/departments.html');
        new DepartmentsManager();
    }

    async loadSpecialitiesSection() {
        await this.loadSectionContent('views/specialities.html');
        new SpecialitiesManager();
    }

    async loadLevelsSection() {
        await this.loadSectionContent('views/levels.html');
        new LevelsManager();
    }

    async loadModulesSection() {
        await this.loadSectionContent('views/modules.html');
        new ModulesManager();
    }

    async loadRoomsSection() {
        await this.loadSectionContent('views/rooms.html');
        new RoomsManager();
    }

    async loadRolesSection() {
        await this.loadSectionContent('views/roles.html');
        new RolesManager();
    }

    showAccessDenied() {
        this.contentBody.innerHTML = `
            <div class="error-message">
                <i class="fas fa-lock"></i>
                <h2>Access Denied</h2>
                <p>You don't have permission to access this section.</p>
            </div>
        `;
    }

    showNotImplemented() {
        this.contentBody.innerHTML = `
            <div class="error-message">
                <i class="fas fa-tools"></i>
                <h2>Under Construction</h2>
                <p>This section is not implemented yet.</p>
            </div>
        `;
    }

    showError() {
        this.contentBody.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h2>Error</h2>
                <p>An error occurred while loading the content. Please try again.</p>
            </div>
        `;
    }

    async handleLogout() {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    new Dashboard();
}); 