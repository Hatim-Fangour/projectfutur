import { Customer } from "@/app/[locale]/(dashboard)/customers/types/customers";
import { formatDateToString } from "@/app/[locale]/(dashboard)/customers/utils/helpers";
import { existingColors } from "@/app/[locale]/(dashboard)/Utils";
import dayjs from "dayjs";
import { AppointmentFormData } from "../schemas/appointmentSchema";
import { toast } from "sonner";
import { SetStateAction } from "react";
import {
  ClassAppointment,
  ClassFormData,
  CustomerAppointmentType,
  EventAppointment,
  EventFormData,
  ReminderAppointment,
  ReminderFormData,
  ServiceAppointment,
  ServiceFormData,
} from "../types/reservations";

export const combineDateAndTime = (date: string, timeString: string) => {
  // Step 1: Validate inputs
  if (!date || !timeString) return null;
  // Returns null if date or timeString is missing

  // Step 2: Parse the time string "10:30 AM" → ["10:30", "AM"]
  const [time, modifier] = timeString.split(" ");
  // time = "10:30"
  // modifier = "AM" or "PM"

  // Step 3: Extract hours and minutes "10:30" → [10, 30]
  let [hours, minutes] = time.split(":").map(Number);
  // hours = 10
  // minutes = 30

  // Step 4: Convert to 24-hour format
  if (modifier === "PM" && hours !== 12) hours += 12;
  // 1:00 PM → 13:00
  // 2:00 PM → 14:00
  // 12:00 PM stays 12:00 (noon)

  if (modifier === "AM" && hours === 12) hours = 0;
  // 12:00 AM → 00:00 (midnight)
  // Other AM times stay the same

  // Step 5: Create a new Date object from the input date
  const newDate = new Date(date);

  // Step 6: Set the hours and minutes (seconds and milliseconds to 0)
  newDate.setHours(hours, minutes, 0, 0);

  // Step 7: Return the complete Date object
  return newDate;
};

export const events = [
  {
    id: "1",
    title: "Long Event",
    start: new Date(2025, 12, 7),
    end: new Date(2025, 12, 10),
  },

  // {
  //   id: "2",
  //   title: "DTS STARTS",
  //   start: new Date(2025, 10, 5, 8, 5, 0),
  //   end: new Date(2025, 10, 5, 11, 0, 0),
  // },

  // {
  //   id: "3",
  //   title: "DTS ENDS",
  //   start: new Date(2025, 10, 9, 8, 5, 0),
  //   end: new Date(2025, 10, 9, 11, 0, 0),
  // },

  // {
  //   id: "4",
  //   title: "Some Event",
  //   start: new Date(2025, 3, 9, 0, 0, 0),
  //   end: new Date(2025, 3, 9, 0, 0, 0),
  //   allDay: true,
  // },

  // {
  //   id: "7",
  //   title: "Lunch",
  //   start: new Date(2025, 3, 12, 12, 0, 0, 0),
  //   end: new Date(2025, 3, 12, 13, 0, 0, 0),
  //   desc: "Power lunch",
  // },

  // {
  //   id: "8",
  //   title: "Today",
  //   start: new Date(new Date().setHours(new Date().getHours() - 3)),
  //   end: new Date(new Date().setHours(new Date().getHours() + 3)),
  // },
];

export const Classes = [
  {
    title: "class_1",
    id: "classe_1",
    description: "class description 1",
    duration: 30,
    seats: 12,
    cost: 987,
    color: "#7856ff",
    classImage: "#imageUrl",
  },
  {
    title: "class_2",
    id: "classe_2",
    description: "class description 2",
    duration: 30,
    seats: 12,
    cost: 987,
    color: "#72ff56",
    classImage: "#imageUrl",
  },
  {
    title: "class_3",
    id: "classe_3",
    description: "class description 3",
    duration: 30,
    seats: 12,
    cost: 987,
    color: "#ff7856",
    classImage: "#imageUrl",
  },
  {
    title: "class_4",
    id: "classe_4",
    description: "class description 4",
    duration: 30,
    seats: 12,
    cost: 987,
    color: "#ffff1b",
    classImage: "#imageUrl",
  },
];

