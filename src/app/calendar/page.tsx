"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  Calendar,
  Views,
  DateLocalizer,
  momentLocalizer,
} from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/css/react-big-calendar.css";
// import "react-big-calendar/lib/addons/dragAndDrop/styles.css";


import moment from "moment";
import "./../../styles/calendarStyle.scss";
import CustomToolbar from "@/components/calendar/CustomToolbar";
import CustomEvent from "@/components/calendar/CustomEvent";
import PopOverEvent from "@/components/calendar/PopOverEvent";

const DragAndDropCalendar = withDragAndDrop(Calendar);
// Initialize localizer OUTSIDE the component
const localizer = momentLocalizer(moment);
const page = () => {
  const calendarRef = useRef(0);

  const now = new Date();

  const events = [
    {
      id: 1,
      title: "Long Event",
      start: new Date(2025, 12, 7),
      end: new Date(2025, 12, 10),
    },

    {
      id: 2,
      title: "DTS STARTS",
      start: new Date(2025, 10, 5, 8, 5, 0),
      end: new Date(2025, 10, 5, 11, 0, 0),
    },

    {
      id: 3,
      title: "DTS ENDS",
      start: new Date(2025, 10, 9, 8, 5, 0),
      end: new Date(2025, 10, 9, 11, 0, 0),
    },

    {
      id: 4,
      title: "Some Event",
      start: new Date(2025, 3, 9, 0, 0, 0),
      end: new Date(2025, 3, 9, 0, 0, 0),
      allDay: true,
    },

    {
      id: 7,
      title: "Lunch",
      start: new Date(2025, 3, 12, 12, 0, 0, 0),
      end: new Date(2025, 3, 12, 13, 0, 0, 0),
      desc: "Power lunch",
    },

    {
      id: 14,
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
   const eventPropGetter = (event:any) => {
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
  return (
    <div>
      <PopOverEvent
        popoverOpen={popoverOpen}
        setPopoverOpen={setPopoverOpen}
        popoverPosition={popoverPosition}
      />
      <div
        className={`calendarPageBody h-full flex-1 box-border pt-3  month-view`}
        style={{
          height: "850px", // Fixed height instead of "100%"
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
              timeGutterFormat: (date, culture, localizer:any) =>
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
  );
};

export default page;
