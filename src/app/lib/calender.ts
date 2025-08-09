import Appointment from "../models/Appointment";

export type Slot = { start: Date; end: Date };

export function generateDaySlotsUTC(date: Date, startHour = 9, endHour = 18, slotMinutes = 30) {
  const slots: Slot[] = [];

  // Force to UTC midnight, then add startHour
  const current = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), startHour, 0, 0));

  while (current.getUTCHours() < endHour) {
    const slotStart = new Date(current);
    current.setUTCMinutes(current.getUTCMinutes() + slotMinutes);
    const slotEnd = new Date(current);

    slots.push({ start: slotStart, end: slotEnd });
  }

  return slots;
}

export async function getAvailableSlots(doctorId: string, date: Date) {
  if (!doctorId || !date) {
    throw new Error("Doctor ID and date are required to fetch available slots.");
  }

  // Day boundaries in UTC
  const dayStartUTC = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 9, 0, 0));
  const dayEndUTC = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 18, 0, 0));

  // Fetch booked appointments in UTC range
  const bookedAppointments = await Appointment.find({
    doctor: doctorId,
    slotStart: { $gte: dayStartUTC, $lt: dayEndUTC }
  });

  // Generate all possible slots in UTC
  const allSlots = generateDaySlotsUTC(date, 9, 18);

  // Filter: future slots & not booked
  const nowUTC = new Date();
  const availableSlots = allSlots.filter(slot => {
    const isFutureSlot = slot.start > nowUTC;
    const isBooked = bookedAppointments.some(appt =>
      appt.slotStart.getTime() === slot.start.getTime() &&
      appt.slotEnd.getTime() === slot.end.getTime()
    );
    return isFutureSlot && !isBooked;
  });

  return availableSlots;
}
