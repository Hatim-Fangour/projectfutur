import NoteCard from "./NoteCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { TabContentProps } from "@/app/[locale]/(dashboard)/customers/Interfaces/customerInterfaces";



const NoteTabContent = ({ customer }: TabContentProps) => {
  return (
    <div className="notes-history">
      <div className="title mb-3 flex justify-between items-center">
        <span>Notes</span>
        <Popover>
          <PopoverTrigger>
            {/* <Button> */}
              <Plus />
            {/* </Button> */}
          </PopoverTrigger>
          <PopoverContent
            side="left"
            align="start"
            sideOffset={10}
            className="w-150 h-80"
          >
            <div className="flex flex-col gap-2 h-full">
              <Textarea
                placeholder="Type your note here."
                className="h-full!"
                cols={10}
              />
              <div>
                <Button className="mt-2 w-full">Save Note</Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-col gap-6 mt-9">
        {!customer.notes || customer.notes.length === 0 ? (
          <p className="emptyCartText">You don't have any notes</p>
        ) : (
          customer.notes.map((note) => <NoteCard key={note.id} note={note} />)
        )}
      </div>
    </div>
  );
};

export default NoteTabContent;
