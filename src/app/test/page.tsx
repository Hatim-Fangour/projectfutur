"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { appointmentSchema, AppointmentFormData } from "@/schemas/appointmentSchema";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { BookAppointmentProps } from "../customers/Interfaces/customerInterfaces";
// ... your other imports

const BookAppointment = ({
  customer,
  existingAppointments,
  onSubmit,
}: BookAppointmentProps) => {
  const defaultStartTime = getNextTimeSlot();
  const defaultEndTime = addOneHour(defaultStartTime);

  // ✅ Initialize React Hook Form with Zod validation
  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      serviceId: "",
      date: new Date(),
      startTime: defaultStartTime,
      endTime: defaultEndTime,
      bufferTime: 0,
      room: "",
      notes: "",
      color: existingColors[0],
    },
  });

  // Watch form values for real-time updates
  const selectedService = form.watch("serviceId");
  const date = form.watch("date");
  const startTime = form.watch("startTime");
  const endTime = form.watch("endTime");
  const bufferTime = form.watch("bufferTime");
  const selectedColor = form.watch("color");

  // ✅ Get selected service data
  const selectedServiceInfo = useMemo(() => {
    if (!selectedService) return null;
    return (customer.services || []).find((svc) => svc.id === selectedService);
  }, [customer.services, selectedService]);

  // ✅ Sync buffer time when service changes
  useEffect(() => {
    if (selectedServiceInfo?.bufferTime !== undefined) {
      form.setValue("bufferTime", selectedServiceInfo.bufferTime);
    }

    if (selectedServiceInfo?.duration) {
      const newEndTime = addDuration(startTime, selectedServiceInfo.duration);
      form.setValue("endTime", newEndTime);
    }
  }, [selectedServiceInfo, startTime, form]);

  // ✅ Handle start time change
  const handleStartTimeChange = (newStartTime: string) => {
    form.setValue("startTime", newStartTime);

    if (selectedServiceInfo?.duration) {
      const newEndTime = addDuration(newStartTime, selectedServiceInfo.duration);
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

  // ✅ Create draft event
  const draftEvent = useMemo(() => {
    if (!date || !startTime || !endTime || !selectedService) return null;

    const dateStr = formatDateToString(date);
    const start = timeStringToDate(dateStr, startTime);
    const actualEnd = timeStringToDate(dateStr, endTime);
    const endWithBuffer = new Date(actualEnd);
    endWithBuffer.setMinutes(endWithBuffer.getMinutes() + bufferTime);

    const title = selectedServiceInfo?.name || "Appointment";

    return {
      id: "draft",
      title,
      start,
      end: endWithBuffer,
      actualEnd,
      bufferTime,
      color: selectedColor,
      isDraft: true,
    };
  }, [date, startTime, endTime, selectedService, bufferTime, selectedColor, selectedServiceInfo]);

  const allEvents = useMemo(() => {
    const events = [...existingEvents];
    if (draftEvent) events.push(draftEvent);
    return events;
  }, [existingEvents, draftEvent]);

  // ✅ Form submission handler
  const handleFormSubmit = (data: AppointmentFormData) => {
    const serviceName = customer.services?.find(
      (svc) => svc.id === data.serviceId
    )?.name || "Unknown Service";

    const endWithBuffer = addDuration(data.endTime, data.bufferTime);

    const appointment = {
      date: formatDateToString(data.date),
      startTime: data.startTime,
      endTime: data.endTime,
      bufferEndTime: endWithBuffer,
      bufferMinutes: data.bufferTime,
      serviceId: data.serviceId,
      serviceName,
      customerId: customer.id,
      customerName: customer.fullName,
      room: data.room,
      notes: data.notes,
      color: data.color,
      status: "pending" as const,
    };

    onSubmit(appointment);
    toast.success("Appointment booked successfully!");
    
    // Reset form
    form.reset();
    setDialogOpen(false);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button>Book appointment</Button>
      </DialogTrigger>

      <DialogContent className="thisDialog flex flex-col w-full h-full sm:max-w-full">
        <DialogHeader>
          <DialogTitle>Book Appointment for {customer.fullName}</DialogTitle>
          <DialogDescription>
            Select service, date and time. Duration is automatically set based on service.
          </DialogDescription>
        </DialogHeader>

        {/* ✅ Wrap in Form component */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="flex w-full gap-8 h-[80%]">
            {/* Calendar */}
            <div className="flex-2">
              <div className="customer-calendar-container h-full day-view">
                <BigCalendar
                  localizer={localizer}
                  events={allEvents}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: "100%" }}
                  defaultView={Views.DAY}
                  view={Views.DAY}
                  views={[Views.DAY]}
                  date={date}
                  onNavigate={(newDate) => form.setValue("date", newDate)}
                  step={15}
                  timeslots={4}
                  eventPropGetter={eventPropGetter}
                  components={{ event: BufferEventComponent }}
                  formats={{
                    timeGutterFormat: (date, culture, localizer: any) =>
                      localizer.format(date, "h A", culture),
                  }}
                  toolbar={true}
                />
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid gap-6 flex-1 h-fit">
              {/* Service Selector */}
              <FormField
                control={form.control}
                name="serviceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service</FormLabel>
                    <div className="flex items-center gap-3">
                      <FormField
                        control={form.control}
                        name="color"
                        render={({ field: colorField }) => (
                          <ColorPicker
                            eventColors={existingColors}
                            selectedColor={colorField.value || existingColors[0]}
                            onColorChange={colorField.onChange}
                          />
                        )}
                      />
                      
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select service..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(customer.services || []).map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              {service.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Service Info */}
              {selectedServiceInfo && (
                <div className="text-sm text-muted-foreground flex items-center gap-4">
                  {selectedServiceInfo.price && (
                    <span>Cost: ${selectedServiceInfo.price}</span>
                  )}
                  {selectedServiceInfo.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Duration: {selectedServiceInfo.duration} min
                    </span>
                  )}
                </div>
              )}

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
                              !field.value && "text-muted-foreground"
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
                      <PopoverContent className="w-auto p-0" align="start">
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

              {/* Buffer Time */}
              <FormField
                control={form.control}
                name="bufferTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Timer className="h-4 w-4" />
                      Buffer Time
                    </FormLabel>
                    <Select
                      value={field.value.toString()}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">No buffer</SelectItem>
                        <SelectItem value="15">15 min</SelectItem>
                        <SelectItem value="30">30 min</SelectItem>
                        <SelectItem value="45">45 min</SelectItem>
                        <SelectItem value="60">60 min</SelectItem>
                        <SelectItem value="90">90 min</SelectItem>
                        <SelectItem value="120">120 min</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Duration Info */}
              {selectedServiceInfo && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-3 rounded-md">
                  <Clock className="h-3 w-3" />
                  <span>
                    Duration: <strong>{selectedServiceInfo.duration} min</strong>
                    {bufferTime > 0 && (
                      <>
                        {" + "}
                        <strong>{bufferTime} min buffer</strong>
                        {" = "}
                        <strong>{selectedServiceInfo.duration + bufferTime} min total</strong>
                      </>
                    )}
                  </span>
                </div>
              )}

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
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a room" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="room-a">Room A</SelectItem>
                        <SelectItem value="room-b">Room B</SelectItem>
                        <SelectItem value="room-c">Room C</SelectItem>
                        <SelectItem value="room-d">Room D</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <NotebookPen className="h-4 w-4" />
                      Notes
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Notes to provider..."
                        className="resize-none"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional notes about the appointment (max 500 characters)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            type="submit"
            onClick={form.handleSubmit(handleFormSubmit)}
            disabled={!form.formState.isValid || form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Booking..." : "Book Appointment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookAppointment;