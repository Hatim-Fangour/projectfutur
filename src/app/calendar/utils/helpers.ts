import dayjs from "dayjs";

export const combineDateAndTime = (date: string, timeString: string) => {
  // Step 1: Validate inputs
  if (!date || !timeString) return null;
  // Returns null if date or timeString is missing

  // Step 2: Parse the time string "10:30 AM" → ["10:30", "AM"]
  const [time, modifier] = timeString.split(" ");
  // time = "10:30"
  // modifier = "AM" or "PM"

  // Step 3: Extract hours and minutes "10:30" → [10, 30]
  let [hours, minutes] = time.split(":").map(Number);
  // hours = 10
  // minutes = 30

  // Step 4: Convert to 24-hour format
  if (modifier === "PM" && hours !== 12) hours += 12;
  // 1:00 PM → 13:00
  // 2:00 PM → 14:00
  // 12:00 PM stays 12:00 (noon)

  if (modifier === "AM" && hours === 12) hours = 0;
  // 12:00 AM → 00:00 (midnight)
  // Other AM times stay the same

  // Step 5: Create a new Date object from the input date
  const newDate = new Date(date);

  // Step 6: Set the hours and minutes (seconds and milliseconds to 0)
  newDate.setHours(hours, minutes, 0, 0);

  // Step 7: Return the complete Date object
  return newDate;
};

export const events = [
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
