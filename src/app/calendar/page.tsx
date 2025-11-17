"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  Calendar,
  Views,
  DateLocalizer,
  momentLocalizer,
} from "react-big-calendar";
import moment from "moment";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/css/react-big-calendar.css";

import "./style/calendarStyle.scss";
import CustomToolbar from "@/app/calendar/calendarComps/CustomToolbar";
import CustomEvent from "@/app/calendar/calendarComps/CustomEvent";
import PopOverEvent from "@/app/calendar/calendarComps/PopOverEvent";
import { Calendar1, Clock, Info, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const DragAndDropCalendar = withDragAndDrop(Calendar);
// Initialize localizer OUTSIDE the component
const localizer = momentLocalizer(moment);
const page = () => {
  const calendarRef = useRef(0);

  const now = new Date();

  const events = [
    {
      id: "1",
      title: "Long Event",
      start: new Date(2025, 12, 7),
      end: new Date(2025, 12, 10),
    },

    {
      id: "2",
      title: "DTS STARTS",
      start: new Date(2025, 10, 5, 8, 5, 0),
      end: new Date(2025, 10, 5, 11, 0, 0),
    },

    {
      id: "3",
      title: "DTS ENDS",
      start: new Date(2025, 10, 9, 8, 5, 0),
      end: new Date(2025, 10, 9, 11, 0, 0),
    },

    {
      id: "4",
      title: "Some Event",
      start: new Date(2025, 3, 9, 0, 0, 0),
      end: new Date(2025, 3, 9, 0, 0, 0),
      allDay: true,
    },

    {
      id: "7",
      title: "Lunch",
      start: new Date(2025, 3, 12, 12, 0, 0, 0),
      end: new Date(2025, 3, 12, 13, 0, 0, 0),
      desc: "Power lunch",
    },

    {
      id: "8",
      title: "Today",
      start: new Date(new Date().setHours(new Date().getHours() - 3)),
      end: new Date(new Date().setHours(new Date().getHours() + 3)),
    },
  ];



  const [myEvents, setMyEvents] = useState(events);

  const moveEvent = useCallback(
    ({ event, start, end, isAllDay: droppedOnAllDaySlot = false }: any) => {
      const { allDay } = event;
      if (!allDay && droppedOnAllDaySlot) {
        event.allDay = true;
      }
      if (allDay && !droppedOnAllDaySlot) {
        event.allDay = false;
      }

      setMyEvents((prev: any) => {
        const existing = prev.find((ev: any) => ev.id === event.id) ?? {};
        const filtered = prev.filter((ev: any) => ev.id !== event.id);
        return [...filtered, { ...existing, start, end, allDay: event.allDay }];
      });
    },
    [setMyEvents]
  );

  const resizeEvent = useCallback(
    ({ event, start, end }: any) => {
      setMyEvents((prev: any) => {
        const existing = prev.find((ev: any) => ev.id === event.id) ?? {};
        const filtered = prev.filter((ev: any) => ev.id !== event.id);
        return [...filtered, { ...existing, start, end }];
      });
    },
    [setMyEvents]
  );

  const defaultDate = useMemo(() => new Date(2015, 3, 12), []);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });

  const handleSelectEvent = (event: any, e: any) => {
    setSelectedEvent(event);
    setPopoverPosition({
      x: e.clientX,
      y: e.clientY,
    });
    setPopoverOpen(true);
  };
  const eventPropGetter = (event: any) => {
    if (event.type === "service") return { className: "serviceEvent" };
    if (event.type === "class") return { className: "classEvent" };
    if (event.type === "reminder") return { className: "reminderEvent" };

    if (event.type === "event") {
      return {
        className: "eventEvent",
        style: {
          // backgroundColor: event?.eventColor || eventColors[0], // fallback
          backgroundColor: event?.eventColor || "#56ff98", // fallback
        },
      };
    }

    return {};
  };

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
    {
      id: "6",
      date: "2024-10-30",
      time: "09:00",
      service: "Skincare Treatment",
      therapist: "Emma Davis",
      reason: "Skin health and hydration",
      status: "completed",
      location: "Spa Studio B",
      duration: "45 min",
    },
    {
      id: "7",
      date: "2024-10-30",
      time: "09:00",
      service: "Skincare Treatment",
      therapist: "Emma Davis",
      reason: "Skin health and hydration",
      status: "completed",
      location: "Spa Studio B",
      duration: "45 min",
    },
    {
      id: "8",
      date: "2024-10-30",
      time: "09:00",
      service: "Skincare Treatment",
      therapist: "Emma Davis",
      reason: "Skin health and hydration",
      status: "completed",
      location: "Spa Studio B",
      duration: "45 min",
    },
    {
      id: "9",
      date: "2024-10-30",
      time: "09:00",
      service: "Skincare Treatment",
      therapist: "Emma Davis",
      reason: "Skin health and hydration",
      status: "completed",
      location: "Spa Studio B",
      duration: "45 min",
    },
    {
      id: "10",
      date: "2024-10-30",
      time: "09:00",
      service: "Skincare Treatment",
      therapist: "Emma Davis",
      reason: "Skin health and hydration",
      status: "completed",
      location: "Spa Studio B",
      duration: "45 min",
    },
    {
      id: "11",
      date: "2024-10-30",
      time: "09:00",
      service: "Skincare Treatment",
      therapist: "Emma Davis",
      reason: "Skin health and hydration",
      status: "completed",
      location: "Spa Studio B",
      duration: "45 min",
    },
    {
      id: "12",
      date: "2024-10-30",
      time: "09:00",
      service: "Skincare Treatment",
      therapist: "Emma Davis",
      reason: "Skin health and hydration",
      status: "completed",
      location: "Spa Studio B",
      duration: "45 min",
    },
    {
      id: "13",
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
  return (
    // <div className="grid grid-cols-10 grid-rows-12 gap-2 h-[calc(100vh-95px)]">
    <div className="flex flex-col gap-4 h-[calc(100vh-95px)]">
      <PopOverEvent
        popoverOpen={popoverOpen}
        setPopoverOpen={setPopoverOpen}
        popoverPosition={popoverPosition}
      />

      {/* Header */}
      {/* <div className="border-b pb-2 flex w-full justify-between items-center h-full">
        <div className="leftHeaderPart">
          <h1 className="text-3xl font-semibold tracking-tight first:mt-0">
            Reservation Management
          </h1>
          <h2>Manage appointments, bookings, and schedules</h2>
        </div>
        <div className="rightHeaderPart">
          <Button>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div> */}

      {/* body */}
      <div className="grid-cols-10 grid flex-1 gap-4 h-full">
        <div className="col-span-2 h-full bg-primary-foreground p-0.5 rounded-lg border-none overflow-hidden pb-9">
          <div className="px-1 pt-2 flex items-center justify-between">
            <Select defaultValue="today">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a fruit" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {/* <SelectLabel>Appointment of:</SelectLabel> */}
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="tomorrow">Tomorrow</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <ScrollArea className="h-[95%] overflow-y-auto p-1 pr-4 mt-5 ">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="mb-3 p-2 mr-2 flex items-center justify-between cursor-pointer w-full border-2 rounded-lg hover:bg-muted transition-colors duration-200"
              >
                <Popover>
                  <PopoverTrigger asChild>
                    <div className="flex items-center justify-between space-x-2 w-full">
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar1 className="w-6 h-6 " />
                        <div>
                          {/* <p className="text-muted-foreground">Date & Time</p> */}
                          <h4 className="text-md font-bold text-foreground group-hover:text-accen transition-colors">
                            {appointment.service}
                          </h4>
                          <p className="font-medium text-foreground">
                            {new Date(appointment.date).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}{" "}
                            at {appointment.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" side="right">
                    <Card
                      key={appointment.id}
                      className="border-none  transition-all hover:shadow-md dark:hover:bg-neutral-800  cursor-pointer group py-2"
                    >
                      <CardContent className="p-2 px-4">
                        <div className="flex items-start justify-between gap-4">
                          {/* Left Content */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="text-lg font-semibold text-foreground group-hover:text-accen transition-colors">
                                {appointment.service}
                              </h3>
                              {/* <Badge
                                className={getStatusColor(appointment.status)}
                              >
                                {getStatusLabel(appointment.status)}
                              </Badge> */}
                            </div>

                            {/* Appointment Details Grid */}
                            <div className="grid grid-cols-4 gap-1 mb-3 bg-red-0 w-full">
                              {/* Date & Time */}
                              <div className="flex items-center gap-3 text-sm">
                                <Calendar1 className="w-6 h-6 " />
                                <div>
                                  <p className="text-muted-foreground">
                                    Date & Time
                                  </p>
                                  <p className="font-medium text-foreground">
                                    {new Date(
                                      appointment.date
                                    ).toLocaleDateString("en-US", {
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
                                    <p className="text-muted-foreground">
                                      Duration
                                    </p>
                                    <p className="font-medium text-foreground">
                                      {appointment.duration}
                                    </p>
                                  </div>
                                </div>
                              )}

                              {/* Reason */}
                              <div className="bg-muted/30 rounded-lg p-3 border">
                                <p className="text-xs text-muted-foreground mb-1">
                                  Reason
                                </p>
                                <p className="font-medium text-foreground text-sm">
                                  {appointment.reason}
                                </p>
                              </div>

                              {/* Therapist */}
                              <div className="bg-muted/30 rounded-lg p-3 border ml-3">
                                <p className="text-xs text-muted-foreground mb-1">
                                  Therapist
                                </p>
                                <p className="font-medium text-foreground text-sm">
                                  {appointment.therapist}
                                </p>
                              </div>
                            </div>

                            {/* Notes */}
                            {appointment.notes && (
                              <div className="mt-3 bg-accent/5 border-l-4 border-accent/800 rounded-r-lg p-3">
                                <p className="text-xs text-muted-foreground mb-1">
                                  Notes
                                </p>
                                <p className="text-sm text-foreground">
                                  {appointment.notes}
                                </p>
                              </div>
                            )}
                          </div>

                        </div>
                      </CardContent>
                    </Card>
                  </PopoverContent>
                </Popover>
              </div>
            ))}
          </ScrollArea>
        </div>

        <div
          className={`calendarPageBody col-span-8 h-full flex-1 box-border bg-primary-foreground p-1 rounded-lg border-none  month-view`}
          style={{
            height: "100%", // Fixed height instead of "100%"
            width: "100%",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div className={`calendar-container h-full month-view`}>
            <DragAndDropCalendar
              defaultView={Views.MONTH}
              events={myEvents}
              localizer={localizer}
              onEventDrop={moveEvent}
              onEventResize={resizeEvent}
              popup
              resizable
              formats={{
                timeGutterFormat: (date, culture, localizer: any) =>
                  localizer.format(date, "h a", culture), // 👈 "12 AM" instead of "12:00 AM"
              }}
              // startAccessor="start"
              // endAccessor="end"
              eventPropGetter={eventPropGetter}
              // view={calendarHook.currentView}
              // onView={calendarHook.setCurrentView}
              // onSelectSlot={calendarHook.onClickOrSelectSlot}
              step={15} // each slot = 15 minutes
              timeslots={4} // 4 slots per hour → 15 × 4 = 60 min
              selectable
              onSelectEvent={(event, e) => {
                e.preventDefault(); // stop default event handling
                e.stopPropagation(); // prevent bubbling
                console.log("Event clicked:", event);
                handleSelectEvent(event, e);

                // calendarHook.onClickEvent(event, e); // your custom handler
              }}
              components={{
                toolbar: CustomToolbar,
                event: CustomEvent,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
