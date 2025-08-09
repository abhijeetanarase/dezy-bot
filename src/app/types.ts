import { Appointment } from "./components/AppointmentList";

export interface Slot {
  start: string;
  end: string;
}


export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  isError?: boolean;
  doctors?: Doctor[];
  appointment?: Appointment[];
  doctor?: Doctor;
  slotAvailable?: boolean;
  metadata?: any;
  slots?: Slot[];
}

export interface Doctor {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  skills?: string[];
  experience?: string;
  education?: string;
  certifications?: string[];
  bio?: string;
  socialLinks?: { platform: string; url: string }[];
  address?: string;
  specialty?: string[];
  slots?: Slot[];
}
