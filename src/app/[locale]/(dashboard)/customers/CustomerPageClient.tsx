// @ts-nocheck
"use client";

import AboutTabContent from "@/app/[locale]/(dashboard)/customers/customersComps/AboutTabContent";
import AppointmentTabContent from "@/app/[locale]/(dashboard)/customers/customersComps/AppointmentTabContent";
import CustomerForm from "@/app/[locale]/(dashboard)/customers/customersComps/CustomerForm";
import NoteTabContent from "@/app/[locale]/(dashboard)/customers/customersComps/NoteTabContent";
import PaymentTabContent from "@/app/[locale]/(dashboard)/customers/customersComps/PaymentTabContent";
import ProgressTabContent from "@/app/[locale]/(dashboard)/customers/customersComps/ProgressTabContent";
import ServiceTabContent from "@/app/[locale]/(dashboard)/customers/customersComps/ServiceTabContent";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import {
  Customer,
  CustomerAppointmentType,
} from "@/app/[locale]/(dashboard)/customers/types/customers";
import BookAppointment from "@/app/[locale]/(dashboard)/customers/customersComps/BookAppointment";
import { customerApi } from "@/lib/api-client";
import { toast } from "sonner";

const CustomerPageClient = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );

  // Fetch customers from API on mount
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/customers?limit=50');
        const result = await response.json();
        if (result.success && result.data) {
          setCustomers(result.data);
          if (result.data.length > 0) {
            setSelectedCustomer(result.data[0]);
          }
        }
      } catch (error) {
        toast.error('Failed to load customers');
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);
  // ✅ State for editing customer
  const [updateMode, setUpdateMode] = useState<boolean>(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>(
    undefined
  );

  const [appointments, setAppointments] = useState<CustomerAppointmentType[]>([
    {
      id: "1",
      start: new Date("2025-12-13T10:30:00"),
      end: new Date("2025-12-13T11:45:00"),
      status: "scheduled",
    },
    {
      id: "2",
      start: new Date("2025-12-13T02:00:00"),
      end: new Date("2025-12-13T03:30:00"),
      status: "scheduled",
    },
    {
      id: "3",
      start: new Date("2025-12-13T09:00:00"),
      end: new Date("2025-12-13T10:00:00"),
      status: "scheduled",
    },
  ]);

  // ✅ Dialog state for CREATE
  const [customerFormDialogOpen, setCustomerFormDialogOpen] = useState(false);

  // ✅ Dialog state for EDIT
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleBookAppointment = (
    appointment: CustomerAppointmentType & {
      customerId: string;
      serviceId: string;
    }
  ) => {
    const newAppointment = {
      ...appointment,
      id: `apt-${Date.now()}`,
    };

    setAppointments([...appointments, newAppointment]);
  };

  // ✅ CREATE Customer - Axios version
  const handleCreateCustomer = async (customerData: any) => {
    if (editingCustomer === undefined) {
      try {
        setLoading(true);
        const result = await customerApi.create(customerData);

        if (result.success) {
          setCustomers([result.data, ...customers]);
          toast.success("Customer created!", {
            description: `${result.data.fullName} has been added`,
          });

          // ✅ Return success (allows form to close)
          return Promise.resolve(result);
        } else {
          toast.error(result.error);
          // ✅ Reject (keeps form open)
          return Promise.reject(new Error(result.error));
        }
      } catch (error: any) {
        const status = error.response?.status;
        const errorMsg = error.response?.data?.error || error.message;

        // Show specific error messages
        if (status === 409) {
          toast.error("Duplicate Email", {
            description: errorMsg,
            duration: 5000,
          });
        } else if (status === 400) {
          toast.error("Validation Error", {
            description: errorMsg,
          });
        } else {
          toast.error("Error", {
            description: errorMsg,
          });
        }

        // ✅ Reject (keeps form open)
        return Promise.reject(error);
      } finally {
        setLoading(false);
      }
    } else if (editingCustomer) {
      if (!editingCustomer?.id) {
        toast.error("No customer selected for editing");
        return Promise.reject(new Error("No customer selected"));
      }

      try {
        setLoading(true);

        const result = await customerApi.update(
          editingCustomer.id,
          customerData
        );

        if (result.success) {
          // Update in list
          setCustomers(
            customers.map((c: any) =>
              c.id === editingCustomer.id ? result.data : c
            )
          );

          // Update selected if same
          if (selectedCustomer?.id === editingCustomer.id) {
            setSelectedCustomer(result.data);
          }

          toast.success("Customer updated!", {
            description: `${result.data.fullName}'s information has been updated`,
          });

          return Promise.resolve(result);
        } else {
          toast.error(result.error);
          return Promise.reject(new Error(result.error));
        }
      } catch (error: any) {
        console.error("❌ Update error:", error);

        const status = error.response?.status;
        const errorMsg = error.response?.data?.error || error.message;

        if (status === 409) {
          toast.error("Duplicate Email", {
            description: errorMsg,
            duration: 5000,
          });
        } else if (status === 404) {
          toast.error("Customer Not Found", {
            description: "This customer may have been deleted",
          });
        } else {
          toast.error("Error", {
            description: errorMsg,
          });
        }

        return Promise.reject(error);
      } finally {
        setLoading(false);
      }
    }
  };

  // ===================================================
  // UPDATE Customer
  // ===================================================
  const handleUpdateCustomer = async (customerData: any) => {
    if (!editingCustomer?.id) {
      toast.error("No customer selected for editing");
      return Promise.reject(new Error("No customer selected"));
    }

    try {
      setLoading(true);

      const result = await customerApi.update(editingCustomer.id, customerData);

      if (result.success) {
        // Update in list
        setCustomers(
          customers.map((c: any) =>
            c.id === editingCustomer.id ? result.data : c
          )
        );

        // Update selected if same
        if (selectedCustomer?.id === editingCustomer.id) {
          setSelectedCustomer(result.data);
        }

        toast.success("Customer updated!", {
          description: `${result.data.fullName}'s information has been updated`,
        });

        return Promise.resolve(result);
      } else {
        toast.error(result.error);
        return Promise.reject(new Error(result.error));
      }
    } catch (error: any) {
      console.error("❌ Update error:", error);

      const status = error.response?.status;
      const errorMsg = error.response?.data?.error || error.message;

      if (status === 409) {
        toast.error("Duplicate Email", {
          description: errorMsg,
          duration: 5000,
        });
      } else if (status === 404) {
        toast.error("Customer Not Found", {
          description: "This customer may have been deleted",
        });
      } else {
        toast.error("Error", {
          description: errorMsg,
        });
      }

      return Promise.reject(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAddOrUpdate = (customerData: any) => {
    if (editingCustomer === undefined) {
      handleCreateCustomer(customerData);
    } else if (editingCustomer) {
      handleUpdateCustomer(customerData);
    }
  };

  // ===================================================
  // DELETE Customer
  // ===================================================
  const handleDeleteCustomer = async (customer: Customer) => {
    if (!customer) {
      console.error("❌ No customer provided for deletion");
      return;
    }

    // ✅ Confirmation dialog with details
    const confirmMsg = `Delete ${customer.fullName}?

This will permanently delete:
• Customer profile
• All appointments
• All notes
• All services
• All progress records

This action cannot be undone.`;

    if (!confirm(confirmMsg)) {
      return;
    }

    try {
      setLoading(true);

      await customerApi.delete(customer.id);

      // ✅ Remove from list
      const updatedCustomers = customers.filter(
        (c: any) => c.id !== customer.id
      );
      setCustomers(updatedCustomers);

      // ✅ Update selected customer
      if (selectedCustomer?.id === customer.id) {
        // Select first customer or null
        setSelectedCustomer(updatedCustomers[0] || null);
      }

      toast.success("Customer deleted!", {
        description: `${customer.fullName} has been removed from your system`,
        duration: 3000,
      });
    } catch (error: any) {
      console.error("❌ Delete error:", error);

      const errorMsg = error.response?.data?.error || error.message;

      if (error.response?.status === 404) {
        toast.error("Customer Not Found", {
          description: "This customer may have already been deleted",
          duration: 4000,
        });
      } else if (error.response?.status === 500) {
        toast.error("Server Error", {
          description: "Failed to delete customer. Please try again.",
          duration: 4000,
        });
      } else {
        toast.error("Delete Failed", {
          description: errorMsg || "Failed to delete customer",
          duration: 4000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // OPEN EDIT FORM
  // ===================================================
  const handleOpenEditForm = (customer: Customer) => {
    setEditingCustomer(customer);
  };

  // ===================================================
  // CLOSE EDIT DIALOG
  // ===================================================
  const handleCloseEditDialog = useCallback(() => {
    setEditDialogOpen(false);
    setEditingCustomer(undefined);
  }, []);

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-10 gap-4 h-[calc(100vh-95px)] w-full overflow-hidden">
      {/* left sidebar */}

      <div className="lg:col-span-2 h-48 lg:h-full flex flex-col gap-5 bg-primary-foreground p-4 rounded-lg border overflow-hidden shrink-0">
        {/* Header */}
        <header className="flex flex-col gap-4">
          <div className="flex items-center justify-between w-full">
            <h1 className="text-lg font-semibold">Customers</h1>
            <Button
              className="w-8 h-8"
              aria-label="Add new customer"
              onClick={() => {
                setCustomerFormDialogOpen(true);
                setEditingCustomer(undefined);
              }}
            >
              +
            </Button>

            {/* ✅ CREATE Form with controlled state */}
            <CustomerForm
              customer={editingCustomer}
              onSubmit={handleSubmitAddOrUpdate}
              open={customerFormDialogOpen}
              onOpenChange={setCustomerFormDialogOpen}
            />
          </div>

          <div className="search-section">
            <label htmlFor="customer-search" className="sr-only">Search customers</label>
            <Input id="customer-search" type="text" placeholder="Search customers..." />
          </div>
        </header>

        {/* Scrollable customer list */}
        <ScrollArea className="flex-1 overflow-y-auto p-1 pr-4">
          {customers.length > 0 ? (
            customers.map((customer: any) => (
              <div
                onClick={() => setSelectedCustomer(customer)}
                key={customer.id}
                className="mb-2 p-2 mr-2 flex cursor-pointer items-center justify-between w-full border-2 rounded-lg hover:bg-muted transition-colors duration-200"
              >
                <div className="flex items-center space-x-2 w-full">
                  <Avatar>
                    <AvatarImage
                      src={customer?.pictureURL}
                      alt={customer.fullName}
                    />
                    <AvatarFallback>
                      {customer.fullName?.[0]?.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate w-full" title={customer.fullName}>{customer.fullName}</span>
                </div>
              </div>
            ))
          ) : (
            <h1>No customers found</h1>
          )}
        </ScrollArea>
      </div>

      {/* main content */}
      {!(customers.length > 0) ? (
        <h1 className="lg:col-span-8 bg-primary-foreground rounded-lg border p-4 flex flex-col overflow-hidden h-full min-h-0 flex-1">
          No customers found
        </h1>
      ) : (
        <div className="lg:col-span-8 bg-primary-foreground rounded-lg border p-4 flex flex-col overflow-hidden h-full min-h-0 flex-1">
          {/* header */}
          <div className="flex w-full justify-between border-b pb-4 shrink-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full px-5 py-0 gap-3">
              <div className="leftHeader flex items-center justify-between gap-2">
                {(() => {
                  // const selectedOne = ""
                  const selectedOne = customers[0];
                  //   customerCRUDHook.filteredCustomers?.find(
                  //     (c) => c.id === selectedCustomer?.id
                  //   ) ??
                  //   selectedCustomer ??
                  //   null;

                  return (
                    <>
                      <Avatar className="size-16 sm:size-25 text-3xl sm:text-5xl">
                        <AvatarImage
                          // sizes="40"
                          src={selectedCustomer?.pictureURL}
                          alt={selectedCustomer?.fullName}
                        />
                        <AvatarFallback className="text">
                          {selectedCustomer?.fullName?.[0]?.toUpperCase() ||
                            "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col gap-2">
                        <span className="text-nowrap text-ellipsis overflow-hidden block w-full">
                          {selectedCustomer?.fullName}
                        </span>
                        <span className="text-nowrap text-ellipsis overflow-hidden block w-full">
                          {selectedCustomer?.address}
                        </span>
                      </div>
                    </>
                  );
                })()}
              </div>
              <div className="rightHeader flex gap-1 items-center justify-center rounded-md">
                <Button
                  onClick={() => {
                    setCustomerFormDialogOpen(true);
                    setEditingCustomer(selectedCustomer as Customer);
                  }}
                  aria-label={`Edit ${selectedCustomer?.fullName || 'customer'}`}
                >
                  <Pencil aria-hidden="true" className="w-4 h-4" />
                </Button>

                <Button
                  color="error"
                  onClick={() =>
                    handleDeleteCustomer(selectedCustomer as Customer)
                  }
                  aria-label={`Delete ${selectedCustomer?.fullName || 'customer'}`}
                >
                  <Trash2 aria-hidden="true" className="w-4 h-4" />
                </Button>

                <BookAppointment
                  customer={selectedCustomer || customers[0]}
                  existingAppointments={appointments}
                  onSubmit={handleBookAppointment}
                />
              </div>
            </div>
          </div>

          {/* main content */}
          <div className="flex-1 overflow-hidden mt-2">
            <Tabs defaultValue="about" className="h-full flex flex-col">
              <TabsList className="w-full overflow-x-auto flex justify-start">
                <TabsTrigger value="about" className="px-4 sm:px-8">
                  About
                </TabsTrigger>
                <TabsTrigger value="notes" className="px-4 sm:px-8">
                  Notes
                </TabsTrigger>
                <TabsTrigger value="appointments" className="px-4 sm:px-8">
                  Appointments
                </TabsTrigger>
                <TabsTrigger value="services" className="px-4 sm:px-8">
                  Services
                </TabsTrigger>
                <TabsTrigger value="progress" className="px-4 sm:px-8">
                  Progress
                </TabsTrigger>
                <TabsTrigger value="payments" className="px-4 sm:px-8">
                  Payments
                </TabsTrigger>
              </TabsList>
              <TabsContent value="about" className="flex-1 overflow-y-auto p-6">
                <AboutTabContent customer={selectedCustomer as Customer} />
              </TabsContent>
              <TabsContent value="notes" className="flex-1 overflow-y-auto p-6">
                <NoteTabContent customer={selectedCustomer as Customer} />
              </TabsContent>
              <TabsContent
                value="appointments"
                className="flex-1 overflow-y-auto p-6"
              >
                <AppointmentTabContent
                  customer={selectedCustomer as Customer}
                />
              </TabsContent>
              <TabsContent
                value="services"
                className="flex-1 overflow-y-auto p-6"
              >
                <ServiceTabContent customer={selectedCustomer as Customer} />
              </TabsContent>
              <TabsContent
                value="progress"
                className="flex-1 overflow-y-auto p-6"
              >
                <ProgressTabContent customer={selectedCustomer as Customer} />
              </TabsContent>
              <TabsContent
                value="payments"
                className="flex-1 overflow-y-auto p-6"
              >
                <PaymentTabContent customer={selectedCustomer as Customer} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerPageClient;
