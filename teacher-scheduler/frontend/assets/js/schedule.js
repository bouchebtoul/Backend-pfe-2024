document.addEventListener('DOMContentLoaded', () => {
    loadAcademicYears();
    loadSemesters();
    loadRooms();
});

async function loadAcademicYears() {
    try {
        const response = await fetch('/api/academic-years');
        const years = await response.json();
        const select = document.getElementById('academicYearSelect');
        
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year.id;
            option.textContent = year.year;
            select.appendChild(option);
        });

        select.addEventListener('change', loadSchedule);
    } catch (error) {
        console.error('Error loading academic years:', error);
    }
}

async function loadSemesters() {
    try {
        const response = await fetch('/api/semesters');
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
        const response = await fetch('/api/rooms');
        const rooms = await response.json();
        const roomsGrid = document.getElementById('roomsGrid');
        
        rooms.forEach(room => {
            const roomRow = document.createElement('div');
            roomRow.className = 'room-row';
            
            // Create cells for each day
            for (let i = 0; i < 5; i++) {
                const cell = document.createElement('div');
                cell.className = 'room-cell';
                cell.dataset.roomId = room.id;
                cell.dataset.day = i;
                
                const roomName = document.createElement('div');
                roomName.className = 'room-name';
                roomName.textContent = room.name;
                cell.appendChild(roomName);
                
                roomRow.appendChild(cell);
            }
            
            roomsGrid.appendChild(roomRow);
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
        const response = await fetch(`/api/schedules?academicYearId=${academicYearId}&semesterId=${semesterId}`);
        const schedules = await response.json();
        
        // Clear existing schedule items
        document.querySelectorAll('.schedule-item').forEach(item => item.remove());
        
        // Add new schedule items
        schedules.forEach(schedule => {
            const cell = document.querySelector(`.room-cell[data-room-id="${schedule.roomId}"][data-day="${schedule.day}"]`);
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