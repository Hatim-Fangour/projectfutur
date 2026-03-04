"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

const BookCalendarAppointment = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  // const form = useForm<AppointmentFormData>({
  //   resolver: zodResolver(customerAppointmentSchema),
  //   defaultValues: getDefaultFormAppointmentValues(),
  // });
  return (
    <h1>BookCalendarAppointment</h1>
    // <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
    //   <DialogTrigger asChild>
    //     <Button>Book appointment</Button>
    //   </DialogTrigger>
    //   <Form {...form}>

    //   </Form>
    // </Dialog>
  );
};

export default BookCalendarAppointment;
