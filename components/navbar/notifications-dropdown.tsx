import {
  Badge,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  NavbarItem,
} from "@heroui/react";
import React from "react";
import { useUserContext } from "../layout/UserContext";
import { NotificationIcon } from "../icons/navbar/notificationicon";

export const NotificationsDropdown = () => {
  const { user } = useUserContext();

  console.log(user);

  return (
    <Badge color="danger" content="2" shape="circle">
      <Dropdown placement="bottom-end">
        <DropdownTrigger>
          <NavbarItem>
            <NotificationIcon />
          </NavbarItem>
        </DropdownTrigger>
        <DropdownMenu className="w-80" aria-label="Avatar Actions">
          <DropdownSection title="Notificactions">
            <DropdownItem
              classNames={{
                base: "py-2",
                title: "text-base font-semibold",
              }}
              key="1"
              description="Sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim."
            >
              📣 Edit your information
            </DropdownItem>
            <DropdownItem
              key="2"
              classNames={{
                base: "py-2",
                title: "text-base font-semibold",
              }}
              description="Sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim."
            >
              🚀 Say goodbye to paper receipts!
            </DropdownItem>
            <DropdownItem
              key="3"
              classNames={{
                base: "py-2",
                title: "text-base font-semibold",
              }}
              description="Sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim."
            >
              📣 Edit your information
            </DropdownItem>
          </DropdownSection>
        </DropdownMenu>
      </Dropdown>
    </Badge>
  );
};
