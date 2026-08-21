document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://localhost:5000/api';
    const contentArea = document.getElementById('content-area');
    const userInfo = document.getElementById('userInfo');
    
    // Check authentication
    const userData = JSON.parse(localStorage.getItem('userData'));
    const accessToken = localStorage.getItem('accessToken');

    if (!userData || !accessToken || userData.role !== 'ADMIN') {
        window.location.href = '../index.html';
        return;
    }

    // Update user info in the navigation
    const userSpan = userInfo.querySelector('span');
    userSpan.textContent = userData.fullname;

    // Fetch function with authentication
    async function fetchWithAuth(endpoint) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    handleLogout();
                    return null;
                }
                throw new Error('Network response was not ok');
            }

            return await response.json();
        } catch (error) {
            console.error('Fetch error:', error);
            return null;
        }
    }

    // Content loading functions
    async function loadTeachers() {
        const teachers = await fetchWithAuth('/teachers');
        return teachers ? `
            <div class="content-section">
                <div class="section-header">
                    <h2>Teachers Management</h2>
                    <button class="add-btn" onclick="showAddTeacherForm()">
                        <i class="fas fa-plus"></i> Add Teacher
                    </button>
                </div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Department</th>
                                <th>Grade</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${teachers.map(teacher => `
                                <tr>
                                    <td>${teacher.fullname}</td>
                                    <td>${teacher.departmentid}</td>
                                    <td>${teacher.gradeid}</td>
                                    <td>
                                        <button class="edit-btn" onclick="editTeacher('${teacher._id}')">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="delete-btn" onclick="deleteTeacher('${teacher._id}')">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        ` : '<p>Error loading teachers</p>';
    }

    async function loadAcademicStructure() {
        const departments = await fetchWithAuth('/departments');
        const levels = await fetchWithAuth('/levels');
        return `
            <div class="content-section">
                <div class="section-header">
                    <h2>Academic Structure</h2>
                </div>
                <div class="grid-container">
                    <div class="grid-item">
                        <h3>Departments</h3>
                        <button class="add-btn" onclick="showAddDepartmentForm()">
                            <i class="fas fa-plus"></i> Add Department
                        </button>
                        <ul class="list-group">
                            ${departments ? departments.map(dept => `
                                <li class="list-item">
                                    <span>${dept.name} (${dept.code})</span>
                                    <div class="item-actions">
                                        <button onclick="editDepartment('${dept._id}')">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button onclick="deleteDepartment('${dept._id}')">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </li>
                            `).join('') : '<li>No departments found</li>'}
                        </ul>
                    </div>
                    <div class="grid-item">
                        <h3>Levels</h3>
                        <button class="add-btn" onclick="showAddLevelForm()">
                            <i class="fas fa-plus"></i> Add Level
                        </button>
                        <ul class="list-group">
                            ${levels ? levels.map(level => `
                                <li class="list-item">
                                    <span>${level.name}</span>
                                    <div class="item-actions">
                                        <button onclick="editLevel('${level._id}')">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button onclick="deleteLevel('${level._id}')">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </li>
                            `).join('') : '<li>No levels found</li>'}
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }

    // Additional content loading functions
    async function loadModules() {
        const modules = await fetchWithAuth('/modules');
        return `
            <div class="content-section">
                <div class="section-header">
                    <h2>Modules Management</h2>
                    <button class="add-btn" onclick="showAddModuleForm()">
                        <i class="fas fa-plus"></i> Add Module
                    </button>
                </div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Level</th>
                                <th>Department</th>
                                <th>Semester</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${modules ? modules.map(module => `
                                <tr>
                                    <td>${module.name}</td>
                                    <td>${module.levelid}</td>
                                    <td>${module.departmentid}</td>
                                    <td>${module.semesterid}</td>
                                    <td>
                                        <button class="edit-btn" onclick="editModule('${module._id}')">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="delete-btn" onclick="deleteModule('${module._id}')">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('') : ''}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    async function loadRooms() {
        return `
            <div class="content-section">
                <div class="section-header">
                    <h2>Rooms Management</h2>
                    <button class="add-btn" onclick="showAddRoomForm()">
                        <i class="fas fa-plus"></i> Add Room
                    </button>
                </div>
                <div class="grid-container">
                    <div class="grid-item">
                        <h3>Lecture Halls</h3>
                        <div class="room-grid">
                            <div class="room-card">
                                <h4>Room A1</h4>
                                <p>Capacity: 200</p>
                                <div class="room-actions">
                                    <button class="edit-btn"><i class="fas fa-edit"></i></button>
                                    <button class="delete-btn"><i class="fas fa-trash"></i></button>
                                </div>
                            </div>
                            <!-- Add more room cards -->
                        </div>
                    </div>
                    <div class="grid-item">
                        <h3>Tutorial Rooms</h3>
                        <div class="room-grid">
                            <!-- Tutorial rooms will be listed here -->
                        </div>
                    </div>
                    <div class="grid-item">
                        <h3>Labs/Workshops</h3>
                        <div class="room-grid">
                            <!-- Labs will be listed here -->
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async function loadTeacherAffectations() {
        const [teachers, modules, levels, semesters] = await Promise.all([
            fetchWithAuth('/teachers'),
            fetchWithAuth('/modules'),
            fetchWithAuth('/levels'),
            fetchWithAuth('/semesters')
        ]);

        return `
            <div class="content-section">
                <div class="section-header">
                    <h2>Teacher Affectations</h2>
                    <button class="add-btn" onclick="showAddAffectationForm()">
                        <i class="fas fa-plus"></i> Add Affectation
                    </button>
                </div>
                <div class="affectation-container">
                    <div class="filters">
                        <select id="levelFilter" onchange="filterAffectations()">
                            <option value="">All Levels</option>
                            ${levels ? levels.map(level => 
                                `<option value="${level._id}">${level.name}</option>`
                            ).join('') : ''}
                        </select>
                        <select id="semesterFilter" onchange="filterAffectations()">
                            <option value="">All Semesters</option>
                            ${semesters ? semesters.map(semester => 
                                `<option value="${semester._id}">${semester.code}</option>`
                            ).join('') : ''}
                        </select>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Teacher</th>
                                    <th>Module</th>
                                    <th>Level</th>
                                    <th>Hours (L/T/P)</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${teachers ? teachers.map(teacher => 
                                    teacher.modules.map(module => `
                                        <tr>
                                            <td>${teacher.fullname}</td>
                                            <td>${module.moduleid}</td>
                                            <td>${module.levelid}</td>
                                            <td>${module.hours.lect}/${module.hours.tut}/${module.hours.wkshp}</td>
                                            <td>
                                                <button class="edit-btn" onclick="editAffectation('${teacher._id}', '${module.moduleid}')">
                                                    <i class="fas fa-edit"></i>
                                                </button>
                                                <button class="delete-btn" onclick="deleteAffectation('${teacher._id}', '${module.moduleid}')">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    `).join('')
                                ).join('') : ''}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    async function loadSemesters() {
        const semesters = await fetchWithAuth('/semesters');
        return `
            <div class="content-section">
                <div class="section-header">
                    <h2>Semester Management</h2>
                    <button class="add-btn" onclick="showAddSemesterForm()">
                        <i class="fas fa-plus"></i> Add Semester
                    </button>
                </div>
                <div class="grid-container">
                    ${semesters ? semesters.map(semester => `
                        <div class="grid-item semester-card">
                            <h3>Semester ${semester.code}</h3>
                            <div class="semester-actions">
                                <button class="edit-btn" onclick="editSemester('${semester._id}')">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="delete-btn" onclick="deleteSemester('${semester._id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `).join('') : ''}
                </div>
            </div>
        `;
    }

    async function loadAcademicYear() {
        const years = await fetchWithAuth('/years');
        return `
            <div class="content-section">
                <div class="section-header">
                    <h2>Academic Year Management</h2>
                    <button class="add-btn" onclick="showAddYearForm()">
                        <i class="fas fa-plus"></i> Add Academic Year
                    </button>
                </div>
                <div class="timeline-container">
                    ${years ? years.map(year => `
                        <div class="timeline-item">
                            <div class="year-card">
                                <h3>${year.year}</h3>
                                <p>Start: ${new Date(year.startDate).toLocaleDateString()}</p>
                                <p>End: ${new Date(year.endDate).toLocaleDateString()}</p>
                                <div class="year-actions">
                                    <button class="edit-btn" onclick="editYear('${year._id}')">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="delete-btn" onclick="deleteYear('${year._id}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('') : ''}
                </div>
            </div>
        `;
    }

    // Navigation handling
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            
            // Update active state
            sidebarLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Load content based on section
            const section = link.getAttribute('href').substring(1);
            let content = '';

            switch (section) {
                case 'teachers':
                    content = await loadTeachers();
                    break;
                case 'academic-structure':
                    content = await loadAcademicStructure();
                    break;
                case 'modules':
                    content = await loadModules();
                    break;
                case 'rooms':
                    content = await loadRooms();
                    break;
                case 'affectations':
                    content = await loadTeacherAffectations();
                    break;
                case 'semesters':
                    content = await loadSemesters();
                    break;
                case 'academic-year':
                    content = await loadAcademicYear();
                    break;
            }

            contentArea.innerHTML = content;
        });
    });

    // Load initial content (Teachers section)
    loadTeachers().then(content => {
        contentArea.innerHTML = content;
    });
});

