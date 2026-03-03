import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Select,
  SelectItem,
} from "@heroui/react";

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string | null;
  userDepartment: string | null;
}

export const KRATemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  employeeId,
  userDepartment,
}) => {
  const [templates, setTemplates] = useState<
    { id: number; template_name: string }[]
  >([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
    null,
  );

  // Fetch templates when modal opens
  useEffect(() => {
    if (!isOpen || !userDepartment) return;

    const fetchTemplates = async () => {
      try {
        const res = await fetch(
          `/api/kra/template?department=${userDepartment}`,
        );
        if (!res.ok) throw new Error("Failed to fetch templates");
        const data = await res.json();
        setTemplates(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchTemplates();
  }, [isOpen, userDepartment]);

  useEffect(() => {
    if (isOpen) setSelectedTemplateId(null);
  }, [isOpen]);

  const handleApplyTemplate = async () => {
    if (!selectedTemplateId || !employeeId) return;

    try {
      const res = await fetch(`/api/kra/template/${selectedTemplateId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId }),
      });

      if (!res.ok) throw new Error("Failed to apply template");
      alert("Template applied successfully!");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error applying template.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} placement="center" size="4xl">
      <ModalContent>
        <ModalHeader>Apply KRA Template</ModalHeader>
        <ModalBody className="space-y-4">
          <Select
            label="Select Template"
            placeholder="Choose a template"
            selectedKeys={
              selectedTemplateId ? [String(selectedTemplateId)] : []
            }
            onSelectionChange={(keys) => {
              const key = Array.from(keys)[0];
              setSelectedTemplateId(key ? Number(key) : null);
            }}
          >
            {templates.map((t) => (
              <SelectItem key={String(t.id)}>{t.template_name}</SelectItem>
            ))}
          </Select>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" color="danger" onPress={onClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={handleApplyTemplate}
            isDisabled={!selectedTemplateId || !employeeId}
          >
            Apply Template
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
