"use client";

import { AlertCircle, CheckCircle2, Clock, Plus } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Progress } from "../../../components/ui/progress";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "../../../components/ui/dialog";
import ShoppingCart from "./ShoppingCart";
import ServiceCard from "./ServiceCard";
import { TabContentProps } from "@/app/customers/Interfaces/customerInterfaces";

const ServiceTabContent = ({ customer }: TabContentProps) => {
  const [filter, setFilter] = useState<
    "all" | "active" | "expiring-soon" | "expired"
  >("all");


  const filteredServices = (customer.services || []).filter((srv) => {
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
                  All Services ({(customer.services || []).length})
                </SelectItem>
                <SelectItem value="active">
                  Active Services (
                  {(customer.services || []).filter((s) => s.status === "active").length})
                </SelectItem>
                <SelectItem value="expiring-soon">
                  Expiring Soon (
                  {(customer.services || []).filter((s) => s.status === "expiring-soon").length})
                </SelectItem>
                <SelectItem value="expired">
                  Expired (
                  {(customer.services || []).filter((s) => s.status === "expired").length})
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
