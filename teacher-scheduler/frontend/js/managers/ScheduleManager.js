import config from '../config.js';

export default class ScheduleManager {
    constructor() {
        this.affectations = [];
        this.modules = [];
        this.teachers = [];
        this.rooms = [];
        this.sections = [];
        this.groups = [];
        this.specialities = [];
        this.levels = [];
        this.currentYear = null;
        this.currentSemester = null;
        
        this.initialize();
    }

    async initialize() {
        // Load initial data
        await Promise.all([
            this.loadAffectations(),
            this.loadModules(),
            this.loadTeachers(),
            this.loadRooms(),
            this.loadSections(),
            this.loadGroups(),
            this.loadSpecialities(),
            this.loadLevels()
        ]);

        // Set up event listeners
        this.setupEventListeners();
    }

    async loadAffectations() {
        try {
            const response = await fetch(`${config.backendUrl}/api/affectations`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            this.affectations = await response.json();
        } catch (error) {
            console.error('Error loading affectations:', error);
        }
    }

    async loadModules() {
        try {
            const response = await fetch(`${config.backendUrl}/api/modules`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            this.modules = await response.json();
        } catch (error) {
            console.error('Error loading modules:', error);
        }
    }

    async loadTeachers() {
        try {
            const response = await fetch(`${config.backendUrl}/api/teachers`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            this.teachers = await response.json();
        } catch (error) {
            console.error('Error loading teachers:', error);
        }
    }

    async loadRooms() {
        try {
            const response = await fetch(`${config.backendUrl}/api/rooms`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            this.rooms = await response.json();
        } catch (error) {
            console.error('Error loading rooms:', error);
        }
    }

    async loadSections() {
        try {
            const response = await fetch(`${config.backendUrl}/api/sections`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            this.sections = await response.json();
        } catch (error) {
            console.error('Error loading sections:', error);
        }
    }

    async loadGroups() {
        try {
            const response = await fetch(`${config.backendUrl}/api/groups`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            this.groups = await response.json();
        } catch (error) {
            console.error('Error loading groups:', error);
        }
    }

    async loadSpecialities() {
        try {
            const response = await fetch(`${config.backendUrl}/api/specialities`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            this.specialities = await response.json();
        } catch (error) {
            console.error('Error loading specialities:', error);
        }
    }

    async loadLevels() {
        try {
            const response = await fetch(`${config.backendUrl}/api/levels`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            this.levels = await response.json();
        } catch (error) {
            console.error('Error loading levels:', error);
        }
    }

    setupEventListeners() {
        // Listen for cell clicks
        document.addEventListener('click', (e) => {
            const cell = e.target.closest('.schedule-cell');
            if (cell) {
                this.handleCellClick(cell);
            }
        });

        // Listen for year/semester changes
        document.getElementById('academicYearSelect').addEventListener('change', (e) => {
            this.currentYear = e.target.value;
            this.updateSchedule();
        });

        document.getElementById('semesterSelect').addEventListener('change', (e) => {
            this.currentSemester = e.target.value;
            this.updateSchedule();
        });
    }

    handleCellClick(cell) {
        const roomId = cell.dataset.roomId;
        const day = cell.dataset.day;
        const slot = cell.dataset.slot;

        // Get available affectations for the current year and semester
        const availableAffectations = this.getAvailableAffectations(roomId, day, slot);

        if (availableAffectations.length === 0) {
            alert('No available affectations for this time slot');
            return;
        }

        // Create and show dropdown
        this.showScheduleDropdown(cell, availableAffectations);
    }

    getAvailableAffectations(roomId, day, slot) {
        // Filter affectations based on:
        // 1. Current academic year and semester
        // 2. Teacher availability (no conflicts)
        // 3. Room availability (no conflicts)
        const availableAffectations = [];
        
        // Get room type
        const room = this.rooms.find(r => r._id === roomId);
        if (!room) return availableAffectations;

        // Map room type to session type
        const sessionTypeMap = {
            'AMPHITHEATER': 'lecture',
            'CLASSROOM': 'tutorial',
            'LAB': 'workshop'
        };
        const sessionType = sessionTypeMap[room.type];
        
        this.affectations.forEach(teacherAffectation => {
            teacherAffectation.affectations.forEach(affectation => {
                // Check year and semester
                // if (affectation.academicYear !== this.currentYear || 
                //     affectation.semester !== parseInt(this.currentSemester)) {
                //     return;
                // }

                // Check if teacher is available
                const teacherConflicts = this.checkTeacherConflicts(
                    teacherAffectation.teacherid,
                    day,
                    slot
                );
                if (teacherConflicts) return;

                // Check if room is available
                const roomConflicts = this.checkRoomConflicts(
                    roomId,
                    day,
                    slot
                );
                if (roomConflicts) return;

                // Get module to find its level
                const module = this.modules.find(m => m._id === affectation.module._id);
                if (!module) return;

                // Get all sections/groups in the module's level
                if (room.type === 'AMPHITHEATER') {
                    // For amphitheaters, get all sections in the level
                    const levelSections = this.sections.filter(s => s.levelid._id === module.levelid._id);
                    levelSections.forEach(section => {
                        availableAffectations.push({
                            ...affectation,
                            teacher: {
                                _id: teacherAffectation.teacherid,
                                firstName: teacherAffectation.teacherName.split(' ')[0],
                                lastName: teacherAffectation.teacherName.split(' ')[1] || ''
                            },
                            sessionType: sessionType,
                            section: section
                        });
                    });
                } else {
                    // For classrooms and labs, get all groups in sections of the level
                    const levelSections = this.sections.filter(s => s.levelid._id === module.levelid._id);
                    levelSections.forEach(section => {
                        const sectionGroups = this.groups.filter(g => g.sectionid._id === section._id);
                        sectionGroups.forEach(group => {
                            availableAffectations.push({
                                ...affectation,
                                teacher: {
                                    _id: teacherAffectation.teacherid,
                                    firstName: teacherAffectation.teacherName.split(' ')[0],
                                    lastName: teacherAffectation.teacherName.split(' ')[1] || ''
                                },
                                sessionType: sessionType,
                                section: section,
                                group: group
                            });
                        });
                    });
                }
            });
        });

        return availableAffectations;
    }

    checkTeacherConflicts(teacherId, day, slot) {
        // Check if teacher has any existing schedules at this time
        return document.querySelector(
            `.schedule-cell[data-day="${day}"][data-slot="${slot}"] .schedule-item[data-teacher-id="${teacherId}"]`
        ) !== null;
    }

    checkRoomConflicts(roomId, day, slot) {
        // Check if room has any existing schedules at this time
        return document.querySelector(
            `.schedule-cell[data-room-id="${roomId}"][data-day="${day}"][data-slot="${slot}"] .schedule-item`
        ) !== null;
    }

    showScheduleDropdown(cell, affectations) {
        // Remove any existing dropdown
        this.removeExistingDropdown();

        // Create dropdown element
        const dropdown = document.createElement('div');
        dropdown.className = 'schedule-dropdown';
        
        // Add affectation options
        affectations.forEach(affectation => {
            const option = document.createElement('div');
            option.className = 'schedule-option';
            
            // Get room type
            const room = this.rooms.find(r => r._id === cell.dataset.roomId);
            const isAmphitheater = room?.type === 'AMPHITHEATER';

            // Get level
            const levelInitial = `${this.levels.find(x=>x._id ==affectation.module.levelid).code}`;
            
            // Format the option text based on room type
            const sessionType = affectation.sessionType.charAt(0).toUpperCase() + affectation.sessionType.slice(1);
            const groupInfo = isAmphitheater ? 
                `S ${affectation.section.number}` : 
                `S ${affectation.section.number} - G ${affectation.group.name}`;
            
            option.textContent = `${levelInitial} ${affectation.module.code} - ${affectation.teacher.firstName} ${affectation.teacher.lastName} (${sessionType} - ${groupInfo})`;
            option.addEventListener('click', () => this.handleScheduleSelection(cell, affectation));
            dropdown.appendChild(option);
        });

        // Position and show dropdown
        const cellRect = cell.getBoundingClientRect();
        dropdown.style.position = 'absolute';
        dropdown.style.top = `${cellRect.bottom}px`;
        dropdown.style.left = `${cellRect.left}px`;
        dropdown.style.minWidth = `${cellRect.width}px`;
        dropdown.style.width = 'auto';
        dropdown.style.maxWidth = '400px'; // Increased max width to accommodate longer text
        
        // Ensure dropdown stays within viewport
        const dropdownRect = dropdown.getBoundingClientRect();
        if (dropdownRect.right > window.innerWidth) {
            dropdown.style.left = `${window.innerWidth - dropdownRect.width - 10}px`;
        }
        
        document.body.appendChild(dropdown);
    }

    removeExistingDropdown() {
        const existingDropdown = document.querySelector('.schedule-dropdown');
        if (existingDropdown) {
            existingDropdown.remove();
        }
    }

    async handleScheduleSelection(cell, affectation) {
        try {
            const scheduleData = {
                teacherid: affectation.teacher._id,
                moduleid: affectation.module._id,
                //semesterid: this.currentSemester,
                yearid: this.currentYear,
                type: affectation.sessionType,
                day: cell.dataset.day,
                start: this.getTimeSlotStart(cell.dataset.slot),
                end: this.getTimeSlotEnd(cell.dataset.slot),
                roomid: cell.dataset.roomId,
                sectionid: affectation.section._id,
                groupid: affectation.group?._id
            };

            const response = await fetch(`${config.backendUrl}/api/schedules`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(scheduleData)
            });

            if (!response.ok) {
                throw new Error('Failed to create schedule');
            }

            // Update the UI
            this.updateSchedule();
            this.removeExistingDropdown();
        } catch (error) {
            console.error('Error creating schedule:', error);
            alert('Failed to create schedule');
        }
    }

    getTimeSlotStart(slot) {
        const times = ['08:30', '10:00', '11:30', '13:00', '14:30'];
        return times[parseInt(slot)];
    }

    getTimeSlotEnd(slot) {
        const times = ['10:00', '11:30', '13:00', '14:30', '16:00'];
        return times[parseInt(slot)];
    }

    async updateSchedule() {
        try {
            const response = await fetch(`${config.backendUrl}/api/schedules?academicyearid=${this.currentYear}&semester=${this.currentSemester}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch schedules');
            }

            const schedules = await response.json();
            
            // Clear existing schedule items
            document.querySelectorAll('.schedule-item').forEach(item => item.remove());
            
            // Add new schedule items
            schedules.forEach(schedule => {
                if(!schedule.roomid) return;
                const cell = document.querySelector(`[data-room-id="${schedule.roomid._id}"][data-day="${schedule.day}"][data-slot="${this.getSlotFromTime(schedule.start)}"]`);
                if (cell) {
                    const scheduleItem = document.createElement('div');
                    scheduleItem.className = 'schedule-item';
                    scheduleItem.dataset.scheduleId = schedule._id;
                    
                    // Get module and teacher info
                    const module = this.modules.find(m => m._id === schedule.moduleid._id);
                    const teacher = this.teachers.find(t => t._id === schedule.teacherid._id);
                    const level = this.levels.find(l => l._id === module.levelid._id);
                    
                    if (module && teacher) {
                        // Get section and group info
                        const section = this.sections.find(s => s._id === schedule.sectionid._id);
                        const group = schedule.groupid ? this.groups.find(g => g._id === schedule.groupid._id) : null;
                        
                        // Add level-based class
                        const levelNumber = module.levelid.code.match(/\d+/)[0];
                        scheduleItem.classList.add(`level-${levelNumber}`);
                        
                        // Format the display text
                        const sectionInitial = `S${section.number}`;
                        const groupInitial = group ? `${group.name}` : '';
                        const levelInitial = `${module.levelid.code}`;
                        const teacherInitial = `${teacher.firstName} ${teacher.lastName}`;
                        
                        // Create the concise display text
                        scheduleItem.textContent = `${sectionInitial}${groupInitial} ${levelInitial} ${module.code} ${teacherInitial}`;

                        // Set background color from level
                        scheduleItem.style.backgroundColor = level.color;
                        
                        // Keep the detailed info in the tooltip
                        const sessionType = schedule.type.charAt(0).toUpperCase() + schedule.type.slice(1);
                        const groupInfo = group ? 
                            `Section ${section.number} - Group ${group.name}` : 
                            `Section ${section.number}`;
                        scheduleItem.title = `${module.name}\nTeacher: ${teacher.firstName} ${teacher.lastName}\nType: ${sessionType}\n${groupInfo}\nTime: ${schedule.start} - ${schedule.end}`;

                        // Add delete button
                        const deleteBtn = document.createElement('button');
                        deleteBtn.className = 'schedule-delete-btn';
                        deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
                        deleteBtn.title = 'Delete Schedule';
                        deleteBtn.addEventListener('click', (e) => {
                            e.stopPropagation(); // Prevent cell click event
                            this.deleteSchedule(schedule._id);
                        });
                        scheduleItem.appendChild(deleteBtn);
                    } else {
                        scheduleItem.textContent = 'Schedule Item';
                    }
                    
                    cell.appendChild(scheduleItem);
                }
            });
        } catch (error) {
            console.error('Error updating schedule:', error);
            alert('Failed to update schedule display');
        }
    }

    async deleteSchedule(scheduleId) {
        if (!confirm('Are you sure you want to delete this schedule?')) {
            return;
        }

        try {
            const response = await fetch(`${config.backendUrl}/api/schedules/${scheduleId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete schedule');
            }

            // Update the UI
            this.updateSchedule();
        } catch (error) {
            console.error('Error deleting schedule:', error);
            alert('Failed to delete schedule');
        }
    }

    getSlotFromTime(time) {
        const times = ['08:30', '10:00', '11:30', '13:00', '14:30'];
        return times.indexOf(time);
    }
} 