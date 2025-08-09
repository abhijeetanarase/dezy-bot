import Appointment from "../models/Appointment";

export type Slot = { start: Date; end: Date };

export function generateDaySlots(date: Date, startHour = 9, endHour = 18, slotMinutes = 30) {
  const slots: Slot[] = [];
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

  // Normalize the input date (start of the day in UTC)
  const dayStart = new Date(date);
  dayStart.setHours(9, 0, 0, 0); // Start from 9 AM local time
  const dayEnd = new Date(date);
  dayEnd.setHours(18, 0, 0, 0); // End at 6 PM local time

  // Fetch booked appointments
  const bookedAppointments = await Appointment.find({
    doctor: doctorId,
    slotStart: { $gte: dayStart, $lt: dayEnd }
  });

  // Generate all possible slots for that day
  const allSlots = generateDaySlots(date, 9, 18);

  // Filter out:
  // 1) Already booked slots
  // 2) Slots that are in the past (only for today)
  const now = new Date();
  const availableSlots = allSlots.filter(slot => {
    const isFutureSlot = slot.start > now; // Remove past slots
    const isBooked = bookedAppointments.some(appointment =>
      appointment.slotStart.getTime() === slot.start.getTime() &&
      appointment.slotEnd.getTime() === slot.end.getTime()
    );

    return isFutureSlot && !isBooked;
  });

  return availableSlots;
}
