"use client";

import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Divider,
  useDisclosure,
  useDraggable,
  Card,
  CardHeader,
  CardFooter,
  Image,
} from "@heroui/react";
import { DatePicker } from "@heroui/date-picker";
import {
  CalendarDate,
  getLocalTimeZone,
  today,
  parseDate,
} from "@internationalized/date";
import React, { useState, useEffect, useRef } from "react";
import { PlusIcon } from "@/components/icons/table/add-icon";
import { Projects } from "@/helpers/acumatica";
import { formatDatetoStr } from "@/helpers/formatDate";
import useSWR from "swr";
import { useUserContext } from "@/components/layout/UserContext";

interface ContractorsProp {
  project: Projects | null;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const data = await res.json();
  return Array.isArray(data) ? data : [data];
};

export default function Contractors({ project }: ContractorsProp) {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<CalendarDate | null>(null);
  const [endDate, setEndDate] = useState<CalendarDate | null>(null);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const { user } = useUserContext();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const targetRef = useRef(null);

  const { moveProps } = useDraggable({
    targetRef,
    canOverflow: true,
    isDisabled: !isOpen,
  });

  const safeParseDate = (input: string): CalendarDate => {
    const datePart = input.split("T")[0];
    return parseDate(datePart);
  };

  const key = projectId
    ? `/api/department/PMO/project_tasks/projectkickoff/bidding?id=${projectId}`
    : null;

  const { data: uploadedFiles = [], mutate } = useSWR(key, fetcher);

  useEffect(() => {
    if (project) setProjectId(project.projectId);

    const latest = uploadedFiles?.[0];
    if (latest?.token) {
      const token = latest.token;
      const link = `${window.location.origin}/contract/upload/${token}`;
      setGeneratedLink(link);
    }

    if (latest) {
      setStartDate(
        typeof latest.startDate === "string"
          ? safeParseDate(latest.startDate)
          : latest.startDate ?? null
      );
      setEndDate(
        typeof latest.endDate === "string"
          ? safeParseDate(latest.endDate)
          : latest.endDate ?? null
      );
    }
  }, [project, uploadedFiles]);

  const handleGenerateLink = async (onClose: () => void) => {
    if (!startDate || !endDate || !projectId) return;

    const payload = {
      projectId,
      startDate: formatDatetoStr(startDate),
      endDate: formatDatetoStr(endDate),
      createdAt: formatDatetoStr(today(getLocalTimeZone())),
    };

    const res = await fetch(
      "/api/department/PMO/project_tasks/projectkickoff/bidding/create",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (res.ok) {
      const { token } = await res.json();
      const uploadLink = `${window.location.origin}/contract/upload/${token}`;
      setGeneratedLink(uploadLink);
      await navigator.clipboard.writeText(uploadLink);
      alert("Link copied to clipboard!");
      onClose();
      mutate();
    } else {
      alert("Failed to generate upload link");
    }
  };

  return (
    <>
      <Button onPress={onOpen} color="primary" endContent={<PlusIcon />}>
        Generate Link
      </Button>

      {generatedLink && (
        <p className="mt-2 text-sm text-blue-600 underline break-words">
          <strong>Generated Link:</strong>{" "}
          <a href={generatedLink} target="_blank" rel="noopener noreferrer">
            {generatedLink}
          </a>
        </p>
      )}

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
              <ModalHeader {...moveProps} className="flex flex-col gap-4">
                Generate Upload Link
              </ModalHeader>
              <ModalBody className="grid grid-cols-2 gap-4">
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={setStartDate}
                  variant="bordered"
                />
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={setEndDate}
                  variant="bordered"
                />
              </ModalBody>
              <ModalFooter>
                <Button
                  color="primary"
                  onClick={() => handleGenerateLink(onClose)}
                >
                  Generate Link
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Divider className="my-6" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {uploadedFiles.length > 0 ? (
          <>
            <div className="col-span-full text-center mb-4">
              {uploadedFiles[0]?.startDate && uploadedFiles[0]?.endDate ? (
                <p className="text-sm text-gray-700 font-medium">
                  Set date: {uploadedFiles[0].startDate} -{" "}
                  {uploadedFiles[0].endDate}
                </p>
              ) : (
                <p className="text-sm text-gray-500 italic">No set date</p>
              )}
              {uploadedFiles.some((file: any) => !!file.attachmentName) ? (
                <p className="text-sm text-gray-700">File has attachment</p>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  No file uploaded yet.
                </p>
              )}
            </div>

            {uploadedFiles.map((file: any, idx: number) => {
              if (!file.attachmentName) return null;

              const previewUrl = `/uploads/${file.projectId}/kickoff/${file.attachmentName}`;
              const isLocked =
                file.status === "Open" || file.status === "Close";
              const hasAccess =
                user?.designation.includes("PMO TL") ||
                user?.name === "Hereld Jean Jivi Aguyaoy";
              const isImage = [
                "image/png",
                "image/jpeg",
                "image/jpg",
                "image/webp",
                "image/gif",
              ].includes(file.attachmentType);

              return (
                <Card
                  key={idx}
                  isFooterBlurred
                  className={`relative h-[300px] w-full overflow-hidden ${
                    isLocked && hasAccess
                      ? "opacity-60 pointer-events-none"
                      : ""
                  }`}
                >
                  {isImage && (
                    <Image
                      alt="Preview"
                      src={previewUrl}
                      className={`absolute inset-0 w-full h-full object-cover ${
                        isLocked ? "blur-md grayscale" : ""
                      }`}
                    />
                  )}
                  <div className="absolute inset-0 bg-black/5 z-0" />
                  <CardHeader className="absolute z-10 flex-col items-start bg-black/40">
                    <h4 className="text-white font-semibold text-md break-words max-w-[90%]">
                      {file.attachmentName}
                    </h4>
                  </CardHeader>
                  <CardFooter className="absolute bg-white/30 backdrop-blur-sm bottom-0 border-t border-white/30 z-10 justify-between p-2">
                    {!isLocked && hasAccess && (
                      <a
                        href={previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          className="text-tiny"
                          color="primary"
                          radius="full"
                          size="sm"
                        >
                          View File
                        </Button>
                      </a>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </>
        ) : (
          <p className="col-span-full text-center text-sm text-gray-500 italic">
            No files uploaded yet.
          </p>
        )}
      </div>
    </>
  );
}
