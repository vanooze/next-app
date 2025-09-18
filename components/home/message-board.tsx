"use client";

import React from "react";
import useSWR from "swr";
import Link from "next/link";
import { Card, CardBody, Spinner } from "@heroui/react";

interface Message {
  id: number;
  projectId: string;
  message: string;
  date: string;
  projectDescription: string | null;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const AllMessages = ({ maxHeight = 425 }: { maxHeight?: number }) => {
  const { data, error, isLoading } = useSWR<Message[]>(
    "/api/department/PMO/messageBoard/getAll",
    fetcher,
    { refreshInterval: 10000 } // optional: auto refresh every 10s
  );

  if (isLoading) {
    return (
      <Card className="w-full shadow-lg rounded-2xl h-full">
        <CardBody className="flex items-center justify-center h-40">
          <Spinner label="Loading messages..." />
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full shadow-lg rounded-2xl h-full">
        <CardBody className="p-6 text-center text-red-500">
          Failed to load messages
        </CardBody>
      </Card>
    );
  }

  const messages = Array.isArray(data) ? data : [];

  return (
    <Card className="w-full shadow-lg rounded-2xl h-full">
      <CardBody
        className="p-6 overflow-y-auto"
        style={{ maxHeight: `${maxHeight}px` }}
      >
        {messages.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">No messages found.</p>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <Link
                key={msg.id}
                href="http://localhost:3000/project/message_board"
                className="block"
              >
                <div
                  className="w-full p-4 border rounded-lg shadow-sm 
                             bg-white dark:bg-gray-800 
                             hover:bg-gray-50 dark:hover:bg-gray-700 
                             transition-colors cursor-pointer"
                >
                  <p className="text-gray-800 dark:text-gray-200">
                    {msg.message}
                  </p>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 flex justify-between">
                    <span>
                      {msg.projectDescription || "No project description"}
                    </span>
                    <span>{new Date(msg.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default AllMessages;
