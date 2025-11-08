import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Define User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  image: { type: String },
  role: { 
    type: String, 
    enum: ['admin', 'manager', 'user'], 
    default: 'user' 
  },
  location: { type: String },
  bookings: [
    {
      placeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Place' },
      seatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seat' },
      tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table' },
      timeframe: {
        start: { type: Date, required: true },
        end: { type: Date, required: true }
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Create model from connection
export const createUserModel = (connection) => {
    return connection.model('User', userSchema);
};

export default userSchema;


