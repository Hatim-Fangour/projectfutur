import { BaseAppointment } from "@/app/[locale]/(dashboard)/calendar/types/reservations";
import { PricingPlan } from "@/app/[locale]/(dashboard)/services/types/services";

export type DateFormatType =
  | "default"
  | "short"
  | "numeric"
  | "iso"
  | "full"
  | "dayMonth"
  | "monthYear"
  | "shortMonthYear"
  | "compact"
  | "european"
  | "dotted"
  | "dashed";

export type ProgressSessionType = "completed" | "in-progress";

export type CustomerNoteType = {
  id: string;
  content: string;
  date: string;
  writer: string;
};

export type CustomerAppointmentType = BaseAppointment & {
  appointmentType?: "service";
  therapist?: string;
  customerId?: string;
  serviceId?: string;
  service?: string;
  staffId?: string;
  reason?: string;
  // Status
  status: "scheduled" | "completed" | "cancelled" | "upcoming";
  location?: string;
  notes?: string;

};

export type CustomerProgressSessionType = {
  id: string;
  date: Date; // Format: "2025-11-15"
  type: string; 
  status: ProgressSessionType;
  beforeImage: string; 
  afterImage: string;
  
  duringImages?: {}[];
  products?: string[];
  notes?: string;
  progress: number;
  therapist: string;
};

export type Customer = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  country?: string;
  state?: string;
  city?: string;
  pictureURL: string; 
  address?: string;
  notes?: CustomerNoteType[];
  appointments?: CustomerAppointmentType[];
  services?: PricingPlan[];
  progress?: CustomerProgressSessionType[];
};


