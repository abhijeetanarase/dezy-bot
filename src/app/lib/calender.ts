import Appointment from "../models/Appointment";

export type Slot = { start: Date; end: Date };

export function generateDaySlots(
  date: Date,          // Input date (treated as local time)
  startHour = 9,       // 9 AM
  endHour = 18,        // 6 PM
  slotMinutes = 30
): Slot[] {
  const slots: Slot[] = [];
  
  // Create a copy of the date and set to midnight
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  
  // Calculate start and end times
  const startTime = new Date(dayStart);
  startTime.setHours(startHour, 0, 0, 0);
  
  const endTime = new Date(dayStart);
  endTime.setHours(endHour, 0, 0, 0);

  let current = new Date(startTime);

  while (current < endTime) {
    const slotStart = new Date(current);
    current = new Date(current.getTime() + slotMinutes * 60 * 1000);
    const slotEnd = new Date(current);

    slots.push({ 
      start: slotStart,
      end: slotEnd
    });
  }

  return slots;
}

export async function getAvailableSlots(doctorId: string, date: Date): Promise<Slot[]> {
  if (!doctorId || !date) {
    throw new Error("Doctor ID and date are required to fetch available slots.");
  }

  // Generate all possible slots for the day (9 AM to 6 PM)
  const allSlots = generateDaySlots(date);

  // Get the start and end of the day for querying
  const dayStart = allSlots[0].start;
  const dayEnd = allSlots[allSlots.length - 1].end;

  // Get booked appointments for this doctor on this date
  const bookedAppointments = await Appointment.find({
    doctor: doctorId,
    slotStart: { $gte: dayStart, $lt: dayEnd }
  });

  const now = new Date();

  // Filter out booked slots and past slots
  const availableSlots = allSlots.filter(slot => {
    const isFutureSlot = slot.start > now;
    const isBooked = bookedAppointments.some(appt =>
      appt.slotStart.getTime() === slot.start.getTime()
    );
    return isFutureSlot && !isBooked;
  });

  return availableSlots;
}