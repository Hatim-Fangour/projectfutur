import type { Metadata } from 'next'
import { prisma } from "@/lib/prisma";
import React from "react";

export const metadata: Metadata = {
  title: 'Customer Details',
  description: 'View detailed customer profile, visit history, and treatment records.',
}

const singleCustomer = async () => {
  const cust = await prisma.customer.findMany();

  return (
    <div>
      <div>{cust[0].fullName}</div>
      <div>{cust[0].company}</div>
      <div>{cust[0].email}</div>
      <div>{cust[0].phone}</div>
      <div>{cust[0].address}</div>
      <div>{cust[0].state}</div>
    </div>
  );
};

export default singleCustomer;
