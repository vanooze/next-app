"use client";

import { Button, Input, Tooltip } from "@heroui/react";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import { fetcher } from "@/app/lib/fetcher";
import { HouseIcon } from "@/components/icons/breadcrumb/house-icon";
import { TableWrapper } from "@/components/deparments/INVENTORY/stockItems/table/table";
import { useUserContext } from "@/components/layout/UserContext";
import { Items } from "@/helpers/acumatica";
import { SearchIcon } from "@/components/icons/searchicon";
import { EyeIcon } from "@/components/icons/table/eye-icon";
import { ProductsIcon } from "@/components/icons/sidebar/products-icon";

export const StockItems = () => {
  const { user } = useUserContext();
  const [filterValue, setFilterValue] = useState("");
  const [debouncedFilterValue, setDebouncedFilterValue] = useState(filterValue);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const {
    data: items = [],
    error,
    isLoading,
  } = useSWR<Items[]>("/api/department/INVENTORY/StockItems", fetcher, {
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

  const filtereditems = debouncedFilterValue
    ? items.filter((items) => {
        const query = debouncedFilterValue.toLowerCase();
        return items.description?.toLowerCase().includes(query);
      })
    : items;

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
          <ProductsIcon />
          <span>Inventory</span>
          <span> / </span>{" "}
        </li>
        <li className="flex gap-2">
          <span>Stock Items</span>
        </li>
      </ul>

      <h3 className="text-xl font-semibold">Inventory</h3>
      <div className="flex justify-between flex-wrap gap-4 items-center">
        <div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
          <Input
            isClearable
            startContent={<SearchIcon />}
            classNames={{
              input: "w-full",
              mainWrapper: "w-full",
            }}
            placeholder="Search Item"
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
        <div className="flex flex-row gap-3.5 flex-wrap"></div>
      </div>
      <div
        className={`${
          isFullScreen
            ? "fixed inset-0 z-[9999] bg-default p-4 overflow-auto shadow-xl rounded-none"
            : "max-w-[95rem] mx-auto w-full"
        } transition-all duration-300`}
      >
        <TableWrapper
          items={filtereditems}
          loading={isLoading}
          fullScreen={isFullScreen}
        />
      </div>
    </div>
  );
};
