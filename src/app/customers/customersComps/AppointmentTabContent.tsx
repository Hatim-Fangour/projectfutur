"use client";

import { useState } from "react";
import { Card, CardContent } from "../../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AppointmentCard from "./AppointmentCard";
import { TabContentProps } from "@/app/customers/Interfaces/customerInterfaces";



const AppointmentTabContent = ({ customer }: TabContentProps) => {
  const [filter, setFilter] = useState<"all" | "completed" | "upcoming">("all");
 
const filteredAppointments = (customer?.appointments ?? []).filter((apt) => {
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
                All Appointments ({(customer?.appointments ?? []).length})
              </SelectItem>
              <SelectItem value="completed">
                Completed (
                {(customer?.appointments ?? []).filter((a) => a.status === "completed").length})
              </SelectItem>
              <SelectItem value="upcoming">
                Upcoming (
                {(customer?.appointments ?? []).filter((a) => a.status === "upcoming").length})
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
       
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((appointment) => (
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
