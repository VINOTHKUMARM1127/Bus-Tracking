import Joi from 'joi';

// Route validation schemas
export const routeSchema = Joi.object({
  name: Joi.string().trim().required().min(1).max(200),
  stops: Joi.array()
    .items(
      Joi.object({
        lat: Joi.number().min(-90).max(90).required(),
        lng: Joi.number().min(-180).max(180).required(),
        name: Joi.string().trim().required().min(1),
        etaOrder: Joi.number().integer().min(0).required()
      })
    )
    .min(2)
    .required(),
  geofence: Joi.object({
    type: Joi.string().valid('polygon', 'circle').required(),
    coords: Joi.alternatives()
      .try(
        // Polygon: array of [lat, lng]
        Joi.array().items(
          Joi.array().items(Joi.number()).length(2).required()
        ).min(3),
        // Circle: { center: [lat, lng], radius: number }
        Joi.object({
          center: Joi.array().items(Joi.number()).length(2).required(),
          radius: Joi.number().positive().required()
        })
      )
      .required()
  }).optional(),
  speedLimit: Joi.number().positive().optional(),
  assignedDriver: Joi.string().optional()
});

// Trip validation schemas
export const startTripSchema = Joi.object({
  routeId: Joi.string().required(),
  busId: Joi.string().optional()
});

// Location update schema
export const locationUpdateSchema = Joi.object({
  lat: Joi.number().min(-90).max(90).required(),
  lng: Joi.number().min(-180).max(180).required(),
  speed: Joi.number().min(0).optional(),
  heading: Joi.number().min(0).max(360).optional(),
  accuracy: Joi.number().min(0).optional()
});

// Bulk location sync schema
export const bulkLocationSchema = Joi.object({
  locations: Joi.array()
    .items(locationUpdateSchema)
    .min(1)
    .max(100)
    .required()
});

