"use client";
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "../../../components/ui/alert";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { BUSINESS_HOURS, generateTimeSlots, getAvailableTimeSlots, timesOverlap, timeToMinutes } from "../utils/helpers";



const TimeRangePicker = ({
  startTime: initialStartTime = "09:00 AM",
  endTime: initialEndTime = "05:00 PM",
  selectedDate = "",
  appointments = [],
  onStartTimeChange,
  onEndTimeChange,
  onValidationChange,
  className,
}: any) => {
  const [startTime, setStartTime] = useState(initialStartTime);
  const [endTime, setEndTime] = useState(initialEndTime);
  const [conflict, setConflict] = useState<{} | null>(null);

  const [availableSlots, setAvailableSlots] = useState<
    { start: string; end: string }[]
  >([]);



  const timeSlots = generateTimeSlots();

  const businessTimeSlots = timeSlots
  // Filter time slots within business hours
  // const businessTimeSlots = timeSlots.filter((slot) => {
  //   const slotMinutes = timeToMinutes(slot);
  //   const businessStartMinutes = timeToMinutes(BUSINESS_HOURS.start);
  //   const businessEndMinutes = timeToMinutes(BUSINESS_HOURS.end);
  //   return (
  //     slotMinutes >= businessStartMinutes && slotMinutes <= businessEndMinutes
  //   );
  // });

  // Check for conflicts whenever time or date changes
  useEffect(() => {
    if (!selectedDate) {
      setConflict(null);
      onValidationChange?.(true);
      return;
    }

    // Check if times are within business hours
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    const businessStartMinutes = timeToMinutes(BUSINESS_HOURS.start);
    const businessEndMinutes = timeToMinutes(BUSINESS_HOURS.end);

    // if (
    //   startMinutes < businessStartMinutes ||
    //   endMinutes > businessEndMinutes ||
    //   startMinutes >= endMinutes
    // ) {
    //   setConflict({
    //     id: "business-hours",
    //     date: selectedDate,
    //     startTime: BUSINESS_HOURS.start,
    //     endTime: BUSINESS_HOURS.end,
    //   });
    //   onValidationChange?.(false);
    //   return;
    // }

    // Check for appointment conflicts
    const dayAppointments = appointments.filter(
      (apt:any) => apt.date === selectedDate
    );
    const conflictingAppointment = dayAppointments.find((apt:any) =>
      timesOverlap(startTime, endTime, apt.startTime, apt.endTime)
    );

    // setConflict(conflictingAppointment || null);
    // onValidationChange?.(!conflictingAppointment);

    // Calculate available slots
    const duration = endMinutes - startMinutes;
    const slots = getAvailableTimeSlots(selectedDate, appointments, duration);
    setAvailableSlots(slots);
  }, [startTime, endTime, selectedDate, appointments, onValidationChange]);

  const handleStartTimeChange = (time: string) => {
    setStartTime(time);
    onStartTimeChange?.(time);
  };

  const handleEndTimeChange = (time: string) => {
    setEndTime(time);
    onEndTimeChange?.(time);
  };

  const handleSlotSelect = (slot: { start: string; end: string }) => {
    handleStartTimeChange(slot.start);
    // Set end time to match the original duration
    const duration = timeToMinutes(endTime) - timeToMinutes(startTime);
    const newEndMinutes = timeToMinutes(slot.start) + duration;
    const slotEndMinutes = timeToMinutes(slot.end);

    if (newEndMinutes <= slotEndMinutes) {
      handleEndTimeChange(minutesToTime(newEndMinutes));
    } else {
      handleEndTimeChange(slot.end);
    }
  };

  return (
    <>
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${className}`}>
        {/* Start Time */}
        <div className="space-y-2">
          {/* <Label htmlFor="start-time">Start Time</Label> */}
          <Select value={startTime} onValueChange={handleStartTimeChange}>
            <SelectTrigger id="start-time" className="font-mono">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-80">
              {businessTimeSlots.map((slot) => (
                <SelectItem
                  key={`start-${slot}`}
                  value={slot}
                  className="font-mono"
                >
                  {slot}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* End Time */}
        <div className="space-y-2">
          {/* <Label htmlFor="end-time">End Time</Label> */}
          <Select value={endTime} onValueChange={handleEndTimeChange}>
            <SelectTrigger id="end-time" className="font-mono">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-80">
              {businessTimeSlots.map((slot) => (
                <SelectItem
                  key={`end-${slot}`}
                  value={slot}
                  className="font-mono"
                >
                  {slot}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Validation Messages */}
      {selectedDate && (
        <>
          {conflict?.id === "business-hours" ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Outside Business Hours</AlertTitle>
              <AlertDescription>
                Business hours are from {BUSINESS_HOURS.start} to{" "}
                {BUSINESS_HOURS.end}. Please select a time within these hours.
              </AlertDescription>
            </Alert>
          ) : conflict ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Time Slot Not Available</AlertTitle>
              <AlertDescription>
                This time conflicts with an existing appointment from{" "}
                <strong>{conflict.startTime}</strong> to{" "}
                <strong>{conflict.endTime}</strong>.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Time Available</AlertTitle>
              <AlertDescription className="text-green-700">
                This time slot is available for booking.
              </AlertDescription>
            </Alert>
          )}

          {/* Available Time Slots */}
          {conflict && availableSlots.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <h4 className="text-sm font-semibold">
                  Available Time Slots Today:
                </h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableSlots.map((slot, index) => {
                  const duration =
                    timeToMinutes(endTime) - timeToMinutes(startTime);
                  const slotDuration =
                    timeToMinutes(slot.end) - timeToMinutes(slot.start);

                  // Only show slots that can accommodate the requested duration
                  if (slotDuration >= duration) {
                    return (
                      <Badge
                        key={index}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() => handleSlotSelect(slot)}
                      >
                        {slot.start} - {slot.end}
                      </Badge>
                    );
                  }
                  return null;
                })}
              </div>
              {availableSlots.every(
                (slot) => timeToMinutes(slot.end) - timeToMinutes(slot.start)
                // timeToMinutes(endTime) - timeToMinutes(startTime)
              ) && (
                <p className="text-sm text-muted-foreground">
                  No available slots can accommodate the requested duration.
                  Please select a shorter time range or choose another day.
                </p>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
};

export default TimeRangePicker;
