"use client";

import React, { useState, useEffect } from "react";
import { Input, Button, Listbox, ListboxItem } from "@heroui/react";
import { Projects } from "@/helpers/acumatica";
import { useUserContext } from "@/components/layout/UserContext";

interface PostProjectProps {
  project: Projects | null;
}
export default function PostProjectReview({ project }: PostProjectProps) {
  const [inputValue, setInputValue] = useState("");
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  const { user } = useUserContext();

  useEffect(() => {
    if (project) {
      setProjectId(project.projectId);
    }
  }, [project]);

  const canEdit = user?.designation.includes("DOCUMENT CONTROLLER");

  const fetchReviews = async () => {
    if (!projectId) return;
    setLoading(true);
    const res = await fetch(
      `/api/department/PMO/project_tasks/postProject/post_project_review?projectId=${projectId}`
    );
    const data = await res.json();
    setReviews(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, [projectId]);

  const handleSubmit = async () => {
    console.log("Submit pressed", inputValue, projectId);
    if (!inputValue.trim() || !projectId) return;

    await fetch(
      "/api/department/PMO/project_tasks/postProject/post_project_review",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          list: inputValue,
        }),
      }
    );

    setInputValue("");
    fetchReviews();
  };

  return (
    <div className="p-4 border rounded-md space-y-4">
      {canEdit && (
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter a new review note..."
          />
          <Button onPress={handleSubmit} color="primary">
            Add
          </Button>
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : reviews.length > 0 ? (
        <Listbox aria-label="Post Project Review List">
          {reviews.map((r) => (
            <ListboxItem key={r.id}>{r.list}</ListboxItem>
          ))}
        </Listbox>
      ) : (
        <p className="text-gray-500">No reviews yet.</p>
      )}
    </div>
  );
}
