// schemas/appointmentSchema.ts
import { z } from "zod";
import { timeToMinutes } from "../utils/helpers";

// ===================================================
// BASE SCHEMA (shared fields)
// ===================================================
function isValidTimeFormat(time: string): boolean {
  // 24-hour format: "14:30"
  const format24h = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  // 12-hour format: "2:30 PM"
  const format12h = /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/;

  return format24h.test(time) || format12h.test(time);
}

const baseAppointmentSchema = z
  .object({
    // ✅ Date with validation
    date: z.date({
      // required_error: "Please select a date",
      // invalid_type_error: "Invalid date",
    }),

    // ✅ Start time with format validation
    startTime: z
      .string()
      .min(1, "Start time is required")
      .refine(isValidTimeFormat, {
        message: "Invalid time format (use HH:MM or HH:MM AM/PM)",
      }),

    color: z.string().optional(),

    note: z
      .string()
      .max(500, "Notes must be less than 500 characters")
      .optional(),
  })
  .refine(
    (data) => {
      // ✅ Validate that date is not in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const selectedDate = new Date(data.date);
      selectedDate.setHours(0, 0, 0, 0);

      return selectedDate >= today;
    },
    {
      message: "Cannot book appointments in the past",
      path: ["date"],
    }
  );

// ===================================================
// SERVICE APPOINTMENT SCHEMA
// ===================================================

export const serviceAppointmentSchema = baseAppointmentSchema
  .safeExtend({
    appointmentType: z.literal("service"),

    // Service
    serviceId: z.string().min(1, "Please select a service"),
    room: z.string().optional(),

    // ✅ End time with format validation
    endTime: z
      .string()
      .min(1, "End time is required")
      .refine(isValidTimeFormat, {
        message: "Invalid time format (use HH:MM or HH:MM AM/PM)",
      }),

    // Buffer time
    bufferTime: z.number().min(0).max(120),
    guests: z.array(z.object()).optional(),
  })
  .refine(
    (data) => {
      // ✅ VALIDATION 1: End time must be after start time

      try {
        const startMinutes = timeToMinutes(data.startTime);
        const endMinutes = timeToMinutes(data.endTime);
        return endMinutes > startMinutes;
      } catch (error) {
        console.error("Time comparison error:", error);
        return false;
      }
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    }
  )
  .refine(
    (data) => {
      // ✅ VALIDATION 2: Minimum duration (e.g., at least 15 minutes)
      try {
        const startMinutes = timeToMinutes(data.startTime);
        const endMinutes = timeToMinutes(data.endTime);
        const duration = endMinutes - startMinutes;
        return duration >= 15;
      } catch (error) {
        return false;
      }
    },
    {
      message: "Appointment must be at least 15 minutes long",
      path: ["endTime"],
    }
  )
  .refine(
    (data) => {
      // ✅ VALIDATION 3: Check if time is in the past (for today's appointments)
      const selectedDate = new Date(data.date);
      const today = new Date();

      // Only validate if selected date is today
      if (
        selectedDate.getDate() === today.getDate() &&
        selectedDate.getMonth() === today.getMonth() &&
        selectedDate.getFullYear() === today.getFullYear()
      ) {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const startMinutes = timeToMinutes(data.startTime);

        return startMinutes > currentMinutes;
      }

      return true; // Future dates are always valid
    },
    {
      message: "Cannot book appointments in the past",
      path: ["startTime"],
    }
  );

export type ServiceFormData = z.infer<typeof serviceAppointmentSchema>;

// ===================================================
// CLASS APPOINTMENT SCHEMA
// ===================================================

export const classAppointmentSchema = baseAppointmentSchema
  .safeExtend({
    appointmentType: z.literal("class"),
    classId: z.string().min(1, "Please select a class"),

    endTime: z
      .string()
      .min(1, "End time is required")
      .refine(isValidTimeFormat, {
        message: "Invalid time format",
      }),
  })
  .refine(
    (data) => {
      const startMinutes = timeToMinutes(data.startTime);
      const endMinutes = timeToMinutes(data.endTime);
      return endMinutes > startMinutes;
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    }
  );

export type ClassFormData = z.infer<typeof classAppointmentSchema>;

// ===================================================
// EVENT APPOINTMENT SCHEMA (no end time needed)
// ===================================================

export const eventAppointmentSchema = baseAppointmentSchema.safeExtend({
  appointmentType: z.literal("event"),
  eventName: z.string().min(1, "Event name is required").max(100),
  location: z.string().max(200).optional(),
  endTime: z.string().min(1, "End time is required").refine(isValidTimeFormat, {
    message: "Invalid time format",
  }),
});

export type EventFormData = z.infer<typeof eventAppointmentSchema>;

// ===================================================
// REMINDER APPOINTMENT SCHEMA (no end time needed)
// ===================================================

export const reminderAppointmentSchema = baseAppointmentSchema.safeExtend({
  appointmentType: z.literal("reminder"),
  reminderText: z.string().min(1, "Reminder text is required").max(200),
  // No endTime - auto-calculated as startTime + 15 min
});

export type ReminderFormData = z.infer<typeof reminderAppointmentSchema>;

// ===================================================
// DISCRIMINATED UNION
// ===================================================

export const appointmentSchema = z.discriminatedUnion("appointmentType", [
  serviceAppointmentSchema,
  classAppointmentSchema,
  eventAppointmentSchema,
  reminderAppointmentSchema,
]);

export type AppointmentFormData = z.infer<typeof appointmentSchema>;
