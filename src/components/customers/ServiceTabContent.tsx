"use client";

import { AlertCircle, CheckCircle2, Clock, Plus } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import ShoppingCart from "./ShoppingCart";
import ServiceCard from "./ServiceCard";
import { Customer } from "@/types/customers";
import { TabContentProps } from "@/Interfaces/customerInterfaces";

const ServiceTabContent = ({ customer }: TabContentProps) => {
  console.log(customer);
  const [filter, setFilter] = useState<
    "all" | "active" | "expiring-soon" | "expired"
  >("all");
  const services = [
    {
      id: "1",
      name: "Premium Facial Package",
      type: "Facial Treatment",
      totalSessions: 10,
      remainingSessions: 6,
      purchaseDate: "2024-08-15",
      expiryDate: "2024-11-15",
      price: 450,
      status: "expiring-soon",
      description:
        "Includes anti-aging facial, hydration treatment, and skin brightening",
    },
    {
      id: "2",
      name: "Full Body Massage Bundle",
      type: "Massage Therapy",
      totalSessions: 8,
      remainingSessions: 3,
      purchaseDate: "2024-09-01",
      expiryDate: "2024-11-30",
      price: 380,
      status: "active",
      description: "90-minute full body relaxation sessions",
    },
    {
      id: "3",
      name: "Spa Wellness Package",
      type: "Complete Wellness",
      totalSessions: 12,
      remainingSessions: 12,
      purchaseDate: "2024-11-13",
      expiryDate: "2025-02-13",
      price: 599,
      status: "active",
      description: "Mix of massages, facials, and spa treatments",
    },
    {
      id: "4",
      name: "Hot Stone Massage Series",
      type: "Massage Therapy",
      totalSessions: 6,
      remainingSessions: 0,
      purchaseDate: "2024-08-01",
      expiryDate: "2024-11-01",
      price: 270,
      status: "expired",
      description: "Therapeutic hot stone massage sessions",
    },
    {
      id: "5",
      name: "Skincare Intensive",
      type: "Skincare Treatment",
      totalSessions: 5,
      remainingSessions: 2,
      purchaseDate: "2024-10-15",
      expiryDate: "2025-01-15",
      price: 299,
      status: "active",
      description: "Professional skincare consultation and treatment",
    },
  ];

  const filteredServices = services.filter((srv) => {
    if (filter === "all") return true;
    return srv.status === filter;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        {/* Filter Tabs */}
        <div className="">
          <Select
            defaultValue="all"
            onValueChange={(value) => setFilter(value as any)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a fruit" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">
                  All Services ({services.length})
                </SelectItem>
                <SelectItem value="active">
                  Active Services (
                  {services.filter((s) => s.status === "active").length})
                </SelectItem>
                <SelectItem value="expiring-soon">
                  Expiring Soon (
                  {services.filter((s) => s.status === "expiring-soon").length})
                </SelectItem>
                <SelectItem value="expired">
                  Expired (
                  {services.filter((s) => s.status === "expired").length})
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Dialog>
            <DialogTrigger asChild>
              <div className="sticky bottom-0 w-6 left-0 cursor-pointer">
                <Button>
                  <Plus />
                </Button>
              </div>
            </DialogTrigger>
            <DialogContent className="w-[95%]! h-[95%]! max-w-full! p-8">
              <ShoppingCart />
              {/* <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter> */}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Services List */}
      <div className="space-y-4">
        {filteredServices.length > 0 ? (
          filteredServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))
        ) : (
          <Card className="border-accent/20 bg-card/50">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground text-lg">No Services found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ServiceTabContent;
