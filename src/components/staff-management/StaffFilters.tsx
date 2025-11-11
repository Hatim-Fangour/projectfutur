import React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const StaffFilters = ({
  searchTerm,
  onSearchChange,
  selectedRole,
  onRoleChange,
  selectedDepartment,
  onDepartmentChange,
  selectedStatus,
  onStatusChange,
  onClearFilters,
}: any) => {
  const roleOptions = [
    { value: "all", label: "All Roles" },
    { value: "Manager", label: "Manager" },
    { value: "Senior Therapist", label: "Senior Therapist" },
    { value: "Therapist", label: "Therapist" },
    { value: "Front Desk", label: "Front Desk" },
    { value: "Administrative", label: "Administrative" },
  ];

  const departmentOptions = [
    { value: "all", label: "All Departments" },
    { value: "Management", label: "Management" },
    { value: "Massage Therapy", label: "Massage Therapy" },
    { value: "Facial Treatments", label: "Facial Treatments" },
    { value: "Body Treatments", label: "Body Treatments" },
    { value: "Reception", label: "Reception" },
    { value: "Administration", label: "Administration" },
  ];

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "Active", label: "Active" },
    { value: "On Leave", label: "On Leave" },
    { value: "Inactive", label: "Inactive" },
  ];

  const hasActiveFilters =
    searchTerm || selectedRole || selectedDepartment || selectedStatus;

  return (
    <div className="bg-card border border-border rounded-lg p-6 spa-shadow-soft">
      <div className="flex flex-col lg:flex-row lg:items-end gap-4">
        {/* Search */}
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Search staff by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e?.target?.value)}
            className="w-full"
          />
        </div>

        {/* Role Filter */}
        <div className="w-full lg:w-48">
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {roleOptions.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Department Filter */}
        <div className="w-full lg:w-48">
         
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by departements" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {departmentOptions.map((departmentOption, index) => (
                  <SelectItem key={index} value={departmentOption.value}>
                    {departmentOption.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="w-full lg:w-40">
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {statusOptions.map((statusOption) => (
                  <SelectItem
                    key={statusOption.value}
                    value={statusOption.value}
                  >
                    {statusOption.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            // iconName="X"
            // iconPosition="left"
            onClick={onClearFilters}
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  );
};

export default StaffFilters;
