// components/CustomCalendarEvent.tsx
import React from "react";
import { EventProps } from "react-big-calendar";
import { CalendarEventType } from "../Interfaces/customerInterfaces";

const CustomCalendarEvent: React.FC<EventProps<CalendarEventType>> = ({ event }) => {
  const buffer = event.bufferTime || 0;
  const hasBuffer = buffer > 0 && event.actualEnd;

  // Calculate percentages
  let appointmentPercent = 100;
  let bufferPercent = 0;

  if (hasBuffer) {
    const totalDuration =
      (new Date(event.end).getTime() - new Date(event.start).getTime()) /
      (1000 * 60);
    appointmentPercent = ((totalDuration - buffer) / totalDuration) * 100;
    bufferPercent = (buffer / totalDuration) * 100;
  }

  const eventColor =  "#41ad31";
  // const eventColor = event.color || "#ad3131";

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        opacity: event.isDraft ? 0.85 : 1,
      }}
    >
      {/* Main Event block - with solid background color */}
      <div
        style={{
          flex: `0 0 ${appointmentPercent}%`,
          padding: "0px",
          backgroundColor: eventColor, // ✅ Set color here
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          minHeight: 0,
        }}
      >
        <strong
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: "white",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            lineHeight: 1.3,
          }}
        >
          {event.title.replace(` (+${buffer}min buffer)`, "")}
        </strong>

        {event.isDraft && (
          <span
            style={{
              fontSize: "11px",
              color: "rgba(255, 255, 255, 0.9)",
              marginTop: "2px",
            }}
          >
            Preview
          </span>
        )}
      </div>
      {/* Buffer block - with contrasting striped pattern */}
      {hasBuffer && (
        <div
          style={{
            flex: `0 0 ${bufferPercent}%`,
            padding: "4px 8px",
            // ✅ Two layers: base color + stripe pattern
            backgroundColor: "#ff0000",
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 8px,
              rgba(179, 24, 24, 0.3) 8px,
              rgba(244, 0, 0, 0.768) 16px
            )`,
            borderTop: "2px dashed rgba(255, 255, 255, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 0,
          }}
        >
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "white",
              textShadow: "0 1px 3px rgba(0, 0, 0, 0.5)",
            }}
          >
            +{buffer}min buffer
          </span>
        </div>
      )}
    </div>
  );
};

export default CustomCalendarEvent;