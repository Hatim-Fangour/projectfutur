"use client";

import AboutTabContent from "@/app/customers/customersComps/AboutTabContent";
import AppointmentTabContent from "@/app/customers/customersComps/AppointmentTabContent";
import CustomerForm from "@/app/customers/customersComps/CustomerForm";
import NoteTabContent from "@/app/customers/customersComps/NoteTabContent";
import ProgressTabContent from "@/app/customers/customersComps/ProgressTabContent";
import ServiceTabContent from "@/app/customers/customersComps/ServiceTabContent";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { Customer } from "@/app/customers/types/customers";
import BookAppointment from "@/app/customers/customersComps/BookAppointment";
import { BaseAppointment } from "../calendar/types/reservations";

const page = () => {
  const [openedDialog, setOpenedDialog] = useState<boolean | null>(null);

  const customers: Customer[] = [
    {
      id: "1",
      fullName: "John Doe",
      email: "John.Doe@gmail.com",
      pictureURL: "",
      phone: "+0123456789",
      address: "123 Main St, Cityville",
      notes: [
        {
          id: "1",
          content:
            "Followed up on the last appointment.Followed up on the last appointment.Followed up on the last appointment.Followed up on the last appointment.Followed up on the last appointment.Followed up on the last appointment.Followed up on the last appointment.Followed up on the last appointment.Followed up on the last appointment.Followed up on the last appointment.Followed up on the last appointment.Followed up on the last appointment.Followed up on the last appointment.Followed up on the last appointment.Followed up on the last appointment.Followed up on the last appointment.Followed up on the last appointment.Followed up on the last appointment.Followed up on the last appointment.Followed up on the last appointment.",
          date: "2024-10-01 20:09",
          writer: "Hatim Fangour",
        },
        {
          id: "2",
          content: "Interested in new spa packages.",
          date: "2024-10-05",
          writer: "Hatim Fangour",
        },
      ],
      appointments: [
        {
          id: "1",
          start: new Date("2024-11-13T14:00:00"),
          end: new Date("2024-11-13T15:15:00"),

          service: "Full Body Massage",
          therapist: "Sarah Johnson",
          reason: "Relaxation and stress relief",
          status: "completed",
          location: "Spa Studio A",
          notes: "Great session, client was very satisfied",
        },
        {
          id: "2",
          start: new Date("2024-11-20T10:30:00"),
          end: new Date("2024-11-20T11:15:00"),

          service: "Facial Treatment",
          therapist: "Emma Davis",
          reason: "Anti-aging treatment",
          status: "upcoming",
          location: "Spa Studio B",
        },
        {
          id: "3",
          start: new Date("2024-11-06T15:30:00"),
          end: new Date("2024-11-06T16:30:00"),

          service: "Hot Stone Massage",
          therapist: "Michael Chen",
          reason: "Deep tissue and relaxation",
          status: "completed",
          location: "Spa Studio A",

          notes: "Client reported excellent results",
        },
        {
          id: "4",
          start: new Date("2024-11-27T11:00:00"),
          end: new Date("2024-11-27T11:30:00"),

          service: "Spa Package - Full Treatment",
          therapist: "Sarah Johnson",
          reason: "Complete wellness package",
          status: "upcoming",
          location: "Spa Studio C",
        },
        {
          id: "5",
          start: new Date("2024-10-27T09:00:00"),
          end: new Date("2024-10-27T09:30:00"),

          service: "Skincare Treatment",
          therapist: "Emma Davis",
          reason: "Skin health and hydration",
          status: "completed",
          location: "Spa Studio B",
        },
      ],
      services: [
        {
          id: "1",
          name: "Premium Facial Package",
          type: "Facial Treatment",
          totalSessions: 10,
          remainingSessions: 6,
          price: 450,

          purchaseDate: new Date("2025-08-15T10:30:00"),
          expiryDate: new Date("2025-11-19T10:30:00"),
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
      ],
      progress: [
        {
          id: "1",
          date: new Date("2024-11-13"),
          // date: new Date("2024-11-13T14:00:00"),

          type: "Full Body Massage & Facial",
          status: "completed",
          beforeImage: "/spa-customer-before-treatment-massage-relaxation.jpg",
          afterImage: "/spa-customer-after-treatment-glowing-radiant-skin.jpg",
          duringImages: [
            {
              url: "/spa-treatment-in-progress-massage-therapy.jpg",
              caption: "Full body massage",
              timestamp: "5 min",
            },
            {
              url: "/facial-treatment-spa-relaxation-session.jpg",
              caption: "Facial treatment application",
              timestamp: "15 min",
            },
          ],
          products: [
            "Hydrating Face Serum",
            "Premium Body Oil",
            "Anti-aging Face Cream",
            "Organic Lavender Extract",
          ],
          notes:
            "Excellent results! Skin texture improved significantly. Client reported feeling very relaxed.",
          progress: 100,
          therapist: "Sarah Johnson",
        },
        {
          id: "2",
          date: new Date("2024-11-06"),
          type: "Intensive Skincare Treatment",
          status: "completed",
          beforeImage: "/spa-customer-skin-before-treatment.jpg",
          afterImage: "/spa-customer-skin-after-treatment-brightened.jpg",
          duringImages: [
            {
              url: "/skincare-treatment-application-spa.jpg",
              caption: "Skincare treatment application",
              timestamp: "20 min",
            },
          ],
          products: [
            "Vitamin C Serum",
            "Hydrating Mask",
            "Skin Brightening Cream",
          ],
          notes:
            "Second session showing cumulative benefits. Hydration level improved.",
          progress: 100,
          therapist: "Emma Davis",
        },
        {
          id: "3",
          date: new Date("2024-11-15"),
          type: "Anti-Aging Spa Package",
          status: "in-progress",
          beforeImage: "/spa-customer-before-anti-aging-treatment.jpg",
          afterImage: "/spa-customer-during-anti-aging-treatment-process.jpg",
          duringImages: [
            {
              url: "/anti-aging-treatment-spa-session.jpg",
              caption: "Anti-aging treatment",
              timestamp: "10 min",
            },
          ],
          products: [
            "Retinol Night Cream",
            "Collagen Serum",
            "Eye Contour Cream",
          ],
          notes: "Treatment in progress. Great response from client so far.",
          progress: 60,
          therapist: "Michael Chen",
        },
      ],
    },
    {
      id: "2",
      fullName: "Jane Smith",
      email: "",
      pictureURL: "",
      phone: "+0123456789",
    },
    {
      id: "3",
      fullName: "Alice Johnson",
      email: "",
      pictureURL: "",
      phone: "+0123456789",
    },
    {
      id: "4",
      fullName: "Bob Brown",
      email: "",
      pictureURL: "",
      phone: "+0123456789",
    },
    {
      id: "5",
      fullName: "Charlie Davis",
      email: "",
      pictureURL: "",
      phone: "+0123456789",
    },
    {
      id: "6",
      fullName: "Diana Evans",
      email: "",
      pictureURL: "",
      phone: "+0123456789",
    },
    {
      id: "7",
      fullName: "Frank Green",
      email: "",
      pictureURL: "",
      phone: "+0123456789",
    },
    {
      id: "8",
      fullName: "Grace Harris",
      email: "",
      pictureURL: "",
      phone: "+0123456789",
    },
    {
      id: "9",
      fullName: "Henry Lee",
      email: "",
      pictureURL: "",
      phone: "+0123456789",
    },
    {
      id: "10",
      fullName: "Ivy Martinez",
      email: "",
      pictureURL: "",
      phone: "+0123456789",
    },
    {
      id: "11",
      fullName: "Ivy Martinez",
      email: "",
      pictureURL: "",
      phone: "+0123456789",
    },
    {
      id: "12",
      fullName: "Ivy Martinez",
      email: "",
      pictureURL: "",
      phone: "+0123456789",
    },
    {
      id: "13",
      fullName: "Ivy Martinez",
      email: "",
      pictureURL: "",
      phone: "+0123456789",
    },
    {
      id: "14",
      fullName: "Ivy Martinez",
      email: "",
      pictureURL: "",
      phone: "+0123456789",
    },
    {
      id: "15",
      fullName: "Ivy Martinez",
      email: "",
      pictureURL: "",
      phone: "+0123456789",
    },
  ];

  const [appointments, setAppointments] = useState([
    {
      id: "1",
      start: new Date("2024-11-15T10:30:00"),
      end: new Date("2024-11-15T11:45:00"),
      customerId: "customer-1",
      serviceId: "service-1",
    },
    {
      id: "2",
      start: new Date("2024-11-15T02:00:00"),
      end: new Date("2024-11-15T03:30:00"),
      customerId: "customer-2",
      serviceId: "service-2",
    },
    {
      id: "3",
      start: new Date("2024-11-15T09:00:00"),
      end: new Date("2024-11-15T10:00:00"),
      customerId: "customer-3",
      serviceId: "service-1",
    },
  ]);

  const handleBookAppointment = (
    appointment: BaseAppointment & { customerId: string; serviceId: string }
  ) => {
    const newAppointment = {
      ...appointment,
      id: `apt-${Date.now()}`,
    };

    setAppointments([...appointments, newAppointment]);
  };

  return (
    <div className="grid grid-cols-10 gap-4 h-[calc(100vh-95px)] w-full overflow-hidden">
      {/* left sidebar */}

      <div className="col-span-2 h-full flex flex-col gap-5 bg-primary-foreground p-4 rounded-lg border overflow-hidden">
        {/* Header */}
        <header className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">Customers</h1>

            <Button className="w-8 h-8" onClick={() => setOpenedDialog(true)}>
              +
            </Button>
          </div>

          <div className="search-section">
            <Input type="text" placeholder="Search customers..." />
          </div>
        </header>

        {/* Scrollable customer list */}
        <ScrollArea className="flex-1 overflow-y-auto p-1 pr-4">
          {customers.map((customer) => (
            <div
              key={customer.id}
              className="mb-2 p-2 mr-2 flex items-center justify-between w-full border-2 rounded-lg hover:bg-muted transition-colors duration-200"
            >
              <div className="flex items-center space-x-2 w-full">
                <Avatar>
                  <AvatarImage
                    src={customer?.pictureURL}
                    alt={customer.fullName}
                  />
                  <AvatarFallback>
                    {customer.fullName?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate w-full">{customer.fullName}</span>
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* main content */}
      <div className="col-span-8 bg-primary-foreground rounded-lg border p-4 flex flex-col overflow-hidden h-full">
        {/* header */}
        <div className="flex w-full justify-between border-b pb-4 shrink-0">
          <div className="flex items-center justify-between  w-full px-5 py-0">
            <div className="leftHeader flex items-center justify-between gap-2">
              {(() => {
                // const selectedOne = ""
                const selectedOne = customers[0];
                //   customerCRUDHook.filteredCustomers?.find(
                //     (c) => c.id === selectedCustomer?.id
                //   ) ??
                //   selectedCustomer ??
                //   null;

                return (
                  <>
                    <Avatar className="size-25 text-5xl">
                      <AvatarImage
                        // sizes="40"
                        src={selectedOne?.pictureURL}
                        alt={selectedOne.fullName}
                      />
                      <AvatarFallback className="text">
                        {selectedOne.fullName?.[0]?.toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-2">
                      <span className="text-nowrap text-ellipsis overflow-hidden block w-full">
                        {selectedOne?.fullName}
                      </span>
                      <span className="text-nowrap text-ellipsis overflow-hidden block w-full">
                        {selectedOne?.address}
                      </span>
                    </div>
                  </>
                );
              })()}
            </div>
            <div className="rightHeader flex gap-1 items-center justify-center rounded-md">
              <Button
              // sx={{
              //   height: "100%",
              // }}
              // onClick={() => {
              //   console.log(selectedCustomer);
              //   customerCRUDHook.onClickEditCustomer();
              // }}
              >
                <Pencil className="w-4 h-4" />
              </Button>

              <Button
                // variant="outlined"
                color="error"
                // onClick={() =>
                //   customerCRUDHook.onClickDeleteCustomer(
                //     selectedCustomer
                //   )
                // }
                // sx={{
                //   height: "100%",
                // }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>

              <BookAppointment
                customer={customers[0]}
                existingAppointments={appointments}
                onSubmit={handleBookAppointment}
              />
            </div>
          </div>
        </div>

        {/* main content */}
        <div className="flex-1 overflow-hidden mt-2">
          <Tabs defaultValue="about" className="h-full flex flex-col">
            <TabsList>
              <TabsTrigger value="about" className="px-8">
                About
              </TabsTrigger>
              <TabsTrigger value="notes" className="px-8">
                Notes
              </TabsTrigger>
              <TabsTrigger value="appointments" className="px-8">
                Appointments
              </TabsTrigger>
              <TabsTrigger value="services" className="px-8">
                Services
              </TabsTrigger>
              <TabsTrigger value="progress" className="px-8">
                Progress
              </TabsTrigger>
            </TabsList>
            <TabsContent value="about" className="flex-1 overflow-y-auto p-6">
              <AboutTabContent customer={customers[0]} />
            </TabsContent>
            <TabsContent value="notes" className="flex-1 overflow-y-auto p-6">
              <NoteTabContent customer={customers[0]} />
            </TabsContent>
            <TabsContent
              value="appointments"
              className="flex-1 overflow-y-auto p-6"
            >
              <AppointmentTabContent customer={customers[0]} />
            </TabsContent>
            <TabsContent
              value="services"
              className="flex-1 overflow-y-auto p-6"
            >
              <ServiceTabContent customer={customers[0]} />
            </TabsContent>
            <TabsContent
              value="progress"
              className="flex-1 overflow-y-auto p-6"
            >
              <ProgressTabContent customer={customers[0]} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* add CustomerForm */}
      <Dialog open={!!openedDialog} onOpenChange={() => setOpenedDialog(null)}>
        <DialogContent
          className="sm:max-w-[800px]"
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
          </DialogHeader>

          <CustomerForm />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default page;
