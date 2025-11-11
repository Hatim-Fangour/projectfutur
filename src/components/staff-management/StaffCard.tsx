import React from 'react'
import { Button } from '../ui/button';

const StaffCard = ({ staff, onEdit, onViewSchedule, onManagePermissions }:any) => {
     const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-success text-success-foreground';
      case 'On Leave':
        return 'bg-warning text-warning-foreground';
      case 'Inactive':
        return 'bg-error text-error-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Manager':
        return 'bg-primary text-primary-foreground';
      case 'Senior Therapist':
        return 'bg-accent text-accent-foreground';
      case 'Therapist':
        return 'bg-secondary text-secondary-foreground';
      case 'Front Desk':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-card text-card-foreground';
    }
  };
  return (
      <div className="bg-card border border-border rounded-lg p-6 spa-shadow-soft hover:spa-shadow-elevated spa-transition">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            {/* <Image
              src={staff?.avatar}
              alt={staff?.avatarAlt}
              className="w-16 h-16 rounded-full object-cover"
            /> */}
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-card ${
              staff?.status === 'Active' ? 'bg-success' : 
              staff?.status === 'On Leave' ? 'bg-warning' : 'bg-error'
            }`}></div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-card-foreground">{staff?.name}</h3>
            <p className="text-sm text-muted-foreground">{staff?.email}</p>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(staff?.role)}`}>
                {staff?.role}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(staff?.status)}`}>
                {staff?.status}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            // iconName="Edit"
            onClick={() => onEdit(staff)}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="icon"
            // iconName="MoreVertical"
          />
        </div>
      </div>
      {/* Details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Department:</span>
          <span className="text-sm font-medium text-card-foreground">{staff?.department}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Phone:</span>
          <span className="text-sm font-medium text-card-foreground">{staff?.phone}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Hire Date:</span>
          <span className="text-sm font-medium text-card-foreground">{staff?.hireDate}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Access Level:</span>
          <span className="text-sm font-medium text-card-foreground">{staff?.accessLevel}</span>
        </div>
      </div>
      {/* Specializations */}
      {staff?.specializations && staff?.specializations?.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">Specializations:</p>
          <div className="flex flex-wrap gap-1">
            {staff?.specializations?.map((spec:any, index:any) => (
              <span
                key={index}
                className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md"
              >
                {spec}
              </span>
            ))}
          </div>
        </div>
      )}
      {/* Performance Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-muted rounded-lg">
        <div className="text-center">
          <div className="text-lg font-semibold text-card-foreground">{staff?.metrics?.completedServices}</div>
          <div className="text-xs text-muted-foreground">Services</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-card-foreground">{staff?.metrics?.rating}</div>
          <div className="text-xs text-muted-foreground">Rating</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-card-foreground">{staff?.metrics?.hoursWorked}</div>
          <div className="text-xs text-muted-foreground">Hours</div>
        </div>
      </div>
      {/* Actions */}
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
        //   iconName="Calendar"
        //   iconPosition="left"
          onClick={() => onViewSchedule(staff)}
          className="flex-1"
        >
          Schedule
        </Button>
        <Button
          variant="outline"
          size="sm"
        //   iconName="Shield"
        //   iconPosition="left"
          onClick={() => onManagePermissions(staff)}
          className="flex-1"
        >
          Permissions
        </Button>
      </div>
    </div>
  )
}

export default StaffCard