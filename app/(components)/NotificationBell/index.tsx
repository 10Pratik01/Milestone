

"use client";

import { Bell } from "lucide-react";
import { getUnreadNotificationCount } from "@/actions/notifications";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const count = await getUnreadNotificationCount();
        setUnreadCount(count);
      } catch (error) {
        console.error("Failed to fetch notification count", error);
      }
    };
    fetchCount();
  }, []);

  return (
    <Link
      href="/notifications"
      className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
    >
      <Bell className="h-6 w-6 text-gray-600 dark:text-gray-300" />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
