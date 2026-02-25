export type BaseAppointment = {
  id: string;
  AppointmentType?  : "service" | "class" | "event" | "reminder",
  title?: string | "";
  start: Date;
  end: Date;
  allDay?: boolean;
  desc?: string;
  color?: string;
  
};

// Service-specific appointment
export type ServiceAppointment = BaseAppointment & {
  appointmentType: "service";
  therapist?: string;
  customerId: string;
  serviceId: string;
  serviceName?: string;
  staffId?: string;
  reason?: string;
  status: "scheduled" | "completed" | "cancelled" | "upcoming";
  location?: string;
  room?: string;
  notes?: string;
  bufferTime?: number;
  duration?: number;
  cost?: number;
};


// Class-specific appointment
export type ClassAppointment = BaseAppointment & {
  appointmentType: "class";
  classId: string;
  className?: string;
  customerId: string;
  instructor?: string;
  maxSeats?: number;
  enrolledSeats?: number;
  status: "scheduled" | "completed" | "cancelled" | "full";
  cost?: number;
  duration?: number;
  notes?: string;
};


// Event-specific appointment (simpler, 15 min default)
export type EventAppointment = BaseAppointment & {
  appointmentType: "event";
  eventName: string;
  customerId?: string;
  location?: string;
  videoLink?: string;
  attendees?: string[];
  notes?: string;
};

// Reminder-specific appointment
export type ReminderAppointment = BaseAppointment & {
  appointmentType: "reminder";
  reminderText: string;
  createdBy: string;
  isCompleted?: boolean;
};

// Union type for all appointments
export type CustomerAppointmentType =
  | ServiceAppointment
  | ClassAppointment
  | EventAppointment
  | ReminderAppointment;



  // ===================================================
// FORM DATA TYPES
// ===================================================

// Base form data
export type BaseAppointmentFormData = {
  appointmentType: "service" | "class" | "event" | "reminder";
  date: Date;
  startTime: string;
  endTime?: string;
  color: string;
  note?: string;
};

// Service form data
export type ServiceFormData = BaseAppointmentFormData & {
  appointmentType: "service";
  serviceId: string;
  room?: string;
  bufferTime: number;
};

// Class form data
export type ClassFormData = BaseAppointmentFormData & {
  appointmentType: "class";
  classId: string;
};

// Event form data
export type EventFormData = BaseAppointmentFormData & {
  appointmentType: "event";
  eventName: string;
  location?: string;
};

// Reminder form data
export type ReminderFormData = BaseAppointmentFormData & {
  appointmentType: "reminder";
  reminderText: string;
};

// Union type for form data
export type AppointmentFormData =
  | ServiceFormData
  | ClassFormData
  | EventFormData
  | ReminderFormData;
