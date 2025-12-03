import mongoose from "mongoose";

const maintenanceCenterSchema = mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },

  workingHours: { type: [String], default: [] },
  services: { type: [String], default: [] },

  evaluation: { type: Number, default: 0 },

  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  createAt: { type: Date, default: Date.now },
  lastUpdateAt: { type: Date, default: Date.now },
});

let maintenanceCenterModel = mongoose.model(
  "MaintenanceCenter",
  maintenanceCenterSchema
);

export default maintenanceCenterModel;
