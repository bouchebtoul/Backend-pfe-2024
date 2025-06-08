// Import managers
//import TeachersManager from './managers/TeachersManager.js';
import SpecialitiesManager from './managers/SpecialitiesManager.js';
import DepartmentsManager from './managers/DepartmentsManager.js';
import LevelsManager from './managers/LevelsManager.js';
import ModulesManager from './managers/ModulesManager.js';
import config from './config.js';

document.addEventListener('DOMContentLoaded', () => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    // Initialize UI elements
    const logoutBtn = document.getElementById('logoutBtn');
    const profileLink = document.getElementById('profileLink');
    const mainContent = document.querySelector('.main-content .content-body');

    // Handle logout
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    });

    // Handle sidebar navigation
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            console.log('Sidebar link clicked:', e.currentTarget.getAttribute('href'));
            
            const section = e.currentTarget.getAttribute('href').substring(1);
            
            // Don't process parent menu items with submenus
            if (e.currentTarget.parentElement.querySelector('.submenu')) {
                // Toggle submenu visibility
                const submenu = e.currentTarget.parentElement.querySelector('.submenu');
                submenu.style.display = submenu.style.display === 'block' ? 'none' : 'block';
                return;
            }
            
            // Remove active class from all links
            document.querySelectorAll('.sidebar-menu a').forEach(l => l.classList.remove('active'));
            // Add active class to clicked link
            e.currentTarget.classList.add('active');

            try {
                // Handle different sections
                switch(section) {
                    case 'teachers':
                        console.log('Loading teachers section...');
                        await loadTeachersSection();
                        break;
                    case 'rooms':
                        console.log('Loading rooms section...');
                        await loadRoomsSection();
                        break;
                    case 'specialities':
                        console.log('Loading specialities section...');
                        await loadSpecialitiesSection();
                        break;
                    case 'departments':
                        console.log('Loading departments section...');
                        await loadDepartmentsSection();
                        break;
                    case 'levels':
                        console.log('Loading levels section...');
                        await loadLevelsSection();
                        break;
                    case 'modules':
                        console.log('Loading modules section...');
                        await loadModulesSection();
                        break;
                    // Add other section handlers here
                    default:
                        mainContent.innerHTML = `<h2>${section.charAt(0).toUpperCase() + section.slice(1)}</h2>`;
                }
            } catch (error) {
                console.error('Error loading section:', error);
            }
        });
    });

    // Fetch dashboard statistics
    fetchDashboardStats();
});

async function loadTeachersSection() {
    console.log('Loading teachers section...');
    const mainContent = document.querySelector('.main-content .content-body');
    
    if (!mainContent) {
        console.error('Main content element not found');
        return;
    }

    try {
        // Fetch the teachers section HTML template
        const response = await fetch('views/teachers.html');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const htmlContent = await response.text();
        
        // Load the HTML content
        mainContent.innerHTML = htmlContent;
        console.log('Teachers section HTML loaded');

        // Load and initialize the teachers manager
        if (!window.teachersManager) {
            console.log('Creating new teachers manager...');
            const script = document.createElement('script');
            script.src = 'js/teachers.js';
            document.body.appendChild(script);
            
            script.onload = () => {
                console.log('Teachers.js loaded successfully');
                if (window.teachersManager) {
                    window.teachersManager.initialize();
                } else {
                    console.error('TeachersManager not found after script load');
                }
            };

            script.onerror = (error) => {
                console.error('Error loading teachers.js:', error);
            };
        } else {
            console.log('Using existing teachers manager');
            window.teachersManager.initialize();
        }
    } catch (error) {
        console.error('Error loading teachers section:', error);
        mainContent.innerHTML = `<div class="error-message">Error loading teachers section: ${error.message}</div>`;
    }
}

async function loadRoomsSection() {
    console.log('Loading rooms section...');
    const mainContent = document.querySelector('.main-content .content-body');
    
    if (!mainContent) {
        console.error('Main content element not found');
        return;
    }

    try {
        // Fetch the rooms section HTML template
        const response = await fetch('views/rooms.html');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const htmlContent = await response.text();
        
        // Load the HTML content
        mainContent.innerHTML = htmlContent;
        console.log('Rooms section HTML loaded');

        // Load and initialize the rooms manager
        if (!window.roomsManager) {
            console.log('Creating new rooms manager...');
            const script = document.createElement('script');
            script.src = 'js/rooms.js';
            document.body.appendChild(script);
            
            script.onload = () => {
                console.log('Rooms.js loaded successfully');
                if (window.roomsManager) {
                    window.roomsManager.initialize();
                } else {
                    console.error('RoomsManager not found after script load');
                }
            };

            script.onerror = (error) => {
                console.error('Error loading rooms.js:', error);
            };
        } else {
            console.log('Using existing rooms manager');
            window.roomsManager.initialize();
        }
    } catch (error) {
        console.error('Error loading rooms section:', error);
        mainContent.innerHTML = `<div class="error-message">Error loading rooms section: ${error.message}</div>`;
    }
}

