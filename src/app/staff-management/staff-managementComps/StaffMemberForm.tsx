"use client"
import React, { useState } from 'react'
import { Button } from '../../../components/ui/button';
import { Checkbox } from '../../../components/ui/checkbox';
import { Select } from '../../../components/ui/select';
import { Input } from '../../../components/ui/input';

const StaffMemberForm = ({ isOpen, onClose, onSave }:any) => {
     const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    accessLevel: '',
    hireDate: '',
    specializations: [],
    permissions: {
      viewReservations: false,
      manageReservations: false,
      viewCustomers: false,
      manageCustomers: false,
      viewServices: false,
      manageServices: false,
      viewReports: false,
      manageStaff: false,
      systemSettings: false
    }
  });

  const [errors, setErrors] = useState({});

  const roleOptions = [
    { value: 'Manager', label: 'Manager' },
    { value: 'Senior Therapist', label: 'Senior Therapist' },
    { value: 'Therapist', label: 'Therapist' },
    { value: 'Front Desk', label: 'Front Desk' },
    { value: 'Administrative', label: 'Administrative' }
  ];

  const departmentOptions = [
    { value: 'Management', label: 'Management' },
    { value: 'Massage Therapy', label: 'Massage Therapy' },
    { value: 'Facial Treatments', label: 'Facial Treatments' },
    { value: 'Body Treatments', label: 'Body Treatments' },
    { value: 'Reception', label: 'Reception' },
    { value: 'Administration', label: 'Administration' }
  ];

  const accessLevelOptions = [
    { value: 'Full Access', label: 'Full Access' },
    { value: 'Manager Access', label: 'Manager Access' },
    { value: 'Staff Access', label: 'Staff Access' },
    { value: 'Limited Access', label: 'Limited Access' }
  ];

  const specializationOptions = [
    'Swedish Massage', 'Deep Tissue', 'Hot Stone', 'Aromatherapy', 
    'Facial Treatments', 'Body Wraps', 'Reflexology', 'Prenatal Massage'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handlePermissionChange = (permission, checked) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev?.permissions,
        [permission]: checked
      }
    }));
  };

  const handleSpecializationToggle = (specialization) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev?.specializations?.includes(specialization)
        ? prev?.specializations?.filter(s => s !== specialization)
        : [...prev?.specializations, specialization]
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData?.name?.trim()) newErrors.name = 'Name is required';
    if (!formData?.email?.trim()) newErrors.email = 'Email is required';
    if (!formData?.phone?.trim()) newErrors.phone = 'Phone is required';
    if (!formData?.role) newErrors.role = 'Role is required';
    if (!formData?.department) newErrors.department = 'Department is required';
    if (!formData?.accessLevel) newErrors.accessLevel = 'Access level is required';
    if (!formData?.hireDate) newErrors.hireDate = 'Hire date is required';

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (validateForm()) {
      onSave(formData);
      onClose();
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: '',
        department: '',
        accessLevel: '',
        hireDate: '',
        specializations: [],
        permissions: {
          viewReservations: false,
          manageReservations: false,
          viewCustomers: false,
          manageCustomers: false,
          viewServices: false,
          manageServices: false,
          viewReports: false,
          manageStaff: false,
          systemSettings: false
        }
      });
    }
  };

  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg spa-shadow-elevated w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-card-foreground">Add New Staff Member</h2>
          <Button
            variant="ghost"
            size="icon"
            // iconName="X"
            onClick={onClose}
          />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-card-foreground mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                // label="Full Name"
                type="text"
                required
                value={formData?.name}
                onChange={(e) => handleInputChange('name', e?.target?.value)}
                // error={errors?.name}
              />
              <Input
                // label="Email Address"
                type="email"
                required
                value={formData?.email}
                onChange={(e) => handleInputChange('email', e?.target?.value)}
                // error={errors?.email}
              />
              <Input
                // label="Phone Number"
                type="tel"
                required
                value={formData?.phone}
                onChange={(e) => handleInputChange('phone', e?.target?.value)}
                // error={errors?.phone}
              />
              <Input
                // label="Hire Date"
                type="date"
                required
                value={formData?.hireDate}
                onChange={(e) => handleInputChange('hireDate', e?.target?.value)}
                // error={errors?.hireDate}
              />
            </div>
          </div>

          {/* Role & Department */}
          <div>
            <h3 className="text-lg font-medium text-card-foreground mb-4">Role & Department</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* <Select
                label="Role"
                required
                options={roleOptions}
                value={formData?.role}
                onChange={(value) => handleInputChange('role', value)}
                error={errors?.role}
              />
              <Select
                label="Department"
                required
                options={departmentOptions}
                value={formData?.department}
                onChange={(value) => handleInputChange('department', value)}
                error={errors?.department}
              />
              <Select
                // label="Access Level"
                required
                // options={accessLevelOptions}
                value={formData?.accessLevel}
                // onChange={(value) => handleInputChange('accessLevel', value)}
                error={errors?.accessLevel}
              /> */}
            </div>
          </div>

          {/* Specializations */}
          <div>
            <h3 className="text-lg font-medium text-card-foreground mb-4">Specializations</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {specializationOptions?.map((spec) => (
                <Checkbox
                  key={spec}
                //   label={spec}
                  checked={formData?.specializations?.includes(spec)}
                  onChange={(e) => handleSpecializationToggle(spec)}
                />
              ))}
            </div>
          </div>

          {/* Permissions */}
          <div>
            <h3 className="text-lg font-medium text-card-foreground mb-4">Permissions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-muted-foreground">Reservations</h4>
                <Checkbox
                //   label="View Reservations"
                  checked={formData?.permissions?.viewReservations}
                  onChange={(e) => handlePermissionChange('viewReservations', e?.target?.checked)}
                />
                <Checkbox
                //   label="Manage Reservations"
                  checked={formData?.permissions?.manageReservations}
                  onChange={(e) => handlePermissionChange('manageReservations', e?.target?.checked)}
                />
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-muted-foreground">Customers</h4>
                <Checkbox
                //   label="View Customers"
                  checked={formData?.permissions?.viewCustomers}
                  onChange={(e) => handlePermissionChange('viewCustomers', e?.target?.checked)}
                />
                <Checkbox
                //   label="Manage Customers"
                  checked={formData?.permissions?.manageCustomers}
                  onChange={(e) => handlePermissionChange('manageCustomers', e?.target?.checked)}
                />
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-muted-foreground">Services</h4>
                <Checkbox
                //   label="View Services"
                  checked={formData?.permissions?.viewServices}
                  onChange={(e) => handlePermissionChange('viewServices', e?.target?.checked)}
                />
                <Checkbox
                //   label="Manage Services"
                  checked={formData?.permissions?.manageServices}
                  onChange={(e) => handlePermissionChange('manageServices', e?.target?.checked)}
                />
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-muted-foreground">System</h4>
                <Checkbox
                //   label="View Reports"
                  checked={formData?.permissions?.viewReports}
                  onChange={(e) => handlePermissionChange('viewReports', e?.target?.checked)}
                />
                <Checkbox
                //   label="Manage Staff"
                  checked={formData?.permissions?.manageStaff}
                  onChange={(e) => handlePermissionChange('manageStaff', e?.target?.checked)}
                />
                <Checkbox
                //   label="System Settings"
                  checked={formData?.permissions?.systemSettings}
                  onChange={(e) => handlePermissionChange('systemSettings', e?.target?.checked)}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
            //   iconName="Plus"
            //   iconPosition="left"
            >
              Add Staff Member
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default StaffMemberForm