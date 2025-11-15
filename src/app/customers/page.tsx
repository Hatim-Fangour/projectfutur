"use client";
import ColorPicker from "@/components/ColorPicker";
import AboutTabContent from "@/components/customers/AboutTabContent";
import AppointmentTabContent from "@/components/customers/AppointmentTabContent";
import CustomerForm from "@/components/customers/CustomerForm";
import NoteTabContent from "@/components/customers/NoteTabContent";
import ProgressTabContent from "@/components/customers/ProgressTabContent";
import ServiceTabContent from "@/components/customers/ServiceTabContent";
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
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CalendarIcon,
  Check,
  ChevronsUpDown,
  Clock,
  Pencil,
  ReceiptText,
  Sparkles,
  TimerReset,
  Trash,
  Trash2,
  User,
  X,
} from "lucide-react";
import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import TimeRangePicker from "@/components/customers/TimeRangePicker";
import { Textarea } from "@/components/ui/textarea";
import { Customer } from "@/types/customers";

function formatDate(date: Date | undefined) {
  if (!date) {
    return "";
  }
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
function isValidDate(date: Date | undefined) {
  if (!date) {
    return false;
  }
  return !isNaN(date.getTime());
}

const page = () => {
  const [openedDialog, setOpenedDialog] = useState<boolean | null>(null);
  const tags = Array.from({ length: 50 }).map(
    (_, i, a) => `v1.2.0-beta.${a.length - i}`
  );
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date("2025-06-01"));
  const [month, setMonth] = useState<Date | undefined>(date);
  const [value, setValue] = useState(formatDate(date));
  const [openCombobox, setOpenCombobox] = useState(false);
  const [valueCombobox, setValueCombobox] = useState("");

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
          date: "2024-11-13",
          startTime: "14:00",
          endTime: "15:15",
          service: "Full Body Massage",
          therapist: "Sarah Johnson",
          reason: "Relaxation and stress relief",
          status: "completed",
          room: "Spa Studio A",
          duration: "90 min",
          notes: "Great session, client was very satisfied",
        },
        {
          id: "2",
          date: "2024-11-20",
          startTime: "10:30",
          endTime: "10:30",
          service: "Facial Treatment",
          therapist: "Emma Davis",
          reason: "Anti-aging treatment",
          status: "upcoming",
          room: "Spa Studio B",
          duration: "60 min",
        },
        {
          id: "3",
          date: "2024-11-06",
          startTime: "15:30",
          endTime: "16:30",
          service: "Hot Stone Massage",
          therapist: "Michael Chen",
          reason: "Deep tissue and relaxation",
          status: "completed",
          room: "Spa Studio A",
          duration: "75 min",
          notes: "Client reported excellent results",
        },
        {
          id: "4",
          date: "2024-11-27",
          startTime: "11:00",
          endTime: "11:30",
          service: "Spa Package - Full Treatment",
          therapist: "Sarah Johnson",
          reason: "Complete wellness package",
          status: "upcoming",
          room: "Spa Studio C",
          duration: "180 min",
        },
        {
          id: "5",
          date: "2024-10-30",
          startTime: "09:00",
          endTime: "09:30",

          service: "Skincare Treatment",
          therapist: "Emma Davis",
          reason: "Skin health and hydration",
          status: "completed",
          room: "Spa Studio B",
          duration: "45 min",
        },
      ],
      services: ["serviceID_1", "serviceID_2"],
      progress: [
        { date: "2024-10-01", details: "Initial consultation completed." },
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



  const frameworks = [
    {
      value: "next.js",
      label: "Next.js",
    },
    {
      value: "sveltekit",
      label: "SvelteKit",
    },
    {
      value: "nuxt.js",
      label: "Nuxt.js",
    },
    {
      value: "remix",
      label: "Remix",
    },
    {
      value: "astro",
      label: "Astro",
    },
  ];

  const [startTime, setStartTime] = useState("09:00 AM");
  const [endTime, setEndTime] = useState("05:00 PM");

  // Generate hours 1-12
  const hours = Array.from({ length: 12 }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );

  // Generate minutes in 15-minute intervals
  const minutes = ["00", "15", "30", "45"];

  const BUSINESS_HOURS = {
    start: "08:00 AM",
    end: "08:00 PM",
  };

  return (
    <div className="grid grid-cols-10 gap-4 h-[calc(100vh-95px)] w-full overflow-hidden">
      {/* left sidebar */}
      {true && (
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
      )}

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

              <Dialog>
                <form>
                  <DialogTrigger asChild>
                    <Button>Book appointment</Button>
                  </DialogTrigger>
                  <DialogContent className="w-1/2! h-[95%]! max-w-full!">
                    <DialogHeader>
                      <DialogTitle>Book Appointment for Achille</DialogTitle>
                      <DialogDescription>
                        Make changes to your profile here. Click save when
                        you&apos;re done.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-8">
                      {/* Service selector */}
                      <div className="flex  items-center gap-4">
                        <span>ColorPicker</span>
                        <Popover
                          open={openCombobox}
                          onOpenChange={setOpenCombobox}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={openCombobox}
                              className="w-[200px] justify-between"
                            >
                              {valueCombobox
                                ? frameworks.find(
                                    (framework) =>
                                      framework.value === valueCombobox
                                  )?.label
                                : "Select framework..."}
                              <ChevronsUpDown className="opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[200px] p-0">
                            <Command>
                              <CommandInput
                                placeholder="Search framework..."
                                className="h-9"
                              />
                              <CommandList>
                                <CommandEmpty>No framework found.</CommandEmpty>
                                <CommandGroup>
                                  {frameworks.map((framework) => (
                                    <CommandItem
                                      key={framework.value}
                                      value={framework.value}
                                      onSelect={(currentValue) => {
                                        setValueCombobox(
                                          currentValue === valueCombobox
                                            ? ""
                                            : currentValue
                                        );
                                        setOpenCombobox(false);
                                      }}
                                    >
                                      {framework.label}
                                      <Check
                                        className={cn(
                                          "ml-auto",
                                          valueCombobox === framework.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Date and Time */}
                      <div className="flex  items-center gap-4">
                        <span>Clock</span>
                        {/* date */}
                        <div>
                          <div className="flex flex-col gap-3">
                            <div className="relative flex gap-2">
                              <Input
                                id="date"
                                value={value}
                                placeholder="June 01, 2025"
                                className="bg-background pr-10"
                                onChange={(e) => {
                                  const date = new Date(e.target.value);
                                  setValue(e.target.value);
                                  if (isValidDate(date)) {
                                    setDate(date);
                                    setMonth(date);
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "ArrowDown") {
                                    e.preventDefault();
                                    setOpen(true);
                                  }
                                }}
                              />
                              <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                  <Button
                                    id="date-picker"
                                    variant="ghost"
                                    className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                                  >
                                    <CalendarIcon className="size-3.5" />
                                    <span className="sr-only">Select date</span>
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto overflow-hidden p-0"
                                  align="end"
                                  alignOffset={-8}
                                  sideOffset={10}
                                >
                                  <Calendar
                                    mode="single"
                                    selected={date}
                                    captionLayout="dropdown"
                                    disabled={{ before: new Date() }}
                                    month={month}
                                    onMonthChange={setMonth}
                                    onSelect={(date) => {
                                      setDate(date);
                                      setValue(formatDate(date));
                                      setOpen(false);
                                    }}
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                          </div>
                        </div>

                        {/* Time */}
                        <div>
                          <TimeRangePicker
                            startTime={startTime}
                            endTime={endTime}
                            onStartTimeChange={setStartTime}
                            onEndTimeChange={setEndTime}
                          />
                        </div>
                      </div>

                      {/* Guest */}
                      <div className="flex  items-center gap-4">
                        <span>Guest icon</span>
                        <div>
                          <div>
                            <Avatar>
                              <AvatarImage
                                src="https://github.com/shadcn.png"
                                alt="@shadcn"
                              />
                              <AvatarFallback>CN</AvatarFallback>
                            </Avatar>
                          </div>
                          <span>{customers[0].fullName}</span>
                        </div>
                      </div>

                      {/* Note */}
                      <div className="flex  items-center gap-4">
                        <span>Note icon</span>
                        <div>
                          <Textarea placeholder="Notes to provider and guest(s)" />
                        </div>
                      </div>

                      {/* Creator */}
                      <div className="flex  items-center gap-4">
                        <span>Craetor icon</span>
                        <div>
                          <div>
                            <Avatar>
                              <AvatarImage
                                src="https://github.com/shadcn.png"
                                alt="@shadcn"
                              />
                              <AvatarFallback>CN</AvatarFallback>
                            </Avatar>
                          </div>
                          <span>Hatim Fangour</span>
                        </div>
                      </div>
                    </div>

                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button type="submit">Book Appointment</Button>
                    </DialogFooter>
                  </DialogContent>
                </form>
              </Dialog>
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
              <AppointmentTabContent customer={customers[0]}/>
            </TabsContent>
            <TabsContent
              value="services"
              className="flex-1 overflow-y-auto p-6"
            >
              <ServiceTabContent customer={customers[0]}/>
            </TabsContent>
            <TabsContent
              value="progress"
              className="flex-1 overflow-y-auto p-6"
            >
              <ProgressTabContent customer={customers[0]}/>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={!!openedDialog} onOpenChange={() => setOpenedDialog(null)}>
        <CustomerForm />
      </Dialog>
    </div>
  );
};

export default page;
