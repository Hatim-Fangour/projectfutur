import React from "react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Calendar, ChevronRight, Clock } from "lucide-react";

const AppointmentCard = ({appointment}:any) => {
    const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200";
      case "upcoming":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };
  return (
    <Card
      key={appointment.id}
      className="border   transition-all hover:shadow-md dark:hover:bg-neutral-800  cursor-pointer group py-2"
    >
      <CardContent className="p-2 px-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left Content */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-lg font-semibold text-foreground group-hover:text-accen transition-colors">
                {appointment.service}
              </h3>
              <Badge className={getStatusColor(appointment.status)}>
                {getStatusLabel(appointment.status)}
              </Badge>
            </div>

            {/* Appointment Details Grid */}
            <div className="grid grid-cols-4 gap-1 mb-3 bg-red-0 w-4/5">
              {/* Date & Time */}
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-6 h-6 " />
                <div>
                  <p className="text-muted-foreground">Date & Time</p>
                  <p className="font-medium text-foreground">
                    {new Date(appointment.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}{" "}
                    at {appointment.time}
                  </p>
                </div>
              </div>

              {/* Duration */}
              {appointment.duration && (
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 " />
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-medium text-foreground">
                      {appointment.duration}
                    </p>
                  </div>
                </div>
              )}

              {/* Reason */}
              <div className="bg-muted/30 rounded-lg p-3 border">
                <p className="text-xs text-muted-foreground mb-1">Reason</p>
                <p className="font-medium text-foreground text-sm">
                  {appointment.reason}
                </p>
              </div>

              {/* Therapist */}
              <div className="bg-muted/30 rounded-lg p-3 border ml-3">
                <p className="text-xs text-muted-foreground mb-1">Therapist</p>
                <p className="font-medium text-foreground text-sm">
                  {appointment.therapist}
                </p>
              </div>

         
            </div>

            {/* Notes */}
            {appointment.notes && (
              <div className="mt-3 bg-accent/5 border-l-4 border-accent/800 rounded-r-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Notes</p>
                <p className="text-sm text-foreground">{appointment.notes}</p>
              </div>
            )}
          </div>

          {/* Right Arrow */}
          <div className="flex items-center justify-center pt-2">
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppointmentCard;
