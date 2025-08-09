import Appointment from "../models/Appointment";

export type Slot = { start: string; end: string };

export function generateDaySlots(date: Date, startHour = 9, endHour = 18, slotMinutes = 30) {
  const slots = [];
  const current = new Date(date);
  current.setHours(startHour, 0, 0, 0);

  while (current.getHours() < endHour) {
    const slotStart = new Date(current);
    current.setMinutes(current.getMinutes() + slotMinutes);
    const slotEnd = new Date(current);

    slots.push({ start: slotStart, end: slotEnd });
  }

  return slots;
}
export async function getAvailableSlots(doctorId: string, date: Date) {
  if (!doctorId || !date) {
    throw new Error("Doctor ID and date are required to fetch available slots.");
  }

  // Normalize the input date (remove time components)
  const dayStart = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayEnd = new Date(dayStart);
  dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

  // Fetch booked appointments
  const bookedAppointments = await Appointment.find({
    doctor: doctorId,
    slotStart: { $gte: dayStart, $lt: dayEnd }
  });

  // Generate all possible slots
  const allSlots = generateDaySlots(date);

  // Filter out booked slots
  const availableSlots = allSlots.filter(slot => {
    const isBooked = bookedAppointments.some(appointment => {
      return (
        appointment.slotStart.getTime() === slot.start.getTime() &&
        appointment.slotEnd.getTime() === slot.end.getTime()
      );
    });
    return !isBooked;
  });

  return availableSlots;
}
