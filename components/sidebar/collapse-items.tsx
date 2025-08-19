"use client";
import React from "react";
import { ChevronDownIcon } from "../icons/sidebar/chevron-down-icon";
import { Accordion, AccordionItem } from "@heroui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  icon: React.ReactNode;
  title: string;
  items: { label: string; href: string }[]; // ⬅️ changed to store link path
}

export const CollapseItems = ({ icon, items, title }: Props) => {
  const pathname = usePathname();

  return (
    <div className="flex gap-4 h-full items-center cursor-pointer">
      <Accordion className="px-0">
        <AccordionItem
          indicator={<ChevronDownIcon />}
          classNames={{
            indicator: "data-[open=true]:-rotate-180",
            trigger:
              "py-0 min-h-[44px] hover:bg-default-100 rounded-xl active:scale-[0.98] transition-transform px-3.5",
            title:
              "px-0 flex text-base gap-2 h-full items-center cursor-pointer",
          }}
          aria-label="Accordion"
          title={
            <div className="flex flex-row gap-2">
              <span>{icon}</span>
              <span>{title}</span>
            </div>
          }
        >
          <div className="pl-12 flex flex-col gap-2">
            {items.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={index}
                  href={item.href}
                  className={`w-full flex transition-colors ${
                    isActive
                      ? "text-primary font-medium"
                      : "text-default-500 hover:text-default-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
