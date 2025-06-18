"use client";
import { Button, Input } from "@heroui/react";
import Link from "next/link";
import React, { useState, useEffect } from "react";

import { ExportIcon } from "@/components/icons/accounts/export-icon";
import { HouseIcon } from "@/components/icons/breadcrumb/house-icon";
import { UsersIcon } from "@/components/icons/breadcrumb/users-icon";
import { TableWrapper } from "@/components/deparments/DT/tasks/table/table";
import { useUserContext } from "../layout/UserContext";
import { dtTask } from "../../helpers/task";
import { AddTask } from "../deparments/DT/tasks/add-task";
import { SearchIcon } from "../icons/searchicon";

export const Tasks = () => {
  const [tasks, setTasks] = useState<dtTask[]>([]);
  const { user } = useUserContext();
  const [filterValue, setFilterValue] = useState("");
  const [debouncedFilterValue, setDebouncedFilterValue] = useState(filterValue);
  const [loading, setLoading] = useState(true);

  const hasSearchFilter = Boolean(filterValue);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch("/api/department/ITDT/DT/tasks");
        const data = await res.json();
        setTasks(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch tasks", err);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

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
        </div>
        <div className="flex flex-row gap-3.5 flex-wrap">
          <AddTask />
        </div>
      </div>
      <div className="max-w-[95rem] mx-auto w-full">
        <TableWrapper tasks={filteredTasks} loading={loading} />
      </div>
    </div>
  );
};
