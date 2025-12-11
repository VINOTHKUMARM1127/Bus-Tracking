import mongoose from 'mongoose';

const AlertSchema = new mongoose.Schema(
  {
    type: { 
      type: String, 
      enum: ['overspeed', 'out_of_route', 'other'], 
      required: true 
    },
    driverId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    tripId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Trip' 
    },
    routeId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Route' 
    },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    // For overspeed alerts
    speed: { type: Number },
    speedLimit: { type: Number },
    // For out-of-route alerts
    distanceFromRoute: { type: Number }, // meters
    message: { type: String, required: true },
    severity: { 
      type: String, 
      enum: ['low', 'medium', 'high'], 
      default: 'medium' 
    },
    acknowledged: { type: Boolean, default: false },
    acknowledgedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    acknowledgedAt: { type: Date }
  },
  { timestamps: true }
);

AlertSchema.index({ driverId: 1, createdAt: -1 });
AlertSchema.index({ type: 1, acknowledged: 1 });
AlertSchema.index({ createdAt: -1 });

export const Alert = mongoose.model('Alert', AlertSchema);

