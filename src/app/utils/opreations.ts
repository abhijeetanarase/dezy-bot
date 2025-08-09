import { NextResponse } from "next/server";
import Appointment from "../models/Appointment";
import { getAvailableSlots } from "../lib/calender";
import Doctor from "../models/Doctor";
import { ParsedResult } from "../api/appointments/route";

export async function handleAvailableDoctors(result: ParsedResult) {
    const doctors = await Doctor.find().select('name');
    return NextResponse.json({ 
        data: doctors, 
        message: result.message 
    });
}

export async function handleSelectDoctor(result: ParsedResult) {
    const { name } = result.function_call.arguments;
    const doctor = await Doctor.findOne({ name }).select(
        'name email phone skills experience education certifications bio socialLinks address'
    );
    return NextResponse.json({ 
        data: doctor, 
        message: result.message 
    });
}

export async function handleBookAppointment(result: ParsedResult) {
    const { doctorId, patientId, description, start, end } = result.function_call.arguments;

    if (!doctorId || !patientId || !start || !end) {
        return NextResponse.json(
            { error: "Doctor ID, patient ID, start time and end time are required" },
            { status: 400 }
        );
    }

    const startUTC = new Date(String(start));
    const endUTC = new Date(String(end));
    
    // Convert from IST to UTC (if input is in IST)
    startUTC.setMinutes(startUTC.getMinutes() - 330);
    endUTC.setMinutes(endUTC.getMinutes() - 330);

    // Check for existing appointments
    const existingAppointment = await Appointment.findOne({
        doctor: doctorId,
        $or: [
            { slotStart: { $lt: endUTC }, slotEnd: { $gt: startUTC } }
        ]
    });

    if (existingAppointment) {
        return NextResponse.json(
            { 
                error: "Time slot already booked",
                conflict: {
                    existing: {
                        start: existingAppointment.slotStart.toISOString(),
                        end: existingAppointment.slotEnd.toISOString()
                    }
                }
            },
            { status: 409 }
        );
    }

    // Create new appointment
    const newAppointment = new Appointment({
        doctor: doctorId,
        patient: patientId,
        slotStart: startUTC,
        slotEnd: endUTC,
        description,
    });

    await newAppointment.save();

    return NextResponse.json({
        success: true,
        message: "Appointment booked successfully",
        appointment: {
            id: newAppointment._id,
            utc: {
                start: startUTC.toISOString(),
                end: endUTC.toISOString()
            },
            description
        }
    });
}

export async function handleCheckSlotAvailability(result: ParsedResult) {
    const { doctorId, start, end } = result.function_call.arguments;

    if (!doctorId || !start || !end) {
        return NextResponse.json(
            { error: "Doctor ID, start and end time are required" },
            { status: 400 }
        );
    }

    const startDate = new Date(String(start));
    const endDate = new Date(String(end));
    startDate.setMinutes(startDate.getMinutes() - 330);
    endDate.setMinutes(endDate.getMinutes() - 330);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return NextResponse.json(
            { error: "Invalid date format. Please use ISO format" },
            { status: 400 }
        );
    }

    const existingAppointment = await Appointment.findOne({
        doctor: doctorId,
        $or: [
            { slotStart: { $gte: startDate, $lt: endDate } },
            { slotEnd: { $gt: startDate, $lte: endDate } },
            { slotStart: { $lte: startDate }, slotEnd: { $gte: endDate } }
        ]
    });

    if (existingAppointment) {
        return NextResponse.json(
            {
                available: false,
                message: "Slot already booked",
                conflictingAppointment: {
                    id: existingAppointment._id,
                    start: existingAppointment.slotStart,
                    end: existingAppointment.slotEnd
                }
            },
            { status: 409 }
        );
    }

    return NextResponse.json({
        available: true,
        message: "Slot is available"
    });
}

export async function handleCancelAppointment(result: ParsedResult) {
    const { patientId, doctorId, start } = result.function_call.arguments;
    const appointment = await Appointment.findOneAndDelete({ 
        patient: patientId, 
        doctor: doctorId, 
        slotStart: new Date(String(start)) 
    });
    
    if (!appointment) {
        return NextResponse.json({ 
            message: "Appointment that you want to cancel does not exist" 
        });
    }
    
    return NextResponse.json({ 
        message: result.message, 
        data: appointment 
    });
}

export async function handleGetAllAvailableSlots(result: ParsedResult) {
    const { doctorId, date } = result.function_call.arguments;
    const slots = await getAvailableSlots(String(doctorId), new Date(String(date)));
    return NextResponse.json({ 
        slots: slots, 
        message: result.message, 
        length: slots.length 
    });
}

export async function handleGetDoctorAppointments(result: ParsedResult) {
    const { doctorId } = result.function_call.arguments;
    const appointments = await Appointment.find({ doctor: doctorId })
        .populate('doctor')
        .populate('patient')
        .lean();
    return NextResponse.json({ 
        appointments: appointments, 
        message: result.message 
    });
}

export async function handleCancelAllAppointments(result: ParsedResult) {
    const { patientId } = result.function_call.arguments;
    await Appointment.deleteMany({ patient: patientId });
    return NextResponse.json({ 
        message: result.message 
    });
}

export async function handleGetPatientAppointments(result: ParsedResult) {
    const { patientId } = result.function_call.arguments;
    const appointments = await Appointment.find({ patient: patientId })
        .populate('doctor')
        .populate('patient')
        .lean();
    
    if (appointments.length === 0) {
        return NextResponse.json({ 
            message: "You have no Appointments" 
        });
    }
    
    return NextResponse.json({ 
        appointments: appointments, 
        message: result.message 
    });
}

export async function handleInfoAboutDoctor(result: ParsedResult) {
    const { doctorId } = result.function_call.arguments;
    const doctor = await Doctor.findById(doctorId).select(
        'name email phone skills experience education certifications bio socialLinks address'
    );
    
    if (!doctor) {
        return NextResponse.json({ 
            error: "Doctor not found" 
        }, { status: 404 });
    }
    
    return NextResponse.json({ 
        data: doctor, 
        message: result.message 
    });
}

export async function handleCancelAppointmentById(result: ParsedResult) {
    const { appointmentId } = result.function_call.arguments;
    const appointment = await Appointment.findByIdAndDelete(appointmentId);
    
    if (!appointment) {
        return NextResponse.json({ 
            error: "Appointment not found" 
        }, { status: 404 });
    }
    
    return NextResponse.json({ 
        message: result.message, 
        data: appointment 
    });
}

export async function handleGetDoctorsInfo(result: ParsedResult) {
    const { name } = result.function_call.arguments;
    const doctors = await Doctor.find({ name: new RegExp(String(name), 'i') });
    
    if (!doctors || doctors.length === 0) {
        return NextResponse.json({ 
            error: "Doctor not found" 
        }, { status: 404 });
    }
    
    return NextResponse.json({ 
        data: doctors, 
        message: result.message 
    });
}