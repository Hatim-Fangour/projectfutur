import React from "react";
import { Button } from "@/components/ui/button";
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
    <div className="grid grid-cols-4 gap-6 border-b pb-4">
      {/* Search */}
      <Input
        type="search"
        placeholder="Search staff by name, email, or phone..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e?.target?.value)}
        className="col-span-2"
      />
      <div className="grid grid-cols-3 col-span-2 gap-6">
        {/* Role Filter */}
        <Select>
          <SelectTrigger className="w-full">
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

        {/* Department Filter */}
        <Select>
          <SelectTrigger className="w-full">
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

        {/* Status Filter */}
        <Select>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {statusOptions.map((statusOption) => (
                <SelectItem key={statusOption.value} value={statusOption.value}>
                  {statusOption.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-col lg:flex-row lg:items-end gap-4">
          {/* Clear Filters */}(
          <Button
            variant="outline"
            // iconName="X"
            // iconPosition="left"
            onClick={onClearFilters}
          >
            Clear
          </Button>
          )
        </div>
      )}
    </div>
  );
};

export default StaffFilters;