// Logout function
function handleLogout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    window.location.href = '../index.html';
}

// Generic form display function
function showFormModal(title, fields, submitCallback) {
    // Remove existing modal if any
    const existingModal = document.querySelector('.modal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="close-btn" onclick="closeModal()">&times;</button>
            </div>
            <form id="dataForm">
                ${fields.map(field => `
                    <div class="form-group">
                        <label for="${field.id}">${field.label}</label>
                        ${field.type === 'select' ? `
                            <select id="${field.id}" name="${field.id}" ${field.required ? 'required' : ''}>
                                <option value="">Select ${field.label}</option>
                                ${field.options ? field.options.map(opt => 
                                    `<option value="${opt.value}">${opt.label}</option>`
                                ).join('') : ''}
                            </select>
                        ` : `
                            <input type="${field.type}" id="${field.id}" name="${field.id}"
                                ${field.required ? 'required' : ''}
                                ${field.min ? `min="${field.min}"` : ''}
                                ${field.max ? `max="${field.max}"` : ''}
                            >
                        `}
                    </div>
                `).join('')}
                <button type="submit" class="submit-btn">Submit</button>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('dataForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = {};
        fields.forEach(field => {
            formData[field.id] = document.getElementById(field.id).value;
        });
        await submitCallback(formData);
        closeModal();
    });
}

