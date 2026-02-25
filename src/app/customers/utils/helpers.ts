import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
dayjs.extend(duration);
import { Customer, DateFormatType } from "../types/customers";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { BaseAppointment } from "@/app/calendar/types/reservations";
import { SetStateAction } from "react";
import { CustomerFormData } from "../schemas/CustomerSchema";
import { toast } from "sonner";

export const BUSINESS_HOURS = {
  start: "08:00 AM",
  end: "08:00 PM",
};

export const getAppointementStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200";
    case "upcoming":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "cancelled":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getServiceStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return {
        badge:
          "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
        icon: CheckCircle2,
        color: "text-emerald-600",
      };
    case "expiring-soon":
      return {
        badge:
          "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
        icon: Clock,
        color: "text-amber-600",
      };
    case "expired":
      return {
        badge: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        icon: AlertCircle,
        color: "text-red-600",
      };
    default:
      return {
        badge: "bg-gray-100 text-gray-800",
        icon: CheckCircle2,
        color: "text-gray-600",
      };
  }
};

export const getDaysRemaining = (expiryDate: string | Date) => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const getSessionPercentage = (
  remaining: number = 1,
  total: number = 1
) => {
  return (remaining / total) * 100;
};

export const getSessionStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200";
    case "in-progress":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
    case "upcoming":
      return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getStatusLabel = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

// Generate all time slots in 15-min intervals
export const generateTimeSlots = (
  restricted: boolean = false,
  businessTime: {
    start: string;
    end: string;
  } = {
    start: BUSINESS_HOURS.start,
    end: BUSINESS_HOURS.end,
  }
) => {
  const slots: string[] = [];
  const periods = ["AM", "PM"];

  periods.forEach((period) => {
    for (let hour = 12; hour <= 12; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        slots.push(
          `${String(hour).padStart(2, "0")}:${String(minute).padStart(
            2,
            "0"
          )} ${period}`
        );
      }
    }
    for (let hour = 1; hour < 12; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        slots.push(
          `${String(hour).padStart(2, "0")}:${String(minute).padStart(
            2,
            "0"
          )} ${period}`
        );
      }
    }
  });
  // restricted= true means we have a business hours to respect
  if (restricted) {
    // if we have bussiness hours for exp from 9:00 AM to 5:00 PM
    // we want to filter timeSlots to only include those between 9:00 AM and 5:00 PM
    const businessStartMinutes = timeToMinutes(businessTime.start);
    const businessEndMinutes = timeToMinutes(businessTime.end);
    const businessTimeSlots = slots.filter((slot) => {
      const slotMinutes = timeToMinutes(slot);
      return (
        slotMinutes >= businessStartMinutes && slotMinutes <= businessEndMinutes
      );
    });

    return businessTimeSlots;
  }

  return slots;
};

