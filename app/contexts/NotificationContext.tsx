import React, { createContext, useContext, useState, useEffect } from "react";
import { SERVER_URL } from "../../utility/env";
import request from "../../utility/request";
import { useUser } from "./UserContext";

export interface Notification {
  id: number;
  from_user: number;
  to_user: number;
  message: string;
  type:
    | "ABSENCE"
    | "ACCEPT_ABSENCE_REQUEST"
    | "REJECT_ABSENCE_REQUEST"
    | "ASSIGNMENT_GRADE";
  sent_time: string;
  status: "READ" | "UNREAD";
  title_push_notification: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchUnreadNotificationCount: () => Promise<void>;
  markNotificationAsRead: (notificationId: number) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { token } = useUser();

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    if (token) {
      setLoading(true);
      try {
        const response: any = await request(
          `${SERVER_URL}/it5023e/get_notifications`,
          {
            method: "POST",
            body: { token, index: 0, count: 10 },
          }
        );
        if (response && response.data) {
          setNotifications(response.data);
          setUnreadCount(
            response.data.filter(
              (noti: Notification) => noti.status === "UNREAD"
            ).length
          );
        } else {
          console.log("Dữ liệu không hợp lệ:", response);
        }
      } catch (error) {
        console.log("Lỗi tải thông báo:", error);
      } finally {
        setLoading(false); // Đảm bảo loading được tắt
      }
    }
  };

  const fetchUnreadNotificationCount = async () => {
    if (token) {
      try {
        const response: any = await request(
          `${SERVER_URL}/it5023e/get_unread_notification_count`,
          {
            method: "POST",
            body: { token },
          }
        );

        // Kiểm tra nếu response hợp lệ
        if (response && response.data !== undefined) {
          setUnreadCount(response.data);
        } else {
          console.log("Dữ liệu không hợp lệ:", response);
        }
      } catch (error) {
        console.log("Lỗi lấy số lượng thông báo chưa đọc:", error);
      }
    }
  };

  const markNotificationAsRead = async (notificationId: number) => {
    try {
      const response = await request(
        `${SERVER_URL}/it5023e/mark_notification_as_read`,
        {
          method: "POST",
          body: {
            token,
            notification_id: notificationId,
          },
        }
      );
      if (response) {
        setNotifications((prevNotifications) =>
          prevNotifications.map((noti: Notification) =>
            noti.id === notificationId ? { ...noti, status: "READ" } : noti
          )
        );

        setUnreadCount((prev) => Math.max(0, prev - 1));
      } else {
        console.log("Lỗi đánh dấu đã đọc:", response);
      }
    } catch (error) {
      console.log("Lỗi đánh dấu đã đọc:", error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchUnreadNotificationCount,
        markNotificationAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications phải được sử dụng trong NotificationProvider"
    );
  }
  return context;
}
