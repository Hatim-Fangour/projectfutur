import { Edit, MoreHorizontal, Shield, View } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";

const StaffTable = ({
  staff,
  onEdit,
  onViewSchedule,
  onManagePermissions,
  onSort,
  sortField,
  sortDirection,
}: any) => {
  const getStatusColor = (status: any) => {
    switch (status) {
      case "Active":
        return "bg-success text-success-foreground";
      case "On Leave":
        return "bg-warning text-warning-foreground";
      case "Inactive":
        return "bg-error text-error-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getRoleColor = (role: any) => {
    switch (role) {
      case "Manager":
        return "bg-primary text-primary-foreground";
      case "Senior Therapist":
        return "bg-accent text-accent-foreground";
      case "Therapist":
        return "bg-secondary text-secondary-foreground";
      case "Front Desk":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-card text-card-foreground";
    }
  };

  const SortableHeader = ({ field, children }: any) => (
    <th
      className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted spa-transition"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortField === field && (
          <MoreHorizontal />
          //   <Icon
          //     name={sortDirection === 'asc' ? 'ChevronUp' : 'ChevronDown'}
          //     size={14}
          //   />
        )}
      </div>
    </th>
  );
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden spa-shadow-soft">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted">
            <tr>
              <SortableHeader field="name">Staff Member</SortableHeader>
              <SortableHeader field="role">Role & Department</SortableHeader>
              <SortableHeader field="status">Status</SortableHeader>
              <SortableHeader field="accessLevel">Access Level</SortableHeader>
              <SortableHeader field="hireDate">Hire Date</SortableHeader>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Performance
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {staff?.map((member: any) => (
              <tr key={member?.id} className="hover:bg-muted spa-transition">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="relative">
                      {/* <Image
                        src={member?.avatar}
                        alt={member?.avatarAlt}
                        className="w-10 h-10 rounded-full object-cover"
                      /> */}
                      <div
                        className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-card ${
                          member?.status === "Active"
                            ? "bg-success"
                            : member?.status === "On Leave"
                            ? "bg-warning"
                            : "bg-error"
                        }`}
                      ></div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-card-foreground">
                        {member?.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {member?.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(
                        member?.role
                      )}`}
                    >
                      {member?.role}
                    </span>
                    <div className="text-sm text-muted-foreground">
                      {member?.department}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      member?.status
                    )}`}
                  >
                    {member?.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground">
                  {member?.accessLevel}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground">
                  {member?.hireDate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-sm font-medium text-card-foreground">
                        {member?.metrics?.rating}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Rating
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-card-foreground">
                        {member?.metrics?.completedServices}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Services
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      //   iconName="Calendar"
                      onClick={() => onViewSchedule(member)}
                    >
                      <View />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      //   iconName="Shield"
                      onClick={() => onManagePermissions(member)}
                    >
                      <Shield />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      //   iconName="Edit"
                      onClick={() => onEdit(member)}
                    >
                      <Edit />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffTable;
