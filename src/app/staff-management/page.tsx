"use client";
import StaffCard from "@/app/staff-management/staff-managementComps/StaffCard";
import StaffFilters from "@/app/staff-management/staff-managementComps/StaffFilters";
import StaffTable from "@/app/staff-management/staff-managementComps/StaffTable";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Grid,
  List,
  Plus,
  ShoppingCart,
  Sigma,
  Siren,
  Users,
} from "lucide-react";
import React, { useMemo, useState } from "react";

const page = () => {
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'cards'
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  // Mock staff data
  const [staffMembers, setStaffMembers] = useState([
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.johnson@spamanager.com",
      phone: "(555) 123-4567",
      role: "Manager",
      department: "Management",
      status: "Active",
      accessLevel: "Full Access",
      hireDate: "01/15/2023",
      avatar: "https://images.unsplash.com/photo-1734991032476-bceab8383a59",
      avatarAlt:
        "Professional headshot of woman with shoulder-length brown hair in business attire",
      specializations: ["Management", "Customer Relations", "Staff Training"],
      metrics: {
        completedServices: 0,
        rating: "N/A",
        hoursWorked: 160,
      },
      permissions: {
        viewReservations: true,
        manageReservations: true,
        viewCustomers: true,
        manageCustomers: true,
        viewServices: true,
        manageServices: true,
        viewReports: true,
        manageStaff: true,
        systemSettings: true,
      },
    },
    {
      id: 2,
      name: "Emily Chen",
      email: "emily.chen@spamanager.com",
      phone: "(555) 234-5678",
      role: "Senior Therapist",
      department: "Massage Therapy",
      status: "Active",
      accessLevel: "Manager Access",
      hireDate: "03/22/2022",
      avatar: "https://images.unsplash.com/photo-1668049221564-862149a48e10",
      avatarAlt:
        "Professional headshot of Asian woman with long black hair smiling at camera",
      specializations: [
        "Swedish Massage",
        "Deep Tissue",
        "Hot Stone",
        "Aromatherapy",
      ],
      metrics: {
        completedServices: 342,
        rating: "4.9",
        hoursWorked: 152,
      },
      permissions: {
        viewReservations: true,
        manageReservations: true,
        viewCustomers: true,
        manageCustomers: false,
        viewServices: true,
        manageServices: false,
        viewReports: false,
        manageStaff: false,
        systemSettings: false,
      },
    },
    {
      id: 3,
      name: "Michael Rodriguez",
      email: "michael.rodriguez@spamanager.com",
      phone: "(555) 345-6789",
      role: "Therapist",
      department: "Massage Therapy",
      status: "Active",
      accessLevel: "Staff Access",
      hireDate: "06/10/2023",
      avatar: "https://images.unsplash.com/photo-1663720527180-4c60a78fe3b7",
      avatarAlt:
        "Professional headshot of Hispanic man with short dark hair in casual shirt",
      specializations: ["Swedish Massage", "Deep Tissue", "Reflexology"],
      metrics: {
        completedServices: 189,
        rating: "4.7",
        hoursWorked: 144,
      },
      permissions: {
        viewReservations: true,
        manageReservations: false,
        viewCustomers: true,
        manageCustomers: false,
        viewServices: true,
        manageServices: false,
        viewReports: false,
        manageStaff: false,
        systemSettings: false,
      },
    },
    {
      id: 4,
      name: "Jessica Williams",
      email: "jessica.williams@spamanager.com",
      phone: "(555) 456-7890",
      role: "Senior Therapist",
      department: "Facial Treatments",
      status: "Active",
      accessLevel: "Manager Access",
      hireDate: "09/05/2021",
      avatar: "https://images.unsplash.com/photo-1624484631620-9e53e4aed980",
      avatarAlt:
        "Professional headshot of blonde woman with wavy hair in white top",
      specializations: [
        "Facial Treatments",
        "Anti-Aging",
        "Acne Treatment",
        "Microdermabrasion",
      ],
      metrics: {
        completedServices: 428,
        rating: "4.8",
        hoursWorked: 148,
      },
      permissions: {
        viewReservations: true,
        manageReservations: true,
        viewCustomers: true,
        manageCustomers: false,
        viewServices: true,
        manageServices: false,
        viewReports: false,
        manageStaff: false,
        systemSettings: false,
      },
    },
    {
      id: 5,
      name: "David Thompson",
      email: "david.thompson@spamanager.com",
      phone: "(555) 567-8901",
      role: "Front Desk",
      department: "Reception",
      status: "Active",
      accessLevel: "Staff Access",
      hireDate: "11/18/2023",
      avatar: "https://images.unsplash.com/photo-1641479160067-5ae7bde244b0",
      avatarAlt:
        "Professional headshot of young man with brown hair in button-up shirt",
      specializations: [
        "Customer Service",
        "Booking Management",
        "Payment Processing",
      ],
      metrics: {
        completedServices: 0,
        rating: "4.6",
        hoursWorked: 136,
      },
      permissions: {
        viewReservations: true,
        manageReservations: true,
        viewCustomers: true,
        manageCustomers: true,
        viewServices: true,
        manageServices: false,
        viewReports: false,
        manageStaff: false,
        systemSettings: false,
      },
    },
    {
      id: 6,
      name: "Amanda Garcia",
      email: "amanda.garcia@spamanager.com",
      phone: "(555) 678-9012",
      role: "Therapist",
      department: "Body Treatments",
      status: "On Leave",
      accessLevel: "Staff Access",
      hireDate: "04/12/2022",
      avatar: "https://images.unsplash.com/photo-1665023024202-4c8671802bf6",
      avatarAlt:
        "Professional headshot of Latina woman with curly hair in professional attire",
      specializations: ["Body Wraps", "Exfoliation", "Cellulite Treatment"],
      metrics: {
        completedServices: 267,
        rating: "4.5",
        hoursWorked: 0,
      },
      permissions: {
        viewReservations: true,
        manageReservations: false,
        viewCustomers: true,
        manageCustomers: false,
        viewServices: true,
        manageServices: false,
        viewReports: false,
        manageStaff: false,
        systemSettings: false,
      },
    },
  ]);

  // Filter and sort staff
  const filteredAndSortedStaff = useMemo(() => {
    let filtered = staffMembers?.filter((staff) => {
      const matchesSearch =
        staff?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
        staff?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
        staff?.phone?.includes(searchTerm);
      const matchesRole = !selectedRole || staff?.role === selectedRole;
      const matchesDepartment =
        !selectedDepartment || staff?.department === selectedDepartment;
      const matchesStatus = !selectedStatus || staff?.status === selectedStatus;

      return matchesSearch && matchesRole && matchesDepartment && matchesStatus;
    });

    // Sort
    filtered?.sort((a, b) => {
      let aValue = a?.[sortField];
      let bValue = b?.[sortField];

      if (typeof aValue === "string") {
        aValue = aValue?.toLowerCase();
        bValue = bValue?.toLowerCase();
      }

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [
    staffMembers,
    searchTerm,
    selectedRole,
    selectedDepartment,
    selectedStatus,
    sortField,
    sortDirection,
  ]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedRole("");
    setSelectedDepartment("");
    setSelectedStatus("");
  };

  const handleAddStaff = (newStaff) => {
    const staff = {
      ...newStaff,
      id: staffMembers?.length + 1,
      avatar: "https://images.unsplash.com/photo-1663720527180-4c60a78fe3b7",
      avatarAlt: "Professional headshot placeholder for new staff member",
      status: "Active",
      metrics: {
        completedServices: 0,
        rating: "N/A",
        hoursWorked: 0,
      },
    };
    setStaffMembers((prev) => [...prev, staff]);
  };

  const handleEditStaff = (staff) => {
    setSelectedStaff(staff);
    // In a real app, this would open an edit modal
    console.log("Edit staff:", staff);
  };

  const handleViewSchedule = (staff) => {
    setSelectedStaff(staff);
    setIsScheduleModalOpen(true);
  };

  const handleManagePermissions = (staff) => {
    setSelectedStaff(staff);
    setIsPermissionsModalOpen(true);
  };

  const handleSavePermissions = (staffId, permissions) => {
    setStaffMembers((prev) =>
      prev?.map((staff) =>
        staff?.id === staffId ? { ...staff, permissions } : staff
      )
    );
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = staffMembers?.length;
    const active = staffMembers?.filter((s) => s?.status === "Active")?.length;
    const onLeave = staffMembers?.filter(
      (s) => s?.status === "On Leave"
    )?.length;
    const avgRating =
      staffMembers
        ?.filter((s) => s?.metrics?.rating !== "N/A")
        ?.reduce((acc, s) => acc + parseFloat(s?.metrics?.rating), 0) /
      staffMembers?.filter((s) => s?.metrics?.rating !== "N/A")?.length;

    return { total, active, onLeave, avgRating: avgRating?.toFixed(1) };
  }, [staffMembers]);

  const statsStaffCards = [
    {
      id: 1,
      value: 6,
      title: "Total Staff",
      icon: Users,
      color: "#f57c00",
    },
    {
      id: 2,
      value: 5,
      title: "Active Staff",
      icon: Siren,
      color: "#d32f2f",
    },
    {
      id: 3,
      value: 1,
      title: "On Leave",
      icon: ShoppingCart,
      color: "#2e7d32",
    },
    {
      id: 4,
      value: 4.7,
      title: "Avg Rating",
      icon: Sigma,
      color: "#1976d2",
    },
  ];
  return (
    <div className=" pb-6">
      <div className="flex flex-col gap-4">
        {/* Page Header */}
        <div className="scroll-m-20 border-b pb-2 flex w-full justify-between items-center">
          <div className="leftHeaderPart">
            <h1 className="text-3xl font-semibold tracking-tight first:mt-0">
              Staff Management
            </h1>
            <h2>Manage staff members, roles, permissions, and schedules</h2>
          </div>
          <div className="rightHeaderPart">
            <div className="mt-4 lg:mt-0 flex items-center space-x-4">
              <Button
                variant="outline"
                //   iconName="Download"
                // iconPosition="left"
              >
                Export Staff
              </Button>
              <Button
                //   iconName="UserPlus"
                // iconPosition="left"
                onClick={() => setIsAddModalOpen(true)}
              >
                Add Staff Member
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="flex items-center w-full gap-6 justify-between mt-4">
          {statsStaffCards.map((statCard) => (
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
                    {statCard.value}
                  </h1>
                  <h2 className="" style={{ color: statCard.color }}>
                    {statCard.title}
                  </h2>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {false && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-card border border-border rounded-lg p-6 spa-shadow-soft">
              <div className="flex items-center">
                <div className="p-2 bg-primary bg-opacity-10 rounded-lg">
                  {/* <Icon name="Users" size={24} className="text-primary" /> */}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Staff
                  </p>
                  <p className="text-2xl font-bold text-card-foreground">
                    {stats?.total}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 spa-shadow-soft">
              <div className="flex items-center">
                <div className="p-2 bg-success bg-opacity-10 rounded-lg">
                  {/* <Icon name="UserCheck" size={24} className="text-success" /> */}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Active Staff
                  </p>
                  <p className="text-2xl font-bold text-card-foreground">
                    {stats?.active}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 spa-shadow-soft">
              <div className="flex items-center">
                <div className="p-2 bg-warning bg-opacity-10 rounded-lg">
                  {/* <Icon name="UserX" size={24} className="text-warning" /> */}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    On Leave
                  </p>
                  <p className="text-2xl font-bold text-card-foreground">
                    {stats?.onLeave}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 spa-shadow-soft">
              <div className="flex items-center">
                <div className="p-2 bg-accent bg-opacity-10 rounded-lg">
                  {/* <Icon name="Star" size={24} className="text-accent" /> */}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Avg Rating
                  </p>
                  <p className="text-2xl font-bold text-card-foreground">
                    {stats?.avgRating}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
          <StaffFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedRole={selectedRole}
            onRoleChange={setSelectedRole}
            selectedDepartment={selectedDepartment}
            onDepartmentChange={setSelectedDepartment}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            onClearFilters={handleClearFilters}
          />

        {/* View Toggle and Results */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              Showing {filteredAndSortedStaff?.length} of {staffMembers?.length}{" "}
              staff members
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === "table" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("table")}
            >
              <List />
            </Button>

            <Button
              variant={viewMode === "cards" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("cards")}
            >
              <Grid />
            </Button>
          </div>
        </div>

        {/* Staff List */}
        {viewMode === "table" ? (
          <StaffTable
            staff={filteredAndSortedStaff}
            onEdit={handleEditStaff}
            onViewSchedule={handleViewSchedule}
            onManagePermissions={handleManagePermissions}
            onSort={handleSort}
            sortField={sortField}
            sortDirection={sortDirection}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedStaff?.map((staff) => (
              
              <StaffCard
                key={staff?.id}
                staff={staff}
                onEdit={handleEditStaff}
                onViewSchedule={handleViewSchedule}
                onManagePermissions={handleManagePermissions}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredAndSortedStaff?.length === 0 && (
          <div className="text-center py-12">
            {/* <Icon
                name="Users"
                size={48}
                className="text-muted-foreground mx-auto mb-4"
              /> */}
            <h3 className="text-lg font-medium text-foreground mb-2">
              No staff members found
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ||
              selectedRole ||
              selectedDepartment ||
              selectedStatus
                ? "Try adjusting your filters to see more results."
                : "Get started by adding your first staff member."}
            </p>
            {!searchTerm &&
              !selectedRole &&
              !selectedDepartment &&
              !selectedStatus && (
                <Button
                  // iconName="UserPlus"
                  // iconPosition="left"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  Add Staff Member
                </Button>
              )}
          </div>
        )}
      </div>

      {/* Modals */}
      {/* <AddStaffModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddStaff} /> */}

      {/* <PermissionsModal
        isOpen={isPermissionsModalOpen}
        onClose={() => setIsPermissionsModalOpen(false)}
        staff={selectedStaff}
        onSave={handleSavePermissions} /> */}

      {/* <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        staff={selectedStaff} /> */}

      {/* <QuickActionButton /> */}
    </div>
  );
};

export default page;
