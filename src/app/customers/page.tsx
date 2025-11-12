import AboutTabContent from "@/components/customers/AboutTabContent";
import NoteTabContent from "@/components/customers/NoteTabContent";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, Trash2 } from "lucide-react";
import React from "react";

const page = () => {
  const tags = Array.from({ length: 50 }).map(
    (_, i, a) => `v1.2.0-beta.${a.length - i}`
  );

  const customers = [
    {
      id: 1,
      fullName: "John Doe",
      email: "John.Doe@gmail.com",
      pictureURL: "",
      phone: "+0123456789",
      address: "123 Main St, Cityville",
      notes: [
        {
          id: 1,
          content:
            "Followed up on the last appointment.Followed up on the last appointment.Followed up on the last appointment.Followed up on the last appointment.Followed up on the last appointment.Followed up on the last appointment.Followed up on the last appointment.Followed up on the last appointment.Followed up on the last appointment.Followed up on the last appointment.Followed up on the last appointment.Followed up on the last appointment.Followed up on the last appointment.Followed up on the last appointment.Followed up on the last appointment.Followed up on the last appointment.Followed up on the last appointment.Followed up on the last appointment.Followed up on the last appointment.Followed up on the last appointment.",
          date: "2024-10-01 20:09",
          writer: "Hatim Fangour",
        },
        {
          id: 2,
          content: "Interested in new spa packages.",
          date: "2024-10-05",
          writer: "Hatim Fangour",
        },
      ],
    },
    {
      id: 2,
      fullName: "Jane Smith",
      email: "",
      pictureURL: "",
      phone: "+0123456789",
    },
    {
      id: 3,
      fullName: "Alice Johnson",
      email: "",
      pictureURL: "",
      phone: "+0123456789",
    },
    {
      id: 4,
      fullName: "Bob Brown",
      email: "",
      pictureURL: "",
      phone: "+0123456789",
    },
    {
      id: 5,
      fullName: "Charlie Davis",
      email: "",
      pictureURL: "",
      phone: "+0123456789",
    },
    {
      id: 6,
      fullName: "Diana Evans",
      email: "",
      pictureURL: "",
      phone: "+0123456789",
    },
    {
      id: 7,
      fullName: "Frank Green",
      email: "",
      pictureURL: "",
      phone: "+0123456789",
    },
    {
      id: 8,
      fullName: "Grace Harris",
      email: "",
      pictureURL: "",
      phone: "+0123456789",
    },
    {
      id: 9,
      fullName: "Henry Lee",
      email: "",
      pictureURL: "",
      phone: "+0123456789",
    },
    {
      id: 10,
      fullName: "Ivy Martinez",
      email: "",
      pictureURL: "",
      phone: "+0123456789",
    },
    {
      id: 11,
      fullName: "Ivy Martinez",
      email: "",
      pictureURL: "",
      phone: "+0123456789",
    },
    {
      id: 12,
      fullName: "Ivy Martinez",
      email: "",
      pictureURL: "",
      phone: "+0123456789",
    },
    {
      id: 13,
      fullName: "Ivy Martinez",
      email: "",
      pictureURL: "",
      phone: "+0123456789",
    },
    {
      id: 14,
      fullName: "Ivy Martinez",
      email: "",
      pictureURL: "",
      phone: "+0123456789",
    },
    {
      id: 15,
      fullName: "Ivy Martinez",
      email: "",
      pictureURL: "",
      phone: "+0123456789",
    },
  ];
  return (
    <div className="grid grid-cols-4 gap-4 overflow-hidden items-start pb-6">
      {/* left sidebar */}
      <div className="flex flex-col bg-primary-foreground p-2 rounded-lg">
        {/* Header */}
        <header className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">Customers</h1>
            <Button className="w-8 h-8">+</Button>
          </div>

          <div className="search-section">
            <Input type="text" placeholder="Search customers..." />
          </div>
        </header>

        {/* Scrollable customer list */}
        <ScrollArea className="mt-4 p-1 pr-3 py-4 h-[700px]">
          {customers.map((customer) => (
            <div
              key={customer.id}
              className="mb-2 p-2 flex items-center justify-between w-full border-2 rounded-lg hover:bg-muted transition-colors duration-200"
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
                <span className="truncate w-full">{customer.fullName}</span>
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* main content */}
      <div className="grid grid-cols-1 gap-4 grid-rows-6 bg-primary-foreground p-2 rounded-lg col-span-3">
        <div className="grid bg-amber-20 rounded-lg border">
          <div className="header w-full">
            <div className="flex items-center justify-between space-x-2 w-full h-full px-5">
              <div className="leftHeader flex items-center justify-between space-x-2 h-full">
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
                      <Avatar className="size-25 text-5xl">
                        <AvatarImage
                          sizes="40"
                          src={selectedOne?.pictureURL}
                          alt={selectedOne.fullName}
                        />
                        <AvatarFallback className="text">
                          {selectedOne.fullName?.[0]?.toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col gap-2">

                      <span className="text-nowrap text-ellipsis overflow-hidden block w-full">
                        {selectedOne?.fullName}
                      </span>
                      <span className="text-nowrap text-ellipsis overflow-hidden block w-full">
                        {selectedOne?.address}
                      </span>
                      </div>
                    </>
                  );
                })()}
              </div>
              <div className="rightHeader flex gap-1 items-center justify-center  border rounded-md h-[30px]">
                <Button
                // sx={{
                //   height: "100%",
                // }}
                // onClick={() => {
                //   console.log(selectedCustomer);
                //   customerCRUDHook.onClickEditCustomer();
                // }}
                >
                  <Pencil className="w-4 h-4" />
                </Button>

                <Button
                  // variant="outlined"
                  color="error"
                  // onClick={() =>
                  //   customerCRUDHook.onClickDeleteCustomer(
                  //     selectedCustomer
                  //   )
                  // }
                  // sx={{
                  //   height: "100%",
                  // }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="grid row-span-5 bg-amber-30 rounded-lg border">
          <Tabs defaultValue="about" className="">
            <TabsList>
              <TabsTrigger value="about" className="px-8">About</TabsTrigger>
              <TabsTrigger value="notes" className="px-8">Notes</TabsTrigger>
              <TabsTrigger value="appointments" className="px-8">Appointments</TabsTrigger>
              <TabsTrigger value="services" className="px-8">Services</TabsTrigger>
            </TabsList>
            <TabsContent value="about" className="p-6">
              <AboutTabContent customer={customers[0]} />
            </TabsContent>
            <TabsContent value="notes" className="p-6">
              <NoteTabContent customer={customers[0]} />
            </TabsContent>
            <TabsContent value="appointments" className="p-6">
              appointments Content
            </TabsContent>
            <TabsContent value="services" className="p-6">
              services Content
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default page;
