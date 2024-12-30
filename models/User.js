import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firebaseId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: false,
  },
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Prevent duplicate model initialization
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User; 