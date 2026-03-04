"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  appointmentSchema,
  AppointmentFormData,
} from "./../../calendar/schemas/appointmentSchema";

import {
  Calendar as BigCalendar,
  Views,
  momentLocalizer,
  Event as CalendarEvent,
} from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./../style/CalendarStyle.scss";
import {
  CalendarIcon,
  Clock,
  DollarSign,
  House,
  LocationEdit,
  NotebookPen,
  Sparkles,
  Timer,
  UserStar,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import TimeRangePicker from "./TimeRangePicker";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";

import { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
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
import { toast } from "sonner";
import {
  BookAppointmentProps,
  CalendarEventType,
} from "../Interfaces/customerInterfaces";
import ColorPicker from "@/components/ColorPicker";
import { existingColors } from "@/app/[locale]/(dashboard)/Utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  addDuration,
  addOneHour,
  Classes,
  formatDate,
  getDefaultFormAppointmentValues,
  getDefaultServiceValues,
  getDefaultValues,
  getNextTimeSlot,
  handleFormSubmit,
  isValidDate,
  timeStringToDate,
} from "@/app/[locale]/(dashboard)/calendar/utils/helpers";
import moment from "moment";
import { Label } from "@/components/ui/label";
import BufferEventComponent from "@/app/[locale]/(dashboard)/calendar/calendarComps/BufferEventComponent";
import { formatDateToString } from "../utils/helpers";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

// Initialize localizer OUTSIDE the component
const localizer = momentLocalizer(moment);

const BookAppointment = ({
  customer,
  existingAppointments,
  onSubmit,
}: BookAppointmentProps) => {
  // ✅ Start with dialog CLOSED
  const [dialogOpen, setDialogOpen] = useState(false);

  // state for active tab (appointment type)
  const [activeTab, setActiveTab] = useState<
    "service" | "class" | "event" | "reminder"
  >("service");

  // ✅ Add mounting state
  const [isMounted, setIsMounted] = useState(false);
  // ✅ Calendar date - synced with date picker

  // ✅ Get default times based on current time
  const defaultStartTime = getNextTimeSlot();
  const defaultEndTime = addOneHour(defaultStartTime);

  // ✅ Control Calendar popover state properly

  // ✅ Control Calendar default date properly
  // const [date, setDate] = useState<Date | undefined>(new Date());

  // ✅ Control Calendar date value properly

  // ✅ Control Combobox state of services  properly
  const [openCombobox, setOpenCombobox] = useState(false);

  // ✅ Control Combobox value of services  properly
  const [valueCombobox, setValueCombobox] = useState("");

  // ✅ Control if time is valide  properly
  const [isTimeValid, setIsTimeValid] = useState(false);

  // ✅ Control selected service properly
  // const [selectedService, setSelectedService] = useState("");

  // ✅ Control selected Color properly
  // const [selectedColor, setSelectedColor] = useState(existingColors[0]);

  // ✅ Control selected Room properly
  const [selectedRoom, setSelectedRoom] = useState("");

  // ✅ Control typed Note properly
  // const [notes, setNotes] = useState("");

  // ✅ Initialize form
  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: getDefaultServiceValues(),
  });

  // ✅ Set mounted
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Watch form values for real-time updates
  const selectedService = form.watch("serviceId");
  const date = form.watch("date");
  const startTime = form.watch("startTime");
  const endTime = form.watch("endTime");
  const bufferTime = form.watch("bufferTime");
  const selectedColor = form.watch("color");
  const note = form.watch("note");
  const guests = form.watch("guests");

  // ✅ Convert existing appointments to calendar events
  // Validate existing appointments BEFORE mapping
  const existingEvents: CalendarEventType[] = useMemo(() => {
    if (!existingAppointments || !Array.isArray(existingAppointments)) {
      return [];
    }

    return existingAppointments
      .filter((apt) => {
        // ✅ CRITICAL: Validate dates exist and are valid
        if (!apt) return false;

        const hasValidStart =
          apt.start && apt.start instanceof Date && !isNaN(apt.start.getTime());

        const hasValidEnd =
          apt.end && apt.end instanceof Date && !isNaN(apt.end.getTime());

        if (!hasValidStart || !hasValidEnd) {
          console.warn("Invalid appointment found:", apt);
          return false;
        }

        return true;
      })
      .map((apt) => ({
        id: apt.id,
        title: apt.title || "Appointment",
        start: new Date(apt.start), // Create new Date instance
        end: new Date(apt.end), // Create new Date instance
        color: apt.color || "#3174ad",
      }));
  }, [existingAppointments]);

  // Get selected service info
  const selectedServiceInfo = useMemo(() => {
    if (!selectedService) return null;
    return (customer?.services || []).find((svc) => svc.id === selectedService);
  }, [customer?.services, selectedService]);

  // ✅ Reset form when dialog opens
  useEffect(() => {
    if (dialogOpen) {
      form.reset(getDefaultFormAppointmentValues());
    }
  }, [dialogOpen]);

  // ✅ 1. When service changes, sync buffer time AND adjust end time based on duration
  useEffect(() => {
    if (selectedServiceInfo?.bufferTime !== undefined) {
      form.setValue("bufferTime", selectedServiceInfo.bufferTime);
    }

    if (selectedServiceInfo?.duration) {
      const newEndTime = addDuration(startTime, selectedServiceInfo.duration);
      form.setValue("endTime", newEndTime);
    }
  }, [selectedServiceInfo, startTime, form]);

  // Reset form when tab changes
  useEffect(() => {
    if (dialogOpen) {
      const defaults = getDefaultValues(activeTab); // Get defaults based on active tab
      form.reset(defaults);
    }
  }, [dialogOpen, activeTab]); // ✅ Add activeTab dependency

  // Add hidden field for appointmentType
  useEffect(() => {
    form.setValue("appointmentType", activeTab);
  }, [activeTab, form]);

  // ✅ 2. When start time changes, maintain service duration
  const handleStartTimeChange = (newStartTime: string) => {
    form.setValue("startTime", newStartTime);

    if (selectedServiceInfo?.duration) {
      const newEndTime = addDuration(
        newStartTime,
        selectedServiceInfo.duration
      );
      form.setValue("endTime", newEndTime);
    }
  };

  // ✅ Handle end time change
  const handleEndTimeChange = (newEndTime: string) => {
    if (!selectedServiceInfo) {
      form.setValue("endTime", newEndTime);
    } else {
      toast.info(
        `End time is automatically set based on ${selectedServiceInfo.name} duration`
      );
    }
  };

  // ✅ Create draft event with proper time calculations for real-time preview
  // ✅ FIX: Add comprehensive validation to draft event
  const draftEvent: CalendarEventType | null = useMemo(() => {
    if (!isMounted || !date || !isValidDate(date) || !startTime || !endTime)
      return null;

    // if (!startTime || !endTime || !selectedService) return null;

    try {
      const dateStr = formatDateToString(date);
      const start = timeStringToDate(dateStr, startTime);
      const actualEnd = timeStringToDate(dateStr, endTime);

      let end: Date;
      let title: string;

      switch (activeTab) {
        case "service": {
          if (!endTime || !selectedService) return null;
          end = timeStringToDate(dateStr, endTime);
          const service = customer.services?.find(
            (s) => s.id === selectedService
          );
          title = service?.name || "Service";

          // Add buffer time
          const endWithBuffer = new Date(end);
          endWithBuffer.setMinutes(
            endWithBuffer.getMinutes() + (bufferTime || 0)
          );

          return {
            id: "draft",
            title,
            start,
            end: endWithBuffer,
            actualEnd: end,
            bufferTime: bufferTime || 0,
            color: selectedColor,
            isDraft: true,
          };
        }

        case "class": {
          if (!endTime) return null;
          end = timeStringToDate(dateStr, endTime);
          const classId = form.watch("classId");
          const classInfo = Classes.find((c) => c.id === classId);
          title = classInfo?.title || "Class";

          return {
            id: "draft",
            title,
            start,
            end,
            color: selectedColor,
            isDraft: true,
          };
        }

        case "event":
        case "reminder": {
          // Auto 15 minutes
          end = new Date(start);
          end.setMinutes(end.getMinutes() + 15);

          const name =
            activeTab === "event"
              ? form.watch("eventName")
              : form.watch("reminderText");

          title = name || (activeTab === "event" ? "Event" : "Reminder");

          return {
            id: "draft",
            title,
            start,
            end,
            color: selectedColor,
            isDraft: true,
          };
        }
      }

      // ✅ Validate created dates
      if (!start || isNaN(start.getTime())) {
        console.error("Invalid start date created");
        return null;
      }
      if (!actualEnd || isNaN(actualEnd.getTime())) {
        console.error("Invalid end date created");
        return null;
      }

      const endWithBuffer = new Date(actualEnd);
      endWithBuffer.setMinutes(endWithBuffer.getMinutes() + (bufferTime || 0));

      if (isNaN(endWithBuffer.getTime())) {
        console.error("Invalid buffer end date");
        return null;
      }

      // const title = selectedServiceInfo?.name || "Appointment";

      // return {
      //   id: "draft",
      //   title,
      //   start,
      //   end: endWithBuffer,
      //   actualEnd,
      //   bufferTime: bufferTime || 0,
      //   color: selectedColor || existingColors[0],
      //   isDraft: true,
      // };
    } catch (error) {
      console.error("Error creating draft event:", error);
      return null;
    }
  }, [
    isMounted,
    date,
    startTime,
    endTime,
    activeTab,
    selectedService,
    bufferTime,
    selectedColor,
    form,
  ]);

  // ✅ Combine existing and draft events
  const allEvents = useMemo(() => {
    const events = [...existingEvents];
    if (draftEvent) events.push(draftEvent);

    // ✅ FINAL SAFETY CHECK - filter out ANY invalid events
    const validEvents = events.filter((event) => {
      const isValid =
        event &&
        event.start instanceof Date &&
        !isNaN(event.start.getTime()) &&
        event.end instanceof Date &&
        !isNaN(event.end.getTime());

      if (!isValid) {
        console.warn("Filtered out invalid event:", event);
      }

      return isValid;
    });

    // console.log("📅 Valid events for calendar:", validEvents.length);
    return validEvents;
  }, [existingEvents, draftEvent]);

  // ✅ Safe calendar date
  const calendarDate = useMemo(() => {
    if (date instanceof Date && !isNaN(date.getTime())) {
      return date;
    }
    return new Date();
  }, [date]);

  // ✅ Event styling with buffer visualization only for colors and borders
  const eventPropGetter = useCallback((event: CalendarEventType) => {
    return {
      style: {
        borderRadius: "5px",
        color: "white",
        border: event.isDraft ? "2px dashed rgba(255, 255, 255, 0.9)" : "none",
        opacity: event.isDraft ? 0.85 : 1,
      },
    };
  }, []);

  // ✅ Don't render until mounted
  if (!isMounted) {
    return <Button disabled>Book appointment</Button>;
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {/* ✅ Wrap in Form component */}
      <DialogTrigger asChild>
        <Button>Book appointment</Button>
      </DialogTrigger>

      <Form {...form}>
        <form
          className="w-full "
          onSubmit={form.handleSubmit((data) =>
            handleFormSubmit(customer, data, onSubmit, setDialogOpen)
          )}
        >
          <DialogContent className="thisDialog flex flex-col justify-between w-full h-full gap-10! sm:max-w-full">
            <DialogHeader className="flex">
              <DialogTitle>Book Appointment for Achille</DialogTitle>
              <DialogDescription>
                Make changes to your profile here. Click save when you&apos;re
                done.
              </DialogDescription>
            </DialogHeader>

            <div className="flex w-full gap-8 h-[80%] ">
              {/* Big Calendar left side*/}
              <div className="flex-2">
                <div className={`customer-calendar-container h-full day-view`}>
                  {dialogOpen && isMounted ? (
                    <BigCalendar
                      defaultView={Views.DAY}
                      view={Views.DAY}
                      views={[Views.DAY]}
                      events={allEvents}
                      // ✅ Add fallback - never pass undefined
                      date={calendarDate}
                      localizer={localizer}
                      style={{ height: "100%" }}
                      startAccessor="start"
                      endAccessor="end"
                      step={15} // each slot = 15 minutes
                      timeslots={4} // 4 slots per hour → 15 × 4 = 60 min
                      eventPropGetter={eventPropGetter}
                      formats={{
                        timeGutterFormat: (date, culture, localizer: any) =>
                          localizer.format(date, "h A", culture),
                      }}
                      toolbar={true}
                      // ✅  Use custom event component
                      components={{
                        event: BufferEventComponent,
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      Loading calendar...
                    </div>
                  )}
                </div>
              </div>

              {/* Tabs right Side */}
              <Tabs
                defaultValue="service"
                className="flex-1"
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as any)}
              >
                <TabsList>
                  <TabsTrigger value="service">Service</TabsTrigger>
                  <TabsTrigger value="class">Class</TabsTrigger>
                  <TabsTrigger value="event">Event</TabsTrigger>
                  <TabsTrigger value="reminder">Reminder</TabsTrigger>
                </TabsList>
                {/* service Tab */}
                <TabsContent value="service">
                  <Card>
                    <CardContent className="grid gap-6">
                      <div className="grid gap-8 flex-1 h-fit">
                        {/* Service selector */}
                        <FormField
                          control={form.control}
                          name="serviceId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4" />
                                Service
                              </FormLabel>

                              <div className="flex  items-start flex-col gap-4 w-full mt-2">
                                <div className="flex items-center gap-3 w-full">
                                  <FormField
                                    control={form.control}
                                    name="color"
                                    render={({ field: colorField }) => (
                                      <ColorPicker
                                        eventColors={existingColors}
                                        selectedColor={
                                          colorField.value || existingColors[0]
                                        }
                                        onColorChange={colorField.onChange}
                                      />
                                    )}
                                  />

                                  <div className="flex-1 min-w-0 w-full">
                                    <Select
                                      value={field.value}
                                      onValueChange={field.onChange}
                                    >
                                      <FormControl>
                                        <SelectTrigger className="flex-1 w-full">
                                          <SelectValue placeholder="Select service..." />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {(customer.services || []).map(
                                          (service) => (
                                            <SelectItem
                                              key={service.id}
                                              value={service.id}
                                            >
                                              {service.name}
                                            </SelectItem>
                                          )
                                        )}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                {/* Service Info */}
                                <div className="info ml-10 w-full">
                                  {selectedServiceInfo ? (
                                    <div className="space-y-1 flex items-center w-full gap-7 text-sm">
                                      <div className="flex items-center gap-7">
                                        {selectedServiceInfo.price && (
                                          <p className="text-muted-foreground flex items-center gap-1">
                                            <DollarSign className="h-4 w-4" />
                                            Cost: ${selectedServiceInfo.price}
                                          </p>
                                        )}
                                        {selectedServiceInfo.duration && (
                                          <p className="text-muted-foreground flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            Duration:{" "}
                                            {selectedServiceInfo.duration} min
                                          </p>
                                        )}
                                        {/* Buffer Time */}
                                        <div className="flex items-center gap-3">
                                          <FormField
                                            control={form.control}
                                            name="bufferTime"
                                            render={({ field }) => (
                                              <FormItem className="flex ">
                                                <FormLabel className="text-muted-foreground flex items-center gap-1">
                                                  <Timer className="h-4 w-4" />
                                                  Buffer
                                                </FormLabel>
                                                <Select
                                                  value={field.value.toString()}
                                                  onValueChange={(value) =>
                                                    field.onChange(
                                                      parseInt(value)
                                                    )
                                                  }
                                                >
                                                  <FormControl>
                                                    <SelectTrigger>
                                                      <SelectValue />
                                                    </SelectTrigger>
                                                  </FormControl>
                                                  <SelectContent>
                                                    <SelectItem value="0">
                                                      No buffer
                                                    </SelectItem>
                                                    <SelectItem value="15">
                                                      15 min
                                                    </SelectItem>
                                                    <SelectItem value="30">
                                                      30 min
                                                    </SelectItem>
                                                    <SelectItem value="45">
                                                      45 min
                                                    </SelectItem>
                                                    <SelectItem value="60">
                                                      60 min
                                                    </SelectItem>
                                                    <SelectItem value="90">
                                                      90 min
                                                    </SelectItem>
                                                    <SelectItem value="120">
                                                      120 min
                                                    </SelectItem>
                                                  </SelectContent>
                                                </Select>
                                                <FormMessage />
                                              </FormItem>
                                            )}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-sm text-muted-foreground italic ml-0">
                                      Select a service to see details
                                    </p>
                                  )}
                                </div>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Date and Time Pickers */}
                        <div className="flex items-center gap-6 w-full">
                          <Clock />
                          <div className="flex flex-1 gap-14 min-w-0">
                            {/* Date Picker */}
                            <FormField
                              control={form.control}
                              name="date"
                              render={({ field }) => (
                                <FormItem className="flex flex-col">
                                  <FormLabel>Date</FormLabel>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <FormControl>
                                        <Button
                                          variant="outline"
                                          className={cn(
                                            "w-full pl-3 text-left font-normal",
                                            !field.value &&
                                              "text-muted-foreground"
                                          )}
                                        >
                                          {field.value ? (
                                            formatDate(field.value)
                                          ) : (
                                            <span>Pick a date</span>
                                          )}
                                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                      </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent
                                      className="w-auto p-0"
                                      align="start"
                                    >
                                      <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={{ before: new Date() }}
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            {/* Time Range */}
                            <div className="space-y-2">
                              <Label>Time</Label>
                              <TimeRangePicker
                                startTime={startTime}
                                endTime={endTime}
                                selectedDate={formatDateToString(date)}
                                appointments={existingAppointments}
                                onStartTimeChange={handleStartTimeChange}
                                onEndTimeChange={handleEndTimeChange}
                                onValidationChange={(isValid) => {
                                  // You can use this for additional validation
                                }}
                                isEndTimeDisabled={!!selectedServiceInfo}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Duration Info - placeholder for future implementation */}

                        {/* Guest */}
                        <FormField
                          control={form.control}
                          name="guests"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <UserStar className="h-4 w-4" />
                                Guest
                              </FormLabel>
                              <FormControl className="mt-2">
                                <div className="flex  items-center gap-2">
                                  <Avatar>
                                    <AvatarImage
                                      src="https://github.com/shadcn.png"
                                      alt="@shadcn"
                                    />
                                    <AvatarFallback>CN</AvatarFallback>
                                  </Avatar>
                                  <span>{customer.fullName}</span>
                                </div>
                              </FormControl>

                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Room */}
                        <FormField
                          control={form.control}
                          name="room"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <House className="h-4 w-4" />
                                Room
                              </FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <FormControl className="mt-2">
                                  <SelectTrigger className="w-full ">
                                    <SelectValue placeholder="Select a room" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="">
                                  <SelectItem value="room-a">Room A</SelectItem>
                                  <SelectItem value="room-b">Room B</SelectItem>
                                  <SelectItem value="room-c">Room C</SelectItem>
                                  <SelectItem value="room-d">Room D</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />

                        {/* Note */}
                        <FormField
                          control={form.control}
                          name="note"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <NotebookPen className="h-4 w-4" />
                                Note
                              </FormLabel>
                              <FormControl className="mt-2">
                                <Textarea
                                  placeholder="Note to provider..."
                                  className="resize-none"
                                  rows={4}
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Optional note about the appointment (max 500
                                characters)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Creator */}
                        <div className="flex items-center gap-6">
                          <Avatar>
                            <AvatarImage
                              src="https://github.com/shadcn.png"
                              alt="@shadcn"
                            />
                            <AvatarFallback>CN</AvatarFallback>
                          </Avatar>
                          <span>Hatim Fangour</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* class Tab */}
                <TabsContent value="class">
                  <Card>
                    <CardContent className="grid gap-6">
                      <div className="grid gap-8 flex-1 h-fit">
                        {/* Class selector */}
                        <FormField
                          control={form.control}
                          name="serviceId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4" />
                                Class
                              </FormLabel>

                              <div className="flex  items-start flex-col gap-4 w-full mt-2">
                                <div className="flex items-center gap-3 w-full">
                                  <FormField
                                    control={form.control}
                                    name="color"
                                    render={({ field: colorField }) => (
                                      <ColorPicker
                                        eventColors={existingColors}
                                        selectedColor={
                                          colorField.value || existingColors[0]
                                        }
                                        onColorChange={colorField.onChange}
                                      />
                                    )}
                                  />

                                  <div className="flex-1 min-w-0 w-full">
                                    <Select
                                      value={field.value}
                                      onValueChange={field.onChange}
                                    >
                                      <FormControl>
                                        <SelectTrigger className="flex-1 w-full">
                                          <SelectValue placeholder="Select class..." />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {(Classes || []).map((Cls) => (
                                          <SelectItem
                                            key={Cls.id}
                                            value={Cls.id}
                                          >
                                            {Cls.title}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                {/* Service Info */}
                                <div className="info ml-10 w-full">
                                  {selectedServiceInfo ? (
                                    <div className="space-y-1 flex items-center w-full gap-7 text-sm">
                                      <div className="flex items-center gap-7">
                                        {selectedServiceInfo.price && (
                                          <p className="text-muted-foreground flex items-center gap-1">
                                            <DollarSign className="h-4 w-4" />
                                            Cost: ${selectedServiceInfo.price}
                                          </p>
                                        )}
                                        {selectedServiceInfo.duration && (
                                          <p className="text-muted-foreground flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            Duration:{" "}
                                            {selectedServiceInfo.duration} min
                                          </p>
                                        )}
                                        {/* Buffer Time */}
                                        <div className="flex items-center gap-3">
                                          <FormField
                                            control={form.control}
                                            name="bufferTime"
                                            render={({ field }) => (
                                              <FormItem className="flex ">
                                                <FormLabel className="text-muted-foreground flex items-center gap-1">
                                                  <Timer className="h-4 w-4" />
                                                  Buffer
                                                </FormLabel>
                                                <Select
                                                  value={field.value.toString()}
                                                  onValueChange={(value) =>
                                                    field.onChange(
                                                      parseInt(value)
                                                    )
                                                  }
                                                >
                                                  <FormControl>
                                                    <SelectTrigger>
                                                      <SelectValue />
                                                    </SelectTrigger>
                                                  </FormControl>
                                                  <SelectContent>
                                                    <SelectItem value="0">
                                                      No buffer
                                                    </SelectItem>
                                                    <SelectItem value="15">
                                                      15 min
                                                    </SelectItem>
                                                    <SelectItem value="30">
                                                      30 min
                                                    </SelectItem>
                                                    <SelectItem value="45">
                                                      45 min
                                                    </SelectItem>
                                                    <SelectItem value="60">
                                                      60 min
                                                    </SelectItem>
                                                    <SelectItem value="90">
                                                      90 min
                                                    </SelectItem>
                                                    <SelectItem value="120">
                                                      120 min
                                                    </SelectItem>
                                                  </SelectContent>
                                                </Select>
                                                <FormMessage />
                                              </FormItem>
                                            )}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-sm text-muted-foreground italic ml-0">
                                      Select a class to see details
                                    </p>
                                  )}
                                </div>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Date and Time Pickers */}
                        <div className="flex items-center gap-6 w-full">
                          <Clock />
                          <div className="flex flex-1 gap-14 min-w-0">
                            {/* Date Picker */}
                            <FormField
                              control={form.control}
                              name="date"
                              render={({ field }) => (
                                <FormItem className="flex flex-col">
                                  <FormLabel>Date</FormLabel>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <FormControl>
                                        <Button
                                          variant="outline"
                                          className={cn(
                                            "w-full pl-3 text-left font-normal",
                                            !field.value &&
                                              "text-muted-foreground"
                                          )}
                                        >
                                          {field.value ? (
                                            formatDate(field.value)
                                          ) : (
                                            <span>Pick a date</span>
                                          )}
                                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                      </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent
                                      className="w-auto p-0"
                                      align="start"
                                    >
                                      <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={{ before: new Date() }}
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            {/* Time Range */}
                            <div className="space-y-2">
                              <Label>Time</Label>
                              <TimeRangePicker
                                startTime={startTime}
                                endTime={endTime}
                                selectedDate={formatDateToString(date)}
                                appointments={existingAppointments}
                                onStartTimeChange={handleStartTimeChange}
                                onEndTimeChange={handleEndTimeChange}
                                onValidationChange={(isValid) => {
                                  // You can use this for additional validation
                                }}
                                isEndTimeDisabled={!!selectedServiceInfo}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Guest */}
                        <FormField
                          control={form.control}
                          name="note"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <UserStar className="h-4 w-4" />
                                Guest
                              </FormLabel>
                              <FormControl className="mt-2">
                                <div className="flex  items-center gap-2">
                                  <Avatar>
                                    <AvatarImage
                                      src="https://github.com/shadcn.png"
                                      alt="@shadcn"
                                    />
                                    <AvatarFallback>CN</AvatarFallback>
                                  </Avatar>
                                  <span>{customer.fullName}</span>
                                </div>
                              </FormControl>

                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Notes */}
                        <FormField
                          control={form.control}
                          name="note"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <NotebookPen className="h-4 w-4" />
                                Notes
                              </FormLabel>
                              <FormControl className="mt-2">
                                <Textarea
                                  placeholder="Notes to provider..."
                                  className="resize-none"
                                  rows={4}
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Optional notes about the appointment (max 500
                                characters)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Creator */}
                        <div className="flex items-center gap-6">
                          <Avatar>
                            <AvatarImage
                              src="https://github.com/shadcn.png"
                              alt="@shadcn"
                            />
                            <AvatarFallback>CN</AvatarFallback>
                          </Avatar>
                          <span>Hatim Fangour</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Event Tab */}
                <TabsContent value="event">
                  <Card>
                    <CardContent className="grid gap-6">
                      <div className="grid gap-8 flex-1 h-fit">
                        {/* Event Name */}
                        <FormField
                          control={form.control}
                          name="eventName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4" />
                                Event
                              </FormLabel>

                              <div className="flex  items-start flex-col gap-4 w-full mt-2">
                                <div className="flex items-center gap-3 w-full">
                                  <FormField
                                    control={form.control}
                                    name="color"
                                    render={({ field: colorField }) => (
                                      <ColorPicker
                                        eventColors={existingColors}
                                        selectedColor={
                                          colorField.value || existingColors[0]
                                        }
                                        onColorChange={colorField.onChange}
                                      />
                                    )}
                                  />

                                  <div className="flex-1 min-w-0 w-full">
                                    <Select
                                      value={field.value}
                                      onValueChange={field.onChange}
                                    >
                                      <FormControl>
                                        <Input
                                          placeholder="Event name"
                                          className="resize-none"
                                          {...field}
                                        />
                                      </FormControl>
                                    </Select>
                                  </div>
                                </div>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Date and Time Pickers */}
                        <div className="flex items-center gap-6 w-full">
                          <Clock />
                          <div className="flex flex-1 gap-14 min-w-0">
                            {/* Date Picker */}
                            <FormField
                              control={form.control}
                              name="date"
                              render={({ field }) => (
                                <FormItem className="flex flex-col">
                                  <FormLabel>Date</FormLabel>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <FormControl>
                                        <Button
                                          variant="outline"
                                          className={cn(
                                            "w-full pl-3 text-left font-normal",
                                            !field.value &&
                                              "text-muted-foreground"
                                          )}
                                        >
                                          {field.value ? (
                                            formatDate(field.value)
                                          ) : (
                                            <span>Pick a date</span>
                                          )}
                                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                      </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent
                                      className="w-auto p-0"
                                      align="start"
                                    >
                                      <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={{ before: new Date() }}
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            {/* Time Range */}
                            <div className="space-y-2">
                              <Label>Time</Label>
                              <TimeRangePicker
                                startTime={startTime}
                                endTime={endTime}
                                selectedDate={formatDateToString(date)}
                                appointments={existingAppointments}
                                onStartTimeChange={handleStartTimeChange}
                                onEndTimeChange={handleEndTimeChange}
                                onValidationChange={(isValid) => {
                                  // You can use this for additional validation
                                }}
                                isEndTimeDisabled={!!selectedServiceInfo}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Guest */}
                        <FormField
                          control={form.control}
                          name="note"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <UserStar className="h-4 w-4" />
                                Guest
                              </FormLabel>
                              <FormControl className="mt-2">
                                <div className="flex  items-center gap-2">
                                  <Avatar>
                                    <AvatarImage
                                      src="https://github.com/shadcn.png"
                                      alt="@shadcn"
                                    />
                                    <AvatarFallback>CN</AvatarFallback>
                                  </Avatar>
                                  <span>{customer.fullName}</span>
                                </div>
                              </FormControl>

                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Location */}
                        <FormField
                          control={form.control}
                          name="note"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <LocationEdit className="h-4 w-4" />
                                Location
                              </FormLabel>
                              <FormControl className="mt-2">
                                <Textarea
                                  placeholder="Add location or video link"
                                  className="resize-none"
                                  rows={4}
                                  {...field}
                                />
                              </FormControl>

                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Notes */}
                        <FormField
                          control={form.control}
                          name="note"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <NotebookPen className="h-4 w-4" />
                                Notes
                              </FormLabel>
                              <FormControl className="mt-2">
                                <Textarea
                                  placeholder="Notes to provider..."
                                  className="resize-none"
                                  rows={4}
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Optional notes about the appointment (max 500
                                characters)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Creator */}
                        <div className="flex items-center gap-6">
                          <Avatar>
                            <AvatarImage
                              src="https://github.com/shadcn.png"
                              alt="@shadcn"
                            />
                            <AvatarFallback>CN</AvatarFallback>
                          </Avatar>
                          <span>Hatim Fangour</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Reminder Tab */}
                <TabsContent value="reminder">
                  <Card>
                    <CardContent className="grid gap-6">
                      <div className="grid gap-8 flex-1 h-fit">
                        {/* Date and Time Pickers */}
                        <div className="flex items-center gap-6 w-full">
                          <Clock />
                          <div className="flex flex-1 gap-14 min-w-0">
                            {/* Date Picker */}
                            <FormField
                              control={form.control}
                              name="date"
                              render={({ field }) => (
                                <FormItem className="flex flex-col">
                                  <FormLabel>Date</FormLabel>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <FormControl>
                                        <Button
                                          variant="outline"
                                          className={cn(
                                            "w-full pl-3 text-left font-normal",
                                            !field.value &&
                                              "text-muted-foreground"
                                          )}
                                        >
                                          {field.value ? (
                                            formatDate(field.value)
                                          ) : (
                                            <span>Pick a date</span>
                                          )}
                                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                      </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent
                                      className="w-auto p-0"
                                      align="start"
                                    >
                                      <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={{ before: new Date() }}
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            {/* Time Range */}
                            <div className="space-y-2">
                              <Label>Time</Label>
                              <TimeRangePicker
                                startTime={startTime}
                                endTime={endTime}
                                selectedDate={formatDateToString(date)}
                                appointments={existingAppointments}
                                onStartTimeChange={handleStartTimeChange}
                                onEndTimeChange={handleEndTimeChange}
                                onValidationChange={(isValid) => {
                                  // You can use this for additional validation
                                }}
                                isEndTimeDisabled={!!selectedServiceInfo}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Notes */}
                        <FormField
                          control={form.control}
                          name="note"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <NotebookPen className="h-4 w-4" />
                                Notes
                              </FormLabel>
                              <FormControl className="mt-2">
                                <Textarea
                                  placeholder="Notes to provider..."
                                  className="resize-none"
                                  rows={4}
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Optional notes about the appointment (max 500
                                characters)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Creator */}
                        <div className="flex items-center gap-6">
                          <Avatar>
                            <AvatarImage
                              src="https://github.com/shadcn.png"
                              alt="@shadcn"
                            />
                            <AvatarFallback>CN</AvatarFallback>
                          </Avatar>
                          <span>Hatim Fangour</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                type="submit"
                // onClick={() => {
                //   console.log("Form values:", form.getValues());
                //   console.log("Form errors:", form.formState.errors);
                //   console.log("Is valid?", form.formState.isValid);
                // }}
                onClick={form.handleSubmit((data) =>
                  handleFormSubmit(customer, data, onSubmit, setDialogOpen)
                )}
                // disabled={
                //   !form.formState.isValid || form.formState.isSubmitting
                // }
              >
                {form.formState.isSubmitting
                  ? "Booking..."
                  : "Book Appointment"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </Form>
    </Dialog>
  );
};

export default BookAppointment;
