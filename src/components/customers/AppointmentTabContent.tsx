"use client";

import { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Calendar, ChevronRight, Clock, MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AppointmentCard from "./AppointmentCard";

const AppointmentTabContent = () => {
  const [filter, setFilter] = useState<"all" | "completed" | "upcoming">("all");

  const appointments = [
    {
      id: "1",
      date: "2024-11-13",
      time: "14:00",
      service: "Full Body Massage",
      therapist: "Sarah Johnson",
      reason: "Relaxation and stress relief",
      status: "completed",
      location: "Spa Studio A",
      duration: "90 min",
      notes: "Great session, client was very satisfied",
    },
    {
      id: "2",
      date: "2024-11-20",
      time: "10:30",
      service: "Facial Treatment",
      therapist: "Emma Davis",
      reason: "Anti-aging treatment",
      status: "upcoming",
      location: "Spa Studio B",
      duration: "60 min",
    },
    {
      id: "3",
      date: "2024-11-06",
      time: "15:30",
      service: "Hot Stone Massage",
      therapist: "Michael Chen",
      reason: "Deep tissue and relaxation",
      status: "completed",
      location: "Spa Studio A",
      duration: "75 min",
      notes: "Client reported excellent results",
    },
    {
      id: "4",
      date: "2024-11-27",
      time: "11:00",
      service: "Spa Package - Full Treatment",
      therapist: "Sarah Johnson",
      reason: "Complete wellness package",
      status: "upcoming",
      location: "Spa Studio C",
      duration: "180 min",
    },
    {
      id: "5",
      date: "2024-10-30",
      time: "09:00",
      service: "Skincare Treatment",
      therapist: "Emma Davis",
      reason: "Skin health and hydration",
      status: "completed",
      location: "Spa Studio B",
      duration: "45 min",
    },
  ];

  const filteredAppointments = appointments.filter((apt) => {
    if (filter === "all") return true;
    return apt.status === filter;
  });


  return (
    <div>
      {/* Filter Tabs */}
      <div className="mb-4">
        <Select defaultValue="all" onValueChange={(value) => setFilter(value as any)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a fruit" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">
                All Appointments ({appointments.length})
              </SelectItem>
              <SelectItem value="completed">
                Completed (
                {appointments.filter((a) => a.status === "completed").length})
              </SelectItem>
              <SelectItem value="upcoming">
                Upcoming (
                {appointments.filter((a) => a.status === "upcoming").length})
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
       
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((appointment) => (
            // <h1>hello</h1>
            <AppointmentCard key={appointment.id} appointment={appointment}/>
          ))
        ) : (
          <Card className="border-accent/20 bg-card/50">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground text-lg">
                No appointments found
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AppointmentTabContent;
