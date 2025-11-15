export type CustomerNoteType = {
  id: string;
  content: string;
  date: string;
  writer: string;
};

export type CustomerAppointmentType = {
  id: string;
  date: string; // Format: "2025-11-15"
  startTime: string; // Format: "10:30 AM"
  endTime: string; // Format: "11:45 AM"
  therapist: string;
  customerId?: string;
  serviceId?: string;
  service?: string;
  staffId?: string;
  reason: string;
  status: "scheduled" | "completed" | "cancelled" | "upcoming";
  room: string;
  duration: string;
  notes?: string;
};

export type Customer = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  pictureURL: string; // in minutes
  address?: string;
  notes?: CustomerNoteType[];
  appointments?: CustomerAppointmentType[];
  services?: string[];
  progress?: {}[];
};
