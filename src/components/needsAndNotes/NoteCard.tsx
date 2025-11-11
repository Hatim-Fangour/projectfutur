import React from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Separator } from "../ui/separator";
import {
  CalendarDays,
  CheckCircle,
  MoreVertical,
  RefreshCcw,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NoteCard = ({ note }: any) => {
  return (
    <Card
      key={note.id}
      className="py-3 gap-3 px-3 transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-0.5"
      style={{
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",

        transition: "all 0.3s ease",
        border:
          note.priority === "High"
            ? "2px solid #f4433674"
            : "1px solid #56565659",
        // backgroundColor: note.status === "Done" ? "#f3f4f6" : "#ffffff",
        opacity: note.status === "Done" ? 0.5 : 1,
      }}
    >
      <CardHeader className="flex items-center gap-2 justify-between px-1">
        <div className="flex items-center gap-3">
          <Avatar className="w-11 h-11">
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>{note.writer?.fullName}</AvatarFallback>
          </Avatar>

          <div>
            <h1 className="text-sm font-medium">{note.writer?.fullName}</h1>
            <p className="text-xs text-gray-500 mt-1">{note.writer.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary">{note.priority}</Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <MoreVertical className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              <DropdownMenuGroup>
                <DropdownMenuItem>Mark as Pending/Done</DropdownMenuItem>
                <DropdownMenuItem>Edit Note</DropdownMenuItem>
                <DropdownMenuItem variant="destructive">
                  Delete Note
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="py-0 px-0">
        <div className="px-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center flex-col justify-between gap-1">
              <div className="flex items-center gap-2 w-full justify-between">
                <Badge
                  className="h-6"
                  //  label={note.category}
                  //  variant="outline"
                  //  sx={{
                  //    p: 0,
                  //    height: "20px",
                  //    ...getCategoryColor(note.category), // Spread the color styles
                  //  }}
                  //   className={`text-xs ${getPriorityColor(note.category)}`}
                >
                  {note.category}
                </Badge>
                <Badge className="h-6">
                  {note.status === "Done" ? (
                    <>
                      <CheckCircle />
                      {note.status}
                    </>
                  ) : (
                    <>
                      <RefreshCcw />
                      {note.status}
                    </>
                  )}
                </Badge>
              </div>
            </div>
          </div>

          <h1>{note.description}</h1>
        </div>

        <Separator className="my-3" />
        <div className="flex items-center gap-2 text-xs text-gray-500 px-1">
          <CalendarDays className="h-3 w-3" />
          <span>Completed on{"12/09/2025"}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default NoteCard;
