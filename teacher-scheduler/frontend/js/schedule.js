import config from './config.js';
import ScheduleManager from './managers/ScheduleManager.js';

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

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize schedule manager first
    window.scheduleManager = new ScheduleManager();
    
    // Then load the data
    await Promise.all([
        loadAcademicYears(),
        loadSemesters(),
        loadRooms(),
        loadSchedule()
    ]);
});

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
        
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year._id;
            option.textContent = year.year;
            select.appendChild(option);
        });

        // Set initial year
        if (years.length > 0) {
            select.value = years[0]._id;
            window.scheduleManager.currentYear = years[0]._id;
        }
    } catch (error) {
        if (error.message !== 'Session expired. Please login again.') {
            console.error('Error loading academic years:', error);
        }
    }
}

function loadSemesters() {
    const select = document.getElementById('semesterSelect');
    
    // Clear existing options
    select.innerHTML = '';
    
    // Add static semester options
    const semesters = [
        { id: 1, name: 'Semester 1' },
        { id: 2, name: 'Semester 2' }
    ];
    
    semesters.forEach(semester => {
        const option = document.createElement('option');
        option.value = semester.id;
        option.textContent = semester.name;
        select.appendChild(option);
    });

    // Set initial semester
    select.value = semesters[0].id;
    window.scheduleManager.currentSemester = semesters[0].id;
}

async function loadRooms() {
    try {
        const response = await fetch(`${config.backendUrl}/api/rooms`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        await handleApiResponse(response);
        const rooms = await response.json();
        const roomsColumn = document.querySelector('.rooms-column');
        const scheduleCells = document.getElementById('scheduleCells');
        
        // Clear existing content
        roomsColumn.innerHTML = '';
        scheduleCells.innerHTML = '';
        
        // Add room names to the column
        rooms.forEach(room => {
            const roomName = document.createElement('div');
            roomName.className = 'room-name';
            roomName.textContent = room.roomNumber;
            roomsColumn.appendChild(roomName);
            
            // Create cells for each day and timeslot
            for (let day = 0; day < 6; day++) { // Saturday to Thursday
                for (let slot = 0; slot < 5; slot++) { // 5 timeslots
                    const cell = document.createElement('div');
                    cell.className = 'schedule-cell';
                    cell.dataset.roomId = room._id;
                    cell.dataset.day = day;
                    cell.dataset.slot = slot;
                    scheduleCells.appendChild(cell);
                }
            }
        });

        // Load initial schedule
        window.scheduleManager.updateSchedule();
    } catch (error) {
        if (error.message !== 'Session expired. Please login again.') {
            console.error('Error loading rooms:', error);
        }
    }
}

async function loadSchedule() {
    const academicYearId = document.getElementById('academicYearSelect').value;
    const semesterId = document.getElementById('semesterSelect').value;
    
    if (!academicYearId || !semesterId) return;
    
    try {
        const response = await fetch(`${config.backendUrl}/api/schedules?academicYearId=${academicYearId}&semesterId=${semesterId}`);
        const schedules = await response.json();
        
        // Clear existing schedule items
        document.querySelectorAll('.schedule-item').forEach(item => item.remove());
        
        // Add new schedule items
        schedules.forEach(schedule => {
            const cell = document.querySelector(
                `.schedule-cell[data-room-id="${schedule.roomId}"][data-day="${schedule.day}"][data-slot="${schedule.slot}"]`
            );
            
            if (cell) {
                const scheduleItem = document.createElement('div');
                scheduleItem.className = 'schedule-item';
                scheduleItem.textContent = `${schedule.moduleName} - ${schedule.teacherName}`;
                scheduleItem.title = `${schedule.moduleName}\nTeacher: ${schedule.teacherName}\nTime: ${schedule.startTime} - ${schedule.endTime}`;
                cell.appendChild(scheduleItem);
            }
        });
    } catch (error) {
        console.error('Error loading schedule:', error);
    }
} 