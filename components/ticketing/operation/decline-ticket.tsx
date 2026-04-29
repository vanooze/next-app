"use client";

import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Button,
  Input,
  Select,
  SelectItem,
} from "@heroui/react";
import React, { useState } from "react";
import { Ticketing } from "@/helpers/db";
import { mutate } from "swr";

interface Props {
  ticket: Ticketing | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DeclineTicketModal = ({ ticket, isOpen, onClose }: Props) => {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  if (!ticket) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setFiles(Array.from(e.target.files));
  };

  const handleDecline = async () => {
    if (!reason.trim()) {
      alert("Reason is required");
      return;
    }

    setLoading(true);

    try {
      const rejectedDate = new Date()
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");

      const formData = new FormData();
      formData.append("description", ticket.description);
      formData.append("department", ticket.department || "");
      formData.append("assignedPersonnel", ticket.assignedPersonnel || "");
      formData.append("requestedBy", ticket.requestedBy);
      formData.append("requestedDate", ticket.requestedDate);
      formData.append("requestedNote", reason);
      formData.append("status", "Pending");
      files.forEach((file) => {
        formData.append("files", file);
      });

      const res = await fetch("/api/ticketing/decline", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to decline ticket");

      await mutate("/api/ticketing");

      setReason("");
      onClose();
    } catch (err) {
      console.error("Error declining ticket:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="lg">
      <ModalContent>
        <>
          <ModalHeader>Decline Ticket</ModalHeader>

          <ModalBody className="gap-4">
            {/* Description */}
            <Input
              label="Description"
              variant="bordered"
              value={ticket.description || ""}
              isDisabled
            />

            {/* Reason (ONLY editable field) */}
            <Input
              isRequired
              label="Reason"
              variant="bordered"
              value={reason}
              onValueChange={setReason}
            />

            {/* Department */}
            <Input
              label="Department"
              variant="bordered"
              value={ticket.department || ""}
              isDisabled
            />

            {/* Assigned Personnel */}
            <Input
              label="Assigned Personnel"
              variant="bordered"
              value={ticket.assignedPersonnel || ""}
              isDisabled
            />

            {/* Files (read-only display) */}
            <div className="col-span-2">
              <Input
                type="file"
                label="Attachments"
                multiple
                onChange={handleFileChange}
              />

              {files.length > 0 && (
                <div className="text-sm text-gray-500 mt-2">
                  {files.length} file(s) selected
                </div>
              )}
            </div>
          </ModalBody>

          <ModalFooter>
            <Button variant="flat" onPress={onClose} isDisabled={loading}>
              Cancel
            </Button>

            <Button color="danger" onPress={handleDecline} isLoading={loading}>
              Submit Decline
            </Button>
          </ModalFooter>
        </>
      </ModalContent>
    </Modal>
  );
};
