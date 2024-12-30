import mongoose from 'mongoose';

const timeSlotSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  time: {
    type: String,
    required: true,
    // Format: "HH:mm" (24-hour)
  }
});

const scheduleSchema = new mongoose.Schema({
  groupChatId: {
    type: String,
    required: true,
  },
  timeSlots: [timeSlotSchema],
  messages: {
    type: [String],
    validate: {
      validator: function(arr) {
        return arr.length <= 5;
      },
      message: 'Cannot have more than 5 messages'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Schedule = mongoose.models.Schedule || mongoose.model('Schedule', scheduleSchema);

export default Schedule; 