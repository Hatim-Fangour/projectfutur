import { BaseAppointment } from "@/app/calendar/types/reservations";
import { Customer, CustomerAppointmentType } from "@/app/customers/types/customers";
import { PricingPlan } from "@/app/services/types/services";
import {

  Event as CalendarEvent,
} from "react-big-calendar";

export interface TabContentProps {
  customer: Customer;
}

export interface ServiceCardProps {
  service: PricingPlan;
}



export interface TimeRangePickerProps {
  startTime?: string;
  endTime?: string;
  selectedDate?: string;
  appointments?: BaseAppointment[];
  onStartTimeChange?: (time: string) => void;
  onEndTimeChange?: (time: string) => void;
  onValidationChange?: (isValid: boolean) => void;
  className?: string;
  minimumDuration?: number; // in minutes, default 15
  isEndTimeDisabled?: boolean; // ✅ New prop
}

export interface BookAppointmentProps {
  customer: Customer;
  existingAppointments: CustomerAppointmentType[];
  onSubmit: (appointment: any) => void;
}

export interface CustomerFormProps {
  customer?: Customer | undefined ;
  onSubmit: (appointment: any) => void;
  open: boolean; // ✅ Controlled by parent
  onOpenChange: (open: boolean) => void; // ✅ Controlled by parent
}


export interface CalendarEventType extends CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  actualEnd?: Date; // End time without buffer
  bufferTime?: number; // Buffer time in minutes
  color?: string;
  isDraft?: boolean; // For preview appointment
}


export interface State {
  isoCode: string;
  name: string;
}
export interface City {
  isoCode: string;
  name: string;
}


