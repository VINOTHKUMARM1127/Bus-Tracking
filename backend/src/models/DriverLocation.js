import mongoose from 'mongoose';

const DriverLocationSchema = new mongoose.Schema(
  {
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    busNumber: { type: String },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    speed: { type: Number },
    heading: { type: Number },
    accuracy: { type: Number },
    isTracking: { type: Boolean, default: true }
  },
  { timestamps: true }
);

DriverLocationSchema.index({ driver: 1, updatedAt: -1 });

export const DriverLocation = mongoose.model('DriverLocation', DriverLocationSchema);


