"use client";

import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/app/lib/fetcher";
import { Sidebar } from "./sidebar.styles";
import { Company } from "./company";
import { HomeIcon } from "../icons/sidebar/home-icon";
import { AccountsIcon } from "../icons/sidebar/accounts-icon";
import { ProductsIcon } from "../icons/sidebar/products-icon";
import { ReportsIcon } from "../icons/sidebar/reports-icon";
import { CollapseItems } from "./collapse-items";
import { SidebarItem } from "./sidebar-item";
import { SidebarMenu } from "./sidebar-menu";
import { useSidebarContext } from "../layout/layout-context";
import { usePathname } from "next/navigation";
import { useUserContext } from "../layout/UserContext";
import { BalanceIcon } from "../icons/sidebar/balance-icon";
import { ChatIcon } from "../icons/sidebar/chat-icon";
import {
  SIDEBAR_ACCESS_FOR_TASK_DESIGNATION,
  SIDEBAR_ACCESS_FOR_INVENTORY_DESIGNATION,
  SIDEBAR_ACCESS_FOR_PROJECT_DESIGNATION,
  SIDEBAR_ACCESS_FOR_SALES_DESIGNATION,
} from "@/helpers/restriction";

export const SidebarWrapper = () => {
  const { user } = useUserContext();
  const pathname = usePathname();
  const { collapsed, setCollapsed } = useSidebarContext();

  const accessForProject =
    user?.designation &&
    SIDEBAR_ACCESS_FOR_PROJECT_DESIGNATION.some((role) =>
      user.designation.toUpperCase().includes(role),
    );

  const {
    data: ongoingProjects = [],
    error: projectsError,
    isLoading: loadingProjects,
  } = useSWR<any[]>(
    accessForProject ? "/api/department/PMO/project?status=Active" : null,
    fetcher,
    {
      refreshInterval: 120000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    },
  );

  const accessForTask =
    user?.designation &&
    SIDEBAR_ACCESS_FOR_TASK_DESIGNATION.some((role) =>
      user.designation.toUpperCase().includes(role),
    );

  const accessForSales =
    user?.designation &&
    SIDEBAR_ACCESS_FOR_SALES_DESIGNATION.some((role) =>
      user.designation.toUpperCase().includes(role),
    );

  const accessForInventory =
    user?.designation &&
    SIDEBAR_ACCESS_FOR_INVENTORY_DESIGNATION.some((role) =>
      user.designation.toUpperCase().includes(role),
    );

  useEffect(() => {
    if (projectsError) {
      console.error("❌ Error loading ongoing projects:", projectsError);
    }
  }, [projectsError]);

  const ongoingItems = React.useMemo(() => {
    if (loadingProjects) {
      return [{ label: "Loading...", href: "#" }];
    }

    if (projectsError) {
      return [{ label: "Error loading projects", href: "#" }];
    }

    return ongoingProjects.length > 0
      ? ongoingProjects.map((proj) => ({
          label:
            proj.description?.length > 25
              ? proj.description.slice(0, 25) + "..."
              : proj.description || proj.projectId,
          nestedItems: [
            {
              label: "Sales Order",
              href: `/project/${proj.projectId}/sales-order`,
            },
            {
              label: "Documentation",
              href: `/project/${proj.projectId}/documentation`,
            },
            {
              label: "Project Kick Off",
              href: `/project/${proj.projectId}/project-kick-off`,
            },
            {
              label: "Project Validation",
              href: `/project/${proj.projectId}/project-validation`,
            },
            {
              label: "Project Execution",
              href: `/project/${proj.projectId}/project-execution`,
            },
            {
              label: "Project Completion",
              href: `/project/${proj.projectId}/project-completion`,
            },
            {
              label: "Post Project",
              href: `/project/${proj.projectId}/post-project`,
            },
          ],
        }))
      : [{ label: "No Ongoing Projects", href: "#" }];
  }, [ongoingProjects, loadingProjects, projectsError]);

  const projectManagementItems = [
    { label: "Project Monitoring", href: "/project" },
    { label: "Message Board", href: "/project/message_board" },
    // {
    //   label: "Active Projects",
    //   nestedItems: ongoingItems,
    // },
  ];

  return (
    <aside className="h-screen z-[20] sticky top-0">
      {collapsed ? (
        <div className={Sidebar.Overlay()} onClick={setCollapsed} />
      ) : null}

      <div className={`${Sidebar({ collapsed })} overflow-x-hidden`}>
        <div className={Sidebar.Header()}>
          <Company />
        </div>
        <div className="flex flex-col justify-between h-full">
          <div className={Sidebar.Body()}>
            <SidebarItem
              title="Home"
              icon={<HomeIcon />}
              isActive={pathname === "/"}
              href="/"
            />
            <SidebarItem
              title="Chat Assistant"
              icon={<ChatIcon />}
              isActive={pathname === "/chat"}
              href="/chat"
            />
            <SidebarMenu title="Main Menu">
              {accessForTask && (
                <SidebarItem
                  isActive={pathname === "/tasks"}
                  title="Task Designation"
                  icon={<AccountsIcon />}
                  href="/tasks"
                />
              )}
              {accessForSales ? (
                <SidebarItem
                  isActive={pathname === "/sales"}
                  title="Sales Management"
                  icon={<BalanceIcon />}
                  href="/sales"
                />
              ) : null}
              {accessForProject && (
                <CollapseItems
                  icon={<ReportsIcon />}
                  title="Project Management"
                  items={projectManagementItems}
                />
              )}
              {accessForInventory ? (
                <CollapseItems
                  icon={<ProductsIcon />}
                  title="Inventory"
                  items={[
                    { label: "PO Monitoring", href: "/inventory/purchasing" },
                    { label: "Stock Items", href: "/inventory/stockItems" },
                  ]}
                />
              ) : null}
              <CollapseItems
                icon={<ReportsIcon />}
                title="Files"
                items={[
                  { label: "QMS Files", href: "/qms" },
                  { label: "LMS Files", href: "/lms" },
                ]}
              />
            </SidebarMenu>
          </div>
        </div>
      </div>
    </aside>
  );
};
