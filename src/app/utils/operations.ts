import Appointment from "../models/Appointment";
import User from "../models/User";



const getALLDoctrors = async (clinicId:string)=>{
     const doctors = await User.find({ role: 'doctor' , clinic : clinicId }).select('name email phone skills experience education certifications bio socialLinks address');
    return doctors;
}


const getDoctorById = async (doctorId:string)=>{
    const doctor = await User.findById(doctorId).select('name email phone skills experience education certifications bio socialLinks address');
    return doctor;
}

const getAvailableDoctors = async (clinicId:string, date:Date)=>{
    const doctors = await User.find({ role: 'doctor' , clinic : clinicId  , isAvailable : true}).select('name email phone skills experience education certifications bio socialLinks address');
    return doctors;
}

const getDoctorAppointments = async (doctorId:string)=>{
    const appointments = await Appointment.findOne()
}

const bookAppointment = async (doctorId:string, patientId:string, clinicId:string, date:Date, description:string)=>{
    const appointment = await User.findByIdAndUpdate(doctorId, {
        $push: {
            appointments: {
                patient: patientId,
                clinic: clinicId,
                date,
                description,
                status: 'pending'
            }
        }
    }, { new: true });
    return appointment;
}

export {getALLDoctrors , getDoctorById , getAvailableDoctors , getDoctorAppointments , bookAppointment}

