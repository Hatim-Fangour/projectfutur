"use client";
import React, { useState } from "react";
import { Card, CardAction, CardContent, CardFooter } from "../ui/card";
import { Eye, Pen, Save, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Separator } from "../ui/separator";

const NoteCard = ({ note }: any) => {
  const [editMode, setEditMode] = useState(false);
  return (
    <Card className="w-full flex-row items-center p-2 border- dark:bg-[#232323]">
      <CardContent className="w-full flex flex-col gap-2 p-0">
        <div className="noteContent p-2 ">
          {editMode ? (
            <Textarea
              value={note.content}
              style={{
                fontSize: 16,
              }}
            ></Textarea>
          ) : (
            <div className=" p-2">{note.content}</div>
          )}
        </div>
        <Separator className="w-full" />
        <div className="noteInfo text-sm ml-3 flex  gap-3">
          <span>{note.date}</span>
          <span>by {note.writer}</span>
        </div>
      </CardContent>
      <CardAction className="self-start flex gap-3">
        <Button variant="destructive">
          <Trash2 />
        </Button>
        <Button onClick={() => setEditMode((prev) => !prev)}>
          {editMode ? <Save /> : <Pen />}
        </Button>
      </CardAction>

      {/* <CardFooter className="border">
        <div className="noteDate text-sm ml-3">{note.date}</div>
      </CardFooter> */}

      {/* {isEditMode && (
            <span
              className="group inline-flex cursor-pointer text-red-600"
              onClick={() => {
                if (!isEditMode) return;
                handleDeleteCustomerNote(note.id);
              }}
            >
              <Trash2 className="transition duration-200 group-hover:drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)]" />
            </span>
          )} */}
    </Card>
  );
};

export default NoteCard;
