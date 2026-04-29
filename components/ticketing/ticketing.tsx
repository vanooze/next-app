"use client";

import React, { useState, useEffect } from "react";
import { Button, Input, Tooltip, Tabs, Tab } from "@heroui/react";
import Link from "next/link";
import useSWR from "swr";
import { fetcher } from "@/app/lib/fetcher";
import { HouseIcon } from "@/components/icons/breadcrumb/house-icon";
import { UsersIcon } from "@/components/icons/breadcrumb/users-icon";
import { SearchIcon } from "@/components/icons/searchicon";
import { EyeIcon } from "@/components/icons/table/eye-icon";
import { useUserContext } from "@/components/layout/UserContext";
import { TicketTableWrapper } from "./table/table";
import { CreateTicketModal } from "./operation/add-ticket";
import {
  pendingTicketingColumns,
  personalTicketingColumns,
  Ticketing,
} from "@/helpers/db";

export const Ticket = () => {
  const { user } = useUserContext();

  const [filterValue, setFilterValue] = useState("");
  const [debouncedFilterValue, setDebouncedFilterValue] = useState(filterValue);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("myTickets");

  const { data: tickets = [], isLoading } = useSWR<Ticketing[]>(
    "/api/ticketing",
    fetcher,
    {
      refreshInterval: 60000,
      revalidateOnFocus: true,
    },
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilterValue(filterValue);
    }, 300);

    return () => clearTimeout(handler);
  }, [filterValue]);

  const filteredTickets = (list: Ticketing[]) =>
    debouncedFilterValue
      ? list.filter((ticket) => {
          const query = debouncedFilterValue.toLowerCase();
          return (
            ticket.description?.toLowerCase().includes(query) ||
            ticket.status?.toLowerCase().includes(query)
          );
        })
      : list;

  // My created tickets
  const myTickets = tickets.filter((t) => t.requestedBy === user?.name);

  const assignedTickets = tickets.filter((t) => {
    if (user?.name) {
      return t.assignedPersonnel === user.name;
    }
    return t.department === user?.department_clean;
  });

  console.log("All Tickets:", tickets);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullScreen(false);
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div className="my-10 px-4 lg:px-6 max-w-[95rem] mx-auto w-full flex flex-col gap-4">
      {/* Breadcrumb */}
      <ul className="flex">
        <li className="flex gap-2">
          <HouseIcon />
          <Link href="/">
            <span>Home</span>
          </Link>
          <span> / </span>
        </li>

        <li className="flex gap-2">
          <UsersIcon />
          <span>Ticket</span>
        </li>
      </ul>

      {/* Title */}
      <h3 className="text-xl font-semibold">Ticketing System</h3>

      {/* Controls */}
      <div className="flex justify-between flex-wrap gap-4 items-center">
        <div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
          <Input
            isClearable
            startContent={<SearchIcon />}
            classNames={{
              input: "w-full",
              mainWrapper: "w-full",
            }}
            placeholder="Search tickets..."
            value={filterValue}
            onValueChange={setFilterValue}
          />

          <Tooltip content="View in fullscreen" color="secondary">
            <button onClick={() => setIsFullScreen((prev) => !prev)}>
              <EyeIcon size={20} fill="#979797" />
            </button>
          </Tooltip>
        </div>

        <div className="flex flex-row gap-3.5 flex-wrap">
          <CreateTicketModal />
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        selectedKey={selectedTab}
        onSelectionChange={(key) => setSelectedTab(key as string)}
      >
        {/* ✅ My Tickets */}
        <Tab key="myTickets" title="My Tickets">
          <div
            className={`${
              isFullScreen
                ? "fixed inset-0 z-[9999] bg-default p-4 overflow-auto shadow-xl"
                : "w-full"
            } transition-all duration-300`}
          >
            <TicketTableWrapper
              tickets={filteredTickets(myTickets)}
              columns={personalTicketingColumns}
              loading={isLoading}
              fullScreen={isFullScreen}
              searchValue={debouncedFilterValue}
              viewType="personal"
            />
          </div>
        </Tab>

        {/* ✅ Assigned */}
        <Tab key="assigned" title="Assigned / Department">
          <div
            className={`${
              isFullScreen
                ? "fixed inset-0 z-[9999] bg-default p-4 overflow-auto shadow-xl"
                : "w-full"
            } transition-all duration-300`}
          >
            <TicketTableWrapper
              tickets={filteredTickets(assignedTickets)}
              columns={pendingTicketingColumns}
              loading={isLoading}
              fullScreen={isFullScreen}
              searchValue={debouncedFilterValue}
              viewType="pending"
            />
          </div>
        </Tab>
      </Tabs>
    </div>
  );
};
