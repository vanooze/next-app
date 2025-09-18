"use client";

import React, { useState, useEffect } from "react";
import { Card, CardBody, CardFooter, Input, Button } from "@heroui/react";
import { Projects } from "@/helpers/acumatica";
import { useUserContext } from "@/components/layout/UserContext";

interface MessageProps {
  project: Projects | null;
}

export const NotesPage = ({ project }: MessageProps) => {
  const { user } = useUserContext();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (project) {
      setProjectId(project.projectId);
    }
  }, [project]);

  const fetchMessage = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/department/PMO/messageBoard?projectId=${projectId}`
      );
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessage();
  }, [projectId]);

  const handleAddMessage = async () => {
    if (!input.trim() || !projectId) return;

    try {
      await fetch("/api/department/PMO/messageBoard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          message: input,
        }),
      });
      setInput("");
      fetchMessage();
    } catch (err) {
      console.error("Failed to add message:", err);
    }
  };

  const userDocumentController = user?.designation?.includes(
    "DOCUMENT CONTROLLER"
  );

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-black">
      {/* Header / Input */}
      {userDocumentController && (
        <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-black sticky top-0 z-10">
          <div className="max-w-2xl mx-auto flex items-center gap-2 p-4">
            <Input
              fullWidth
              placeholder="Write a note..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1"
              classNames={{
                input: "text-gray-900 dark:text-gray-100",
                inputWrapper:
                  "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
              }}
            />
            <Button
              onPress={handleAddMessage}
              color="primary"
              isDisabled={!input.trim()}
            >
              Add
            </Button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {loading ? (
            <p className="text-center text-gray-600 dark:text-gray-400">
              Loading messages...
            </p>
          ) : messages.length === 0 ? (
            <Card
              shadow="sm"
              radius="lg"
              className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              <CardBody>
                <p className="text-center text-gray-600 dark:text-gray-400">
                  No messages yet.
                </p>
              </CardBody>
            </Card>
          ) : (
            messages.map((message) => (
              <Card
                key={message.id}
                shadow="sm"
                radius="lg"
                className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              >
                <CardBody>
                  <p className="text-sm text-gray-800 dark:text-gray-200">
                    {message.message}
                  </p>
                </CardBody>
                <CardFooter className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(message.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