export const timeToMinutes = (time: string) => {
  const [timeStr, period] = time.split(" ");
  let [hours, minutes] = timeStr.split(":").map(Number);
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
};

export function formatDate(date: Date | undefined) {
  if (!date) {
    return "";
  }
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function isValidDate(date: Date | undefined) {
  if (!date) {
    return false;
  }
  return !isNaN(date.getTime());
}

/**
 * Get the next 15-minute time slot from now
 * Example: If it's 2:05 PM, returns "02:15 PM"
 */
export const getNextTimeSlot = (date = new Date()): string => {
  const now = dayjs(date);
  const minutes = now.minute();

  // Round up to next 15-minute interval
  const roundedMinutes = Math.ceil(minutes / 15) * 15;

  // Add the difference to current time
  const nextSlot = now.minute(0).add(roundedMinutes, "minute");

  return nextSlot.format("hh:mm A");
};

/**
 * Add duration (in minutes) to a time string
 * Example: addDuration("02:15 PM", 60) returns "03:15 PM"
 */
export const addDuration = (
  timeString: string,
  durationMinutes: number
): string => {
  // Create a date with the time
  const [time, period] = timeString.split(" ");
  let [hours, minutes] = time.split(":").map(Number);

  // Convert to 24-hour
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  // Create dayjs object for today with this time
  const baseTime = dayjs().hour(hours).minute(minutes);

  // Add duration
  const newTime = baseTime.add(durationMinutes, "minute");

  return newTime.format("hh:mm A");
};

/**
 * Add 1 hour to a time string
 */
export const addOneHour = (timeString: string): string => {
  return addDuration(timeString, 60);
};

// ✅ Helper to convert time string to Date object for calendar
export const timeStringToDate = (dateStr: string, timeStr: string): Date => {
  const [time, period] = timeStr.split(" ");
  let [hours, minutes] = time.split(":").map(Number);

  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  const date = new Date(dateStr);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

// ✅ Create a function to get fresh default values
export const getDefaultFormAppointmentValues = () => {
  const startTime = getNextTimeSlot();
  return {
    serviceId: "",
    date: new Date(),
    startTime,
    endTime: addOneHour(startTime),
    bufferTime: 0,
    room: "",
    note: "",
    color: existingColors[0],
  };
};

export const getDefaultServiceValues = (): ServiceFormData => {

  const startTime = getNextTimeSlot();

  return {
  appointmentType: "service",
  date: new Date(),
  startTime,
  endTime: addOneHour(startTime),
  serviceId: "",
  room: "",
  bufferTime: 0,
  color: existingColors[0],
  note: "",
}

}

export const getDefaultClassValues = (): ClassFormData => ({
  appointmentType: "class",
  date: new Date(),
  startTime: "09:00",
  endTime: "10:00",
  classId: "",
  color: "#72ff56",
  note: "",
});

export const getDefaultEventValues = (): EventFormData => ({
  appointmentType: "event",
  date: new Date(),
  startTime: "09:00",
  eventName: "",
  location: "",
  color: "#ff7856",
  note: "",
});

export const getDefaultReminderValues = (): ReminderFormData => ({
  appointmentType: "reminder",
  date: new Date(),
  startTime: "09:00",
  reminderText: "",
  color: "#ffff1b",
  note: "",
});

// Update form initialization based on active tab
export const getDefaultValues = (activeTab: string) => {
  switch (activeTab) {
    case "service":
      return getDefaultServiceValues();
    case "class":
      return getDefaultClassValues();
    case "event":
      return getDefaultEventValues();
    case "reminder":
      return getDefaultReminderValues();
  }
};

// handle submit the appointment after getting all data
export const handleFormSubmit = (
  customer: Customer,
  data: AppointmentFormData,
  onSubmit: (appointment: any) => void,
  setDialogOpen: (value: SetStateAction<boolean>) => void
) => {
  try {
    let appointmentData: CustomerAppointmentType;

    switch (data.appointmentType) {
      case "service": {
        const serviceData = data as ServiceFormData;
        const service =
          customer.services?.find((s) => s.id === serviceData.serviceId) ||
          "Unknown Service";

        const start = timeStringToDate(
          formatDateToString(serviceData.date),
          serviceData.startTime
        );
        const end = timeStringToDate(
          formatDateToString(serviceData.date),
          serviceData.endTime || addOneHour(serviceData.startTime)
        );

        const endWithBuffer = addDuration(data.endTime, data.bufferTime);

        appointmentData = {
          id: `apt-${Date.now()}`,
          appointmentType: "service",
          // title: service?.title || "Service",
          start,
          end,
          color: serviceData.color,
          customerId: customer.id,
          serviceId: serviceData.serviceId,
          // serviceName: service?.name,
          room: serviceData.room,
          bufferEndTime: endWithBuffer,
          bufferTime : data.bufferTime,
          // duration: service?.duration,
          guests: customer.fullName,
          status: "scheduled",
          note: serviceData.note,
        } as ServiceAppointment;

        break;
      }

      case "class": {
        const classData = data as ClassFormData;
        const classInfo = Classes.find((c) => c.id === classData.classId);

        const start = timeStringToDate(
          formatDateToString(classData.date),
          classData.startTime
        );
        const end = timeStringToDate(
          formatDateToString(classData.date),
          classData.endTime || addOneHour(classData.startTime)
        );

        appointmentData = {
          id: `apt-${Date.now()}`,
          appointmentType: "class",
          title: classInfo?.title || "Class",
          start,
          end,
          color: classData.color,
          customerId: customer.id,
          classId: classData.classId,
          className: classInfo?.title,
          duration: classInfo?.duration,
          cost: classInfo?.cost,
          maxSeats: classInfo?.seats,
          status: "scheduled",
          note: classData.note,
        } as ClassAppointment;
        break;
      }

      case "event": {
        const eventData = data as EventFormData;

        const start = timeStringToDate(
          formatDateToString(eventData.date),
          eventData.startTime
        );
        // Auto-calculate end time as start + 15 minutes
        const end = new Date(start);
        end.setMinutes(end.getMinutes() + 15);

        appointmentData = {
          id: `apt-${Date.now()}`,
          appointmentType: "event",
          title: eventData.eventName,
          eventName: eventData.eventName,
          start,
          end,
          color: eventData.color,
          customerId: customer.id,
          location: eventData.location,
          note: eventData.note,
        } as EventAppointment;
        break;
      }

      case "reminder": {
        const reminderData = data as ReminderFormData;

        const start = timeStringToDate(
          formatDateToString(reminderData.date),
          reminderData.startTime
        );
        // Auto-calculate end time as start + 15 minutes
        const end = new Date(start);
        end.setMinutes(end.getMinutes() + 15);

        appointmentData = {
          id: `apt-${Date.now()}`,
          appointmentType: "reminder",
          title: reminderData.reminderText,
          reminderText: reminderData.reminderText,
          start,
          end,
          color: reminderData.color,
          createdBy: "current-user-id", // Replace with actual user ID
          isCompleted: false,
        } as ReminderAppointment;
        break;
      }
    }
    onSubmit(appointmentData);
     toast.success(`${data.appointmentType} booked successfully!`);
     // ✅ Close dialog
    setDialogOpen(false);
  } catch (error) {
    console.error("Error creating appointment:", error);
    toast.error("Failed to book appointment. Please try again.");
    return;
  }

  // const appointment = {
  //   date: formatDateToString(data.date),
  //   startTime: data.startTime,
  //   // endTime: data.endTime,
  //   bufferEndTime: endWithBuffer,
  //   // bufferMinutes: data.bufferTime,
  //   // serviceId: data.serviceId,
  //   serviceName,
  //   customerId: customer.id,
  //   customerName: customer.fullName,
  //   room: data.room,
  //   note: data.note,
  //   color: data.color,
  //   status: "pending" as const,
  // };
  
 

  
};



