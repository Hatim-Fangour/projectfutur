import { BaseAppointment } from "@/app/calendar/types/reservations";
import { Customer } from "@/app/customers/types/customers";
import { PricingPlan } from "@/app/services/types/services";


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
}

export interface BookAppointmentProps {
  customer: Customer;
  existingAppointments: BaseAppointment[];
  onSubmit: (appointment: any) => void;
}


