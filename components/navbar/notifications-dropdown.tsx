"use client";

import React, { useMemo, useState } from "react";
import {
  Badge,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  NavbarItem,
  Spinner,
  Button,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { NotificationIcon } from "../icons/navbar/notificationicon";
import { useUserContext } from "../layout/UserContext";

interface NotificationLog {
  id: number;
  type: string | null;
  message: string | null;
  receiver_name: string | null;
  redirect_url: string | null;
  active: number;
}

const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    throw new Error("Failed to fetch notifications");
  }
  return res.json();
};

const normalize = (value?: string | null) =>
  value ? value.trim().toUpperCase() : "";

const USER_TO_RECEIVER_CODES: Record<string, string[]> = {
  "LANI KIMBER CAMPOS": ["LSC"],
  "MARIA LEA BERMUDEZ": ["MLB"],
  "MARVIN JIMENEZ": ["MJ"],
  "HAROLD DAVID": ["HAROLD"],
  "Alliah Pearl Robles": ["ALI"],
  "KENNETH BAUTISTA": ["KENNETH"],
  "Saira May Y. Gatdula ": ["SAIRA"],
  "Jhoannah Rose-Mil L. Sicat ": ["JHOAN"],
  "DESIREE SALIVIO": ["DESIREE", "MDS", "GAKKEN"],
  "Ida Ma. Catherine C. Madamba": ["IDA"],
  "EVELYN PEQUIRAS": ["EVE"],
  "Genevel Garcia": ["GENEVEL", "GEN"],
  "JUDIE ANN MANUEL": ["JAM"],
  "ERWIN TALAVERA": ["ERWIN T."],
  "Ronaldo J. Francisco": ["RONALD"],
  "ERWIN DEL ROSARIO": ["ERWIN"],
  "ASHLY ALVARO": ["ASH"],
  "LAWRENCE DUCUT": ["ENCHONG"],
  "Aaron Vincent A. Opinaldo": ["AARON"],
  "JOEMAR BANICHINA": ["JOEMAR"],
  "RAMIELYN MALAYA": ["RAM"],
  "RITZGERALD LOPEZ": ["RITZ"],
};

export const NotificationsDropdown: React.FC = () => {
  const { user } = useUserContext();
  const router = useRouter();

  // 🔥 PAGINATION STATE
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const receiverFilters = useMemo(() => {
    if (!user?.name) return [];

    const normalizedName = normalize(user.name);
    const searchTokens = new Set<string>();

    const mapped = USER_TO_RECEIVER_CODES[normalizedName] ?? [];
    mapped.forEach((token) => searchTokens.add(token));

    if (normalizedName) {
      searchTokens.add(normalizedName);
      const [firstWord] = normalizedName.split(" ");
      if (firstWord) {
        searchTokens.add(firstWord);
      }
    }

    if (user.username) {
      searchTokens.add(normalize(user.username));
    }

    return Array.from(searchTokens).filter(Boolean);
  }, [user?.name, user?.username]);

  const requestKey = useMemo(() => {
    if (receiverFilters.length === 0) return null;
    const params = new URLSearchParams();
    receiverFilters.forEach((token) => params.append("receiver", token));
    return `/api/notification/unseen?${params.toString()}`;
  }, [receiverFilters]);

  const {
    data: notifications = [],
    error,
    isLoading,
    mutate,
  } = useSWR<NotificationLog[]>(requestKey, fetcher, {
    revalidateOnFocus: true,
    keepPreviousData: true,
  });

  // 🔥 PAGINATION: Slice notifications
  const totalPages = Math.ceil(notifications.length / pageSize) || 1;
  const paginated = notifications.slice((page - 1) * pageSize, page * pageSize);

  const unreadCount = notifications.filter(
    (notif) => notif.active === 1
  ).length;

  const handleNotificationClick = async (notification: NotificationLog) => {
    const redirectUrl = notification.redirect_url;
    const isUnread = notification.active === 1;

    try {
      if (isUnread) {
        await fetch(`/api/notification/mark-seen?id=${notification.id}`, {
          method: "PATCH",
          credentials: "include",
        });
        mutate(
          (current = []) =>
            current.map((entry) =>
              entry.id === notification.id ? { ...entry, active: 0 } : entry
            ),
          false
        );
      }
    } catch (err) {
      console.error("Failed to mark notification as seen:", err);
    } finally {
      if (redirectUrl) router.push(redirectUrl);
    }
  };

  return (
    <Badge
      color="danger"
      content={unreadCount > 0 ? unreadCount : null}
      shape="circle"
      isInvisible={unreadCount === 0}
    >
      <Dropdown placement="bottom-end">
        <DropdownTrigger>
          <NavbarItem className="cursor-pointer">
            <NotificationIcon />
          </NavbarItem>
        </DropdownTrigger>

        <DropdownMenu className="w-80" aria-label="Notifications">
          <DropdownSection title="Notifications">
            {error ? (
              <DropdownItem
                key="error"
                className="text-center text-danger"
                isDisabled
              >
                Failed to load notifications
              </DropdownItem>
            ) : isLoading ? (
              <DropdownItem key="loading" className="justify-center">
                <div className="w-full flex justify-center py-2">
                  <Spinner size="sm" />
                </div>
              </DropdownItem>
            ) : notifications.length === 0 ? (
              <DropdownItem
                key="empty"
                className="text-center text-foreground-400"
                isDisabled
              >
                No notifications
              </DropdownItem>
            ) : (
              <>
                {/* 🔥 PAGINATED NOTIFICATIONS */}
                {paginated.map((notification) => (
                  <DropdownItem
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    startContent={
                      <Badge
                        color="danger"
                        content={notification.active === 1 ? 1 : null}
                        isInvisible={notification.active !== 1}
                        shape="circle"
                      >
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full ${
                            notification.active === 1
                              ? "bg-primary-200"
                              : "bg-default-200"
                          }`}
                        >
                          <NotificationIcon className="h-5 w-5" />
                        </div>
                      </Badge>
                    }
                    classNames={{
                      base: `py-2 cursor-pointer transition-colors ${
                        notification.active === 1
                          ? "bg-primary-50 hover:bg-primary-100"
                          : "hover:bg-default-100"
                      }`,
                      title: `text-sm ${
                        notification.active === 1 ? "font-semibold" : ""
                      }`,
                      description: "text-xs text-foreground-500",
                    }}
                    description={notification.type ?? undefined}
                  >
                    {notification.message ?? "Notification"}
                  </DropdownItem>
                ))}

                {/* 🔥 PAGINATION CONTROLS */}
                <DropdownItem isDisabled key="pagination" className="py-2">
                  <div className="flex items-center justify-between w-full">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="px-2 py-1 text-sm rounded bg-default-200 disabled:opacity-40"
                    >
                      Prev
                    </button>

                    <span className="text-xs text-foreground-500">
                      Page {page} / {totalPages}
                    </span>

                    <button
                      disabled={page === totalPages}
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      className="px-2 py-1 text-sm rounded bg-default-200 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </DropdownItem>
              </>
            )}
          </DropdownSection>
        </DropdownMenu>
      </Dropdown>
    </Badge>
  );
};
