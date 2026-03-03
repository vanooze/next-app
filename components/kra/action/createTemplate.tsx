"use client";

import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@heroui/react";
import { deprecate } from "util";
import { useUserContext } from "@/components/layout/UserContext";

interface KRACreateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableIds?: number[]; // all table IDs will be passed here
  onSaved?: () => void;
}

export const KRACreateTemplateModal: React.FC<KRACreateTemplateModalProps> = ({
  isOpen,
  onClose,
  tableIds,
  onSaved,
}) => {
  const [templateName, setTemplateName] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useUserContext();

  const selectedTables = tableIds || [];

  const handleSaveTemplate = async () => {
    if (!selectedTables.length)
      return alert("No tables to create template from.");
    if (!templateName.trim()) return alert("Please enter a template name.");

    setLoading(true);
    try {
      const res = await fetch("/api/kra/template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template_name: templateName,
          table_ids: selectedTables,
          department: user?.department,
          date: new Date().toISOString(),
        }),
      });

      if (!res.ok) throw new Error("Failed to save template");

      alert("Template created successfully!");
      setTemplateName("");
      onSaved?.();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error creating template.");
    } finally {
      setLoading(false);
    }
  };

  // Reset template name when modal opens
  useEffect(() => {
    if (isOpen) setTemplateName("");
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} placement="center" size="2xl">
      <ModalContent>
        <ModalHeader>Create Template</ModalHeader>
        <ModalBody className="space-y-4">
          <Input
            label="Template Name"
            placeholder="Enter template name"
            value={templateName}
            onValueChange={setTemplateName}
            className="w-full"
          />
          <p className="text-sm text-gray-500">
            This template will include {selectedTables.length} table
            {selectedTables.length !== 1 ? "s" : ""}.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="flat"
            color="danger"
            onPress={onClose}
            isDisabled={loading}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={handleSaveTemplate}
            isLoading={loading}
          >
            Save Template
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
