"use client";

import React, { useEffect, useState } from "react";
import {
  Textarea,
  Button,
  Divider,
  Card,
  CardHeader,
  CardFooter,
  Image,
  Spinner,
} from "@heroui/react";
import useSWR from "swr";
import { DropZone, DropItem, FileTrigger } from "react-aria-components";
import { Projects } from "@/helpers/acumatica";
import { useUserContext } from "@/components/layout/UserContext";

interface BOQProps {
  project: Projects | null;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const data = await res.json();
  return Array.isArray(data) ? data : [data]; // Ensure array format
};

export default function BOQ({ project }: BOQProps) {
  const { user } = useUserContext();
  const [projectId, setProjectId] = useState<string | null>("");
  const [assignedPersonnel, setassignedPersonnel] = useState(user?.name);
  const [PODetails, setPODetails] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  useEffect(() => {
    if (project) {
      setProjectId(project.projectId);
    }
  }, [project]);

  const canUpload =
    user?.name === "Kaye Kimberly L. Manuel" ||
    user?.designation.includes("DOCUMENT CONTROLLER");

  const key = projectId
    ? `/api/department/PMO/project_tasks/projectkickoff/boq?id=${projectId}`
    : null;

  const {
    data: uploadedFiles = [],
    error,
    isLoading,
    mutate,
  } = useSWR(key, fetcher);

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

  const submitForm = async () => {
    if (!projectId) return alert("No project selected");
    if (files.length === 0) return alert("Please upload at least one file.");

    setIsUploading(true);
    const attachDate = new Date().toISOString().slice(0, 19).replace("T", " ");
    const status = "1";
    const type = "2";

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("projectId", projectId.toString());
        formData.append("assignedPersonnel", assignedPersonnel || "null");
        formData.append("description", PODetails || "null");
        formData.append("status", status);
        formData.append("attachDate", attachDate);
        formData.append("type", type);
        formData.append("file", file);

        const res = await fetch(
          "/api/department/PMO/project_tasks/projectkickoff/boq/create",
          {
            method: "POST",
            body: formData,
          }
        );

        const result = await res.json();
        if (!res.ok || !result?.file) throw new Error("Upload failed");

        const webhookFormData = new FormData();
        webhookFormData.append("projectId", projectId.toString());
        webhookFormData.append(
          "assignedPersonnel",
          assignedPersonnel || "null"
        );
        webhookFormData.append("description", PODetails || "null");
        webhookFormData.append("status", status);
        webhookFormData.append("attachDate", attachDate);
        webhookFormData.append("fileType", file.type);
        webhookFormData.append("type", type);
        webhookFormData.append("file", file);

        await fetch(
          "http://localhost:5678/webhook-test/75d91fd6-cbca-432e-b115-935e48ce8461",
          {
            method: "POST",
            body: webhookFormData,
          }
        );
      }

      // Reset form
      setFiles([]);
      setPODetails("");
      alert("Submitted successfully!");
      mutate();
    } catch (err) {
      console.error("Submit error:", err);
      alert("Submit failed. Try again.");
    }

    setIsUploading(false);
  };

  return (
    <div className="flex w-full flex-col md:flex-nowrap gap-4">
      {canUpload && (
        <>
          <h1 className="text-lg font-semibold">Signed BOQ Details</h1>
          <Textarea
            className="max-w-lg"
            label="Signed BOQ Details"
            placeholder="Enter the details here..."
            value={PODetails}
            onChange={(e) => setPODetails(e.target.value)}
          />

          <h1 className="text-lg font-semibold">Signed BOQ Attachment</h1>
          <p className="text-sm text-gray-500 dark:text-gray-300 italic">
            Upload Excel first for data Extracting, then upload the PDF for
            documentation and version control
          </p>
          <div className="border border-dashed rounded max-w-lg">
            <DropZone
              onDrop={handleDrop}
              className="p-6 border border-gray-300 rounded text-center"
            >
              <p className="text-sm text-gray-600">Drag & drop files here</p>
              <FileTrigger
                allowsMultiple
                acceptedFileTypes={[
                  "image/png",
                  "image/jpeg",
                  "application/pdf",
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
              <div className="mt-4 space-y-2">
                <p className="font-semibold text-sm">Files to Upload:</p>
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-100 px-3 py-1 rounded"
                  >
                    <span className="text-sm text-gray-700 truncate">
                      {file.name}
                    </span>
                    <button
                      onClick={() =>
                        setFiles((prev) => prev.filter((_, i) => i !== index))
                      }
                      className="text-red-500 hover:text-red-700 text-sm ml-2"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button
            color="primary"
            className="max-w-lg"
            isDisabled={isUploading}
            onPress={submitForm}
          >
            {isUploading ? "Uploading..." : "Submit"}
          </Button>
        </>
      )}
      <Divider />

      {isLoading && (
        <Spinner
          classNames={{ label: "text-foreground mt-4" }}
          label="loading files..."
          variant="dots"
        />
      )}
      {error && (
        <p className="text-sm text-red-500">Failed to load uploaded files.</p>
      )}

      {/* Uploaded Files Preview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {uploadedFiles.map((file: any, idx: number) => {
          if (!file.attachmentName) return null;
          const isImage = [
            "image/png",
            "image/jpeg",
            "image/jpg",
            "image/webp",
            "image/gif",
          ].includes(file.attachmentType);
          const previewUrl = `/uploads/${file.projectId}/kickoff/${file.attachmentName}`;

          const isExcel =
            file.attachmentName?.toLowerCase().endsWith(".xlsx") ||
            file.attachmentName?.toLowerCase().endsWith(".xls");

          if (isExcel) return null;

          return (
            <Card
              key={idx}
              isFooterBlurred
              className="relative h-[300px] w-full overflow-hidden"
            >
              <Image
                removeWrapper
                alt="File preview"
                className="absolute inset-0 z-0 w-full h-full object-cover"
                src={isImage ? previewUrl : ""}
              />
              <div className="absolute inset-0 bg-black/5 z-0" />
              <CardHeader className="absolute z-10 flex-col items-start bg-black/40">
                <h4 className="text-white font-semibold text-md break-words max-w-[90%]">
                  {file.attachmentName}
                </h4>
              </CardHeader>
              <CardFooter className="absolute bg-white/30 backdrop-blur-sm bottom-0 border-t border-white/30 z-10 justify-between p-2">
                <div>
                  <p className="text-black text-tiny">
                    {file.description &&
                    file.description.toLowerCase() !== "null" ? (
                      <>
                        {file.description}
                        {file.assignedPersonnel &&
                          file.assignedPersonnel.toLowerCase() !== "null" && (
                            <span className="ml-1 italic text-gray-500">
                              — {file.assignedPersonnel}
                            </span>
                          )}
                      </>
                    ) : (
                      <>
                        <span className="italic">No description</span>
                        {file.assignedPersonnel &&
                          file.assignedPersonnel.toLowerCase() !== "null" && (
                            <span className="ml-1 italic text-gray-500">
                              — {file.assignedPersonnel}
                            </span>
                          )}
                      </>
                    )}
                  </p>
                </div>
                <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                  <Button
                    className="text-tiny"
                    color="primary"
                    radius="full"
                    size="sm"
                  >
                    View File
                  </Button>
                </a>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
