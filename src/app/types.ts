import { Appointment } from "./components/AppointmentList";

export interface Slot {
  start: string;
  end: string;
}


export interface Metadata {
  available: boolean;
  slotStart?: string;
  slotEnd?: string;
  [key: string]: unknown; // allows extra backend data without `any`
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
  metadata?: Metadata;
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
  specialization?: string[];
  bio?: string;
  socialLinks?: { platform: string; url: string }[];
  address?: string;
  specialty?: string[];
  slots?: Slot[];
}
