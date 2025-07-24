"use client";
import { Button, Input, Tooltip } from "@heroui/react";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import { fetcher } from "@/app/lib/fetcher";
import { HouseIcon } from "@/components/icons/breadcrumb/house-icon";
import { UsersIcon } from "@/components/icons/breadcrumb/users-icon";
import { TableWrapper } from "@/components/deparments/DT/tasks/table/table";
import { useUserContext } from "../../../layout/UserContext";
import { dtTask } from "../../../../helpers/db";
import { AddTask } from "./operation/add-task";
import { SearchIcon } from "../../../icons/searchicon";
import { EyeIcon } from "../../../icons/table/eye-icon";

export const Tasks = () => {
  const { user } = useUserContext();
  const [filterValue, setFilterValue] = useState("");
  const [debouncedFilterValue, setDebouncedFilterValue] = useState(filterValue);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const {
    data: tasks = [],
    error,
    isLoading,
  } = useSWR<dtTask[]>("/api/department/ITDT/DT/tasks", fetcher, {
    refreshInterval: 120000, // every 120 seconds
    revalidateOnFocus: true, // optional but useful
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilterValue(filterValue);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [filterValue]);

  const filteredTasks = debouncedFilterValue
    ? tasks.filter((task) => {
        const query = debouncedFilterValue.toLowerCase();
        return (
          task.clientName?.toLowerCase().includes(query) ||
          task.salesPersonnel?.toLowerCase().includes(query)
        );
      })
    : tasks;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullScreen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div className="my-10 px-4 lg:px-6 max-w-[95rem] mx-auto w-full flex flex-col gap-4">
      <ul className="flex">
        <li className="flex gap-2">
          <HouseIcon />
          <Link href={"/"}>
            <span>Home</span>
          </Link>
          <span> / </span>{" "}
        </li>

        <li className="flex gap-2">
          <UsersIcon />
          <span>Task</span>
          <span> / </span>{" "}
        </li>
        <li className="flex gap-2">
          <span>List</span>
        </li>
      </ul>

      <h3 className="text-xl font-semibold">All Tasks</h3>
      <div className="flex justify-between flex-wrap gap-4 items-center">
        <div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
          <Input
            isClearable
            startContent={<SearchIcon />}
            classNames={{
              input: "w-full",
              mainWrapper: "w-full",
            }}
            placeholder="Search Client/Sales Name"
            value={filterValue}
            onValueChange={setFilterValue}
          />
          <div className="flex items-center ">
            <Tooltip content="View in fullscreen" color="secondary">
              <button onClick={() => setIsFullScreen((prev) => !prev)}>
                <EyeIcon size={20} fill="#979797" />
              </button>
            </Tooltip>
          </div>
        </div>
        <div className="flex flex-row gap-3.5 flex-wrap">
          <AddTask />
          {/* <AddReport /> */}
        </div>
      </div>
      <div
        className={`${
          isFullScreen
            ? "fixed inset-0 z-[9999] bg-default p-4 overflow-auto shadow-xl rounded-none"
            : "max-w-[95rem] mx-auto w-full"
        } transition-all duration-300`}
      >
        <TableWrapper
          tasks={filteredTasks}
          loading={isLoading}
          fullScreen={isFullScreen}
        />
      </div>
    </div>
  );
};