// Convert time string to minutes since midnight
export function timeToMinutes(time: string): number {
  const [timePart, period] = time.split(" ");
  let [hours, minutes] = timePart.split(":").map(Number);

  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

// Convert minutes to time string
export function minutesToTime(minutes: number): string {
  let hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours >= 12 ? "PM" : "AM";

  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12;

  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(
    2,
    "0"
  )} ${period}`;
}

// Check if two time ranges overlap
export function timesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const start1Min = timeToMinutes(start1);
  const end1Min = timeToMinutes(end1);
  const start2Min = timeToMinutes(start2);
  const end2Min = timeToMinutes(end2);

  return start1Min < end2Min && end1Min > start2Min;
}

// Get available time slots for a given day
export function getAvailableTimeSlots(
  date: string,
  appointments: BaseAppointment[],
  duration: number = 60 // duration in minutes
): { start: string; end: string }[] {
  const businessStart = timeToMinutes(BUSINESS_HOURS.start);
  const businessEnd = timeToMinutes(BUSINESS_HOURS.end);
  // Get appointments for this specific date
  const dayAppointments = appointments
    .filter((apt) => formatDate(apt.start, "iso") === date)
    .sort(
      (a, b) =>
        timeToMinutes(formatToSlot(a.start)) -
        timeToMinutes(formatToSlot(b.start))
    );

  const availableSlots: { start: string; end: string }[] = [];
  let currentTime = businessStart;

  for (const appointment of dayAppointments) {
    const aptStart = timeToMinutes(formatToSlot(appointment.start));
    const aptEnd = timeToMinutes(formatToSlot(appointment.end));

    // If there's a gap before this appointment
    if (currentTime + duration <= aptStart) {
      availableSlots.push({
        start: minutesToTime(currentTime),
        end: minutesToTime(aptStart),
      });
    }

    currentTime = Math.max(currentTime, aptEnd);
  }

  // Add remaining time until business hours end
  if (currentTime + duration <= businessEnd) {
    availableSlots.push({
      start: minutesToTime(currentTime),
      end: minutesToTime(businessEnd),
    });
  }

  return availableSlots;
}

// Format date to YYYY-MM-DD
export function formatDateToString(date: Date | undefined): string {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// extarct Date from Date object
export const formatDate = (
  date: Date,
  format: DateFormatType = "default"
): string => {
  const formats = {
    default: "MMMM D, YYYY", // "November 15, 2024"
    short: "MMM D, YYYY", // "Nov 15, 2024"
    numeric: "MM/DD/YYYY", // "11/15/2024"
    iso: "YYYY-MM-DD", // "2024-11-15"
    full: "dddd, MMMM D, YYYY", // "Friday, November 15, 2024"
    dayMonth: "MMM D", // "Nov 15"
    monthYear: "MMMM YYYY", // "November 2024"
    shortMonthYear: "MMM YYYY", // "Nov 2024"
    compact: "MM/DD/YY", // "11/15/24"
    european: "DD/MM/YYYY", // "15/11/2024"
    dotted: "DD.MM.YYYY", // "15.11.2024"
    dashed: "DD-MM-YYYY", // "15-11-2024"
  };

  return dayjs(date).format(formats[format] || formats.default);
};

// extarct Time from Date object in "h:mm A" format
export const formatToSlot = (date: Date) => {
  return dayjs(date).format("h:mm A");
};

// Calculate duration in minutes
export const calculateDuration = (
  start: Date | string,
  end: Date | string
): number => {
  const startDate = dayjs(start);
  const endDate = dayjs(end);

  return endDate.diff(startDate, "minute");
};

// ✅ Get valid end times based on selected start time
export const getValidEndTimes = (
  timeSlots: string[] = [],
  minimumDuration: number = 0,
  selectedStartTime: string
) => {
  const startMinutes = timeToMinutes(selectedStartTime);
  const minEndMinutes = startMinutes + minimumDuration;

  return timeSlots.filter((slot) => {
    const slotMinutes = timeToMinutes(slot);
    return slotMinutes >= minEndMinutes;
  });
};

export const handleFormSubmit = (
  customer: Customer,
  data: CustomerFormData,
  onSubmit: (appointment: any) => void,
  setDialogOpen: (value: SetStateAction<boolean>) => void
) => {
 
console.log({data})

  // const appointment = {
  //   date: formatDateToString(data.date),
  //   startTime: data.startTime,
  //   endTime: data.endTime,
  //   bufferEndTime: endWithBuffer,
  //   bufferMinutes: data.bufferTime,
  //   serviceId: data.serviceId,
  //   serviceName,
  //   customerId: customer.id,
  //   customerName: customer.fullName,
  //   room: data.room,
  //   note: data.notes,
  //   color: data.color,
  //   status: "pending" as const,
  // };
  // console.log({ appointment });
  // onSubmit(appointment);
  toast.success("Customer added successfully!");

  // ✅ Close dialog FIRST
  setDialogOpen(false);
};

// ✅ Create a function to get fresh default values
// export const getDefaultFormCustomerValues = () => {
//   return {
//     fullName: "",
//     date: new Date(),
//     startTime,
//     endTime: addOneHour(startTime),
//     bufferTime: 0,
//     room: "",
//     notes: "",
//     color: existingColors[0],
//   };
// };
