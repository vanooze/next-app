"use client";

import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Button,
  useDisclosure,
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

export const GetTicketModal = ({ ticket, isOpen, onClose }: Props) => {
  const { user } = useUserContext();
  const [loading, setLoading] = useState(false);

  if (!ticket) return null;

  const handleGet = async () => {
    setLoading(true);

    try {
      const now = new Date();
      const acceptedDate = now.toISOString().slice(0, 10);
      const acceptedTime = now.toTimeString().slice(0, 8);

      const res = await fetch("/api/ticketing/get", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: ticket.id,
          assignedPersonnel: ticket.assignedPersonnel || user?.name,
          acceptedDate,
          acceptedTime,
        }),
      });

      if (!res.ok) throw new Error("Failed to get ticket");

      await mutate("/api/ticketing");

      onClose();
    } catch (err) {
      console.error("Error getting ticket:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose}>
      <ModalContent>
        <>
          <ModalHeader>Get Ticket</ModalHeader>

          <ModalBody>
            <p className="text-sm">Are you sure you want to get this ticket?</p>

            <div className="mt-3 text-sm">
              <p>
                <strong>Description:</strong> {ticket.description}
              </p>
              <p>
                <strong>Requested By:</strong> {ticket.requestedBy}
              </p>
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
