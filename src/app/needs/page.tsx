import NeedCard from "@/components/needsAndNotes/NeedCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Archive,
  CircleAlert,
  MoreVertical,
  Plus,
  ShoppingCart,
  Sigma,
  Siren,
} from "lucide-react";
import React from "react";

const page = () => {
  const categories = [
    {
      value: "skincare",
      label: "Skincare & Beauty",
      // icon: <Spa />,
      color: "#e8f5e8",
    },
    {
      value: "massage",
      label: "Massage Products",
      // icon: <LocalFlorist />,
      color: "#f3e5f5",
    },
    {
      value: "linens",
      label: "Towels & Linens",
      // icon: <Hotel />,
      color: "#e3f2fd",
    },
    {
      value: "equipment",
      label: "Equipment",
      // icon: <FitnessCenter />,
      color: "#fff3e0",
    },
    {
      value: "aromatherapy",
      label: "Aromatherapy",
      // icon: <LocalFlorist />,
      color: "#f1f8e9",
    },
    {
      value: "cleaning",
      label: "Cleaning Supplies",
      // icon: <CleaningServices />,
      color: "#fce4ec",
    },
    {
      value: "reception",
      label: "Reception",
      // icon: <ShoppingCart />,
      color: "#e8eaf6",
    },
    {
      value: "refreshments",
      label: "Refreshments",
      // icon: <Restaurant />,
      color: "#e0f2f1",
    },
  ];

  const filteredNeeds = [
    {
      id: 1,
      name: "Aloe Vera Gel",
      category: "skincare",
      description: "Soothing gel for skin hydration and healing.Soothing gel for skin hydration and healing.Soothing gel for skin hydration and healing.",
      quantity: 50,
      unit: "bottles",
      estimatedCost: 200,
      priority: "normal",
      status: "needed",
      supplier: "Nature's Best",
      dueDate: "2024-09-15",
    },
    {
      id: 2,
      name: "Massage Oil",
      category: "massage",
      description: "",
      quantity: 30,
      unit: "liters",
      estimatedCost: 150,
      priority: "urgent",
      status: "ordered",
      supplier: "Relax Co.",
      dueDate: "2024-08-30",
    },
    {
      id: 3,
      name: "Cotton Towels",
      category: "linens",
      description: "Soft and absorbent towels for spa treatments.",
      quantity: 100,
      unit: "pieces",
      estimatedCost: 300,
      priority: "low",
      status: "received",
      supplier: "Comfort Linens",
      dueDate: "2024-10-01",
    },
     {
      id: 4,
      name: "Cotton Towels",
      category: "linens",
      description: "Soft and absorbent towels for spa treatments.",
      quantity: 100,
      unit: "pieces",
      estimatedCost: 300,
      priority: "low",
      status: "received",
      supplier: "Comfort Linens",
      dueDate: "2024-10-01",
    },
     {
      id: 5,
      name: "Cotton Towels",
      category: "linens",
      description: "Soft and absorbent towels for spa treatments.",
      quantity: 100,
      unit: "pieces",
      estimatedCost: 300,
      priority: "low",
      status: "received",
      supplier: "Comfort Linens",
      dueDate: "2024-10-01",
    },
  ];

  const statsNeedsCards = [
    {
      id: 1,
      value: 12,
      title: "Total Products",
      icon: Archive,
      color: "#f57c00",
    },
    {
      id: 2,
      value: 3,
      title: "Urgent Needs",
      icon: Siren,
      color: "#d32f2f",
    },
    {
      id: 3,
      value: 2,
      title: "Pending Orders",
      icon: ShoppingCart,
      color: "#2e7d32",
    },
    {
      id: 4,
      value: 5,
      title: "Total Cost",
      icon: Sigma,
      color: "#1976d2",
    },
  ];
  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="scroll-m-20 border-b pb-2 flex w-full justify-between items-center">
        <div className="leftHeaderPart">
          <h1 className="text-3xl font-semibold tracking-tight first:mt-0">
            Product Management
          </h1>
          <h2>Manage your spa center's product needs and inventory</h2>
        </div>
        <div className="rightHeaderPart">
          <Button>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

     

      {/* Stats Cards */}
      <div className="flex items-center w-full gap-6 justify-between mt-4">
        {statsNeedsCards.map((statCard) => (
          <Card className="w-1/4" key={statCard.id}>
            <CardContent className="flex items-center gap-4">
              <Avatar
                className="flex items-center justify-center bg-[#e8f5e8] rounded-full w-14 h-14"
                style={{
                  color: statCard.color,
                  backgroundColor: `${statCard.color}23`,
                }}
              >
                <statCard.icon className="w-8 h-8" />
              </Avatar>

              <div>
                <h1
                  className="font-bold text-2xl"
                  style={{
                    color: statCard.color,
                  }}
                >
                  12
                  {/* {needs.length} */}
                </h1>
                <h2 className="" style={{ color: statCard.color }}>
                  {statCard.title}
                </h2>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

       {/* Filters and Search */}
      <div className="grid grid-cols-4 gap-6 border-b pb-4">
        <Input
          placeholder="Search products, descriptions, or suppliers..."
          className="col-span-2"
          //   value={searchTerm}
          //   onChange={(e) => setSearchTerm(e.target.value)}
        />

        
          <Select defaultValue="all">
            <SelectTrigger className="col-span-1 w-full">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="needed">Needed</SelectItem>
                <SelectItem value="ordered">Ordered</SelectItem>
                <SelectItem value="received">Received</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select defaultValue="all">
            <SelectTrigger className="col-span-1 w-full">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    <div className="flex items-center gap-2">
                      {/* {category.icon} */}
                      {category.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
        {filteredNeeds.map((need) => {
          //   const categoryInfo = getCategoryInfo(need.category);
          return <NeedCard need={need} />;
        })}
      </div>
    </div>
  );
};

export default page;
