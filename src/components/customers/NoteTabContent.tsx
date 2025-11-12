import React from "react";
import NoteCard from "./NoteCard";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";

const NoteTabContent = ({ customer }: any) => {
  return (
    <div className="notes-history">
      <div className="title mb-3 flex justify-between items-center">
        <span>Notes</span>
        <Button><Plus/></Button>
      </div>
      <div className="flex flex-col gap-6 mt-9">
        {customer?.notes?.length === 0 ? (
          <p className="emptyCartText">You don't have any notes</p>
        ) : (
          customer.notes.map((note) => <NoteCard key={note.id} note={note} />)
        )}
      </div>
    </div>
  );
};

export default NoteTabContent;
