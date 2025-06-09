"use client";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
} from "@nextui-org/react";
import React, { useState } from "react";
import { AcmeIcon } from "../icons/acme-icon";
import { AcmeLogo } from "../icons/acmelogo";
import { BottomIcon } from "../icons/sidebar/bottom-icon";

export const Company = () => {
  return (
    <div className="w-full min-w-[260px]">
      <div className="flex items-center gap-2">
        <AcmeIcon />
        <div className="flex flex-col gap-4">
          <h3 className="text-xl font-medium m-0 text-default-900 -mb-4 whitespace-nowrap">
            Avolution Inc.
          </h3>
          <span className="text-xs font-medium text-default-500">
            San Juan, Manila.
          </span>
        </div>
      </div>
    </div>
  );
};
