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
import UsersManager from './managers/UsersManager.js';
import AffectationsManager from './managers/AffectationsManager.js';

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
        // Handle Dashboard Menu click
        const dashboardMenu = document.querySelector('.sidebar-header');
        if (dashboardMenu) {
            dashboardMenu.style.cursor = 'pointer';
            dashboardMenu.addEventListener('click', () => this.loadSection('dashboard'));
        }

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
        // Update profile button with user's name
        const profileLink = document.getElementById('profileLink');
        if (profileLink && this.currentUser) {
            profileLink.innerHTML = `<i class="fas fa-user"></i> ${this.currentUser.fullname}`;
            profileLink.href = 'profile.html';
        }

        // Add admin class if user is admin
        if (this.currentUser.role === 'ADMIN') {
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
            'users': 'manage_roles',             // Users management requires role management permission
            'semester': 'manage_semesters',
            'academic-year': 'manage_academic_year'  // Part of semester management
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
                case 'affectation':
                    await this.loadAffectationsSection();
                    break;
                case 'roles':
                    if (this.currentUser.role === 'ADMIN') {
                        await this.loadRolesSection();
                    } else {
                        this.showAccessDenied();
                    }
                    break;
                case 'users':
                    if (this.currentUser.role === 'ADMIN') {
                        await this.loadUsersSection();
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
        try {
            // First, ensure we have the stats container
            const contentBody = document.querySelector('.content-body');
            if (!contentBody) return;

            // Create or update the stats container
            contentBody.innerHTML = `
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

            const token = localStorage.getItem('token');
            
            // Fetch all required stats in parallel
            const [teachersRes, modulesRes, roomsRes, semesterRes] = await Promise.all([
                fetch(`${config.backendUrl}/api/teachers`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${config.backendUrl}/api/modules`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${config.backendUrl}/api/rooms`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${config.backendUrl}/api/semesters/current`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            // Check if any request failed
            if (!teachersRes.ok || !modulesRes.ok || !roomsRes.ok || !semesterRes.ok) {
                throw new Error('Failed to fetch dashboard stats');
            }

            // Parse all responses
            const [teachers, modules, rooms, semester] = await Promise.all([
                teachersRes.json(),
                modulesRes.json(),
                roomsRes.json(),
                semesterRes.json()
            ]);

            // Update the UI with actual numbers
            document.getElementById('teacherCount').textContent = Array.isArray(teachers) ? teachers.length : 0;
            document.getElementById('moduleCount').textContent = Array.isArray(modules) ? modules.length : 0;
            document.getElementById('roomCount').textContent = Array.isArray(rooms) ? rooms.length : 0;
            document.getElementById('currentSemester').textContent = semester ? semester.name : '-';

        } catch (error) {
            console.error('Dashboard stats load error:', error);
            // Show error state in UI if elements exist
            const elements = ['teacherCount', 'moduleCount', 'roomCount', 'currentSemester'];
            elements.forEach(id => {
                const element = document.getElementById(id);
                if (element) element.textContent = '-';
            });
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

    async loadUsersSection() {
        await this.loadSectionContent('views/users.html');
        new UsersManager();
    }

    async loadAffectationsSection() {
        await this.loadSectionContent('views/affectations.html');
        new AffectationsManager();
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
        localStorage.removeItem('userName');
        window.location.href = 'index.html';
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    new Dashboard();
}); 