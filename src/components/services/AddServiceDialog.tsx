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
import { Field, FieldGroup, FieldLabel, FieldSet } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
const AddServiceDialog = () => {
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
  return (
    <DialogContent
      className="sm:max-w-[425px]"
      onInteractOutside={(e) => {
        e.preventDefault();
      }}
    >
      <DialogHeader>
        <DialogTitle>Create New Service</DialogTitle>
      </DialogHeader>
      <FieldGroup className="pb-3 ">
        <Field>
          <FieldLabel htmlFor="filename">Service Name</FieldLabel>
          <div className="flex items-center gap-6 flex-row">
            <Input id="filename" name="filename" placeholder="exp: Massages..." />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-6 h-6 p-0 rounded-full border-2 border-white shadow-[0_0_0_1px_#ccc] hover:opacity-90"
                  // style={{ backgroundColor: selectedColor || eventColors[0] }}
                >
                  <span className="sr-only">Pick a color</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-auto p-2" align="start">
                <div className="grid grid-cols-5 gap-2">
                  {eventColors.map((color, index) => (
                    <DropdownMenuItem
                      key={index}
                      // onClick={() => onColorChange(color)}
                      className="p-0 h-auto cursor-pointer focus:bg-transparent"
                    >
                      <div
                        className="w-6 h-6 rounded-full transition-transform hover:scale-110"
                        style={{
                          backgroundColor: color,
                          // border: color === selectedColor
                          //   ? "2px solid black"
                          //   : "2px solid transparent",
                        }}
                      />
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Field>
      </FieldGroup>
      <FieldSet>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="checkout-7j9-optional-Description">
              Description
            </FieldLabel>
            <Textarea
              id="checkout-7j9-optional-Description"
              placeholder="Add any additional Description"
              className="resize-none"
            />
          </Field>
        </FieldGroup>
      </FieldSet>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button type="submit">Create</Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default AddServiceDialog;