async function loadSpecialitiesSection() {
    console.log('Loading specialities section...');
    const mainContent = document.querySelector('.main-content .content-body');
    
    if (!mainContent) {
        console.error('Main content element not found');
        return;
    }

    try {
        // Fetch the specialities section HTML template
        const response = await fetch('views/specialities.html');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const htmlContent = await response.text();
        
        // Load the HTML content
        mainContent.innerHTML = htmlContent;
        console.log('Specialities section HTML loaded');

        // Load CSS
        if (!document.querySelector('link[href="css/specialities.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'css/specialities.css';
            document.head.appendChild(link);
        }
        
        // Initialize manager
        window.specialitiesManager = new SpecialitiesManager();
    } catch (error) {
        console.error('Error loading specialities section:', error);
        mainContent.innerHTML = `<div class="error-message">Error loading specialities section: ${error.message}</div>`;
    }
}

async function loadDepartmentsSection() {
    console.log('Loading departments section...');
    const mainContent = document.querySelector('.main-content .content-body');
    
    if (!mainContent) {
        console.error('Main content element not found');
        return;
    }

    try {
        // Fetch the departments section HTML template
        const response = await fetch('views/departments.html');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const htmlContent = await response.text();
        
        // Load the HTML content
        mainContent.innerHTML = htmlContent;
        console.log('Departments section HTML loaded');

        // Load CSS
        if (!document.querySelector('link[href="css/departments.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'css/departments.css';
            document.head.appendChild(link);
        }
        
        // Initialize manager
        window.departmentsManager = new DepartmentsManager();
    } catch (error) {
        console.error('Error loading departments section:', error);
        mainContent.innerHTML = `<div class="error-message">Error loading departments section: ${error.message}</div>`;
    }
}

async function loadLevelsSection() {
    console.log('Loading levels section...');
    const mainContent = document.querySelector('.main-content .content-body');
    
    if (!mainContent) {
        console.error('Main content element not found');
        return;
    }

    try {
        // Fetch the levels section HTML template
        const response = await fetch('views/levels.html');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const htmlContent = await response.text();
        
        // Load the HTML content
        mainContent.innerHTML = htmlContent;
        console.log('Levels section HTML loaded');

        // Load CSS
        if (!document.querySelector('link[href="css/levels.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'css/levels.css';
            document.head.appendChild(link);
        }
        
        // Initialize manager
        window.levelsManager = new LevelsManager();
    } catch (error) {
        console.error('Error loading levels section:', error);
        mainContent.innerHTML = `<div class="error-message">Error loading levels section: ${error.message}</div>`;
    }
}

async function loadModulesSection() {
    console.log('Loading modules section...');
    const mainContent = document.querySelector('.main-content .content-body');
    
    if (!mainContent) {
        console.error('Main content element not found');
        return;
    }

    try {
        // Fetch the modules section HTML template
        const response = await fetch('views/modules.html');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const htmlContent = await response.text();
        
        // Load the HTML content
        mainContent.innerHTML = htmlContent;
        console.log('Modules section HTML loaded');

        // Load CSS
        if (!document.querySelector('link[href="css/modules.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'css/modules.css';
            document.head.appendChild(link);
        }
        
        // Initialize manager
        window.modulesManager = new ModulesManager();
    } catch (error) {
        console.error('Error loading modules section:', error);
        mainContent.innerHTML = `<div class="error-message">Error loading modules section: ${error.message}</div>`;
    }
}

async function fetchDashboardStats() {
    const token = localStorage.getItem('token');
    const baseUrl = config.backendUrl;

    try {
        // Fetch teachers count
        const teachersResponse = await fetch(`${baseUrl}/api/teachers`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const teachersData = await teachersResponse.json();
        document.getElementById('teacherCount').textContent = teachersData.length || 0;

        // Fetch modules count
        const modulesResponse = await fetch(`${baseUrl}/api/modules`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const modulesData = await modulesResponse.json();
        document.getElementById('moduleCount').textContent = modulesData.length || 0;

        // Fetch rooms count
        const roomsResponse = await fetch(`${baseUrl}/api/rooms`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const roomsData = await roomsResponse.json();
        document.getElementById('roomCount').textContent = roomsData.length || 0;

        // Fetch current semester
        const semestersResponse = await fetch(`${baseUrl}/api/semesters`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const semestersData = await semestersResponse.json();
        const currentSemester = semestersData.find(sem => sem.isActive);
        document.getElementById('currentSemester').textContent = currentSemester ? currentSemester.name : 'None';
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
    }
}

// Update the section loaders object
const sectionLoaders = {
    teachers: loadTeachersSection,
    specialities: loadSpecialitiesSection,
    departments: loadDepartmentsSection,
    levels: loadLevelsSection,
    modules: loadModulesSection,
    // ... other sections ...
}; 