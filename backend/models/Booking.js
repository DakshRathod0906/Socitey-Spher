import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: "Society", required: true },
    amenityId: { type: mongoose.Schema.Types.ObjectId, ref: "Amenity", required: true },
    residentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    bookingDate: { type: String, required: true }, // YYYY-MM-DD
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    status: { type: String, enum: ["confirmed", "cancelled"], default: "confirmed" },
  },
  { timestamps: true }
);

bookingSchema.index({ amenityId: 1, bookingDate: 1, startTime: 1 }, { unique: true });

export default mongoose.model("Booking", bookingSchema);
