"use client";

import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Button,
  useDisclosure,
  Input,
} from "@heroui/react";
import { useState } from "react";
import { Ticketing } from "@/helpers/db";
import { useUserContext } from "@/components/layout/UserContext";
import { mutate } from "swr";

interface Props {
  ticket: Ticketing | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FinishTicketModal = ({ ticket, isOpen, onClose }: Props) => {
  const { user } = useUserContext();
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  if (!ticket) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setFiles(Array.from(e.target.files));
  };

  const handleGet = async () => {
    setLoading(true);

    try {
      const now = new Date();
      const finishedDate = now.toISOString().slice(0, 10);
      const finishedTime = now.toTimeString().slice(0, 8);
      const formData = new FormData();

      formData.append("id", ticket.id.toString());
      formData.append("finishedDate", finishedDate);
      formData.append("finishedTime", finishedTime);
      files.forEach((file) => {
        formData.append("files", file);
      });

      const res = await fetch("/api/ticketing/finish", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to finish ticket");

      await mutate("/api/ticketing");

      onClose();
    } catch (err) {
      console.error("Error finishing ticket:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose}>
      <ModalContent>
        <>
          <ModalHeader>Finish Ticket</ModalHeader>

          <ModalBody>
            <p className="text-sm">
              Are you sure you want to finish this ticket?
            </p>

            <div className="mt-3 text-sm">
              <p>
                <strong>Description:</strong> {ticket.description}
              </p>
              <p>
                <strong>Requested By:</strong> {ticket.requestedBy}
              </p>
            </div>

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

            <Button color="success" onPress={handleGet} isLoading={loading}>
              Get Ticket
            </Button>
          </ModalFooter>
        </>
      </ModalContent>
    </Modal>
  );
};
