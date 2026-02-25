import { prisma } from "@/lib/prisma";
import React from "react";

const singleCustomer = async () => {
  const cust = await prisma.customer.findMany();

  console.log({ cust });
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
