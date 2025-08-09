import mongoose, { Schema, models } from "mongoose";

const AppointmentSchema = new Schema(
  {
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    slotEnd: { type: Date, required: true },
    slotStart: { type: Date, required: true },
    description : { type: String, required: true },
  },
  { timestamps: true }
);

export default models.Appointment || mongoose.model("Appointment", AppointmentSchema);
