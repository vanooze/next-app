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

export const SidebarWrapper = () => {
  const { user, loading } = useUserContext();
  const pathname = usePathname();
  const { collapsed, setCollapsed } = useSidebarContext();

  const accessForProject =
    user?.department.includes("SALES") ||
    user?.department.includes("Design") ||
    user?.department.includes("PURCHASING") ||
    user?.department.includes("IT/DT Manager") ||
    user?.department.includes("PMO") ||
    user?.department.includes("TECHNICAL MANAGER") ||
    user?.designation_status.includes("TECHNICAL SUPERVISOR") ||
    user?.designation_status.includes("TECHNICAL ASSISTANT MANAGER");

  const accessForInventory = user?.department.includes("ACCOUNTING&INVENTORY");
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
              <SidebarItem
                isActive={pathname === "/tasks"}
                title="Task Designation"
                icon={<AccountsIcon />}
                href="/tasks"
              />
              {accessForProject ? (
                <SidebarItem
                  isActive={pathname === "/project"}
                  title="Project Monitoring"
                  icon={<ReportsIcon />}
                  href="/project"
                />
              ) : null}
              {accessForInventory ? (
                <SidebarItem
                  isActive={pathname === "/inventory"}
                  title="Inventory"
                  icon={<ProductsIcon />}
                  href="/inventory"
                />
              ) : null}
              {/* <CollapseItems
                icon={<BalanceIcon />}
                items={["TMIG", "IT/DT", "Marketing"]}
                title="Departments"
              /> */}
              {/* <SidebarItem
                isActive={pathname === "/reports"}
                title="Reports"
                icon={<ReportsIcon />}
                href="reports"
              /> */}
            </SidebarMenu>
          </div>
        </div>
      </div>
    </aside>
  );
};