function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) modal.remove();
}

// Module management functions
async function showAddModuleForm() {
    const [departments, levels, semesters] = await Promise.all([
        fetchWithAuth('/departments'),
        fetchWithAuth('/levels'),
        fetchWithAuth('/semesters')
    ]);

    showFormModal('Add New Module', [
        { id: 'name', label: 'Module Name', type: 'text', required: true },
        {
            id: 'levelid',
            label: 'Level',
            type: 'select',
            required: true,
            options: levels.map(level => ({
                value: level._id,
                label: level.name
            }))
        },
        {
            id: 'departmentid',
            label: 'Department',
            type: 'select',
            required: true,
            options: departments.map(dept => ({
                value: dept._id,
                label: dept.name
            }))
        },
        {
            id: 'semesterid',
            label: 'Semester',
            type: 'select',
            required: true,
            options: semesters.map(sem => ({
                value: sem._id,
                label: sem.code
            }))
        }
    ], async (formData) => {
        const response = await fetch(`${API_BASE_URL}/modules`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            loadModules().then(content => {
                contentArea.innerHTML = content;
            });
        }
    });
}

// Teacher management functions
async function showAddTeacherForm() {
    const [departments, grades] = await Promise.all([
        fetchWithAuth('/departments'),
        fetchWithAuth('/grades')
    ]);

    showFormModal('Add New Teacher', [
        { id: 'fullname', label: 'Full Name', type: 'text', required: true },
        {
            id: 'departmentid',
            label: 'Department',
            type: 'select',
            required: true,
            options: departments.map(dept => ({
                value: dept._id,
                label: `${dept.name} (${dept.code})`
            }))
        },
        {
            id: 'gradeid',
            label: 'Grade',
            type: 'select',
            required: true,
            options: grades.map(grade => ({
                value: grade._id,
                label: grade.code
            }))
        }
    ], async (formData) => {
        const response = await fetch(`${API_BASE_URL}/teachers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            loadTeachers().then(content => {
                contentArea.innerHTML = content;
            });
        }
    });
}

// Department management functions
async function showAddDepartmentForm() {
    showFormModal('Add New Department', [
        { id: 'name', label: 'Department Name', type: 'text', required: true },
        { id: 'code', label: 'Department Code', type: 'text', required: true }
    ], async (formData) => {
        const response = await fetch(`${API_BASE_URL}/departments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            loadAcademicStructure().then(content => {
                contentArea.innerHTML = content;
            });
        }
    });
}

