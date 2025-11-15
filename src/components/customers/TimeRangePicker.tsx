"use client"
import React, { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";



// Generate all time slots
const generateTimeSlots = () => {
  const slots: string[] = [];
  const periods = ["AM", "PM"];
  
  periods.forEach((period) => {
    for (let hour = 12; hour <= 12; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        slots.push(
          `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${period}`
        );
      }
    }
    for (let hour = 1; hour < 12; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        slots.push(
          `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${period}`
        );
      }
    }
  });
  
  return slots;
};
const TimeRangePicker = ({
  startTime: initialStartTime = "09:00 AM",
  endTime: initialEndTime = "05:00 PM",
  onStartTimeChange,
  onEndTimeChange,
  className,
}:any) => {
     const [startTime, setStartTime] = useState(initialStartTime);
  const [endTime, setEndTime] = useState(initialEndTime);

  const timeSlots = generateTimeSlots();

  const handleStartTimeChange = (time: string) => {
    setStartTime(time);
    onStartTimeChange?.(time);
  };

  const handleEndTimeChange = (time: string) => {
    setEndTime(time);
    onEndTimeChange?.(time);
  };
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${className}`}>
      {/* Start Time */}
      <div className="space-y-2">
        {/* <Label htmlFor="start-time">Start Time</Label> */}
        <Select value={startTime} onValueChange={handleStartTimeChange}>
          <SelectTrigger id="start-time" className="font-mono">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-80">
            {timeSlots.map((slot) => (
              <SelectItem key={`start-${slot}`} value={slot} className="font-mono">
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
            {timeSlots.map((slot) => (
              <SelectItem key={`end-${slot}`} value={slot} className="font-mono">
                {slot}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

export default TimeRangePicker