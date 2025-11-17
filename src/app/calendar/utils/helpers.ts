import dayjs from "dayjs";

export const combineDateAndTime = (date:string, timeString:string) => {
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

// export const formatDate = (date, format = "default") => {
//   const formats = {
//     default: "MMMM D, YYYY", // "November 15, 2024"
//     short: "MMM D, YYYY", // "Nov 15, 2024"
//     numeric: "MM/DD/YYYY", // "11/15/2024"
//     iso: "YYYY-MM-DD", // "2024-11-15"
//     full: "dddd, MMMM D, YYYY", // "Friday, November 15, 2024"
//     dayMonth: "MMM D", // "Nov 15"
//     monthYear: "MMMM YYYY", // "November 2024"
//     shortMonthYear: "MMM YYYY", // "Nov 2024"
//     compact: "MM/DD/YY", // "11/15/24"
//     european: "DD/MM/YYYY", // "15/11/2024"
//     dotted: "DD.MM.YYYY", // "15.11.2024"
//     dashed: "DD-MM-YYYY", // "15-11-2024"
//   };

//   return dayjs(date).format(formats[format] || formats.default);
// };