"use client";

import {
  AlarmClockCheck,
  CircleDollarSign,
  MoreVertical,
  Pen,
  Trash2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { Button } from "../../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";

const PackageCard = ({ pkg }: any) => {
  console.log({ pkg });
  return (
    <div className="packageCardContainer w-full border rounded-lg flex items-center p-2.5 pl-5 overflow-hidden justify-between relative">
      <div
        className="absolute top-0 left-0 h-full w-1 rounded-l-lg"
        style={{ backgroundColor: pkg.color }}
      />
      <div className="info flex w-1/ items-center gap-5 ">
        <Avatar className="size-15 text-xl">
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>

        <div className="title flex flex-col w-full gap-1">
          <div
            className="overflow-hidden text-ellipsis font-bold"
            title={pkg.name}
          >
            {pkg.name}
          </div>
          <div className="flex gap-8 w-full">
            <div className="flex items-center gap-2">
              <AlarmClockCheck className="h-4 w-4" />
              <span>{pkg.duration} minutes</span>
            </div>

            <div className="flex items-center gap-2">
              <CircleDollarSign className="h-4 w-4" />
              {pkg.promoPrice ? (
                <>
                  <span className="promoPrice font-bold">
                    {pkg.promoPrice} $
                  </span>
                  <span className="price text-red-500 italic line-through text-[14px]">{`${pkg.price} $`}</span>
                </>
              ) : (
                <span className="promoPrice font-bold">{pkg.price} $</span>
              )}
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
          sideOffset={1}
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
    // <div className="packageCardContainer flex items-center w-full p-2.5 cursor-pointer justify-between">
    //   <div className="info flex items-center gap-2.5">
    //     <Avatar>
    //       <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
    //       <AvatarFallback>CN</AvatarFallback>
    //     </Avatar>

    //     <div className="titleContainer flex-2 py-[5px]">
    //       <div
    //         className="title text-[15px] font-bold overflow-hidden text-ellipsis"
    //         title={pkg.name}
    //       >
    //         {pkg.name}
    //       </div>
    //     </div>
    //   </div>

    //   <div className="pricing  items-end gap-1">
    //     {pkg.promoPrice ? (
    //       <>
    //         <span className="promoPrice font-bold">{pkg.promoPrice} $</span>
    //         <span className="price text-red-500 italic line-through text-[14px]">{`${pkg.price} $`}</span>
    //       </>
    //     ) : (
    //       <span className="promoPrice font-bold">{pkg.price} $</span>
    //     )}
    //   </div>
    //   <DropdownMenu>
    //     <DropdownMenuTrigger asChild>
    //       <Button className="">
    //         <MoreVertical />
    //       </Button>
    //     </DropdownMenuTrigger>
    //     <DropdownMenuContent
    //       sideOffset={10}
    //       side="left"
    //       className=""
    //       align="start"
    //     >
    //       <DropdownMenuItem
    //         onSelect={() => console.log("Edit")}
    //         className="flex items-center justify-between w-full"
    //       >
    //         Edit
    //         <Pen />
    //       </DropdownMenuItem>
    //       <DropdownMenuItem
    //         onSelect={() => console.log("Delete")}
    //         variant="destructive"
    //         className="flex items-center justify-between w-full"
    //       >
    //         Delete
    //         <Trash2 />
    //       </DropdownMenuItem>
    //     </DropdownMenuContent>
    //   </DropdownMenu>
    // </div>
  );
};

export default PackageCard;
