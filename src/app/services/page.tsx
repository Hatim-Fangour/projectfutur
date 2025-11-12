"use client";
import ColorPicker from "@/components/ColorPicker";
import AddClassDialog from "@/components/services/AddClassDialog";
import AddServiceDialog from "@/components/services/AddServiceDialog";
import ClassCard from "@/components/services/ClassCard";
import PackageCard from "@/components/services/PackageCard";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Service } from "@/types/services";
import {
  ChevronsUpDown,
  DollarSign,
  ImageIcon,
  MoreVertical,
  Pen,
  Plus,
  Trash2,
} from "lucide-react";
import React, { useState } from "react";

const page: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openCategories, setOpenCategories] = useState<number | null>(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [openServiceAccordion, setOpenServiceAccordion] = useState<string>("");
  const [showNewServiceDialog, setShowNewServiceDialog] = useState(false);
  const [openedDialog, setOpenedDialog] = useState<string | null>(null);
  const [openContentAccordions, setOpenContentAccordions] = useState<
    Record<string, string>
  >({});

  const services: Service[] = [
    {
      id: 1,
      description: "Post Op Packages Description",
      service: "PostOpPackages",
      title: "Post Op Packages",
      content: [
        {
          id: 1,
          title: "Consultation Fee",
          description:
            "During this Session you can expect to receive information regarding supplies needed to prepare for your surgery. We discuss physical sensations and emotional experiences One can expect Post Surgery. We recommend where to purchase your supplies, Doctor referrals, and your schedule for Lymphatic Drainage sessions. We will address all concerns and questions You may have.If consultation is booked prior to surgery, you will receive a complimentary day of or after service check-in call or text. Our services For the Pre-Op Consultation are available Virtually or In Person.",
          duration: 30,
          pricingPlan: [
            {
              duration: 30,
              id: 1,
              name: "Consultation Fee",
              price: 209,
              color: "#ff6789",
            },
          ],
        },
        {
          id: 2,
          title: "this is title",
          description:
            "This package is designed to provide comprehensive post-operative care and support for individuals recovering from surgery. It includes a series of therapeutic sessions aimed at promoting healing, reducing discomfort, and enhancing overall well-being during the recovery process.",
          duration: 60,
          pricingPlan: [
            {
              duration: 60,
              id: 1,
              name: "Single Session",
              price: 129,
              color: "#26fd05",
            },
            {
              duration: 60,
              id: 2,
              name: "5 Sessions Package",
              price: 600,
              color: "#0000ff",
            },
            {
              duration: 60,
              id: 3,
              name: "10 Sessions Package",
              price: 1150,
              color: "#fbff00",
            },
          ],
        },
      ],
    },
    {
      id: 2,
      description: "Lymphatic Drainage Description",
      service: "LymphaticDrainage",
      title: "Lymphatic Drainage",
      content: [
        {
          id: 1,
          title: "this is title 1",
          description:
            "Lymphatic Drainage is a gentle, rhythmic massage technique that stimulates the lymphatic system to promote the flow of lymph fluid throughout the body. This specialized massage is designed to enhance the body's natural detoxification process, reduce swelling, and improve overall immune function.",
          duration: 60,
          pricingPlan: [
            {
              duration: 60,
              id: 1,
              name: "Single Session",
              price: 129,
            },
            {
              duration: 60,
              id: 2,
              name: "5 Sessions Package",
              price: 600,
            },
            {
              duration: 60,
              id: 3,
              name: "10 Sessions Package",
              price: 1150,
            },
          ],
        },
        {
          id: 2,
          title: "this is title 2",
          description:
            "Lymphatic Drainage is a gentle, rhythmic massage technique that stimulates the lymphatic system to promote the flow of lymph fluid throughout the body. This specialized massage is designed to enhance the body's natural detoxification process, reduce swelling, and improve overall immune function.",
          duration: 60,
          pricingPlan: [
            {
              duration: 60,
              id: 1,
              name: "Single Session",
              price: 129,
            },
            {
              duration: 60,
              id: 2,
              name: "5 Sessions Package",
              price: 600,
            },
            {
              duration: 60,
              id: 3,
              name: "10 Sessions Package",
              price: 1150,
            },
          ],
        },
      ],
    },
  ];

  const LeftSideBarServicesList = [
    { id: 1, title: "Services", type: "service", items: services },
    {
      id: 2,
      title: "Classes",
      type: "class",
      items: [
        {
          title: "class_1",
          id: "classe_1",
          description: "class description 1",
          duration: 30,
          seats: 12,
          cost: 987,
          color: "#7856ff",
          classImage: "iamgeUrl",
        },
        {
          title: "class_2",
          id: "classe_2",
          description: "class description 2",
          duration: 30,
          seats: 12,
          cost: 987,
          color: "#72ff56",
          classImage: "iamgeUrl",
        },
        {
          title: "class_3",
          id: "classe_3",
          description: "class description 3",
          duration: 30,
          seats: 12,
          cost: 987,
          color: "#ff7856",
          classImage: "iamgeUrl",
        },
        {
          title: "class_4",
          id: "classe_4",
          description: "class description 4",
          duration: 30,
          seats: 12,
          cost: 987,
          color: "#ffff1b",
          classImage: "iamgeUrl",
        },
      ],
    },
  ];

  console.log({ selectedService });
  // 👇 handle toggle per category
  const toggleCategory = (id: number) => {
    setOpenCategories(
      (
        prev // ...prev,
      ) => id
    );
  };

  console.log(openCategories);
  // Handler for the main service accordion
  const handleServiceAccordionChange = (value: string) => {
    setOpenServiceAccordion(value);
  };

  const eventColors = [
    "#ef4444",
    "#f97316",
    "#f59e0b",
    "#eab308",
    "#84cc16",
    "#22c55e",
    "#10b981",
    "#14b8a6",
    "#06b6d4",
    "#0ea5e9",
    "#3b82f6",
    "#6366f1",
    "#8b5cf6",
    "#a855f7",
    "#d946ef",
    "#ec4899",
    "#f43f5e",
    "#64748b",
    "#6b7280",
    "#71717a",
  ];

  // Handler for nested content accordions
  const handleContentAccordionChange = (serviceId: string, value: string) => {
    setOpenContentAccordions((prev) => ({
      ...prev,
      [serviceId]: value,
    }));
  };

  return (
    <div className="grid grid-cols-4 grid-row-1 gap-4 overflow-hidden h-full">
      {/* left sidebar */}
      <div className="h-full flex flex-col gap-5 bg-primary-foreground p-4 rounded-lg border">
        {/* Header */}
        <header className="flex flex-col gap-4">
          <h1 className="text-lg font-semibold">Services & classes</h1>
        </header>

        {/*  services&classes list */}
        <div className="services&classes flex flex-col mt-4 flex-1 gap-4  overflow-y-auto ">
          {LeftSideBarServicesList.map((category) => (
            <Button
              onClick={() => toggleCategory(category.id)}
              className="cursor-pointer"
            >
              {category.title}
            </Button>
          ))}
        </div>
      </div>

      {/* main content */}
      <div className="grid col-span-3 bg-primary-foreground p-4 pb-6 rounded-lg border content-start">
        <div className="flex w-full justify-between mb-4 border-b pb-2">
          <div className="flex gap-2 text-lg font-bold">
            <span>
              {
                LeftSideBarServicesList.find(
                  (item) => item.id === openCategories
                )?.title
              }
            </span>
            <span>
              (
              {
                LeftSideBarServicesList.find(
                  (item) => item.id === openCategories
                )?.items.length
              }
              )
            </span>
          </div>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button className="">+</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              sideOffset={10}
              side="left"
              className=""
              align="start"
            >
              <DropdownMenuItem onSelect={() => setOpenedDialog("service")}>
                Service
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setOpenedDialog("class")}>
                Class
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog
            open={!!openedDialog}
            onOpenChange={() => setOpenedDialog(null)}
          >
            {openedDialog === "service" ? (
              <AddServiceDialog />
            ) : (
              <AddClassDialog />
            )}
          </Dialog>
        </div>

        <div className="w-full">
          {/* openCategories === 1 means services */}
          {openCategories === 1 ? (
            <Accordion
              type="single"
              collapsible
              className="w-full"
              defaultValue="item-1"
              value={openServiceAccordion}
              onValueChange={handleServiceAccordionChange}
            >
              {LeftSideBarServicesList?.find((cat) => cat.id === 1)?.items.map(
                (classItem: any) => (
                  // Service
                  <AccordionItem
                    key={classItem.id}
                    value={`service-${classItem.id}`}
                    className="bg-primary-foreground border rounded-lg last:border-b mt-4 px-5"
                  >
                    <AccordionTrigger className="hover:!no-underline !no-underline cursor-pointer">
                      <div className="flex gap-4 items-center">
                        {/* service title */}
                        <span className="font-bold text-lg">
                          {classItem.title}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              className="border-0"
                              variant="ghost"
                              size="sm"
                            >
                              <MoreVertical size={10} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            sideOffset={1}
                            side="right"
                            className=""
                            align="start"
                          >
                            <DropdownMenuItem
                              onSelect={() => console.log("Details")}
                              className="flex items-center justify-between w-full"
                            >
                              Add Details
                              <Plus />
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() => console.log("Edit")}
                              className="flex items-center justify-between w-full"
                            >
                              Edit
                              <Pen />
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onSelect={() => console.log("Delete")}
                              variant="destructive"
                              className="flex items-center justify-between w-full"
                            >
                              Delete
                              <Trash2 />
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-4 text-balance">
                      <Accordion
                        type="single"
                        collapsible
                        className="w-full"
                        defaultValue="item-1"
                        value={openContentAccordions[classItem.id] || ""}
                        onValueChange={(value) =>
                          handleContentAccordionChange(classItem.id, value)
                        }
                      >
                        {classItem.content.map((cntnt: any) => (
                          // subService
                          <AccordionItem
                            key={classItem.id}
                            value={`content-${cntnt.id}`}
                            className="dark:bg-[#2828288a] last:border-t-0 border-b-0 rounded-lg mb-3 pr-3"
                          >
                            <AccordionTrigger
                              key={cntnt.id}
                              className="hover:!no-underline !no-underline cursor-pointer"
                            >
                              {/* subservice title */}
                              <div className=" flex gap-4 items-center ml-8 pl-3 border-l-3">
                                <span className="font-bold text-base">
                                  {cntnt.title}
                                </span>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      className="w-8 h-8 border-0 p-0!"
                                      variant="ghost"
                                      size="sm"
                                    >
                                      <MoreVertical size={10} />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    sideOffset={1}
                                    side="right"
                                    className=""
                                    align="start"
                                  >
                                    <DropdownMenuItem
                                      onSelect={() =>
                                        console.log("add Package")
                                      }
                                      className="flex items-center justify-between w-full"
                                    >
                                      Add Package
                                      <Plus />
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onSelect={() => console.log("Edit")}
                                      className="flex items-center justify-between w-full"
                                    >
                                      Edit
                                      <Pen />
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                      onSelect={() => console.log("Delete")}
                                      variant="destructive"
                                      className="flex items-center justify-between w-full"
                                    >
                                      Delete
                                      <Trash2 />
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="flex flex-col gap-4 ">
                              <div className="flex justify-between flex-col  pb-2">
                                {/* packages */}
                                <>
                                  {cntnt.pricingPlan.map((plan: any) => (
                                    <div className="pl-18 mb-3">
                                      <PackageCard key={plan.id} pkg={plan} />
                                    </div>
                                  ))}
                                </>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </AccordionContent>
                  </AccordionItem>
                )
              )}
            </Accordion>
          ) : (
            // Render class information
            <div className="flex flex-col gap-4 w-full ">
              {LeftSideBarServicesList?.find((cat) => cat.id === 2)?.items.map(
                (classItem: any) => (
                  // <div key={classItem.id} className="w-full">
                  <ClassCard key={classItem.id} Class={classItem} />
                  // </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default page;
