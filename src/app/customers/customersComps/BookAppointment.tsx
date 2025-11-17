"use client";

import {
  Calendar as BigCalendar,
  Views,
  momentLocalizer,
  Event as CalendarEvent,
} from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  CalendarIcon,
  Check,
  ChevronsUpDown,
  Clock,
  House,
  NotebookPen,
  Timer,
  UserStar,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import { Button } from "../../../components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover";
import { Textarea } from "../../../components/ui/textarea";
import TimeRangePicker from "./TimeRangePicker";
import { Calendar } from "../../../components/ui/calendar";
import { Input } from "../../../components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../../components/ui/command";
import { useCallback, useMemo, useState } from "react";
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
} from "../../../components/ui/dialog";
import { toast } from "sonner";
import { Customer } from "@/app/customers/types/customers";
import { formatDateToString, timeToMinutes } from "../utils/helpers";
import { BookAppointmentProps } from "../Interfaces/customerInterfaces";
import dayjs from "dayjs";
import ColorPicker from "@/components/ColorPicker";
import { existingColors } from "@/app/Utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { events } from "@/app/calendar/utils/helpers";
import moment from "moment";
import { Label } from "@/components/ui/label";

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

// Initialize localizer OUTSIDE the component
const localizer = momentLocalizer(moment);

interface CalendarEventType extends CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  actualEnd?: Date; // End time without buffer
  bufferTime?: number; // Buffer time in minutes
  color?: string;
  isDraft?: boolean; // For preview appointment
}

