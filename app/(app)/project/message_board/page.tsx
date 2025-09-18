"use client";

import React, { useEffect, useState } from "react";
import { Spinner } from "@heroui/react";

interface Message {
  id: number;
  projectId: string;
  message: string;
  date: string;
  projectDescription: string | null;
}

export const AllMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch("/api/department/PMO/messageBoard/getAll");
        if (!res.ok) throw new Error("Failed to fetch messages");
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching messages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center h-64">
        <Spinner label="Loading messages..." />
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        Message Board
      </h1>

      {messages.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">No messages found.</p>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="w-full p-4 border rounded-lg shadow-sm 
                         bg-white dark:bg-gray-800 
                         border-gray-200 dark:border-gray-700"
            >
              <p className="text-gray-800 dark:text-gray-200">{msg.message}</p>
              <div className="text-sm mt-2 flex justify-between text-gray-500 dark:text-gray-400">
                <span>
                  {msg.projectDescription || "No project description"}
                </span>
                <span>{new Date(msg.date).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllMessages;
