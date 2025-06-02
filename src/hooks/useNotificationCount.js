import { useState, useEffect } from "react";

export function useNotificationCount() {
  const [unreadCount, setUnreadCount] = useState(() => {
    try {
      const notifications = JSON.parse(
        localStorage.getItem("notifications") || "[]"
      );
      return notifications.filter((n) => !n.read).length;
    } catch (e) {
      console.error("Error parsing notifications:", e);
      return 0;
    }
  });

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const notifications = JSON.parse(
          localStorage.getItem("notifications") || "[]"
        );
        setUnreadCount(notifications.filter((n) => !n.read).length);
      } catch (e) {
        console.error("Error parsing notifications:", e);
        setUnreadCount(0);
      }
    };

    // Listen for changes to localStorage
    window.addEventListener("storage", handleStorageChange);

    // Also check for changes every second (in case of same-tab updates)
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return unreadCount;
}
