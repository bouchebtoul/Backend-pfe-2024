require('../../models/Room');
// Migration: Convert Room.type from string to array of strings
module.exports = {
  async up(mongoose) {
    const Room = mongoose.model('Room');
    const typeMap = {
      CLASSROOM: ['TUTORIAL'],
      LAB: ['WORKSHOP'],
      AMPHITHEATER: ['LECTURE']
    };
    const rooms = await Room.find({});
    for (const room of rooms) {
      if (typeof room.type === 'string' && typeMap[room.type]) {
        room.type = typeMap[room.type];
        await room.save();
      }
    }
  },
  async down(mongoose) {
    const Room = mongoose.model('Room');
    const reverseMap = {
      TUTORIAL: 'CLASSROOM',
      WORKSHOP: 'LAB',
      LECTURE: 'AMPHITHEATER'
    };
    const rooms = await Room.find({});
    for (const room of rooms) {
      if (Array.isArray(room.type) && room.type.length === 1 && reverseMap[room.type[0]]) {
        room.type = reverseMap[room.type[0]];
        await room.save();
      }
    }
  }
}; 