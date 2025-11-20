"use client";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../../../components/ui/alert";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import {
  BUSINESS_HOURS,
  generateTimeSlots,
  getAvailableTimeSlots,
  timesOverlap,
  timeToMinutes,
  minutesToTime,
  getValidEndTimes,
} from "../utils/helpers";
import { TimeRangePickerProps } from "../Interfaces/customerInterfaces";

const TimeRangePicker = ({
  startTime: initialStartTime = "09:00 AM",
  endTime: initialEndTime = "10:00 AM",
  selectedDate = "",
  appointments = [],
  onStartTimeChange,
  onEndTimeChange,
  onValidationChange,
  className = "",
  minimumDuration = 15,
  isEndTimeDisabled = false, // ✅ New prop
}: TimeRangePickerProps) => {
  // initialStartTime/initialEndTime calculated based on actual time and business hours
  const [startTime, setStartTime] = useState(initialStartTime);
  const [endTime, setEndTime] = useState(initialEndTime);

  const [conflict, setConflict] = useState<any>(null);
  const [availableSlots, setAvailableSlots] = useState<
    { start: string; end: string }[]
  >([]);

  const timeSlots = generateTimeSlots();
  const businessStartMinutes = timeToMinutes(BUSINESS_HOURS.start);
  const businessEndMinutes = timeToMinutes(BUSINESS_HOURS.end);
  const validEndTimes = getValidEndTimes(timeSlots, minimumDuration, startTime);


  // ✅ Handle start time change with smart end time adjustment
  const handleStartTimeChange = (newStartTime: string) => {
    const newStartMinutes = timeToMinutes(newStartTime);
    const currentEndMinutes = timeToMinutes(endTime);

    setStartTime(newStartTime);
    onStartTimeChange?.(newStartTime);

    // ✅ If new start time is after current end time, adjust end time
    if (newStartMinutes >= currentEndMinutes) {
      const newEndMinutes = newStartMinutes + minimumDuration;
      const newEndTime = minutesToTime(newEndMinutes);

      // Check if new end time is within business hours
      if (newEndMinutes <= businessEndMinutes) {
        setEndTime(newEndTime);
        onEndTimeChange?.(newEndTime);
      } else {
        // If it exceeds business hours, set to business end time
        const businessEndTime = BUSINESS_HOURS.end;
        setEndTime(businessEndTime);
        onEndTimeChange?.(businessEndTime);
      }
    }
    // ✅ If new start time is before current end time, keep end time as is
    // (no action needed, end time stays the same)
  };

  // ✅ Handle end time change
  const handleEndTimeChange = (newEndTime: string) => {
    setEndTime(newEndTime);
    onEndTimeChange?.(newEndTime);
  };

  // ✅ Check for conflicts
  useEffect(() => {
    if (!selectedDate) {
      setConflict(null);
      onValidationChange?.(true);
      return;
    }

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    // Check if times are within business hours
    if (
      startMinutes < businessStartMinutes ||
      endMinutes > businessEndMinutes ||
      startMinutes >= endMinutes
    ) {
      setConflict({
        id: "business-hours",
        date: selectedDate,
        startTime: BUSINESS_HOURS.start,
        endTime: BUSINESS_HOURS.end,
      });
      onValidationChange?.(false);
      return;
    }

    // Check for appointment conflicts
    const dayAppointments = appointments.filter(
      (apt: any) => apt.date === selectedDate
    );
    const conflictingAppointment = dayAppointments.find((apt: any) =>
      timesOverlap(startTime, endTime, apt.startTime, apt.endTime)
    );

    setConflict(conflictingAppointment || null);
    onValidationChange?.(!conflictingAppointment);

    // Calculate available slots
    const duration = endMinutes - startMinutes;
    const slots = getAvailableTimeSlots(selectedDate, appointments, duration);
    setAvailableSlots(slots);
  }, [
    startTime,
    endTime,
    selectedDate,
    appointments,
    onValidationChange,
    businessStartMinutes,
    businessEndMinutes,
  ]);

  // ✅ Added this useEffect
  useEffect(() => {
    setStartTime(initialStartTime);
    setEndTime(initialEndTime);
  }, [initialStartTime, initialEndTime]);

  // ✅ Handle clicking on available slot suggestion
  const handleSlotSelect = (slot: { start: string; end: string }) => {
    const duration = timeToMinutes(endTime) - timeToMinutes(startTime);
    const newEndMinutes = timeToMinutes(slot.start) + duration;
    const slotEndMinutes = timeToMinutes(slot.end);

    handleStartTimeChange(slot.start);

    if (newEndMinutes <= slotEndMinutes) {
      handleEndTimeChange(minutesToTime(newEndMinutes));
    } else {
      handleEndTimeChange(slot.end);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Time Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Start Time */}
        <div className="space-y-2">
          <Select value={startTime} onValueChange={handleStartTimeChange}>
            <SelectTrigger id="start-time" className="font-mono">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-80">
              {timeSlots.map((slot) => (
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
          <Select
            value={endTime}
            onValueChange={handleEndTimeChange}
             disabled={isEndTimeDisabled || validEndTimes.length === 0} // ✅ Disable if needed
          >
            <SelectTrigger id="end-time" className="font-mono">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-80">
              {validEndTimes.map((slot: string) => (
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
      {selectedDate && false && (
        <div className="space-y-3">
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
        </div>
      )}
    </div>
  );
};

export default TimeRangePicker;
