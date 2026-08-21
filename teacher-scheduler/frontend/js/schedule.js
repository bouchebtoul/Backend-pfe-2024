import config from './config.js';

// Helper function to handle API responses and token expiration
async function handleApiResponse(response) {
    if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        window.location.href = '/index.html';
        throw new Error('Session expired. Please login again.');
    }
    return response;
}

// Global variables for schedule data
let currentLayout = 'default'; // 'default' or 'day-room'
let affectations = [];
let modules = [];
let teachers = [];
let rooms = [];
let sections = [];
let groups = [];
let specialities = [];
let levels = [];
let currentYear = null;
let currentSemester = null;
let selectedRooms = []; // Array of selected room IDs
let allRooms = []; // Store all rooms for filtering

// Data loading functions
async function loadAffectations() {
    try {
        const response = await fetch(`${config.backendUrl}/api/affectations`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();
        affectations = Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error loading affectations:', error);
        affectations = [];
    }
}

async function loadModules() {
    try {
        const response = await fetch(`${config.backendUrl}/api/modules`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        modules = await response.json();
    } catch (error) {
        console.error('Error loading modules:', error);
    }
}

async function loadTeachers() {
    try {
        const response = await fetch(`${config.backendUrl}/api/teachers`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        teachers = await response.json();
    } catch (error) {
        console.error('Error loading teachers:', error);
    }
}

async function loadRoomsData() {
    try {
        const response = await fetch(`${config.backendUrl}/api/rooms`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        let roomsData = await response.json();
        // Sort rooms by type priority, then by room number
        const typePriority = { LECTURE: 0, TUTORIAL: 1, WORKSHOP: 2 };
        roomsData.sort((a, b) => {
            // Find the highest priority type for each room
            const aType = Array.isArray(a.type) ? Math.min(...a.type.map(t => typePriority[t] ?? 99)) : (typePriority[a.type] ?? 99);
            const bType = Array.isArray(b.type) ? Math.min(...b.type.map(t => typePriority[t] ?? 99)) : (typePriority[b.type] ?? 99);
            if (aType !== bType) return aType - bType;
            // If same type priority, sort by room number (as string or number)
            if (a.roomNumber && b.roomNumber) {
                // Try numeric comparison if possible
                const aNum = parseInt(a.roomNumber, 10);
                const bNum = parseInt(b.roomNumber, 10);
                if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
                return a.roomNumber.localeCompare(b.roomNumber);
            }
            return 0;
        });
        allRooms = roomsData; // Store all rooms
        rooms = roomsData; // Default to all rooms
    } catch (error) {
        console.error('Error loading rooms:', error);
    }
}

async function loadSections() {
    try {
        const response = await fetch(`${config.backendUrl}/api/sections`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        sections = await response.json();
    } catch (error) {
        console.error('Error loading sections:', error);
    }
}

async function loadGroups() {
    try {
        const response = await fetch(`${config.backendUrl}/api/groups`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        groups = await response.json();
    } catch (error) {
        console.error('Error loading groups:', error);
    }
}

async function loadSpecialities() {
    try {
        const response = await fetch(`${config.backendUrl}/api/specialities`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        specialities = await response.json();
    } catch (error) {
        console.error('Error loading specialities:', error);
    }
}

async function loadLevels() {
    try {
        const response = await fetch(`${config.backendUrl}/api/levels`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        levels = await response.json();
    } catch (error) {
        console.error('Error loading levels:', error);
    }
}

// Initialize all data
async function initializeData() {
    await Promise.all([
        loadAffectations(),
        loadModules(),
        loadTeachers(),
        loadRoomsData(),
        loadSections(),
        loadGroups(),
        loadSpecialities(),
        loadLevels()
    ]);

    // Load cached room selection and apply filter
    loadCachedRoomSelection();
    applyRoomFilter();
}

// Event handling functions
function setupEventListeners() {
    // Listen for cell clicks
    document.addEventListener('click', (e) => {
        const cell = e.target.closest('.schedule-cell');
        if (cell) {
            handleCellClick(cell);
        }
    });

    // Listen for year/semester changes
    document.getElementById('academicYearSelect').addEventListener('change', (e) => {
        currentYear = e.target.value;
        updateSchedule();
    });

    document.getElementById('semesterSelect').addEventListener('change', (e) => {
        currentSemester = e.target.value;
        updateSchedule();
    });
}

function handleCellClick(cell) {
    const roomId = cell.dataset.roomId;
    const day = parseInt(cell.dataset.day);
    const slot = parseInt(cell.dataset.slot);

    // Check if cell already has a schedule item
    const existingItem = cell.querySelector('.schedule-item');
    if (existingItem) {
        // Show delete confirmation or directly delete
        if (confirm('Delete this schedule item?')) {
            const scheduleId = existingItem.dataset.scheduleId;
            if (scheduleId) {
                deleteSchedule(scheduleId);
            }
        }
        return;
    }

    // Get available affectations for this cell
    const availableAffectations = getAvailableAffectations(roomId, day, slot);
    
    if (availableAffectations.length === 0) {
        alert('No available affectations for this time slot');
        return;
    }

    // Show dropdown with available options
    showScheduleDropdown(cell, availableAffectations);
}

function getAvailableAffectations(roomId, day, slot) {
    if (!Array.isArray(affectations)) return [];
    const availableAffectations = [];
    const room = rooms.find(r => r._id === roomId);
    if (!room) return availableAffectations;
    const sessionTypeMap = { 'LECTURE': 'lecture', 'TUTORIAL': 'tutorial', 'WORKSHOP': 'workshop' };
    
    affectations.forEach(teacherAffectation => {
        teacherAffectation.affectations.forEach(affectation => {
            // Check if teacher is available at this time
            if (checkTeacherConflicts(teacherAffectation.teacherid, day, slot)) return;
            
            // Check if room is available at this time
            if (checkRoomConflicts(roomId, day, slot)) return;

            const module = modules.find(m => m._id === affectation.module._id);
            if (!module) return;

            for (const roomSessionType of room.type) {
                let sessionTypeKey = sessionTypeMap[roomSessionType];
                if (!sessionTypeKey) continue;

                if (sessionTypeKey === 'lecture') {
                    const levelSections = sections.filter(s => s.levelid._id === module.levelid._id);
                    levelSections.forEach(section => {
                        availableAffectations.push({
                            ...affectation,
                            teacher: { 
                                _id: teacherAffectation.teacherid, 
                                firstName: teacherAffectation.teacherName.split(' ')[0], 
                                lastName: teacherAffectation.teacherName.split(' ')[1] || '' 
                            },
                            sessionType: 'lecture',
                            section: section
                        });
                    });
                } else {
                    const levelSections = sections.filter(s => s.levelid._id === module.levelid._id);
                    levelSections.forEach(section => {
                        const sectionGroups = groups.filter(g => g.sectionid && g.sectionid._id === section._id);
                        sectionGroups.forEach(group => {
                            availableAffectations.push({
                                ...affectation,
                                teacher: { 
                                    _id: teacherAffectation.teacherid, 
                                    firstName: teacherAffectation.teacherName.split(' ')[0], 
                                    lastName: teacherAffectation.teacherName.split(' ')[1] || '' 
                                },
                                sessionType: sessionTypeKey,
                                section: section,
                                group: group
                            });
                        });
                    });
                }
            }
        });
    });
    return availableAffectations;
}

function checkTeacherConflicts(teacherId, day, slot) {
    // Check if teacher already has a schedule at this time
    const existingSchedules = document.querySelectorAll('.schedule-item');
    for (const item of existingSchedules) {
        const cell = item.closest('.schedule-cell');
        if (cell && cell.dataset.day == day && cell.dataset.slot == slot) {
            const scheduleData = item.dataset;
            if (scheduleData.teacherId === teacherId) {
                return true;
            }
        }
    }
    return false;
}

function checkRoomConflicts(roomId, day, slot) {
    // Check if room already has a schedule at this time
    const existingSchedules = document.querySelectorAll('.schedule-item');
    for (const item of existingSchedules) {
        const cell = item.closest('.schedule-cell');
        if (cell && cell.dataset.roomId === roomId && cell.dataset.day == day && cell.dataset.slot == slot) {
            return true;
        }
    }
    return false;
}

function showScheduleDropdown(cell, affectations) {
    removeExistingDropdown();
    const cellRect = cell.getBoundingClientRect();
    
    const dropdownWrapper = document.createElement('div');
    dropdownWrapper.className = 'schedule-dropdown-wrapper';
    dropdownWrapper.addEventListener('mousedown', (e) => { e.stopPropagation(); });
    
    const dropdownPanel = document.createElement('div');
    dropdownPanel.className = 'schedule-dropdown-panel';
    
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search...';
    searchInput.className = 'schedule-dropdown-search';
    dropdownPanel.appendChild(searchInput);
    
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'schedule-dropdown-options';
    dropdownPanel.appendChild(optionsContainer);
    
    const renderOptions = (filter = '') => {
        optionsContainer.innerHTML = '';
        let count = 0;
        
        affectations.forEach(affectation => {
            const room = rooms.find(r => r._id === cell.dataset.roomId);
            const isLecture = affectation.sessionType === 'lecture';
            const levelInitial = `${levels.find(x => x._id == affectation.module.levelid).code}`;
            const sessionType = affectation.sessionType.charAt(0).toUpperCase() + affectation.sessionType.slice(1);
            const groupInfo = isLecture ? `S ${affectation.section.number}` : `S ${affectation.section.number} - G ${affectation.group.name}`;
            const optionText = `${levelInitial} ${affectation.module.code} - ${affectation.teacher.firstName} ${affectation.teacher.lastName} (${sessionType} - ${groupInfo})`;
            
            if (optionText.toLowerCase().includes(filter.toLowerCase())) {
                count++;
                const option = document.createElement('div');
                option.className = 'schedule-option';
                option.textContent = optionText;
                option.addEventListener('mouseenter', () => option.classList.add('hover'));
                option.addEventListener('mouseleave', () => option.classList.remove('hover'));
                option.addEventListener('click', () => {
                    handleScheduleSelection(cell, affectation);
                    removeExistingDropdown();
                });
                optionsContainer.appendChild(option);
            }
        });
        
        if (count === 0) {
            const noResult = document.createElement('div');
            noResult.textContent = 'No affectations found.';
            noResult.className = 'schedule-no-affectations';
            optionsContainer.appendChild(noResult);
        }
    };
    
    renderOptions();
    searchInput.addEventListener('input', (e) => { renderOptions(e.target.value); });
    
    if (window._scheduleDropdownListener) {
        document.removeEventListener('mousedown', window._scheduleDropdownListener);
    }
    window._scheduleDropdownListener = (e) => {
        removeExistingDropdown();
        document.removeEventListener('mousedown', window._scheduleDropdownListener);
        window._scheduleDropdownListener = null;
    };
    setTimeout(() => { document.addEventListener('mousedown', window._scheduleDropdownListener); }, 0);
    
    dropdownWrapper.appendChild(dropdownPanel);
    document.body.appendChild(dropdownWrapper);
    
    const dropdownHeight = dropdownPanel.offsetHeight || 320;
    const spaceBelow = window.innerHeight - (cellRect.bottom + window.scrollY);
    const spaceAbove = cellRect.top + window.scrollY;
    let top;
    if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        top = cellRect.top + window.scrollY - dropdownHeight;
    } else {
        top = cellRect.bottom + window.scrollY;
    }
    
    dropdownWrapper.style.position = 'absolute';
    dropdownWrapper.style.top = `${top}px`;
    dropdownWrapper.style.left = `${cellRect.left + window.scrollX}px`;
    dropdownWrapper.style.minWidth = `${cellRect.width}px`;
    dropdownWrapper.style.zIndex = '10000';
}

function removeExistingDropdown() {
    const existingWrapper = document.querySelector('.schedule-dropdown-wrapper');
    if (existingWrapper) {
        existingWrapper.remove();
    }
    if (window._scheduleDropdownListener) {
        document.removeEventListener('mousedown', window._scheduleDropdownListener);
        window._scheduleDropdownListener = null;
    }
}

async function handleScheduleSelection(cell, affectation) {
    const roomId = cell.dataset.roomId;
    const day = parseInt(cell.dataset.day);
    const slot = parseInt(cell.dataset.slot);
    
    const startTime = getTimeSlotStart(slot);
    const endTime = getTimeSlotEnd(slot);
    
    const scheduleData = {
        teacherid: affectation.teacher._id,
        moduleid: affectation.module._id,
        yearid: currentYear,
        type: affectation.sessionType,
        day: day.toString(),
        start: startTime,
        end: endTime,
        roomid: roomId,
        sectionid: affectation.section._id,
        groupid: affectation.group ? affectation.group._id : null
    };

    try {
        const response = await fetch(`${config.backendUrl}/api/schedules`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(scheduleData)
        });

        if (response.ok) {
            const result = await response.json();
            renderScheduleItem(cell, result);
        } else {
            throw new Error('Failed to create schedule');
        }
    } catch (error) {
        console.error('Error creating schedule:', error);
        alert('Failed to create schedule');
    }
}

function renderScheduleItem(cell, scheduleData) {
    const scheduleItem = document.createElement('div');
    scheduleItem.className = 'schedule-item';
    scheduleItem.dataset.scheduleId = scheduleData._id;
    scheduleItem.dataset.teacherId = scheduleData.teacherid._id;
    
    // Get level color from the module's level
    const levelColor = scheduleData.moduleid.levelid?.color || '#e3f2fd';
    scheduleItem.style.backgroundColor = levelColor;
    scheduleItem.style.color = '#333';
    scheduleItem.style.border = '1px solid rgba(0,0,0,0.1)';
    scheduleItem.style.borderRadius = '3px';
    scheduleItem.style.padding = '2px 4px';
    scheduleItem.style.fontSize = '0.8em';
    scheduleItem.style.cursor = 'pointer';
    scheduleItem.style.position = 'relative';
    
    const isLecture = scheduleData.type === 'lecture';
    const groupInfo = isLecture ? `S${scheduleData.sectionid?.number || ''}` : `S${scheduleData.sectionid?.number || ''}-G${scheduleData.groupid?.name || ''}`;
    const levelCode = scheduleData.moduleid.levelid?.code || 'L';
    
    scheduleItem.innerHTML = `
        <div style="font-weight: bold;">${levelCode} ${scheduleData.moduleid.code}</div>
        <div>${scheduleData.teacherid.firstName} ${scheduleData.teacherid.lastName}</div>
        <div style="font-size: 0.7em; opacity: 0.8;">${groupInfo}</div>
        <button class="schedule-delete-btn" style="position: absolute; top: 2px; right: 2px; background: none; border: none; color: #666; cursor: pointer; font-size: 0.7em; padding: 0;">×</button>
    `;
    
    // Add delete functionality
    const deleteBtn = scheduleItem.querySelector('.schedule-delete-btn');
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('Delete this schedule item?')) {
            deleteSchedule(scheduleData._id);
        }
    });
    
    cell.appendChild(scheduleItem);
}

function getTimeSlotStart(slot) {
    const times = ['08:30', '10:00', '11:30', '13:00', '14:30'];
    return times[slot] || '08:30';
}

function getTimeSlotEnd(slot) {
    const times = ['10:00', '11:30', '13:00', '14:30', '16:00'];
    return times[slot] || '10:00';
}

async function updateSchedule() {
    // Load existing schedules for the current academic year and semester
    await loadSchedule();
}

function getSlotFromTime(time) {
    const times = ['08:30', '10:00', '11:30', '13:00', '14:30'];
    return times.indexOf(time);
}

async function deleteSchedule(scheduleId) {
    try {
        const response = await fetch(`${config.backendUrl}/api/schedules/${scheduleId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            // Remove from UI
            const scheduleItem = document.querySelector(`[data-schedule-id="${scheduleId}"]`);
            if (scheduleItem) {
                scheduleItem.remove();
            }
        } else {
            throw new Error('Failed to delete schedule');
        }
    } catch (error) {
        console.error('Error deleting schedule:', error);
        alert('Failed to delete schedule');
    }
}

// Room filter functions
function loadCachedRoomSelection() {
    try {
        const cached = localStorage.getItem('schedule_selected_rooms');
        if (cached) {
            selectedRooms = JSON.parse(cached);
        } else {
            // Default to all rooms selected
            selectedRooms = allRooms.map(room => room._id);
        }
    } catch (error) {
        console.error('Error loading cached room selection:', error);
        selectedRooms = allRooms.map(room => room._id);
    }
    
    // Ensure selectedRooms only contains valid room IDs
    selectedRooms = selectedRooms.filter(roomId => 
        allRooms.some(room => room._id === roomId)
    );
}

function saveRoomSelection() {
    try {
        localStorage.setItem('schedule_selected_rooms', JSON.stringify(selectedRooms));
    } catch (error) {
        console.error('Error saving room selection:', error);
    }
}

function initializeRoomFilter() {
    const multiselect = document.getElementById('roomsMultiselect');
    const selected = document.getElementById('roomsSelected');
    const dropdown = document.getElementById('roomsDropdown');
    const search = document.getElementById('roomsSearch');
    const options = document.getElementById('roomsOptions');

    if (!multiselect || !selected || !dropdown || !search || !options) {
        return;
    }

    // Populate room options
    populateRoomOptions();

    // Toggle dropdown
    selected.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
        selected.classList.toggle('active');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!multiselect.contains(e.target)) {
            dropdown.classList.remove('show');
            selected.classList.remove('active');
        }
    });

    // Search functionality
    search.addEventListener('input', (e) => {
        filterRoomOptions(e.target.value);
    });

    // Prevent dropdown from closing when clicking inside
    dropdown.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

function populateRoomOptions() {
    const options = document.getElementById('roomsOptions');
    if (!options) {
        return;
    }

    options.innerHTML = '';
    allRooms.forEach(room => {
        const option = document.createElement('div');
        option.className = 'room-option';
        option.dataset.roomId = room._id;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = selectedRooms.includes(room._id);
        checkbox.addEventListener('change', (e) => {
            toggleRoomSelection(room._id, e.target.checked);
        });

        const label = document.createElement('label');
        label.textContent = `${room.roomNumber} (${Array.isArray(room.type) ? room.type.join(', ') : room.type})`;

        option.appendChild(checkbox);
        option.appendChild(label);
        options.appendChild(option);
    });

    updateRoomSelectionDisplay();
}

function filterRoomOptions(searchTerm) {
    const options = document.querySelectorAll('.room-option');
    options.forEach(option => {
        const label = option.querySelector('label');
        const text = label ? label.textContent.toLowerCase() : '';
        const matches = text.includes(searchTerm.toLowerCase());
        option.style.display = matches ? 'flex' : 'none';
    });
}

function toggleRoomSelection(roomId, selected) {
    if (selected) {
        if (!selectedRooms.includes(roomId)) {
            selectedRooms.push(roomId);
        }
    } else {
        selectedRooms = selectedRooms.filter(id => id !== roomId);
    }

    updateRoomSelectionDisplay();
    saveRoomSelection();
    applyRoomFilter();
}

function updateRoomSelectionDisplay() {
    const selected = document.getElementById('roomsSelected');
    const placeholder = selected.querySelector('.rooms-placeholder');
    if (!placeholder) return;

    if (selectedRooms.length === 0) {
        placeholder.textContent = 'No rooms selected';
    } else if (selectedRooms.length === allRooms.length) {
        placeholder.textContent = 'All Rooms';
    } else {
        const selectedRoomNames = selectedRooms.map(id => {
            const room = allRooms.find(r => r._id === id);
            return room ? room.roomNumber : '';
        }).filter(name => name);
        placeholder.textContent = `${selectedRoomNames.length} room(s) selected`;
    }
}

function applyRoomFilter() {
    if (selectedRooms.length === 0) {
        rooms = [];
    } else if (selectedRooms.length === allRooms.length) {
        rooms = [...allRooms];
    } else {
        rooms = allRooms.filter(room => selectedRooms.includes(room._id));
    }

    // Trigger room reload
    if (typeof window.loadRooms === 'function') {
        window.loadRooms();
    }
}

// Academic year and semester functions
async function loadAcademicYears() {
    try {
        const response = await fetch(`${config.backendUrl}/api/years`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        await handleApiResponse(response);
        const years = await response.json();
        const select = document.getElementById('academicYearSelect');
        select.innerHTML = '<option value="">Select Academic Year</option>';
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year._id;
            option.textContent = year.year;
            select.appendChild(option);
        });
        // Set initial year
        if (years.length > 0) {
            select.value = years[0]._id;
            currentYear = years[0]._id;
        }
    } catch (error) {
        if (error.message !== 'Session expired. Please login again.') {
            console.error('Error loading academic years:', error);
        }
    }
}

function loadSemesters() {
    const semesters = [
        { id: 1, name: 'Semester 1' },
        { id: 2, name: 'Semester 2' }
    ];
    const select = document.getElementById('semesterSelect');
    select.innerHTML = '<option value="">Select Semester</option>';
    semesters.forEach(semester => {
        const option = document.createElement('option');
        option.value = semester.id;
        option.textContent = semester.name;
        select.appendChild(option);
    });
    // Set initial semester
    select.value = semesters[0].id;
    currentSemester = semesters[0].id;
}

// Room loading and display functions
window.loadRooms = async function loadRooms() {
    try {
        const roomsColumn = document.querySelector('.rooms-column');
        const scheduleCells = document.getElementById('scheduleCells');
        const headerGrid = document.querySelector('.schedule-header-grid');
        const scheduleBody = document.querySelector('.schedule-body');

        // Clear existing content
        roomsColumn.innerHTML = '';
        scheduleCells.innerHTML = '';

        if (currentLayout === 'default') {
            if (headerGrid) headerGrid.style.display = '';
            if (roomsColumn) roomsColumn.style.display = '';
            if (scheduleBody) scheduleBody.style.display = 'grid';
            scheduleCells.className = 'schedule-cells schedule-grid-default';
            rooms.forEach(room => {
                const roomName = document.createElement('div');
                roomName.className = 'room-name room-name-default';
                roomName.textContent = room.roomNumber;
                roomsColumn.appendChild(roomName);
                for (let day = 0; day < 6; day++) {
                    for (let slot = 0; slot < 5; slot++) {
                        const cell = document.createElement('div');
                        cell.className = 'schedule-cell schedule-cell-default';
                        cell.dataset.roomId = room._id;
                        cell.dataset.day = day;
                        cell.dataset.slot = slot;
                        scheduleCells.appendChild(cell);
                    }
                }
            });
        } else if (currentLayout === 'day-room') {
            if (headerGrid) headerGrid.style.display = 'none';
            if (roomsColumn) roomsColumn.style.display = 'none';
            if (scheduleBody) scheduleBody.style.display = 'contents';
            scheduleCells.className = 'schedule-cells schedule-grid-dayroom';
            const timeslotLabels = ['8:30 - 10:00', '10:00 - 11:30', '11:30 - 13:00', '13:00 - 14:30', '14:30 - 16:00'];
            // Timeslot header row
            const timeslotHeader = document.createElement('div');
            timeslotHeader.className = 'schedule-grid-header-dayroom';
            timeslotHeader.innerHTML = `<div class="corner-cell"></div>` + timeslotLabels.map(t => `<div class="time-slot-header">${t}</div>`).join('');
            scheduleCells.appendChild(timeslotHeader);
            const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
            days.forEach((day, dayIdx) => {
                // Day section header (spans all columns)
                const daySection = document.createElement('div');
                daySection.className = 'day-section-header-dayroom';
                daySection.textContent = day;
                scheduleCells.appendChild(daySection);
                // For each room, render a row: first cell is room name, then timeslot cells
                rooms.forEach(room => {
                    for (let col = 0; col < timeslotLabels.length + 1; col++) {
                        const cell = document.createElement('div');
                        if (col === 0) {
                            cell.className = 'room-name-dayroom';
                            cell.textContent = room.roomNumber;
                        } else {
                            cell.className = 'schedule-cell-dayroom';
                            cell.dataset.roomId = room._id;
                            cell.dataset.day = dayIdx;
                            cell.dataset.slot = col - 1;
                        }
                        scheduleCells.appendChild(cell);
                    }
                });
            });
        }
        await updateSchedule();
    } catch (error) {
        if (error.message !== 'Session expired. Please login again.') {
            console.error('Error loading rooms:', error);
        }
    }
};

async function loadSchedule() {
    const academicYearId = document.getElementById('academicYearSelect').value;
    const semesterId = document.getElementById('semesterSelect').value;

    if (!academicYearId || !semesterId) {
        return;
    }

    try {
        const response = await fetch(`${config.backendUrl}/api/schedules?academicyearid=${academicYearId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        await handleApiResponse(response);
        const schedules = await response.json();

        // Remove existing schedule items
        document.querySelectorAll('.schedule-item').forEach(item => item.remove());

        // Add new schedule items
        schedules.forEach(schedule => {
            const cell = document.querySelector(
                `.schedule-cell[data-room-id="${schedule.roomid._id}"][data-day="${schedule.day}"][data-slot="${getSlotFromTime(schedule.start)}"]`
            );

            if (cell) {
                renderScheduleItem(cell, schedule);
            }
        });
    } catch (error) {
        console.error('Error loading schedule:', error);
    }
}

// Main initialization
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize all data
    await initializeData();
    
    // Set up event listeners
    setupEventListeners();

    // Set up layout switch
    document.getElementById('layoutSwitchBtn').addEventListener('click', () => {
        currentLayout = currentLayout === 'default' ? 'day-room' : 'default';
        loadRooms();
    });

    // Load academic years and semesters
    await loadAcademicYears();
    loadSemesters();
    
    // Load rooms and display
    await loadRooms();
    
    // Load existing schedules
    await updateSchedule();
    
    // Initialize room filter after DOM is ready
    setTimeout(() => {
        initializeRoomFilter();
        
        // Add a direct event listener as backup
        const selected = document.getElementById('roomsSelected');
        const dropdown = document.getElementById('roomsDropdown');
        if (selected && dropdown) {
            selected.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // Try both class toggle and direct style manipulation
                dropdown.classList.toggle('show');
                selected.classList.toggle('active');
                
                // Also try direct style manipulation as backup
                if (dropdown.classList.contains('show')) {
                    dropdown.style.display = 'block';
                    dropdown.style.visibility = 'visible';
                    dropdown.style.opacity = '1';
                } else {
                    dropdown.style.display = 'none';
                    dropdown.style.visibility = 'hidden';
                    dropdown.style.opacity = '0';
                }
            });
        }
    }, 100);
});