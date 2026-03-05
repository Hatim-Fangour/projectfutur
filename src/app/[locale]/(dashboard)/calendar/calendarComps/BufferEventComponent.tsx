// components/BufferEventComponent.tsx
import { CalendarEventType } from "@/app/[locale]/(dashboard)/customers/Interfaces/customerInterfaces";
import { formatToSlot } from "@/app/[locale]/(dashboard)/customers/utils/helpers";
import { adjustColorBrightness } from "@/app/[locale]/(dashboard)/Helpers";
import React from "react";
import { EventProps } from "react-big-calendar";

const BufferEventComponent: React.FC<EventProps<CalendarEventType>> = ({
  event,
}) => {
  const hasBuffer = event.bufferTime && event.bufferTime > 0 && event.actualEnd;
  // ✅ If no buffer, render simple event
  if (!hasBuffer) {
    return (
      <div
        style={{
          position: "relative",
          padding: "6px 8px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "start",
          overflow: "hidden",
          backgroundColor: `${event.color}aa`,
        }}
      >
        <div
          className={`absolute top-0 left-0 w-2 h-full`}
          style={{
            backgroundColor: `${adjustColorBrightness(
              event.color || "#515151",
              1
            )}`,
          }}
        />
        <div
          style={{
            fontWeight: 600,
            fontSize: "13px",
            color: "white",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            lineHeight: 1.3,
          }}
        >
          <div className="mb-2">
            {formatToSlot(event.start)} - {formatToSlot(event.end)}
          </div>
          <div>{event.title}</div>
        </div>
        {event.isDraft && (
          <div
            style={{
              fontSize: "11px",
              color: "rgba(255, 255, 255, 0.9)",
              marginTop: "2px",
            }}
          >
            No buffer Time
          </div>
        )}
      </div>
    );
  }

  // ✅ Calculate percentages based on actual time durations (most accurate)
  const totalMinutes =
    (event.end.getTime() - event.start.getTime()) / (1000 * 60);
  const actualMinutes =
    (event.actualEnd!.getTime() - event.start.getTime()) / (1000 * 60);
  const bufferMinutes = event.bufferTime || 0;

  // ✅ Calculate percentages
  const appointmentPercent = (actualMinutes / totalMinutes) * 100;
  const bufferPercent = (bufferMinutes / totalMinutes) * 100;

  // ✅ Validation check
  if (appointmentPercent <= 0 || bufferPercent <= 0 || bufferPercent >= 100) {
    console.error("⚠️ Invalid percentages:", {
      appointmentPercent,
      bufferPercent,
    });
    return (
      <div style={{ padding: "6px 8px", height: "100%", color: "white" }}>
        {event.title}
      </div>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        backgroundColor: `${event.color}aa`,
      }}
    >
      <div
        className={`absolute top-0 left-0 w-2 h-full`}
        style={{
          backgroundColor: `${adjustColorBrightness(
            event.color || "#515151",
            1
          )}`,
        }}
      />
      {/* Main appointment section */}
      <div
        style={{
          flex: `0 0 ${appointmentPercent}%`, // ✅ Use calculated percentage
          padding: "6px 16px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "start",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            fontWeight: 600,
            fontSize: "13px",
            color: "white",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            lineHeight: 1.3,
          }}
        >
          <div className="mb-2">
            {formatToSlot(event.start)} - {formatToSlot(event.end)}
          </div>
          <div>{event.title.replace(` (+${bufferMinutes}min buffer)`, "")}</div>
        </div>
        {/* {event.isDraft && (
          <div
            style={{
              fontSize: "11px",
              color: "rgba(255, 255, 255, 0.9)",
              marginTop: "2px",
            }}
          >
            Preview
          </div>
        )} */}
      </div>

      {/* Buffer section */}
      <div
        style={{
          flex: `0 0 ${bufferPercent}%`, // ✅ Use calculated percentage
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
        }}
      >
        +{bufferMinutes}min buffer
      </div>
    </div>
  );
};

export default BufferEventComponent;
