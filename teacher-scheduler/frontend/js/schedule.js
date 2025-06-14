import config from './config.js';

document.addEventListener('DOMContentLoaded', () => {
    loadAcademicYears();
    loadSemesters();
    loadRooms();
});

async function loadAcademicYears() {
    try {
        const response = await fetch(`${config.backendUrl}/api/academic-years`);
        const years = await response.json();
        const select = document.getElementById('academicYearSelect');
        
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year.id;
            option.textContent = year.name;
            select.appendChild(option);
        });

        select.addEventListener('change', loadSchedule);
    } catch (error) {
        console.error('Error loading academic years:', error);
    }
}

async function loadSemesters() {
    try {
        const response = await fetch(`${config.backendUrl}/api/semesters`);
        const semesters = await response.json();
        const select = document.getElementById('semesterSelect');
        
        semesters.forEach(semester => {
            const option = document.createElement('option');
            option.value = semester.id;
            option.textContent = semester.name;
            select.appendChild(option);
        });

        select.addEventListener('change', loadSchedule);
    } catch (error) {
        console.error('Error loading semesters:', error);
    }
}

async function loadRooms() {
    try {
        const response = await fetch(`${config.backendUrl}/api/rooms`);
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
                    cell.dataset.roomId = room.id;
                    cell.dataset.day = day;
                    cell.dataset.slot = slot;
                    scheduleCells.appendChild(cell);
                }
            }
        });
    } catch (error) {
        console.error('Error loading rooms:', error);
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