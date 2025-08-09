import { Appointment } from "./components/AppointmentList";

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
 slots?: { start: string; end: string }[];

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
  slots ?: object[];
}