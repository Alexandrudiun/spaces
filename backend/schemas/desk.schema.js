import mongoose from "mongoose";

// Define Desk Schema
const deskSchema = new mongoose.Schema({
  locationId: { 
    type: String, 
  },
  bookings: [{
    start: { 
      type: Date, 
     
    },
    end: { 
      type: Date, 
      
    },
    status: { 
      type: String, 
      enum: ['pending', 'accepted', 'declined'], 
      default: 'pending', // Set default to 'pending' when booking is created
      //required: true 
    },
    attendees: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      //required: true // Ensure at least one attendee
    }]
  }],
}, {
  timestamps: true // Automatically manage createdAt and updatedAt for desk document
});

// Create model from connection
export const createDeskModel = (connection) => {
    return connection.model('Desk', deskSchema);
};

export default deskSchema;
