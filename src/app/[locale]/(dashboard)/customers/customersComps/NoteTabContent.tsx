"use client";

import NoteCard from "./NoteCard";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { TabContentProps } from "@/app/[locale]/(dashboard)/customers/Interfaces/customerInterfaces";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface Note {
  id: string;
  title: string | null;
  content: string;
  writer: string | null;
  tags: string[];
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

const NoteTabContent = ({ customer }: TabContentProps) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const fetchNotes = useCallback(async () => {
    if (!customer?.id) return;
    try {
      setLoading(true);
      const res = await fetch(
        `/api/notes?customerId=${customer.id}&limit=50`
      );
      const result = await res.json();
      if (result.success && result.data) {
        setNotes(result.data);
      }
    } catch {
      toast.error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  }, [customer?.id]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleCreateNote = async () => {
    if (!newNoteContent.trim()) {
      toast.error("Please enter a note");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customer.id,
          content: newNoteContent.trim(),
        }),
      });

      const result = await res.json();
      if (result.success && result.data) {
        setNotes((prev) => [result.data, ...prev]);
        setNewNoteContent("");
        setPopoverOpen(false);
        toast.success("Note saved");
      } else {
        toast.error(result.error || "Failed to save note");
      }
    } catch {
      toast.error("Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateNote = async (noteId: string, content: string) => {
    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      const result = await res.json();
      if (result.success && result.data) {
        setNotes((prev) =>
          prev.map((n) => (n.id === noteId ? result.data : n))
        );
        toast.success("Note updated");
      } else {
        toast.error(result.error || "Failed to update note");
      }
    } catch {
      toast.error("Failed to update note");
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE",
      });

      const result = await res.json();
      if (result.success) {
        setNotes((prev) => prev.filter((n) => n.id !== noteId));
        toast.success("Note deleted");
      } else {
        toast.error(result.error || "Failed to delete note");
      }
    } catch {
      toast.error("Failed to delete note");
    }
  };

  return (
    <div className="notes-history">
      <div className="title mb-3 flex justify-between items-center">
        <span>Notes</span>
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Add new note">
              <Plus aria-hidden="true" />
            </Button>
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
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                disabled={saving}
              />
              <div>
                <Button
                  className="mt-2 w-full"
                  onClick={handleCreateNote}
                  disabled={saving || !newNoteContent.trim()}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Note"
                  )}
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-col gap-6 mt-9">
        {loading ? (
          <div role="status" aria-label="Loading notes" className="flex justify-center py-8">
            <Loader2 aria-hidden="true" className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : notes.length === 0 ? (
          <p className="emptyCartText">You don&apos;t have any notes</p>
        ) : (
          notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onUpdate={handleUpdateNote}
              onDelete={handleDeleteNote}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default NoteTabContent;
