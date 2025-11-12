// src/types/services.ts

export type PricingPlan = {
  id: number;
  name: string;
  price: number;
  duration: number; // in minutes
  color:string
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
