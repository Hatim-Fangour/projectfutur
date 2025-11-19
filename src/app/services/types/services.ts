// src/types/services.ts

export type PricingPlan = {
  id: string;
  name: string;
  price: number;
  type: string;
  purchaseDate: Date;
  expiryDate: Date;
  status: "active" | "expiring-soon" | "expired";
  
  remainingSessions?: number;
  totalSessions?: number;
  duration?: number; // in minutes
  bufferTime?: number; // in minutes
  color?: string;
  description?: string;
};

export type ServiceContent = {
  id: number;
  description: string;
  title: string;
  duration: number;
  pricingPlan: PricingPlan[];
};

export type Service = {
  id: number;
  title: string;
  description: string;
  service: string; // could also be an enum in the future
  content?: ServiceContent[];
};

export const services: PricingPlan[] = [
  {
    id: "1",
    name: "Premium Facial Package",
    type: "Facial Treatment",
    totalSessions: 10,
    remainingSessions: 6,
    price: 450,

    purchaseDate: new Date("2025-08-15T10:30:00"),
    expiryDate: new Date("2025-11-15T10:30:00"),
    // expiryDate: dayjs(this.purchaseDate).add(90, 'day').toDate(),
    status: "expiring-soon",
    description:
      "Includes anti-aging facial, hydration treatment, and skin brightening",
  },
  {
    id: "2",
    name: "Full Body Massage Bundle",
    type: "Massage Therapy",
    totalSessions: 8,
    remainingSessions: 3,
    purchaseDate: new Date("2025-09-01T10:30:00"),
    expiryDate: new Date("2025-11-30T10:30:00"),

    price: 380,
    status: "active",
    description: "90-minute full body relaxation sessions",
  },
  {
    id: "3",
    name: "Spa Wellness Package",
    type: "Complete Wellness",
    totalSessions: 12,
    remainingSessions: 12,
    purchaseDate: new Date("2025-11-13T10:30:00"),
    expiryDate: new Date("2025-02-13T10:30:00"),

    price: 599,
    status: "active",
    description: "Mix of massages, facials, and spa treatments",
  },
  {
    id: "4",
    name: "Hot Stone Massage Series",
    type: "Massage Therapy",
    totalSessions: 6,
    remainingSessions: 0,
    purchaseDate: new Date("2024-08-01T10:30:00"),
    expiryDate: new Date("2024-11-01T10:30:00"),

    price: 270,
    status: "expired",
    description: "Therapeutic hot stone massage sessions",
  },
  {
    id: "5",
    name: "Skincare Intensive",
    type: "Skincare Treatment",
    totalSessions: 5,
    remainingSessions: 2,
    purchaseDate: new Date("2024-10-15T10:30:00"),
    expiryDate: new Date("2025-01-15T10:30:00"),

    price: 299,
    status: "active",
    description: "Professional skincare consultation and treatment",
  },
];
