import React, { useEffect, useState } from "react";
import { ProjectTask } from "@/helpers/db";
import { formatDatetoStr } from "@/helpers/formatDate";
import {
  Button,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Code,
  Textarea,
  Card,
  ScrollShadow,
} from "@heroui/react";
import {
  CalendarDate,
  getLocalTimeZone,
  today,
  parseDate,
} from "@internationalized/date";
import { DropZone, DropItem, FileTrigger } from "react-aria-components";
import { Provider } from "react-aria-components";
import useSWR, { mutate } from "swr";
import { useUserContext } from "@/components/layout/UserContext";

interface EditTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: ProjectTask | null;
  project: string;
}

export const EditTaskModal = ({
  isOpen,
  onClose,
  task,
  project,
}: EditTasksModalProps) => {
  const { user, loading } = useUserContext();
  const [taskId, setTaskId] = useState(task?.taskKey ?? "");
  const [taskTodo, setTasksTodo] = useState(task?.taskTodo ?? "");
  const [dateStart, setDateStart] = useState<CalendarDate | null>(null);
  const [dateEnd, setDateEnd] = useState<CalendarDate | null>(null);
  const [dateFilled, setDatefilled] = useState<CalendarDate | null>(null);
  const [notes, setNotes] = useState(task?.notes ?? "");
  //  ------------ TASK MESSAGE ------------
  const [message, setMessage] = useState<string>("");
  const [status, setStatus] = useState<string>("1");
  // ------------ TASK ATTACHEMENT ------------
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  let defaultDate = today(getLocalTimeZone());

  const pad = (n: number) => n.toString().padStart(2, "0");
  const now = new Date();
  const fetcher = (url: string) => fetch(url).then((res) => res.json());

  const safeParseDate = (input: string): CalendarDate => {
    const isoString = normalizeToISO(input);
    return parseDate(isoString);
  };
  const normalizeToISO = (input: string): string => {
    if (!input) return "";

    const cleanDate = input.split("T")[0].split(" ")[0];
    const parts = cleanDate.split(/[-\/]/);
    if (parts.length !== 3) return input;
    if (Number(parts[0]) > 31 || Number(parts[1]) > 12) {
      return cleanDate;
    }
    if (
      Number(parts[0]) <= 12 &&
      Number(parts[1]) <= 31 &&
      Number(parts[2]) > 31
    ) {
      const [month, day, year] = parts;
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
    if (
      Number(parts[1]) <= 12 &&
      Number(parts[0]) <= 31 &&
      Number(parts[2]) > 31
    ) {
      const [day, month, year] = parts;
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }

    return cleanDate;
  };
  const dateSentStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
    now.getDate()
  )} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const { data, mutate: mutateReplies } = useSWR(
    task ? `/api/department/PMO/project_tasks/message?taskId=${taskId}` : null,
    fetcher
  );
  const replies: any[] = Array.isArray(data) ? data : [];
  const formatToDateTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    const pad = (n: number) => n.toString().padStart(2, "0");

    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const min = pad(date.getMinutes());

    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
  };

  const handleAddMessage = async (onClose: () => void) => {
    const payload = {
      taskKey: taskId,
      userKey: user?.name ?? "",
      message,
      status,
      date: dateSentStr,
    };

    try {
      const res = await fetch(
        "/api/department/PMO/project_tasks/create/message",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to create a Message");
      }

      const data = await res.json();

      await mutateReplies();
    } catch (err) {
      console.error("Create Message Error:", err);
    }
  };
  useEffect(() => {
    if (task) {
      setTaskId(task.taskKey);
      setTasksTodo(task.taskTodo);
      setNotes(task.notes);
      setDateStart(
        typeof task.dateStart === "string"
          ? safeParseDate(task.dateStart)
          : task.dateStart ?? null
      );
      setDateEnd(
        typeof task.dateEnd === "string"
          ? safeParseDate(task.dateEnd)
          : task.dateEnd ?? null
      );
      setDatefilled(
        typeof task.dateFilled === "string"
          ? safeParseDate(task.dateFilled)
          : task.dateFilled ?? null
      );
    }
  }, [task]);

  const handleDrop = async (e: { items: DropItem[] }) => {
    const newFiles: File[] = [];

    for (const item of e.items) {
      if (item.kind === "file") {
        const file = await item.getFile();
        newFiles.push(file);
      }
    }

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const uploadFiles = async () => {
    setIsUploading(true);

    const attachDate = new Date().toISOString().slice(0, 19).replace("T", " ");
    const status = "1";

    for (const file of files) {
      const formData = {
        taskKey: taskId,
        userKey: user?.name ?? "",
        attachName: file.name,
        attachType: file.type,
        status,
        attachDate,
        projectName: project,
      };

      await fetch("/api/department/PMO/project_tasks/create/attachment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
    }

    setIsUploading(false);
    setFiles([]);
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="5xl">
      <ModalContent>
        <ModalHeader className="grid grid-cols-4 gap-1">
          <span className="col-span-4">{taskTodo}</span>
          <span className="col-span-4">
            {dateStart ? formatDatetoStr(dateStart) : null} :{" "}
            {dateEnd ? formatDatetoStr(dateEnd) : null}
          </span>
          <Code size="sm">{notes}</Code>
        </ModalHeader>
        <ModalBody className="grid grid-cols-2 gap-4">
          <div>
            <Textarea
              className="max-w-lg"
              label="Task Details"
              placeholder="Enter the details here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button
              color="primary"
              className="my-4"
              onPress={() => handleAddMessage(onClose)}
            >
              Send
            </Button>
            <Divider />
            <ScrollShadow hideScrollBar className="w-full max-h-96">
              {replies.length === 0 ? (
                <Card className="mt-4 p-4">
                  <p className="text-sm text-default-500">No replies yet.</p>
                </Card>
              ) : (
                replies.map((reply, index) => (
                  <Card key={index} className="mt-4 p-4">
                    <div className="text-sm font-semibold text-default-800">
                      {reply.userKey}
                    </div>
                    <div className="text-sm text-default-700 mt-1">
                      {reply.message}
                    </div>
                    <div className="text-xs text-default-400 mt-2">
                      {reply.date ? formatToDateTime(reply.date) : "No date"}
                    </div>
                  </Card>
                ))
              )}
            </ScrollShadow>
          </div>
          <div className="flex gap-4">
            <Divider orientation="vertical" />
            <div className="border border-dashed rounded p-4 mt-4">
              <DropZone
                onDrop={handleDrop}
                className="p-6 border border-gray-300 rounded text-center"
              >
                <p className="text-sm text-gray-600">Drag & drop files here</p>
                <FileTrigger
                  allowsMultiple
                  acceptedFileTypes={[
                    "image/png",
                    "application/pdf",
                    "image/jpeg",
                    "text/csv",
                  ]}
                  onSelect={(files) => {
                    if (files) {
                      setFiles((prev) => [...prev, ...Array.from(files)]);
                    }
                  }}
                ></FileTrigger>
              </DropZone>

              {files.length > 0 && (
                <div className="mt-4 space-y-1">
                  <p className="font-semibold text-sm">Files to Upload:</p>
                  {files.map((file, i) => (
                    <div key={i} className="text-sm text-gray-700">
                      {file.name}
                    </div>
                  ))}

                  <Button
                    onClick={uploadFiles}
                    disabled={isUploading}
                    className="mt-2 px-4 py-1 bg-blue-600 text-white rounded disabled:opacity-50"
                  >
                    {isUploading ? "Uploading..." : "Upload Files"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