// Level management functions
async function showAddLevelForm() {
    showFormModal('Add New Level', [
        { id: 'name', label: 'Level Name', type: 'text', required: true },
        { id: 'groupes', label: 'Number of Groups', type: 'number', min: 1, required: true },
        { id: 'sections', label: 'Number of Sections', type: 'number', min: 1, required: true }
    ], async (formData) => {
        const response = await fetch(`${API_BASE_URL}/levels`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                ...formData,
                groupes: parseInt(formData.groupes),
                sections: parseInt(formData.sections)
            })
        });

        if (response.ok) {
            loadAcademicStructure().then(content => {
                contentArea.innerHTML = content;
            });
        }
    });
}

// Room management functions
async function showAddRoomForm() {
    showFormModal('Add New Room', [
        { id: 'name', label: 'Room Name', type: 'text', required: true },
        { id: 'capacity', label: 'Capacity', type: 'number', min: 1, required: true },
        {
            id: 'type',
            label: 'Room Type',
            type: 'select',
            required: true,
            options: [
                { value: 'lecture', label: 'Lecture Hall' },
                { value: 'tutorial', label: 'Tutorial Room' },
                { value: 'lab', label: 'Lab/Workshop' }
            ]
        }
    ], async (formData) => {
        const response = await fetch(`${API_BASE_URL}/rooms`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                ...formData,
                capacity: parseInt(formData.capacity)
            })
        });

        if (response.ok) {
            loadRooms().then(content => {
                contentArea.innerHTML = content;
            });
        }
    });
}

// Teacher affectation functions
async function showAddAffectationForm() {
    const [teachers, modules, levels, semesters] = await Promise.all([
        fetchWithAuth('/teachers'),
        fetchWithAuth('/modules'),
        fetchWithAuth('/levels'),
        fetchWithAuth('/semesters')
    ]);

    showFormModal('Add Teacher Affectation', [
        {
            id: 'teacherid',
            label: 'Teacher',
            type: 'select',
            required: true,
            options: teachers.map(teacher => ({
                value: teacher._id,
                label: teacher.fullname
            }))
        },
        {
            id: 'moduleid',
            label: 'Module',
            type: 'select',
            required: true,
            options: modules.map(module => ({
                value: module._id,
                label: module.name
            }))
        },
        { id: 'lect', label: 'Lecture Hours', type: 'number', min: 0, required: true },
        { id: 'tut', label: 'Tutorial Hours', type: 'number', min: 0, required: true },
        { id: 'wkshp', label: 'Workshop Hours', type: 'number', min: 0, required: true }
    ], async (formData) => {
        const response = await fetch(`${API_BASE_URL}/teachers/${formData.teacherid}/modules`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                moduleid: formData.moduleid,
                hours: {
                    lect: parseInt(formData.lect),
                    tut: parseInt(formData.tut),
                    wkshp: parseInt(formData.wkshp)
                }
            })
        });

        if (response.ok) {
            loadTeacherAffectations().then(content => {
                contentArea.innerHTML = content;
            });
        }
    });
}

// Academic year functions
async function showAddYearForm() {
    showFormModal('Add Academic Year', [
        { id: 'year', label: 'Year', type: 'number', required: true },
        { id: 'startDate', label: 'Start Date', type: 'date', required: true },
        { id: 'endDate', label: 'End Date', type: 'date', required: true }
    ], async (formData) => {
        const response = await fetch(`${API_BASE_URL}/years`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            loadAcademicYear().then(content => {
                contentArea.innerHTML = content;
            });
        }
    });
}

// Semester functions
async function showAddSemesterForm() {
    showFormModal('Add Semester', [
        { id: 'code', label: 'Semester Code', type: 'text', required: true }
    ], async (formData) => {
        const response = await fetch(`${API_BASE_URL}/semesters`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            loadSemesters().then(content => {
                contentArea.innerHTML = content;
            });
        }
    });
}