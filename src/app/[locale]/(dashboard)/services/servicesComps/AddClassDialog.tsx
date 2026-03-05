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
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DollarSign, ImageIcon } from "lucide-react";
import ColorPicker from "@/components/ColorPicker";
import { existingColors } from "@/app/[locale]/(dashboard)/Utils";
const AddClassDialog = () => {

  return (
    <DialogContent
      className="w-full max-w-[750px]"
      onInteractOutside={(e) => {
        e.preventDefault();
      }}
    >
      <DialogHeader>
        <DialogTitle>Create New Class</DialogTitle>
      </DialogHeader>
      <div className="panel-content box-border h-full pb-4 w-full gap-6 flex flex-col justify-between overflow-hidden">
        {/* Class Details */}
        <div className="classDetails w-full flex flex-col items-start gap-1">
          <FieldLabel>Class details</FieldLabel>
          <div className="flex items-center gap-4">
            <Avatar className="w-[100px] h-[100px] rounded-[20px] border-2 border-[#dbdbdb] bg-[#f4f4f4]">
              <AvatarImage
                src={
                  ""
                  // classHook.selectedPicture
                  //   ? classHook.targetClass.current?.pictureURL
                  //   : undefined
                }
                alt="Class image"
              />
              <AvatarFallback className="rounded-[20px]">
                <ImageIcon className="h-10 w-10 text-black" />
              </AvatarFallback>
            </Avatar>

            <div className="imageAction flex flex-col items-start gap-2">
              <div className="info flex flex-col items-start gap-1">
                <span className="text-sm">Class image</span>
                <span className="text-sm text-[#a0a0a0]">
                  Up to 5 MB in size
                </span>
              </div>

              <Button
                variant="outline"
                // onClick={classHook.openPicker}
                className="px-4 border border-[#dbdbdb] rounded-full flex items-center gap-2 hover:bg-[#f1f1f1] hover:border-[#f1f1f1]"
              >
                <ImageIcon className="h-5 w-5" />
                <span>Upload</span>
              </Button>

              <input
                // ref={classHook.inputRef}
                type="file"
                accept="image/*"
                // onChange={classHook.handleClassPictureChange}
                hidden
              />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="widget-item flex items-end gap-4">
          <div className="notes w-full flex flex-col items-start gap-1">
            <FieldLabel>Title *</FieldLabel>
            <div className="flex items-center justify-between w-full gap-4">
              <Input
                name="title"
                placeholder="For example, 'Introductory call'"
                // onChange={(e) => {
                //   classHook.editTargetClass(
                //     e.target.name,
                //     e.target.value
                //   );
                // }}
                className="border border-[#dbdbdb] rounded-[10px] transition-all duration-200 hover:bg-[#f1f1f1] focus-visible:ring-0 focus-visible:ring-offset-0"
              />

              {/* Color Picker */}
              <ColorPicker
                eventColors={existingColors}
                selectedColor={existingColors[0]}
                onColorChange={() => {}}
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="widget-item flex items-center gap-4">
          <div className="notes w-full flex flex-col items-start gap-1">
            <FieldLabel>Description</FieldLabel>
            <Textarea
              name="description"
              placeholder="Describe your class to Booking page visitors"
              rows={4}
              // onChange={(e) => {
              //   classHook.editTargetClass(
              //     e.target.name,
              //     e.target.value
              //   );
              // }}
              className="border border-[#dbdbdb] rounded-[10px] transition-all duration-200 hover:bg-[#f1f1f1] resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </div>

        {/* Details */}
        <div className="widget-item flex items-center gap-4">
          <div className="service-info text-gray-500 flex gap-x-6 items-center justify-between">
            {/* Duration */}
            <div className="flex items-start flex-col gap-3">
              <FieldLabel className="text-sm text-gray-500">
                Duration *
              </FieldLabel>
              <div className="relative">
                <Input
                  name="duration"
                  type="number"
                  placeholder="Enter duration"
                  // onChange={(e) => {
                  //   classHook.editTargetClass(
                  //     e.target.name,
                  //     e.target.value
                  //   );
                  // }}
                  className="border border-[#dbdbdb] rounded-[10px] transition-all duration-200 hover:bg-[#f1f1f1] pr-12 focus-visible:ring-0 focus-visible:ring-offset-0"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  mins
                </span>
              </div>
            </div>

            {/* Seats */}
            <div className="flex items-start flex-col gap-3">
              <FieldLabel className="text-sm text-gray-500">Seats</FieldLabel>
              <Input
                name="seats"
                type="number"
                placeholder="Enter seats"
                // onChange={(e) => {
                //   classHook.editTargetClass(e.target.name, e.target.value);
                // }}
                className="border border-[#dbdbdb] rounded-[10px] transition-all duration-200 hover:bg-[#f1f1f1] focus-visible:ring-0 focus-visible:ring-offset-0"
                required
              />
            </div>

            {/* Cost */}
            <div className="flex items-start flex-col gap-3">
              <FieldLabel className="text-sm text-gray-500">Cost</FieldLabel>
              <div className="relative">
                <Input
                  name="cost"
                  type="number"
                  placeholder="Enter cost"
                  // onChange={(e) => {
                  //   classHook.editTargetClass(e.target.name, e.target.value);
                  // }}
                  className="border border-[#dbdbdb] rounded-[10px] transition-all duration-200 hover:bg-[#f1f1f1] pr-10 focus-visible:ring-0 focus-visible:ring-offset-0"
                  required
                />
                <DollarSign className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button type="submit">Create</Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default AddClassDialog;
