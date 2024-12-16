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
  unreadCount: number;
  fetchUnreadNotificationCount: () => Promise<void>;
  setUnreadCount: any;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [unreadCount, setUnreadCount] = useState(0);
  const { token } = useUser();

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

  useEffect(() => {
    fetchUnreadNotificationCount();
  }, [token]);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        setUnreadCount,
        fetchUnreadNotificationCount,
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
