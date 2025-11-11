import React from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Info, MoreVertical } from "lucide-react";
import { Button } from "../ui/button";

const NeedCard = ({ need }: any) => {
  return (
    <Card
      key={need.id}
      className="py-3 gap-3 px-3 transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-0.5"
      // sx={{
      //   bgcolor: "white",
      //   borderRadius: 3,
      //   boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
      //   "&:hover": {
      //     boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
      //     transform: "translateY(-2px)",
      //   },
      //   transition: "all 0.3s ease",
      //   height: "100%",
      //   border:
      //     need.priority === "urgent"
      //       ? "2px solid #f44336"
      //       : "1px solid #e0e0e0",
      // }}
    >
      <CardHeader className="flex items-center gap-2 justify-between px-1">
        <div className="flex items-center gap-4">
          <Avatar className="w-11 h-11">
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>Need</AvatarFallback>
          </Avatar>

          <div>
            <h1 className="text-sm font-medium">{need.name}</h1>
            <p className="text-xs text-gray-500 mt-1">Skincare & Beauty</p>
          </div>

          <div className="flex items-center flex-wrap mb-1 gap-1 ml-4">
            <Badge variant="secondary" className="capitalize">
              {need.priority}
            </Badge>
            <Badge variant="secondary" className="capitalize">
              {need.status}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {/* <Button variant="outline">Open</Button> */}
              <MoreVertical className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              <DropdownMenuGroup>
                <DropdownMenuItem>Mark as Needed</DropdownMenuItem>
                <DropdownMenuItem>Mark as Ordered</DropdownMenuItem>
                <DropdownMenuItem>Mark as Received</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Edit Product</DropdownMenuItem>
                <DropdownMenuItem variant="destructive">
                  Delete Product
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="py-0 px-0 flex flex-col gap-2 justify-between h-full">
        {need.description && (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <h2>Desc:</h2>
              <h1 className="truncate">{need.description}</h1>
            </div>
            <Info className="w-4 h-4 shrink-0" />
          </div>
        )}
        <div className="flex justify-between">
          <h2>Quantity:</h2>
          <h1>
            {need.quantity} {need.unit}
          </h1>
        </div>
        <div className="flex justify-between">
          <h2>Est. Cost:</h2>
          <h1
          // variant="body2"
          // sx={{ fontWeight: "600", color: "#2e7d32" }}
          >
            ${need.estimatedCost}
          </h1>
        </div>
        {need.supplier && (
          <div className="flex justify-between">
            <h2>Supplier:</h2>
            <h1>{need.supplier}</h1>
          </div>
        )}
        <Separator />
        {need.dueDate && (
          <div className="flex justify-between">
            <h2>Due Date:</h2>
            <h1
            //   variant="body2"
            //   sx={{
            //     fontWeight: "600",
            //     color:
            //       new Date(need.dueDate) < new Date()
            //         ? "#f44336"
            //         : "#666",
            //   }}
            >
              {new Date(need.dueDate).toLocaleDateString()}
            </h1>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NeedCard;
