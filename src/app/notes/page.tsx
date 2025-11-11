import NoteCard from "@/components/needsAndNotes/NoteCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  CheckCircle,
  CircleCheck,
  MoreVertical,
  Notebook,
  Plus,
  RefreshCcw,
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

  const filteredNotes = [
    {
      id: 1,
      category: "HR",
      name: "Note 1",
      description: "This is the description for Note 1.",
      priority: "High",
      status: "Pending",
      quantity: 5,
      unit: "pcs",
      estimatedCost: 100,
      supplier: "Supplier A",
      dueDate: "2024-09-15",
      writer: {
        fullName: "John Doe",
        email: "John.doe@gmail.com",
        avatar: "",
      },
    },
    {
      id: 2,
      category: "Development",
      name: "Note 2",
      description: "This is the description for Note 2.",
      priority: "Medium",
      status: "Done",
      quantity: 3,
      unit: "pcs",
      estimatedCost: 60,
      supplier: "Supplier B",
      dueDate: "2024-09-20",
      writer: {
        fullName: "Jane Smith",
        email: "Jane.smith@gmail.com",
        avatar: "",
      },
    },
    {
       id: 3,
      category: "Development",
      name: "Note 2",
      description: "This is the description for Note 2.",
      priority: "Medium",
      status: "Done",
      quantity: 3,
      unit: "pcs",
      estimatedCost: 60,
      supplier: "Supplier B",
      dueDate: "2024-09-20",
      writer: {
        fullName: "Jane Smith",
        email: "Jane.smith@gmail.com",
        avatar: "",
      },

    },
     {
       id: 4,
      category: "Development",
      name: "Note 2",
      description: "This is the description for Note 2.",
      priority: "Medium",
      status: "Done",
      quantity: 3,
      unit: "pcs",
      estimatedCost: 60,
      supplier: "Supplier B",
      dueDate: "2024-09-20",
      writer: {
        fullName: "Jane Smith",
        email: "Jane.smith@gmail.com",
        avatar: "",
      },

    },
     {
       id: 5,
      category: "Development",
      name: "Note 2",
      description: "This is the description for Note 2.",
      priority: "Low",
      status: "Done",
      quantity: 3,
      unit: "pcs",
      estimatedCost: 60,
      supplier: "Supplier B",
      dueDate: "2024-09-20",
      writer: {
        fullName: "Jane Smith",
        email: "Jane.smith@gmail.com",
        avatar: "",
      },

    }
  ];

  const statsNotesCards = [
    {
      id: 1,
      value: 12,
      title: "Total Notes",
      icon: Notebook,
      color: "#f57c00",
    },
    {
      id: 2,
      value: 3,
      title: "High Priority",
      icon: CalendarDays,
      color: "#d32f2f",
    },
    {
      id: 3,
      value: 2,
      title: "Completed",
      icon: CircleCheck,
      color: "#2e7d32",
    },
    {
      id: 4,
      value: 5,
      title: "Pending",
      icon: RefreshCcw,
      color: "#1976d2",
    },
  ];
  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="scroll-m-20 border-b pb-2 flex w-full justify-between items-center">
        <div className="leftHeaderPart">
          <h1 className="text-3xl font-semibold tracking-tight first:mt-0">
            Employee Notes
          </h1>
          <h2>Manage and track notes from team members</h2>
        </div>
        <div className="rightHeaderPart">
          <Button>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search notes, employees, or categories..."
          className="w-1/2"
          //   value={searchTerm}
          //   onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="flex gap-6">
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="flex items-center w-full gap-6 justify-between mt-4">
        {statsNotesCards.map((statCard) => (
          <Card
          className="w-1/4"
          // sx={{
          //   bgcolor: "white",
          //   borderRadius: 3,
          //   divShadow: "0 2px 8px rgba(0,0,0,0.1)",
          // }}
          >
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

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {filteredNotes.map((note) => {
          //   const categoryInfo = getCategoryInfo(note.category);
          return (
            <NoteCard note={note} key={note.id}/>
          );
        })}
      </div>
    </div>
  );
};

export default page;
