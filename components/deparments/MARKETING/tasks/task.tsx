"use client";
import {
  Button,
  Input,
  Tooltip,
  Modal,
  ModalBody,
  ModalHeader,
  ModalContent,
} from "@heroui/react";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import useSWR from "swr";
import { fetcher } from "@/app/lib/fetcher";
import { HouseIcon } from "@/components/icons/breadcrumb/house-icon";
import { UsersIcon } from "@/components/icons/breadcrumb/users-icon";
import { useUserContext } from "../../../layout/UserContext";
import { MarketingTasks } from "../../../../helpers/db";
import { SearchIcon } from "../../../icons/searchicon";
import { EyeIcon } from "../../../icons/table/eye-icon";
import { AddTask } from "./operation/add-task";
import { MarketingTableWrapper } from "./table/table";
import { RequestMMC } from "./operation/request";
import { ITTasks } from "@/components/deparments/IT/tasks/task";

export const MarketingTask = () => {
  const { user } = useUserContext();
  const [filterValue, setFilterValue] = useState("");
  const [debouncedFilterValue, setDebouncedFilterValue] = useState(filterValue);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isITModalOpen, setIsITModalOpen] = useState(false);

  // ✅ New date range states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: tasks = [], isLoading } = useSWR<MarketingTasks[]>(
    "/api/department/MARKETING/tasks",
    fetcher,
    {
      refreshInterval: 120000,
      revalidateOnFocus: true,
    },
  );

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedFilterValue(filterValue), 300);
    return () => clearTimeout(handler);
  }, [filterValue]);

  // Reset fullscreen on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullScreen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const canCreate = user?.designation.includes("MARKETING");

  return (
    <div className="my-10 px-4 lg:px-6 max-w-[95rem] mx-auto w-full flex flex-col gap-4">
      {/* Breadcrumb */}
      <ul className="flex">
        <li className="flex gap-2">
          <HouseIcon />
          <Link href={"/"}>
            <span>Home</span>
          </Link>
          <span> / </span>
        </li>
        <li className="flex gap-2">
          <UsersIcon />
          <span>Task</span>
          <span> / </span>
        </li>
        <li className="flex gap-2">
          <span>List</span>
        </li>
      </ul>

      <h3 className="text-xl font-semibold">All Tasks</h3>

      {/* Top controls: Search + Date Range + Fullscreen */}
      <div className="flex justify-between flex-wrap gap-4 items-center">
        <div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
          <Input
            isClearable
            startContent={<SearchIcon />}
            classNames={{ input: "w-full", mainWrapper: "w-full" }}
            placeholder="Search Project/Personnel"
            value={filterValue}
            onValueChange={setFilterValue}
          />

          {/* ✅ Date Range Filter */}
          <div className="flex items-center gap-1">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded p-1 text-sm"
            />
            <span>-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded p-1 text-sm"
            />
          </div>

          <Tooltip content="View in fullscreen" color="secondary">
            <button onClick={() => setIsFullScreen((prev) => !prev)}>
              <EyeIcon size={20} fill="#979797" />
            </button>
          </Tooltip>
        </div>

        <div className="flex flex-row gap-3.5 flex-wrap">
          {canCreate && (
            <>
              <AddTask />
              <RequestMMC />
            </>
          )}
          {/* <GenerateReport /> */}
          <Button
            color="secondary"
            variant="flat"
            onPress={() => setIsITModalOpen(true)}
          >
            View MMC Details
          </Button>
        </div>
      </div>

      {/* Table */}
      <div
        className={`${
          isFullScreen
            ? "fixed inset-0 z-[9999] bg-default p-4 overflow-auto shadow-xl rounded-none"
            : "max-w-[95rem] mx-auto w-full"
        } transition-all duration-300`}
      >
        <MarketingTableWrapper
          tasks={tasks}
          loading={isLoading}
          fullScreen={isFullScreen}
          searchValue={debouncedFilterValue}
          startDate={startDate}
          endDate={endDate}
        />
      </div>
      <Modal
        size="5xl"
        isOpen={isITModalOpen}
        onClose={() => setIsITModalOpen(false)}
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>MMC Task Details</ModalHeader>
          <ModalBody>
            <ITTasks />
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};
