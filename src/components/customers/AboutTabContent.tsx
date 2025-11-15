import { TabContentProps } from "@/Interfaces/customerInterfaces";
import { Customer } from "@/types/customers";
import { Mail, MapPin, Phone } from "lucide-react";
import React from "react";
// ✅ Best practice - Interface
// interface TabContentProps {
//   customer: Customer;
// }
const AboutTabContent = ({customer}:TabContentProps) => {
  console.log(customer)
  return (
    <div className="">
      <div className="flex flex-col gap-6">
        {customer?.phone && (
          <div className="flex items-center gap-4">
            <span>
              <Phone />
            </span>
            <span>{customer?.phone}</span>
          </div>
        )}
        {customer?.email && (
          <div className="flex items-center gap-4">
            <span>
              <Mail />
            </span>
            <span>{customer?.email}</span>
          </div>
        )}
        {customer?.address && (
          <div className="flex items-center gap-4">
            <span>
              <MapPin />
            </span>
            <span>{customer?.address}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AboutTabContent;
