"use client";

import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Button,
  Textarea,
  Card,
  CardBody,
  CardHeader,
  Tooltip,
} from "@heroui/react";
import { useState, useCallback } from "react";
import useSWR from "swr";
import { useUserContext } from "@/components/layout/UserContext";
import { dtTask, dtNote } from "@/helpers/db";
import { DeleteIcon } from "@/components/icons/table/delete-icon"; // your icon path

interface Props {
  isOpen: boolean;
  onClose: () => void;
  task: dtTask | null;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const ProjectDescNoteModal = ({ isOpen, onClose, task }: Props) => {
  const { user } = useUserContext();
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(false);

  const canEdit = user?.designation?.includes("DESIGN");

  const { data: notes = [], mutate: mutateNotes } = useSWR<dtNote[]>(
    task?.id ? `/api/department/ITDT/DT/tasks/note?projId=${task.id}` : null,
    fetcher,
  );

  const handleSave = useCallback(async () => {
    if (!task || !newNote.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/department/ITDT/DT/tasks/note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projId: task.id,
          note: newNote,
          createdBy: user?.name,
          date: new Date().toISOString(),
        }),
      });

      if (!res.ok) throw new Error("Failed to save note");

      await mutateNotes();
      setNewNote("");
    } catch (err) {
      console.error("Error saving note:", err);
      alert("Error saving note");
    } finally {
      setLoading(false);
    }
  }, [newNote, task, user?.name, mutateNotes]);

  const handleDelete = useCallback(
    async (noteId: number) => {
      if (!confirm("Are you sure you want to delete this note?")) return;

      try {
        const res = await fetch("/api/department/ITDT/DT/tasks/note/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: noteId }),
        });

        if (!res.ok) throw new Error("Failed to delete note");

        await mutateNotes();
      } catch (err) {
        console.error("Error deleting note:", err);
        alert("Failed to delete note");
      }
    },
    [mutateNotes],
  );

  console.log("NOTES FROM API:", notes);

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="lg">
      <ModalContent>
        <ModalHeader>Project Description Notes</ModalHeader>

        <ModalBody className="flex flex-col gap-4">
          {notes.length === 0 && (
            <Card className="border border-dashed text-center text-default-400 italic">
              <CardBody>No notes yet.</CardBody>
            </Card>
          )}

          {notes.map((n) => (
            <Card key={n.id} className="shadow-sm border relative">
              <CardHeader className="flex flex-col items-start">
                <div className="flex justify-between w-full items-start">
                  <div>
                    <span className="text-sm font-semibold">
                      Design Team Note
                    </span>
                    <br />
                    <span className="text-xs text-default-500">
                      {n.created_by ?? "Unknown"} •{" "}
                      {n.date
                        ? new Date(n.date).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "No date"}
                    </span>
                  </div>
                  {canEdit && (
                    <Tooltip content="Delete note" color="danger">
                      <button
                        onClick={() => handleDelete(n.id)}
                        className="ml-2"
                      >
                        <DeleteIcon size={18} fill="#FF0080" />
                      </button>
                    </Tooltip>
                  )}
                </div>
              </CardHeader>
              <CardBody className="whitespace-pre-wrap text-sm">
                {n.note}
              </CardBody>
            </Card>
          ))}

          {canEdit && (
            <Textarea
              label="Add New Note"
              placeholder="Type your note here..."
              value={newNote}
              onValueChange={setNewNote}
              minRows={4}
            />
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            Close
          </Button>
          {canEdit && (
            <Button
              color="primary"
              onPress={handleSave}
              isLoading={loading}
              disabled={!newNote.trim()}
            >
              Save Note
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
