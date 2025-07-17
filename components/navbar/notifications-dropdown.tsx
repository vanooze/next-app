// "use client";

// import {
//   Badge,
//   Dropdown,
//   DropdownItem,
//   DropdownMenu,
//   DropdownSection,
//   DropdownTrigger,
//   NavbarItem,
// } from "@heroui/react";
// import React from "react";
// import { useUserContext } from "../layout/UserContext";
// import { NotificationIcon } from "../icons/navbar/notificationicon";
// import { NotificationItem } from "@/helpers/db";
// import { useRouter } from "next/navigation";
// import useSWR from "swr";

// export const NotificationsDropdown = () => {
//   const { user } = useUserContext();
//   const router = useRouter();

//   const fetcher = (url: string) => fetch(url).then((res) => res.json());

//   const { data: notifications = [], mutate } = useSWR<NotificationItem[]>(
//     user ? `/api/notification/unseen?name=${user.name}` : null,
//     fetcher
//   );

//   const unseenCount = Array.isArray(notifications)
//     ? notifications.filter((n) => !n.seen).length
//     : 0;

//   const handleRedirectAndMarkAsSeen = async (notif: NotificationItem) => {
//     if (!notif?.link || !notif?.id) return;

//     try {
//       await fetch(`/api/notification/mark-seen?id=${notif.id}`, {
//         method: "PATCH",
//       });

//       // Optimistically mark as seen
//       mutate(
//         (current = []) =>
//           current.map((n) => (n.id === notif.id ? { ...n, seen: true } : n)),
//         false
//       );

//       setTimeout(() => router.push(notif.link), 100);
//     } catch (err) {
//       console.error("🔴 Failed to mark as seen:", err);
//     }
//   };

//   const formatDate = (dateStr: string) => {
//     const date = new Date(dateStr);
//     return new Intl.DateTimeFormat("en", {
//       month: "short",
//       day: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     }).format(date);
//   };

//   const sortedNotifications = [...notifications].sort(
//     (a, b) => Number(a.seen) - Number(b.seen)
//   );

//   return (
//     <Badge
//       color="danger"
//       content={unseenCount > 0 ? unseenCount.toString() : ""}
//       shape="circle"
//       isInvisible={unseenCount === 0}
//     >
//       <Dropdown placement="bottom-end">
//         <DropdownTrigger>
//           <NavbarItem>
//             <NotificationIcon />
//           </NavbarItem>
//         </DropdownTrigger>

//         <DropdownMenu className="w-80" aria-label="Notifications">
//           <DropdownSection title="Notifications">
//             {notifications.length === 0 ? (
//               <DropdownItem key="empty" className="text-center text-gray-500">
//                 No notifications
//               </DropdownItem>
//             ) : (
//               sortedNotifications.map((notif) => (
//                 <DropdownItem
//                   key={notif.id}
//                   onClick={() => handleRedirectAndMarkAsSeen(notif)}
//                   classNames={{
//                     base: `py-2 cursor-pointer ${
//                       notif.seen ? "bg-white" : "bg-blue-50"
//                     }`,
//                     title: "text-base font-semibold",
//                   }}
//                   description={notif.description}
//                 >
//                   📣 {notif.title}
//                 </DropdownItem>
//               ))
//             )}
//           </DropdownSection>
//         </DropdownMenu>
//       </Dropdown>
//     </Badge>
//   );
// };
