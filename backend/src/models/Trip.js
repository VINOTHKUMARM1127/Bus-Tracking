import mongoose from 'mongoose';

const LocationPointSchema = new mongoose.Schema({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  ts: { type: Date, required: true, default: Date.now },
  speed: { type: Number }, // km/h
  heading: { type: Number },
  accuracy: { type: Number }
}, { _id: false });

const TripSchema = new mongoose.Schema(
  {
    driverId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    routeId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Route', 
      required: true 
    },
    busId: { type: String }, // Bus number/identifier
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    startLocation: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    endLocation: {
      lat: { type: Number },
      lng: { type: Number }
    },
    distanceMeters: { type: Number, default: 0 },
    avgSpeed: { type: Number }, // km/h
    maxSpeed: { type: Number }, // km/h
    status: { 
      type: String, 
      enum: ['ongoing', 'completed'], 
      default: 'ongoing' 
    },
    locationPoints: [LocationPointSchema]
  },
  { timestamps: true }
);

TripSchema.index({ driverId: 1, status: 1 });
TripSchema.index({ routeId: 1 });
TripSchema.index({ startTime: -1 });
TripSchema.index({ status: 1 });

export const Trip = mongoose.model('Trip', TripSchema);

