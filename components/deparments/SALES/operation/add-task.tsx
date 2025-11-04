import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
  useDraggable,
} from "@heroui/react";
import { DatePicker } from "@heroui/date-picker";
import { CalendarDate } from "@internationalized/date";
import { Select, SelectItem } from "@heroui/select";
import { mutate } from "swr";
import { formatDatetoStr } from "@/helpers/formatDate";
import React, { useState, useEffect } from "react";
import { PlusIcon } from "@/components/icons/table/add-icon";
import { selectStatus } from "@/helpers/data";
import { useUserContext } from "@/components/layout/UserContext";

export const AddTask = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const targetRef = React.useRef(null);
  const { moveProps } = useDraggable({
    targetRef,
    canOverflow: true,
    isDisabled: !isOpen,
  });

  const { user } = useUserContext();

  const [clientName, setClientName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [salesPersonnel, setSalesPersonnel] = useState("");
  const [dateReceived, setDateReceived] = useState<CalendarDate | null>(null);
  const [status, setStatus] = useState("");
  const [filteredStatus, setFilteredStatus] = useState(selectStatus);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const username = user?.email;
  const password = user?.acu_password;

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      alert("Only PDF and image files are allowed!");
      return;
    }

    setFile(selectedFile);

    // Preview for images
    if (selectedFile.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleAddTask = async (onClose: () => void) => {
    setLoading(true);
    try {
      const dateReceivedStr = formatDatetoStr(dateReceived);
      const name = user?.name || "Unknown User";

      // Prepare form data for file + fields
      const formData = new FormData();
      formData.append("clientName", clientName);
      formData.append("projectDesc", projectDesc);
      formData.append("salesPersonnel", salesPersonnel);
      if (dateReceived) {
        formData.append(
          "dateReceived",
          formatDatetoStr(dateReceived) || "null"
        );
      }
      formData.append("status", status);
      formData.append("username", username || "");
      formData.append("password", password || "");
      formData.append("name", name);

      if (file) {
        formData.append("file", file);
        formData.append("attachment_name", file.name);
        formData.append("attachment_type", file.type);
      } else {
        formData.append("attachment_name", "");
        formData.append("attachment_type", "");
      }

      const res = await fetch("/api/department/ITDT/DT/tasks/create", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to create task");

      await mutate("/api/department/ITDT/DT/tasks");

      // Reset form
      setClientName("");
      setProjectDesc("");
      setSalesPersonnel("");
      setDateReceived(null);
      setStatus("");
      setFile(null);
      setPreviewUrl(null);
      onClose();
    } catch (err) {
      console.error("Error creating task:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!dateReceived) {
      setFilteredStatus(
        selectStatus.filter(
          (item) =>
            item.label === "Pending" ||
            item.label === "Priority" ||
            item.label === "OnHold"
        )
      );
      return;
    }

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const receivedDate = dateReceived.toDate(timeZone);
    const now = new Date();
    const diffDays =
      (now.getTime() - receivedDate.getTime()) / (1000 * 3600 * 24);

    if (diffDays > 3) {
      setStatus("Overdue");
      setFilteredStatus(
        selectStatus.filter(
          (item) =>
            item.label === "Overdue" ||
            item.label === "Priority" ||
            item.label === "OnHold"
        )
      );
    } else {
      setStatus("Pending");
      setFilteredStatus(
        selectStatus.filter(
          (item) =>
            item.label === "Pending" ||
            item.label === "Priority" ||
            item.label === "OnHold"
        )
      );
    }
  }, [dateReceived]);

  return (
    <div>
      <Button onPress={onOpen} color="primary" endContent={<PlusIcon />}>
        Add Project
      </Button>

      <Modal
        ref={targetRef}
        isOpen={isOpen}
        size="xl"
        onOpenChange={onOpenChange}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader
                {...moveProps}
                className="w-full flex flex-col gap-4"
              >
                Add Task
              </ModalHeader>

              <ModalBody className="grid grid-cols-2 gap-4">
                <Input
                  isRequired
                  label="Client Name"
                  variant="bordered"
                  value={clientName}
                  onValueChange={setClientName}
                />
                <Input
                  isRequired
                  label="Project Description"
                  variant="bordered"
                  value={projectDesc}
                  onValueChange={setProjectDesc}
                />
                <Input
                  isRequired
                  label="Sales Personnel"
                  variant="bordered"
                  value={salesPersonnel}
                  onValueChange={setSalesPersonnel}
                />
                <DatePicker
                  label="Date Received"
                  variant="bordered"
                  value={dateReceived}
                  onChange={setDateReceived}
                />
                <Select
                  isRequired
                  items={filteredStatus}
                  label="Status"
                  placeholder="Select a status"
                  variant="bordered"
                  selectedKeys={[status]}
                  onSelectionChange={(keys) =>
                    setStatus(Array.from(keys)[0] as string)
                  }
                >
                  {(item) => (
                    <SelectItem key={item.label}>{item.label}</SelectItem>
                  )}
                </Select>

                {/* File Upload Section */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Upload File (PDF or Image)
                  </label>
                  <input
                    type="file"
                    accept=".pdf, image/png, image/jpeg"
                    onChange={handleFileChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                  />
                  {previewUrl && (
                    <div className="mt-2">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-h-48 rounded-lg border"
                      />
                    </div>
                  )}
                </div>
              </ModalBody>

              <ModalFooter>
                <Button
                  color="danger"
                  variant="flat"
                  onClick={onClose}
                  isDisabled={loading}
                >
                  Close
                </Button>
                <Button
                  color="primary"
                  onClick={() => handleAddTask(onClose)}
                  isLoading={loading}
                  isDisabled={loading}
                >
                  {loading ? "Adding..." : "Add Project"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};
