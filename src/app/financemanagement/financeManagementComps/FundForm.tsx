"use client";
import React, { useState } from "react";
import { Input } from "../../../components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../../../components/ui/popover";
import { Button } from "../../../components/ui/button";
import { ChevronDownIcon } from "lucide-react";
import { Calendar } from "../../../components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FundForm = () => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
    const categoryOptions = [
    { value: "equipment", label: "Equipment", icon: "Settings" },
    { value: "emergency", label: "Emergency Fund", icon: "Shield" },
    { value: "renovation", label: "Renovation", icon: "Home" },
    { value: "training", label: "Training", icon: "GraduationCap" },
    { value: "marketing", label: "Marketing", icon: "Megaphone" },
    { value: "expansion", label: "Expansion", icon: "Building" },
  ];
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg p-6 w-full max-w-md mx-4 spa-shadow-elevated">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-card-foreground">
            Add New Savings Goal
          </h3>
          <button
            // onClick={() => setShowAddGoal(false)}
            className="p-2 hover:bg-muted rounded-lg spa-transition"
          >
            X
            {/* <Icon name="X" size={20} className="text-muted-foreground" /> */}
          </button>
        </div>

        <form
          // onSubmit={handleAddGoal}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Goal Title
            </label>
            <Input type="text" placeholder="Enter goal title" required />
            {/* <input
              type="text"
              //   value={newGoal?.title}
              //   onChange={(e) =>
              //     setNewGoal({ ...newGoal, title: e?.target?.value })
              //   }
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Enter goal title"
              required
            /> */}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Target Amount
            </label>
            <Input type="number" placeholder="Enter target amount" required />
            {/* <input
              type="number"
              //   value={newGoal?.targetAmount}
              //   onChange={(e) =>
              //     setNewGoal({ ...newGoal, targetAmount: e?.target?.value })
              //   }
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Enter target amount"
              required
            /> */}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Deadline
            </label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="date"
                  className="w-full justify-between font-normal"
                >
                  {date ? date.toLocaleDateString() : "Select date"}
                  <ChevronDownIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="start"
              >
                <Calendar
                  required
                  mode="single"
                  selected={date}
                  captionLayout="dropdown"
                  onSelect={(date) => {
                    setDate(date);
                    setOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
            
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Category
            </label>
            <Select >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {categoryOptions?.map((option) => (
                    <SelectItem key={option?.value} value={option?.value}>
                      {option?.label}
                    </SelectItem>
                  ))}
                 
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
            //   type="Button"
              //   onClick={() => setShowAddGoal(false)}
              className="text-black flex-1 px-4 py-2 border border-border rounded-lg  hover:bg-muted spa-transition"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 spa-transition"
            >
              Add Goal
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FundForm;
