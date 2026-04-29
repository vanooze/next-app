import React, { useState, useEffect, useCallback } from "react";
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
  kraType?: "employee" | "department" | "hr";
}

export const KRATemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  employeeId,
  userDepartment,
  kraType = "employee",
}) => {
  const [templates, setTemplates] = useState<
    { id: number; template_name: string }[]
  >([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
    null,
  );

  const getTemplateEndpoint = useCallback((id?: number) => {
    switch (kraType) {
      case "department":
        return id ? `/api/kra/dept/template/${id}` : `/api/kra/dept/template`;

      case "hr":
        return id ? `/api/kra/hr/template/${id}` : `/api/kra/hr/template`;

      default:
        return id ? `/api/kra/template/${id}` : `/api/kra/template`;
    }
  }, [kraType]);

  // Fetch templates when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchTemplates = async () => {
      try {
        let url = getTemplateEndpoint();

        // optional query params
        if (kraType === "employee" && userDepartment) {
          url += `?department=${userDepartment}`;
        }

        if (kraType === "department" && userDepartment) {
          url += `?department=${userDepartment}`;
        }

        const res = await fetch(url);

        if (!res.ok) throw new Error("Failed to fetch templates");

        const data = await res.json();
        setTemplates(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchTemplates();
  }, [isOpen, userDepartment, kraType, getTemplateEndpoint]);

  useEffect(() => {
    if (isOpen) setSelectedTemplateId(null);
  }, [isOpen]);

  const handleApplyTemplate = async () => {
    if (!selectedTemplateId || !employeeId) return;

    try {
      const res = await fetch(getTemplateEndpoint(selectedTemplateId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId,
          department: userDepartment,
        }),
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
