"use client";

import React, { useState } from "react";
import { Card, CardAction, CardContent } from "@/components/ui/card";
import { Loader2, Pen, Save, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

interface NoteCardProps {
  note: {
    id: string;
    content: string;
    writer: string | null;
    createdAt: string;
  };
  onUpdate: (noteId: string, content: string) => Promise<void>;
  onDelete: (noteId: string) => Promise<void>;
}

const NoteCard = ({ note, onUpdate, onDelete }: NoteCardProps) => {
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState(note.content);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    if (!editContent.trim()) return;
    setSaving(true);
    await onUpdate(note.id, editContent.trim());
    setSaving(false);
    setEditMode(false);
  };

  const handleCancel = () => {
    setEditContent(note.content);
    setEditMode(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(note.id);
    setDeleting(false);
  };

  const formattedDate = new Date(note.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Card className="w-full flex-row items-center p-2 dark:bg-[#232323]">
      <CardContent className="w-full flex flex-col gap-2 p-0">
        <div className="noteContent p-2">
          {editMode ? (
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              style={{ fontSize: 16 }}
              disabled={saving}
              aria-label="Note content"
            />
          ) : (
            <div className="p-2 whitespace-pre-wrap">{note.content}</div>
          )}
        </div>
        <Separator className="w-full" />
        <div className="noteInfo text-sm ml-3 flex gap-3 text-muted-foreground">
          <span>{formattedDate}</span>
          {note.writer && <span>by {note.writer}</span>}
        </div>
      </CardContent>
      <CardAction className="self-start flex gap-2">
        <Button
          variant="destructive"
          size="icon"
          onClick={handleDelete}
          disabled={deleting || saving}
          aria-label="Delete note"
        >
          {deleting ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : <Trash2 aria-hidden="true" className="h-4 w-4" />}
        </Button>
        {editMode ? (
          <>
            <Button size="icon" variant="outline" onClick={handleCancel} disabled={saving} aria-label="Cancel edit">
              <X aria-hidden="true" className="h-4 w-4" />
            </Button>
            <Button size="icon" onClick={handleSave} disabled={saving || !editContent.trim()} aria-label="Save note">
              {saving ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : <Save aria-hidden="true" className="h-4 w-4" />}
            </Button>
          </>
        ) : (
          <Button size="icon" variant="outline" onClick={() => setEditMode(true)} aria-label="Edit note">
            <Pen aria-hidden="true" className="h-4 w-4" />
          </Button>
        )}
      </CardAction>
    </Card>
  );
};

export default NoteCard;
