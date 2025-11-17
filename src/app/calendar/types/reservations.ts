export type BaseAppointment = {
  id: string;
  title?: string | "";
  start: Date;
  end: Date;
  allDay?: boolean;
  desc?: string;
};
