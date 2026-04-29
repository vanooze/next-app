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
  Select,
  SelectItem,
  SelectSection,
} from "@heroui/react";
import { DatePicker } from "@heroui/date-picker";
import { CalendarDate } from "@internationalized/date";
import { mutate } from "swr";
import { formatDatetoStr } from "@/helpers/formatDate";
import React, { useState, useEffect } from "react";
import { PlusIcon } from "@/components/icons/table/add-icon";
import { useUserContext } from "@/components/layout/UserContext";
import { selectStatus } from "@/helpers/data";

export const RequestMMC = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const targetRef = React.useRef(null);
  const { moveProps } = useDraggable({
    targetRef,
    canOverflow: true,
    isDisabled: !isOpen,
  });

  const { user } = useUserContext();

  const [project, setProject] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [personnel, setPersonnel] = useState<string>("");
  const [requestBy, setRequestBy] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [date, setDate] = useState<CalendarDate | null>(null);
  const [status, setStatus] = useState<string>("Pending");

  const [loading, setLoading] = useState(false);

  const handleSelectionChange = (keys: Set<string>) => {
    const selectedKey = Array.from(keys)[0];
    setPersonnel(selectedKey);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/x-rar-compressed",
      "application/octet-stream",
    ];

    const validFiles = selectedFiles.filter((file) =>
      allowedTypes.includes(file.type),
    );

    if (validFiles.length !== selectedFiles.length) {
      alert(
        "Some files were skipped. Only PDF, images, Word, Excel, or RAR are allowed.",
      );
    }

    setFiles(validFiles);
  };

  const handleAddTask = async (onClose: () => void) => {
    if (!project || !projectDesc || !requestBy) {
      alert("Please complete required fields.");
      setLoading(false);
      return;
    }
    setLoading(true);

    try {
      const dateStr = formatDatetoStr(date);
      const name = user?.name || "Unknown User";

      const formData = new FormData();
      formData.append("clientName", project);
      formData.append("projectDesc", projectDesc);
      formData.append("personnel", personnel);
      formData.append("salesPersonnel", requestBy);
      formData.append("status", status);
      formData.append("name", name);

      if (date) {
        formData.append("dateReceived", dateStr || "");
      }

      files.forEach((file) => {
        formData.append("files", file);
      });

      const res = await fetch("/api/department/ITDT/IT/tasks/create", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to create task");

      await mutate("/api/department/ITDT/IT/tasks");

      // reset
      setProject("");
      setProjectDesc("");
      setPersonnel("");
      setRequestBy("");
      setDate(null);
      setFiles([]); // ✅ clear files

      onClose();
    } catch (err) {
      console.error("Error creating task:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button onPress={onOpen} color="primary" endContent={<PlusIcon />}>
        Request to MMC
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
                Request to MMC
              </ModalHeader>

              <ModalBody className="grid grid-cols-2 gap-4">
                <Input
                  isRequired
                  label="Client Name"
                  variant="bordered"
                  value={project}
                  onValueChange={setProject}
                />
                <Input
                  isRequired
                  label="Project Description"
                  variant="bordered"
                  value={projectDesc}
                  onValueChange={setProjectDesc}
                />
                <Select
                  isRequired
                  label="Request By"
                  variant="bordered"
                  placeholder="Request By"
                  selectedKeys={requestBy ? new Set([requestBy]) : new Set()}
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0] as string;
                    setRequestBy(selectedKey);
                  }}
                >
                  <SelectItem key="BILLY">Billy Joel Topacio</SelectItem>
                  <SelectItem key="MARCIAL">Marcial A. Gigante III</SelectItem>
                  <SelectItem key="JAN">Jan Ronnell V. Camero</SelectItem>
                  <SelectItem key="JIL">Jilian Mark H. Ardinel</SelectItem>
                  <SelectItem key="JER">John Eden Ross V. Cola</SelectItem>
                </Select>

                <Select
                  isRequired
                  label="Personnel"
                  variant="bordered"
                  placeholder="Select a personnel"
                  selectedKeys={personnel ? new Set([personnel]) : new Set()}
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0] as string;
                    setPersonnel(selectedKey);
                  }}
                >
                  <SelectItem key="CJ">Charles Joseph R. Cabrera</SelectItem>
                  <SelectItem key="RHON">Rhon Pacleb</SelectItem>
                  <SelectItem key="JOHNNY">John Carlo F. Suarez</SelectItem>
                </Select>

                <DatePicker
                  label="Date Start"
                  variant="bordered"
                  value={date}
                  onChange={setDate}
                />
                <Select
                  isRequired
                  label="Status"
                  variant="bordered"
                  items={selectStatus}
                  selectedKeys={new Set([status])}
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0] as string;
                    setStatus(selectedKey);
                  }}
                >
                  {(item) => (
                    <SelectItem key={item.key}>{item.label}</SelectItem>
                  )}
                </Select>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Upload Files (PDF, Image, Word, Excel, or RAR)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx,.rar"
                    onChange={handleFileChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                    multiple
                  />
                  {files.length > 0 && (
                    <ul className="mt-2 list-disc pl-5 text-sm text-gray-700">
                      {files.map((file, idx) => (
                        <li key={idx}>{file.name}</li>
                      ))}
                    </ul>
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
                  {loading ? "Adding..." : "Add Task"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};
