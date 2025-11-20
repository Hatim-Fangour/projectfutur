// components/BufferEventComponent.tsx
import { CalendarEventType } from "@/app/customers/Interfaces/customerInterfaces";
import React from "react";
import { EventProps } from "react-big-calendar";

const BufferEventComponent: React.FC<EventProps<CalendarEventType>> = ({
  event,
}) => {
  console.log("🔍 Event data:", event);
  
  const hasBuffer = event.bufferTime && event.bufferTime > 0 && event.actualEnd;

  console.log("🎨 Rendering event:", event.title, {
    hasBuffer,
    bufferTime: event.bufferTime,
    actualEnd: event.actualEnd,
  });

  // ✅ If no buffer, render simple event

  if (!hasBuffer) {
    return (
      <div
        style={{
          padding: "6px 8px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            fontWeight: 600,
            fontSize: "13px",
            color: "white", // ✅ Explicit color
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            lineHeight: 1.3,
          }}
        >
          {event.title}
        </div>
        {event.isDraft && (
          <div
            style={{
              fontSize: "11px",
              color: "rgba(255, 255, 255, 0.9)", // ✅ Explicit color
              marginTop: "2px",
            }}
          >
            Preview
          </div>
        )}
      </div>
    );
  }

  // ✅ Calculate buffer percentage
  const totalMs = event.end.getTime() - event.start.getTime();
  const actualMs = event.actualEnd!.getTime() - event.start.getTime();
  const bufferPercent = ((totalMs - actualMs) / totalMs) * 100;

  console.log("📊 Buffer calculation:", {
    start: event.start.toLocaleTimeString(),
    actualEnd: event.actualEnd!.toLocaleTimeString(),
    end: event.end.toLocaleTimeString(),
    totalMs,
    actualMs,
    bufferPercent: bufferPercent.toFixed(1) + "%",
    mainPercent: (100 - bufferPercent).toFixed(1) + "%",
  });

  // ✅ If buffer percentage is too high, show warning
  if (bufferPercent >= 100 || bufferPercent < 0) {
    console.error("⚠️ Invalid buffer percentage:", bufferPercent);
    return (
      <div
        style={{
          padding: "6px 8px",
          height: "100%",
          color: "white",
          fontSize: "12px",
        }}
      >
        {event.title}
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Main appointment section */}
      <div
        style={{
          flex: `0 0 ${100 - bufferPercent}%`,
          padding: "6px 8px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          overflow: "hidden",
          minHeight: "20px", // ✅ Minimum height to ensure visibility
        }}
      >
        <div
          style={{
            fontWeight: 600,
            fontSize: "13px",
            color: "white", // ✅ Explicit white color
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            lineHeight: 1.3,
          }}
        >
          {event.title.replace(` (+${event.bufferTime}min buffer)`, "")}
        </div>
        {event.isDraft && (
          <div
            style={{
              fontSize: "11px",
              color: "rgba(255, 255, 255, 0.9)", // ✅ Explicit color
              marginTop: "2px",
            }}
          >
            {event.title}
          </div>
        )}
      </div>

      {/* Buffer section - VERY VISIBLE */}
      <div
        style={{
          flex: `0 0 ${bufferPercent}%`,
          background: `repeating-linear-gradient(
            45deg,
            rgba(0, 0, 0, 0.2),
            rgba(0, 0, 0, 0.2) 6px,
            rgba(255, 255, 255, 0.25) 6px,
            rgba(255, 255, 255, 0.25) 12px
          )`,
          borderTop: "2px dashed rgba(255, 255, 255, 0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "11px",
          fontWeight: 700,
          color: "white",
          textShadow: "0 1px 3px rgba(0, 0, 0, 0.5)",
          minHeight: "15px", // ✅ Minimum height
        }}
      >
        +{event.bufferTime}min buffer
      </div>
    </div>
  );
};

export default BufferEventComponent;


// ## 🔍 What to Check in Console

// Look at the console output:
// ```
// 🔍 Event data: { title: "...", start: ..., end: ..., actualEnd: ..., bufferTime: 30 }
// 🎨 Rendering event: Swedish Massage (+30min buffer) { hasBuffer: true, bufferTime: 30, actualEnd: ... }
// 📊 Buffer calculation: {
//   start: "10:00:00 AM",
//   actualEnd: "11:00:00 AM",
//   end: "11:30:00 AM",
//   totalMs: 5400000,
//   actualMs: 3600000,
//   bufferPercent: "33.3%",
//   mainPercent: "66.7%"
// }