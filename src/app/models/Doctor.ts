// models/Doctor.ts
import mongoose from 'mongoose';

interface IDoctor extends mongoose.Document {
    name: string;
    specialties: string[];
    email: string;
    phone: string;
    experience: string;
    clinic: string;
    qualifications: string[];
    isAvailable: boolean;
}

const DoctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    specialties: [{ type: String, required: true }],
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    experience: { type: String, required: true },
    clinic: { type: String, required: true },
    qualifications: [{
        type: String,
        required: true
    }],
    isAvailable: { type: Boolean, required: true, default: true }
}, { timestamps: true });



export default mongoose.models.Doctor as mongoose.Model<IDoctor> ||
    mongoose.model<IDoctor>('Doctor', DoctorSchema);