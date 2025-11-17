import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import {
  AlarmClockCheck,
  Armchair,
  CircleDollarSign,
  MoreVertical,
  Pen,
  RockingChair,
  Trash2,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";

const ClassCard = ({ Class }: any) => {
  return (
    <div
      className="packageCardContainer w-full border rounded-lg flex items-center p-2.5 pl-5 overflow-hidden justify-between relative"
     
    >
      <div
        className="absolute top-0 left-0 h-full w-1 rounded-l-lg"
        style={{ backgroundColor: Class.color }}
      />
      <div className="info flex w-1/ items-center gap-5 ">
        <Avatar className="size-15 text-xl">
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>

        <div className="title flex flex-col w-full gap-1">
          <div
            className="overflow-hidden text-ellipsis font-bold"
            title={Class.title}
          >
            {Class.title}
          </div>
          <div className="flex gap-8 w-full">
            <div className="flex items-center gap-2">
              <AlarmClockCheck className="h-4 w-4" />
              <span>{Class.duration} minutes</span>
            </div>

            <div className="flex items-center gap-2">
              <Armchair className="h-4 w-4" />
              <span>{Class.seats}</span>
            </div>

            <div className="flex items-center gap-2">
              <CircleDollarSign className="h-4 w-4" />
              <span>{Class.cost}</span>
            </div>
          </div>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
         <Button className="w-8 h-8 border-0 p-0!" variant="ghost" size="sm">
            <MoreVertical size={10} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          sideOffset={10}
          side="left"
          className=""
          align="start"
        >
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
  );
};

export default ClassCard;
