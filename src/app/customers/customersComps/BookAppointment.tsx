"use client";

import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { Button } from "../../../components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../../../components/ui/popover";
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
import { useState } from "react";
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
import { formatDateToString } from "../utils/helpers";
import { BookAppointmentProps } from "../Interfaces/customerInterfaces";
import dayjs from "dayjs";


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
  const nextSlot = now.minute(0).add(roundedMinutes, 'minute');
  
  return nextSlot.format('hh:mm A');
};

/**
 * Add duration (in minutes) to a time string
 * Example: addDuration("02:15 PM", 60) returns "03:15 PM"
 */
export const addDuration = (timeString: string, durationMinutes: number): string => {
  // Create a date with the time
  const [time, period] = timeString.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  
  // Convert to 24-hour
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  
  // Create dayjs object for today with this time
  const baseTime = dayjs().hour(hours).minute(minutes);
  
  // Add duration
  const newTime = baseTime.add(durationMinutes, 'minute');
  
  return newTime.format('hh:mm A');
};

/**
 * Add 1 hour to a time string
 */
export const addOneHour = (timeString: string): string => {
  return addDuration(timeString, 60);
};



const BookAppointment = ({
  customer,
  existingAppointments,
  onSubmit,
}: BookAppointmentProps) => {
  // ✅ Get default times based on current time
  const defaultStartTime = getNextTimeSlot();
  const defaultEndTime = addOneHour(defaultStartTime);
// ✅ Control dialog state properly
const [dialogOpen, setDialogOpen] = useState(false);
// ✅ Control Calendar popover state properly
const [openCalendar, setOpenCalendar] = useState(false);
// ✅ Control Calendar default date properly
const [date, setDate] = useState<Date | undefined>(new Date("2025-11-16"));
const [month, setMonth] = useState<Date | undefined>(date);
// ✅ Control Calendar date value properly
const [value, setValue] = useState(formatDate(date));
// ✅ Control Combobox state of services  properly
const [openCombobox, setOpenCombobox] = useState(false);
// ✅ Control Combobox value of services  properly
const [valueCombobox, setValueCombobox] = useState("");
// ✅ Control if time is valide  properly
  const [isTimeValid, setIsTimeValid] = useState(false);

 // ✅ Use calculated default times
  const [startTime, setStartTime] = useState(defaultStartTime);
  const [endTime, setEndTime] = useState(defaultEndTime);

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
console.log({startTime})
console.log({endTime})
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <form>
        <DialogTrigger asChild>
          <Button>Book appointment</Button>
        </DialogTrigger>
        <DialogContent className="w-1/2! h-[95%]! max-w-full!">
          <DialogHeader>
            <DialogTitle>Book Appointment for Achille</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-8">
            {/* Service selector */}
            <div className="flex  items-center gap-4">
              <span>ColorPicker</span>
              <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCombobox}
                    className="w-[200px] justify-between"
                  >
                    {valueCombobox
                      ? (customer.services || []).find(
                          (service) => service === valueCombobox
                        )
                      : "Select service..."}
                    <ChevronsUpDown className="opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
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
                            key={service}
                            value={service}
                            onSelect={(currentValue) => {
                              setValueCombobox(
                                currentValue === valueCombobox
                                  ? ""
                                  : currentValue
                              );
                              setOpenCombobox(false);
                            }}
                          >
                            {service}
                            <Check
                              className={cn(
                                "ml-auto",
                                valueCombobox === service
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
                          setOpenCalendar(true);
                        }
                      }}
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
                          onSelect={(date) => {
                            setDate(date);
                            setValue(formatDate(date));
                            setOpenCalendar(false);
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
                  selectedDate={formatDateToString(date)}
                  appointments={existingAppointments}
                  onStartTimeChange={setStartTime}
                  onEndTimeChange={setEndTime}
                  onValidationChange={setIsTimeValid}
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
                <span>{customer.fullName}</span>
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
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!date || !isTimeValid}
              className="w-full"
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
