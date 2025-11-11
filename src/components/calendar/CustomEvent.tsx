import React from "react";

const CustomEvent = ({ event }:any) => {
  // console.log(event);
  const buffer = event.buffer?.value || 0; // minutes

  //   const start = new Date(event.start);
  //   const end = new Date(event.end);

  // Extend end time with buffer
  //   const extendedEnd = new Date(end.getTime() + buffer * 60000);

  // Durations
  //   const eventDuration = (end - start) / (1000 * 60); // minutes
  //   const totalDuration = (extendedEnd - start) / (1000 * 60);
  //   const bufferPercent = totalDuration > 0 ? (buffer / totalDuration) * 100 : 0;
  //   console.log(buffer)
  // Add buffer
  // const endWithBuffer = new Date(end.getTime() + buffer * 60 * 1000);
  //
  // console.log(endWithBuffer)

  // Total duration (with buffer) in minutes
  const totalDuration =
    (new Date(event.end).getTime() - new Date(event.start).getTime()) /
    (1000 * 60);

  // Appointment part = total - buffer
  const appointmentPercent =
    buffer > 0 ? ((totalDuration - buffer) / totalDuration) * 100 : 100;
  const bufferPercent = buffer > 0 ? (buffer / totalDuration) * 100 : 0;

  // console.table({totalDuration,appointmentPercent,bufferPercent})

  return (
    <div
      tabIndex={-1}
      className="thisIsTheAllEventContainer"
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        // borderRadius: "6px",
        overflow: "hidden",
        // border :"1px solid red",
      }}
    >
      {/* Main Event block */}
      <div
        style={{
          flex: `1 1 auto`,
          //   padding: "2px 4px",
          //   paddingLeft: 8,
          //   background: "#fdd",
          background: "#fde7e0",
          padding: "2px 8px",

          //   flex: `0 0 ${100 - bufferPercent}%`,
          // padding: "2px 4px",
          display: "flex",
          // flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <strong style={{ fontSize: "12px" }}>{event.title}</strong>
        {event.description && (
          <span style={{ fontSize: "11px", color: "#444" }}>
            {event.description}
          </span>
        )}
      </div>

      {/* Buffer block (striped) */}
      {event?.buffer?.value > 0 && (
        <div
          style={{
            flex: `0 0 ${bufferPercent}%`,
            padding: "2px 8px",
            background:
              "repeating-linear-gradient(45deg, #f8b6a0, #f8b6a0 6px, transparent 6px, transparent 12px)",
          }}
        >
          <span style={{ fontSize: "10px", color: "#444" }}>
            Buffer {event?.buffer?.value} min
          </span>
        </div>
      )}
    </div>
  );
};

export default CustomEvent;
