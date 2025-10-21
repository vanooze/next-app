"use client";
import React from "react";
import { ChevronDownIcon } from "../icons/sidebar/chevron-down-icon";
import { Accordion, AccordionItem } from "@heroui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface CollapseItem {
  label: string;
  href?: string;
  nestedItems?: CollapseItem[];
}

interface Props {
  icon?: React.ReactNode;
  title: string;
  items: CollapseItem[];
}

export const CollapseItems: React.FC<Props> = ({ icon, items, title }) => {
  const pathname = usePathname();

  const renderNestedItems = (nested: CollapseItem[], level = 1) => (
    <div className={`pl-${level * 4} flex flex-col gap-2`}>
      {nested.map((item, index) => {
        const isActive = item.href && pathname === item.href;

        if (item.nestedItems && item.nestedItems.length > 0) {
          return (
            <Accordion key={index}>
              <AccordionItem
                key={index}
                indicator={<ChevronDownIcon />}
                title={<span className="font-medium">{item.label}</span>}
                classNames={{
                  indicator: "data-[open=true]:-rotate-180",
                  trigger:
                    "py-0 min-h-[44px] hover:bg-default-100 rounded-xl transition-all duration-150 px-3.5",
                  content: "px-0",
                }}
              >
                {renderNestedItems(item.nestedItems, level + 1)}
              </AccordionItem>
            </Accordion>
          );
        }

        return (
          <Link
            key={index}
            href={item.href || "#"}
            className={`transition-all duration-150 text-sm min-h-[44px] flex items-center px-3.5 rounded-xl hover:bg-default-100 ${
              isActive
                ? "text-primary font-medium bg-primary-100"
                : "text-default-900"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-col gap-1">
      <Accordion>
        <AccordionItem
          indicator={<ChevronDownIcon />}
          aria-label={title}
          classNames={{
            indicator: "data-[open=true]:-rotate-180",
            trigger:
              "py-2 px-3.5 rounded-xl hover:bg-default-100 transition-all duration-150 flex items-center gap-2 min-h-[44px]",
            title: "flex gap-2 items-center text-base",
            content: "px-0",
          }}
          title={
            <div className="flex flex-row gap-2 items-center">
              {icon && <span>{icon}</span>}
              <span>{title}</span>
            </div>
          }
        >
          {renderNestedItems(items)}
        </AccordionItem>
      </Accordion>
    </div>
  );
};
