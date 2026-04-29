"use client";

import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Button,
} from "@heroui/react";
import { useState } from "react";
import { Ticketing } from "@/helpers/db";
import { useUserContext } from "@/components/layout/UserContext";
import { mutate } from "swr";
import { DeclineTicketModal } from "./decline-ticket";

interface Props {
  ticket: Ticketing | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenDecline: (ticket: Ticketing) => void;
}

export const ApproveTicketModal = ({
  ticket,
  isOpen,
  onClose,
  onOpenDecline,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticketing | null>(null);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isDeclineOpen, setIsDeclineOpen] = useState(false);

  if (!ticket) return null;

  const handleOpenDecline = (ticket: Ticketing) => {
    setSelectedTicket(ticket);
    setIsDeclineOpen(true);
  };

  const handleApprove = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/ticketing/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: ticket.id,
          status: "Approved",
        }),
      });

      if (!res.ok) throw new Error("Failed to approve ticket");

      await mutate("/api/ticketing");
      onClose();
    } catch (err) {
      console.error("Error approving ticket:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onOpenChange={onClose}>
        <ModalContent>
          <>
            <ModalHeader>Approve Ticket</ModalHeader>

            <ModalBody>
              <p className="text-sm">
                Are you sure you want to approve this ticket?
              </p>

              <div className="mt-3 text-sm">
                <p>
                  <strong>Description:</strong> {ticket.description}
                </p>
                <p>
                  <strong>Requested By:</strong> {ticket.requestedBy}
                </p>
                <p>
                  <strong>Finished Date:</strong> {ticket.finishedDate}
                </p>
                <p>
                  <strong>Finished Time:</strong> {ticket.finishedTime}
                </p>
              </div>
            </ModalBody>

            <ModalFooter>
              <Button
                variant="flat"
                isDisabled={loading}
                onPress={() => handleOpenDecline(ticket)} // ✅ use your handler
              >
                Decline
              </Button>

              <Button
                color="success"
                onPress={handleApprove}
                isLoading={loading}
              >
                Approve Ticket
              </Button>
            </ModalFooter>
          </>
        </ModalContent>
      </Modal>

      <DeclineTicketModal
        ticket={selectedTicket}
        isOpen={isDeclineOpen}
        onClose={() => setIsDeclineOpen(false)}
      />
    </>
  );
};
