import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { MoreVertical, Pen, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const ClassCard = ({ Class }: any) => {
  return (
    <div className="packageCardContainer border rounded-lg flex items-center w-full p-2.5 cursor-pointer overflow-hidden justify-between relative after:content-[''] after:absolute  after:top-0 after:left-0 after:h-full after:w-2 after:bg-blue-500 ">
      {/* <span className="absolute top-0 left-0 h-full w-4"></span> */}

      <div className="info flex items-center gap-2.5">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>

        <div className="titleContainer flex-2 py-[5px]">
          <div
            className="title text-[15px] font-bold  line-clamp-2 overflow-hidden text-ellipsis leading-snug max-h-[2.4em]"
            title={Class.title}
          >
            {Class.title}
          </div>
        </div>
      </div>

      <p className="mb-2">{Class.description}</p>
      <p className="mb-2">Duration: {Class.duration} minutes</p>
      <p className="mb-2">Seats Available: {Class.seats}</p>
      <p className="mb-2">Cost: ${Class.cost}</p>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="">
            <MoreVertical />
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
