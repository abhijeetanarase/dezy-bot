import mongoose from 'mongoose';
export const DoctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    specialties: [{ type: String, required: true }],
    email: { type: String, required: true },
    phone: { type: String, required: true },
    experience: { type: String, required: true },
    clinic: { type: String, required: true },
    qualifications: { type: String, required: true },
    isAvailable: { type: Boolean, required: true },
});

export default mongoose.models.Doctor || mongoose.model('Doctor', DoctorSchema);