// ✅ Helper to convert time string to Date object for calendar
const timeStringToDate = (dateStr: string, timeStr: string): Date => {
  const [time, period] = timeStr.split(" ");
  let [hours, minutes] = time.split(":").map(Number);

  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  const date = new Date(dateStr);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const BookAppointment = ({
  customer,
  existingAppointments,
  onSubmit,
}: BookAppointmentProps) => {
  // ✅ Calendar date - synced with date picker
  const [calendarDate, setCalendarDate] = useState(new Date());

  // ✅ Get default times based on current time
  const defaultStartTime = getNextTimeSlot();
  const defaultEndTime = addOneHour(defaultStartTime);
  // ✅ Control dialog state properly
  const [dialogOpen, setDialogOpen] = useState(true);
  // ✅ Control Calendar popover state properly
  const [openCalendar, setOpenCalendar] = useState(false);
  // ✅ Control Calendar default date properly
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [month, setMonth] = useState<Date | undefined>(date);
  // ✅ Control Calendar date value properly
  const [value, setValue] = useState(formatDate(date));
  // ✅ Control Combobox state of services  properly
  const [openCombobox, setOpenCombobox] = useState(false);
  // ✅ Control Combobox value of services  properly
  const [valueCombobox, setValueCombobox] = useState("");
  // ✅ Control if time is valide  properly
  const [isTimeValid, setIsTimeValid] = useState(false);

  const [selectedService, setSelectedService] = useState("");
  const [selectedColor, setSelectedColor] = useState(existingColors[0]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [notes, setNotes] = useState("");
  const [bufferTime, setBufferTime] = useState(0); // in minutes

  // ✅ Use calculated default times
  const [startTime, setStartTime] = useState(defaultStartTime);
  const [endTime, setEndTime] = useState(defaultEndTime);

  // ✅ Convert existing appointments to calendar events
  const existingEvents: CalendarEventType[] = useMemo(() => {
    return existingAppointments.map((apt) => ({
      id: apt.id,
      title: apt.title || "Appointment",
      start: apt.start,
      end: apt.end,
      color: apt.color || "#3174ad",
    }));
  }, [existingAppointments]);

  // ✅ Create draft event for real-time preview
  const draftEvent: CalendarEventType | null = useMemo(() => {
    if (!date || !startTime || !endTime || !selectedService) {
      return null;
    }

    const dateStr = formatDateToString(date);
    const start = timeStringToDate(dateStr, startTime);
    const actualEnd = timeStringToDate(dateStr, endTime);

    // Add buffer time to end
    const endWithBuffer = new Date(actualEnd);
    endWithBuffer.setMinutes(endWithBuffer.getMinutes() + bufferTime);

    return {
      id: "draft",
      title:
        selectedService + (bufferTime > 0 ? ` (+${bufferTime}min buffer)` : ""),
      start,
      end: endWithBuffer,
      actualEnd, // Store actual end without buffer
      bufferTime,
      color: selectedColor,
      isDraft: true,
    };
  }, [date, startTime, endTime, selectedService, bufferTime, selectedColor]);

  // ✅ Combine existing and draft events
  const allEvents = useMemo(() => {
    const events = [...existingEvents];
    if (draftEvent) {
      events.push(draftEvent);
    }
    return events;
  }, [existingEvents, draftEvent]);

  // ✅ Event styling with buffer visualization
  const eventPropGetter = useCallback((event: CalendarEventType) => {
    const style: React.CSSProperties = {
      backgroundColor: event.color || "#3174ad",
      borderRadius: "5px",
      opacity: event.isDraft ? 0.7 : 1,
      color: "white",
      border: event.isDraft ? "2px dashed white" : "none",
      display: "block",
    };

    // ✅ If event has buffer time, add gradient background
    if (event.bufferTime && event.bufferTime > 0 && event.actualEnd) {
      const totalDuration = event.end.getTime() - event.start.getTime();
      const actualDuration = event.actualEnd.getTime() - event.start.getTime();
      const bufferPercentage =
        ((totalDuration - actualDuration) / totalDuration) * 100;

      style.background = `linear-gradient(to bottom, 
            ${event.color || "#3174ad"} 0%, 
            ${event.color || "#3174ad"} ${100 - bufferPercentage}%, 
            repeating-linear-gradient(
              45deg,
              ${event.color || "#3174ad"}80,
              ${event.color || "#3174ad"}80 10px,
              ${event.color || "#3174ad"}40 10px,
              ${event.color || "#3174ad"}40 20px
            ) ${100 - bufferPercentage}%
          )`;
    }

    return { style };
  }, []);

  // ✅ Handle date change - sync with calendar
  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate && isValidDate(newDate)) {
      setDate(newDate);
      setMonth(newDate);
      setValue(formatDate(newDate));
      setCalendarDate(newDate); // ✅ Sync calendar
    }
  };

  // ✅ Handle calendar date navigation
  const handleCalendarNavigate = (newDate: Date) => {
    setCalendarDate(newDate);
  };

  // Calculate actual end time with buffer
  const actualEndTime = endTime;
  const endWithBuffer = dayjs(
    timeStringToDate(formatDateToString(date), endTime)
  )
    .add(bufferTime, "minute")
    .format("hh:mm A");

  // handle sunmit the appointment after getting all data
  const handleSubmit = () => {
    if (!date) {
      toast.error("Please select a date");
      return;
    }

    if (!isTimeValid) {
      toast.error("Please select an available time slot");
      return;
    }

    const appointment: Omit<{}, "id"> = {
      date: formatDateToString(date),
      startTime,
      endTime,
    };

    onSubmit(appointment);
    toast.success("Appointment booked successfully!");

    // Reset form
    setDate(undefined);
    setValue("");
    setStartTime("09:00 AM");
    setEndTime("10:00 AM");
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <form className="w-full ">
        <DialogTrigger asChild>
          <Button>Book appointment</Button>
        </DialogTrigger>
        <DialogContent className="thisDialog flex flex-col justify-between w-full h-full gap-10! sm:max-w-full">
          <DialogHeader className="flex">
            <DialogTitle>Book Appointment for Achille</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <div className="flex w-full gap-8 h-[80%] ">
            {/* Big Calendar */}
            <div className="flex-2">
              <div className={`calendar-container h-full month-view`}>
                <BigCalendar
                  defaultView={Views.DAY}
                  view={Views.DAY}
                  views={[Views.DAY]}
                  events={allEvents}
                  date={calendarDate}
                  localizer={localizer}
                  onNavigate={handleCalendarNavigate}
                  popup
                  style={{ height: "100%" }}
                  // formats={{
                  //   timeGutterFormat: (date, culture, localizer: any) =>
                  //     localizer.format(date, "h a", culture), // 👈 "12 AM" instead of "12:00 AM"
                  // }}
                  startAccessor="start"
                  endAccessor="end"
                  step={15} // each slot = 15 minutes
                  timeslots={4} // 4 slots per hour → 15 × 4 = 60 min
                  selectable
                  eventPropGetter={eventPropGetter}
                  formats={{
                    timeGutterFormat: (date, culture, localizer: any) =>
                      localizer.format(date, "h A", culture),
                  }}
                  toolbar={true}
                />
              </div>
            </div>

            <div className="grid gap-8 flex-1">
              {/* Service selector */}
              <div className="flex  items-start flex-col gap-6 w-full">
                <div className="flex  items-center gap-6 w-full">
                  <div>
                    <ColorPicker
                      eventColors={existingColors}
                      selectedColor={existingColors[0]}
                      onColorChange={setSelectedColor}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <Select
                      value={selectedService}
                      onValueChange={setSelectedService}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select service..." />
                      </SelectTrigger>
                      <SelectContent>
                        {(customer.services || []).map((service) => (
                          <SelectItem key={service.id} value={service.name}>
                            {service.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {false && (
                      <Popover
                        open={openCombobox}
                        onOpenChange={setOpenCombobox}
                      >
                        <PopoverTrigger asChild className="flex">
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openCombobox}
                            className="w-full justify-between"
                          >
                            {valueCombobox
                              ? (customer.services || []).find(
                                  (service) => service.name === valueCombobox
                                )?.name
                              : "Select service..."}
                            <ChevronsUpDown className="opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="p-0" // ✅ Add these props to fix z-index issue
                          // modal={true}
                          style={{ zIndex: 9999 }}
                        >
                          <Command>
                            <CommandInput
                              placeholder="Search service..."
                              className="h-9"
                            />
                            <CommandList>
                              <CommandEmpty>No framework found.</CommandEmpty>
                              <CommandGroup>
                                {(customer.services || []).map((service) => (
                                  <CommandItem
                                    key={service.id}
                                    value={service.name}
                                    onSelect={(currentValue) => {
                                      console.log({ currentValue });
                                      console.log({ valueCombobox });
                                      setValueCombobox(
                                        currentValue === valueCombobox
                                          ? ""
                                          : currentValue
                                      );
                                      setOpenCombobox(false);
                                    }}
                                  >
                                    {service.name}
                                    <Check
                                      className={cn(
                                        "ml-auto",
                                        valueCombobox === service.name
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
                    )}
                  </div>
                </div>

                <div className="info">Infoooooooooo</div>
              </div>

              {/* Date and Time */}
              <div className="flex items-center gap-6 w-full">
                <Clock />
                {/* date */}
                <div className="flex-1 min-w-0">
                  <div className="relative flex gap-2 w-[200px]">
                    <Input
                      id="date"
                      value={value}
                      placeholder="June 01, 2025"
                      className="bg-background pr-10"
                      onChange={(e) => {
                        setValue(e.target.value);
                        const newDate = new Date(e.target.value);
                        if (isValidDate(newDate)) {
                          handleDateChange(newDate);
                        }
                      }}
                      // onKeyDown={(e) => {
                      //   if (e.key === "ArrowDown") {
                      //     e.preventDefault();
                      //     setOpenCalendar(true);
                      //   }
                      // }}
                    />
                    <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
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
                          onSelect={(newDate) => {
                            handleDateChange(newDate);
                            setOpenCalendar(false);
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Time */}
                <div className="ml-6">
                  <TimeRangePicker
                    startTime={startTime}
                    endTime={endTime}
                    selectedDate={formatDateToString(date)}
                    appointments={existingAppointments}
                    onStartTimeChange={setStartTime}
                    onEndTimeChange={setEndTime}
                    onValidationChange={setIsTimeValid}
                  />
                </div>
              </div>

              {/* ✅ Buffer Time */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Timer className="h-4 w-4" />
                  Buffer Time (minutes)
                </Label>
                <Select
                  value={bufferTime.toString()}
                  onValueChange={(value) => setBufferTime(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No buffer</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                  </SelectContent>
                </Select>
                {bufferTime > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Total time:{" "}
                    {timeToMinutes(endTime) -
                      timeToMinutes(startTime) +
                      bufferTime}{" "}
                    minutes (includes {bufferTime}min buffer shown with stripes)
                  </p>
                )}
              </div>

              {/* Guest */}
              <div className="flex  items-center gap-6">
                <UserStar />
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
              </div>

              {/* Room */}
              <div className="flex  items-center gap-6">
                <House />
                <div className="flex  items-center gap-2 w-full">
                  <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a room" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="a">A</SelectItem>
                        <SelectItem value="b">B</SelectItem>
                        <SelectItem value="c">C</SelectItem>
                        <SelectItem value="d">D</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Note */}
              <div className="flex  items-center gap-6 w-full">
                <NotebookPen />
                <Textarea
                  placeholder="Notes to provider and guest(s)"
                  className="w-full"
                />
              </div>

              {/* Creator */}
              <div className="flex  items-center gap-6">
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
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!date || !isTimeValid}
              // className="w-full"
            >
              Book Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
};

export default BookAppointment;
