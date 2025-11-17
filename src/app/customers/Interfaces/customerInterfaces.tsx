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
  selectedDate?: string; // Format: "2025-11-15"
  // appointments: Appointment[];
  appointments: [];
  onStartTimeChange?: (time: string) => void;
  onEndTimeChange?: (time: string) => void;
  onValidationChange?: (isValid: boolean) => void;
  className?: string;
}

export interface BookAppointmentProps {
  customer: Customer;
  existingAppointments: any;
  onSubmit: (appointment: any) => void;
}


