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
  UserStar,
  Timer,
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
import { useState, useMemo, useCallback } from "react";
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
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import moment from "moment";

// Initialize localizer
const localizer = momentLocalizer(moment);

function formatDate(date: Date | undefined) {
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function isValidDate(date: Date | undefined) {
  if (!date) return false;
  return !isNaN(date.getTime());
}

export const getNextTimeSlot = (date = new Date()): string => {
  const now = dayjs(date);
  const minutes = now.minute();
  const roundedMinutes = Math.ceil(minutes / 15) * 15;
  const nextSlot = now.minute(0).add(roundedMinutes, "minute");
  return nextSlot.format("hh:mm A");
};

export const addOneHour = (timeString: string): string => {
  const [time, period] = timeString.split(" ");
  let [hours, minutes] = time.split(":").map(Number);
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  const baseTime = dayjs().hour(hours).minute(minutes);
  const newTime = baseTime.add(60, "minute");
  return newTime.format("hh:mm A");
};

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

const BookAppointment = ({
  customer,
  existingAppointments,
  onSubmit,
}: BookAppointmentProps) => {
  const defaultStartTime = getNextTimeSlot();
  const defaultEndTime = addOneHour(defaultStartTime);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [openCalendar, setOpenCalendar] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [month, setMonth] = useState<Date | undefined>(date);
  const [value, setValue] = useState(formatDate(date));
  const [openCombobox, setOpenCombobox] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [selectedColor, setSelectedColor] = useState(existingColors[0]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [notes, setNotes] = useState("");
  const [bufferTime, setBufferTime] = useState(0); // in minutes
  const [isTimeValid, setIsTimeValid] = useState(false);
  const [startTime, setStartTime] = useState(defaultStartTime);
  const [endTime, setEndTime] = useState(defaultEndTime);

  // ✅ Calendar date - synced with date picker
  const [calendarDate, setCalendarDate] = useState(new Date());

  // ✅ Convert existing appointments to calendar events
  const existingEvents: CalendarEventType[] = useMemo(() => {
    return existingAppointments.map((apt) => ({
      id: apt.id,
      title: apt.serviceName || "Appointment",
      start: timeStringToDate(apt.date, apt.startTime),
      end: timeStringToDate(apt.date, apt.endTime),
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
      title: selectedService + (bufferTime > 0 ? ` (+${bufferTime}min buffer)` : ""),
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
  const eventPropGetter = useCallback(
    (event: CalendarEventType) => {
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
        const bufferPercentage = ((totalDuration - actualDuration) / totalDuration) * 100;
        
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
    },
    []
  );

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

  const handleSubmit = () => {
    if (!date) {
      toast.error("Please select a date");
      return;
    }

    if (!selectedService) {
      toast.error("Please select a service");
      return;
    }

    if (!isTimeValid) {
      toast.error("Please select an available time slot");
      return;
    }

    // Calculate actual end time with buffer
    const actualEndTime = endTime;
    const endWithBuffer = dayjs(timeStringToDate(formatDateToString(date), endTime))
      .add(bufferTime, "minute")
      .format("hh:mm A");

    const appointment = {
      date: formatDateToString(date),
      startTime,
      endTime: actualEndTime,
      bufferEndTime: endWithBuffer,
      bufferMinutes: bufferTime,
      serviceId: selectedService,
      serviceName: selectedService,
      customerId: customer.id,
      room: selectedRoom,
      notes,
      color: selectedColor,
    };

    onSubmit(appointment);
    toast.success("Appointment booked successfully!");

    // Reset form
    const newStartTime = getNextTimeSlot();
    const newEndTime = addOneHour(newStartTime);
    setDate(new Date());
    setValue(formatDate(new Date()));
    setStartTime(newStartTime);
    setEndTime(newEndTime);
    setSelectedService("");
    setSelectedRoom("");
    setNotes("");
    setBufferTime(0);
    setDialogOpen(false);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button>Book appointment</Button>
      </DialogTrigger>
      
      <DialogContent className="flex flex-col w-[95vw] h-[95vh] max-w-none p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Book Appointment for {customer.fullName}</DialogTitle>
          <DialogDescription>
            Select date, time, and service. See preview in calendar.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-1 gap-6 px-6 overflow-hidden">
          {/* ✅ Calendar - Left Side */}
          <div className="flex-[2] min-w-0">
            <div className="h-full border rounded-lg overflow-hidden">
              <BigCalendar
                localizer={localizer}
                events={allEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: "100%" }}
                defaultView={Views.DAY}
                view={Views.DAY}
                views={[Views.DAY]} // ✅ Only day view
                date={calendarDate}
                onNavigate={handleCalendarNavigate}
                step={15}
                timeslots={4}
                eventPropGetter={eventPropGetter}
                formats={{
                  timeGutterFormat: (date, culture, localizer: any) =>
                    localizer.format(date, "h A", culture),
                }}
                toolbar={true}
              />
            </div>
          </div>

          {/* ✅ Form - Right Side */}
          <div className="flex-1 min-w-[400px] overflow-y-auto space-y-6 pr-2">
            {/* Service selector */}
            <div className="space-y-2">
              <Label>Service & Color</Label>
              <div className="flex items-center gap-3">
                <ColorPicker
                  eventColors={existingColors}
                  selectedColor={selectedColor}
                  onColorChange={setSelectedColor}
                />
                
                <Select value={selectedService} onValueChange={setSelectedService}>
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
              </div>
            </div>

            {/* Date and Time */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Date & Time
              </Label>
              
              <div className="space-y-3">
                {/* Date */}
                <div className="relative">
                  <Input
                    value={value}
                    placeholder="Select date"
                    className="pr-10"
                    onChange={(e) => {
                      setValue(e.target.value);
                      const newDate = new Date(e.target.value);
                      if (isValidDate(newDate)) {
                        handleDateChange(newDate);
                      }
                    }}
                  />
                  <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-1/2 right-2 h-7 w-7 -translate-y-1/2"
                      >
                        <CalendarIcon className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
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

                {/* Time */}
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
                  Total time: {timeToMinutes(endTime) - timeToMinutes(startTime) + bufferTime} minutes
                  (includes {bufferTime}min buffer shown with stripes)
                </p>
              )}
            </div>

            {/* Guest */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <UserStar className="h-4 w-4" />
                Customer
              </Label>
              <div className="flex items-center gap-2 p-2 border rounded-md">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={customer.pictureURL} />
                  <AvatarFallback>
                    {customer.fullName?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{customer.fullName}</span>
              </div>
            </div>

            {/* Room */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <House className="h-4 w-4" />
                Room
              </Label>
              <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a room" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="room-a">Room A</SelectItem>
                  <SelectItem value="room-b">Room B</SelectItem>
                  <SelectItem value="room-c">Room C</SelectItem>
                  <SelectItem value="room-d">Room D</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <NotebookPen className="h-4 w-4" />
                Notes
              </Label>
              <Textarea
                placeholder="Notes to provider and guest(s)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            {/* Creator */}
            <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/30">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>HF</AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                Created by Hatim Fangour
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            onClick={handleSubmit}
            disabled={!date || !isTimeValid || !selectedService}
          >
            Book Appointment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookAppointment;