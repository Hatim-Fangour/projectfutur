// schemas/customerSchema.ts
import { z } from "zod";

export const customerSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),

  // ✅ Both optional here, we'll refine below
  phone: z.string().optional(),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),

  company: z.string().optional(),
  pictureURL: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),




  notes: z.array(z.object()).optional(),
  appointments: z.array(z.object()).optional(),
  services: z.array(z.object()).optional(),
  progress: z.array(z.object()).optional(),
})// ✅ IMPORTANT: Refine to require at least one (email OR phone)
.refine(
  (data) => {
    // At least one must be filled
    const hasEmail = data.email && data.email.trim() !== "";
    const hasPhone = data.phone && data.phone.trim() !== "";
    return hasEmail || hasPhone;
  },
  {
    message: "Please provide either email or phone number",
    path: ["phone"], // Show error on phone field
  }
);

export type CustomerFormData = z.infer<typeof customerSchema>;
