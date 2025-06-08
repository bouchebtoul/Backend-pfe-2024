class RoomsManager {
    constructor() {
        this.rooms = [];
        this.currentRoom = null;
        this.modal = null;
        this.initialize();
    }

    async initialize() {
        await this.loadRooms();
        this.modal = document.getElementById('roomModal');
        this.setupEventListeners();
    }

    async loadRooms() {
        try {
            const response = await fetch('http://localhost:5000/api/rooms', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            this.rooms = await response.json();
            this.renderRoomsTable();
        } catch (error) {
            console.error('Error loading rooms:', error);
        }
    }

    renderRoomsTable() {
        const tableBody = document.getElementById('roomsTableBody');
        tableBody.innerHTML = this.rooms.map(room => `
            <tr>
                <td>${room.roomNumber}</td>
                <td>${room.capacity}</td>
                <td>${this.formatRoomType(room.type)}</td>
                <td>
                    <button class="btn-edit" data-id="${room._id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" data-id="${room._id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    formatRoomType(type) {
        return type.charAt(0) + type.slice(1).toLowerCase();
    }

    setupEventListeners() {
        // Add room button
        document.getElementById('addRoomBtn').addEventListener('click', () => {
            this.currentRoom = null;
            document.getElementById('roomForm').reset();
            document.getElementById('roomModalTitle').textContent = 'Add New Room';
            this.showModal();
        });

        // Close modal button
        document.querySelector('.close-modal').addEventListener('click', () => {
            this.hideModal();
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hideModal();
            }
        });

        // Form submission
        document.getElementById('roomForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveRoom();
        });

        // Edit and Delete buttons
        document.getElementById('roomsTableBody').addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (!button) return;

            const roomId = button.dataset.id;
            if (button.classList.contains('btn-edit')) {
                this.editRoom(roomId);
            } else if (button.classList.contains('btn-delete')) {
                this.deleteRoom(roomId);
            }
        });
    }

    showModal() {
        if (this.modal) {
            this.modal.classList.add('show');
        }
    }

    hideModal() {
        if (this.modal) {
            this.modal.classList.remove('show');
        }
    }

    async saveRoom() {
        const formData = {
            roomNumber: document.getElementById('roomNumber').value,
            capacity: parseInt(document.getElementById('capacity').value),
            type: document.getElementById('type').value
        };

        try {
            const url = 'http://localhost:5000/api/rooms' + (this.currentRoom ? `/${this.currentRoom._id}` : '');
            const response = await fetch(url, {
                method: this.currentRoom ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                await this.loadRooms();
                this.hideModal();
            } else {
                const error = await response.json();
                alert(error.message || 'Error saving room');
            }
        } catch (error) {
            console.error('Error saving room:', error);
            alert('Error saving room');
        }
    }

    async editRoom(roomId) {
        this.currentRoom = this.rooms.find(r => r._id === roomId);
        if (!this.currentRoom) return;

        document.getElementById('roomNumber').value = this.currentRoom.roomNumber;
        document.getElementById('capacity').value = this.currentRoom.capacity;
        document.getElementById('type').value = this.currentRoom.type;

        document.getElementById('roomModalTitle').textContent = 'Edit Room';
        this.showModal();
    }

    async deleteRoom(roomId) {
        if (!confirm('Are you sure you want to delete this room?')) return;

        try {
            const response = await fetch(`http://localhost:5000/api/rooms/${roomId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                await this.loadRooms();
            } else {
                const error = await response.json();
                alert(error.message || 'Error deleting room');
            }
        } catch (error) {
            console.error('Error deleting room:', error);
            alert('Error deleting room');
        }
    }
}
export default RoomsManager; 
// Initialize when the section is loaded
// window.roomsManager = new RoomsManager(); 