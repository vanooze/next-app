import React from "react";
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

export const SidebarWrapper = () => {
  const { user, loading } = useUserContext();
  const pathname = usePathname();
  const { collapsed, setCollapsed } = useSidebarContext();

  const SUPERADMIN = user?.restriction === "9";
  const accessForProject =
    user?.department.includes("SALES") ||
    user?.department.includes("Design") ||
    user?.department.includes("PURCHASING") ||
    user?.department.includes("IT/DT Manager") ||
    user?.department.includes("PMO") ||
    user?.designation_status.includes("TECHNICAL MANAGER") ||
    user?.designation_status.includes("TECHNICAL SUPERVISOR") ||
    user?.designation_status.includes("TECHNICAL ASSISTANT MANAGER") ||
    SUPERADMIN;

  const accessForTask =
    user?.department?.includes("PMO") ||
    user?.department?.includes("DT") ||
    SUPERADMIN;
  const accessForSales = user?.position?.includes("SALES") || SUPERADMIN;

  const accessForInventory =
    user?.department.includes("ACCOUNTING&INVENTORY") ||
    user?.department.includes("PURCHASING") ||
    SUPERADMIN;

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
            <SidebarMenu title="Main Menu">
              {accessForTask ? (
                <SidebarItem
                  isActive={pathname === "/tasks"}
                  title="Task Designation"
                  icon={<AccountsIcon />}
                  href="/tasks"
                />
              ) : null}
              {accessForProject ? (
                <SidebarItem
                  isActive={pathname === "/project"}
                  title="Project Monitoring"
                  icon={<ReportsIcon />}
                  href="/project"
                />
              ) : null}
              {accessForSales ? (
                <SidebarItem
                  isActive={pathname === "/sales"}
                  title="Sales Management"
                  icon={<BalanceIcon />}
                  href="/sales"
                />
              ) : null}
              {accessForInventory ? (
                <CollapseItems
                  icon={<ProductsIcon />}
                  items={[
                    { label: "PO Monitoring", href: "/inventory/purchasing" },
                    { label: "Stock Items", href: "/inventory/stockItems" },
                  ]}
                  title="Inventory"
                />
              ) : null}
            </SidebarMenu>
          </div>
        </div>
      </div>
    </aside>
  );
};
