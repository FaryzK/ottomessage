import mongoose from 'mongoose';

const userSchedulesSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  schedules: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Schedule'
  }]
}, {
  timestamps: true
});

const UserSchedules = mongoose.models.UserSchedules || mongoose.model('UserSchedules', userSchedulesSchema);

export default UserSchedules; 