import mongoose from 'mongoose';

const StopSchema = new mongoose.Schema({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  name: { type: String, required: true },
  etaOrder: { type: Number, required: true } // Order for ETA calculation
}, { _id: false });

const GeofenceSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['polygon', 'circle'], 
    required: true 
  },
  coords: {
    // For polygon: [[lat, lng], [lat, lng], ...]
    // For circle: { center: [lat, lng], radius: number (meters) }
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
}, { _id: false });

const RouteSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    stops: [StopSchema],
    geofence: GeofenceSchema,
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    // Speed limit for this route (km/h), optional - uses global if not set
    speedLimit: { type: Number },
    // Assigned driver (optional - can assign later)
    assignedDriver: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

RouteSchema.index({ createdBy: 1 });
RouteSchema.index({ assignedDriver: 1 });
RouteSchema.index({ isActive: 1 });

export const Route = mongoose.model('Route', RouteSchema);

