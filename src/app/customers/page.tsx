

import AboutTabContent from "@/app/customers/customersComps/AboutTabContent";
import AppointmentTabContent from "@/app/customers/customersComps/AppointmentTabContent";
import CustomerForm from "@/app/customers/customersComps/CustomerForm";
import NoteTabContent from "@/app/customers/customersComps/NoteTabContent";
import ProgressTabContent from "@/app/customers/customersComps/ProgressTabContent";
import ServiceTabContent from "@/app/customers/customersComps/ServiceTabContent";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, Trash2 } from "lucide-react";

import {
  Customer,
  CustomerAppointmentType,
} from "@/app/customers/types/customers";
import BookAppointment from "@/app/customers/customersComps/BookAppointment";
import { prisma } from "@/lib/prisma";
import CustomerPageClient from "./CustomerPageClient";

const CustomersPage =async () => {
  // Fetch from database
  const customers = await prisma.customer.findMany({
    // include: {
    //   appointments: true,
    //   notes: true,
    //   services: {
    //     include: {
    //       pricingPlan: true,
    //     },
    //   },
    //   progress: true,
    // },
    orderBy: { createdAt: 'desc' },
  });



 // Pass to client component
  return <CustomerPageClient initialCustomers={customers} />;
};

export default CustomersPage;
