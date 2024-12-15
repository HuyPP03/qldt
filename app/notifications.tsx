import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import request from "@/utility/request";
import { useRouter } from "expo-router";
import { SERVER_URL } from "@/utility/env";
import AsyncStorage from "@react-native-async-storage/async-storage";
// Interface cho dữ liệu thông báo
interface Notification {
  id: string;
  type: "assignment" | "announcement" | "grade";
  title: string;
  message: string;
  time: string;
  read: boolean;
  course: string;
}

// Dữ liệu mẫu
const sampleNotifications: Notification[] = [
  {
    id: "1",
    type: "assignment",
    title: "Bài tập mới",
    message: "Giảng viên đã đăng một bài tập mới trong môn Lập trình Web",
    time: "2 giờ trước",
    read: false,
    course: "Lập trình Web",
  },
  {
    id: "2",
    type: "announcement",
    title: "Thông báo lịch học",
    message: "Lớp học ngày mai sẽ được tổ chức online qua Microsoft Teams",
    time: "3 giờ trước",
    read: true,
    course: "Cơ sở dữ liệu",
  },
  {
    id: "3",
    type: "grade",
    title: "Điểm kiểm tra giữa kỳ",
    message: "Điểm kiểm tra giữa kỳ môn Lập trình Web đã được công bố",
    time: "1 ngày trước",
    read: false,
    course: "Lập trình Web",
  },
];
export const useNotifications = () => {
  const [token, setToken] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadNotificationCount = async () => {
    const token = await AsyncStorage.getItem("userToken");
    if (token) {
      try {
        const response = await request<{
          success: boolean;
          unreadCount: number;
        }>(`${SERVER_URL}/it5023e/get_unread_notification_count`, {
          method: "POST",
          body: { token },
        });

        setUnreadCount(response.unreadCount);
      } catch (error) {
        console.error("Lỗi lấy số lượng thông báo chưa đọc:", error);
      }
    }
  };

  const fetchNotifications = async () => {
    const token = await AsyncStorage.getItem("userToken");

    try {
      const response = await request<{
        success: boolean;
        data: Notification[];
      }>(`${SERVER_URL}/it5023e/get_notifications`, {
        method: "POST",
        body: { token, index: 0, count: 4 },
      });

      setNotifications(response.data);
      setUnreadCount(response.data.filter((noti) => !noti.read).length);
    } catch (error) {
      console.error("Lỗi lấy thông báo:", error);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    const token = await AsyncStorage.getItem("userToken");
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

      setNotifications((prevNotifications) =>
        prevNotifications.map((noti) =>
          noti.id === notificationId ? { ...noti, read: true } : noti
        )
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Lỗi đánh dấu đã đọc:", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUnreadNotificationCount();
      fetchNotifications();
    }
  }, [token]);

  return {
    notifications,
    unreadCount,
    fetchNotifications,
    fetchUnreadNotificationCount,
    markNotificationAsRead,
  };
};
export default function NotificationsScreen() {
  const router = useRouter();
  const { notifications, unreadCount, markNotificationAsRead } =
    useNotifications();

  const renderNotificationIcon = (type: string) => {
    switch (type) {
      case "assignment":
        return <Ionicons name="document-text" size={24} color="#2196F3" />;
      case "announcement":
        return <Ionicons name="megaphone" size={24} color="#4CAF50" />;
      case "grade":
        return <Ionicons name="school" size={24} color="#FF9800" />;
      default:
        return <Ionicons name="notifications" size={24} color="#757575" />;
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.read && styles.unreadNotification]}
      onPress={() => markNotificationAsRead(item.id)}
    >
      <View style={styles.notificationContent}>
        <View style={[styles.iconContainer, styles[`${item.type}Icon`]]}>
          {renderNotificationIcon(item.type)}
        </View>
        <View style={styles.textContainer}>
          <View style={styles.notificationHeader}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.timeText}>{item.time}</Text>
          </View>
          <Text style={styles.courseText}>{item.course}</Text>
          <Text style={styles.messageText} numberOfLines={2}>
            {item.message}
          </Text>
        </View>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/")}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Thông báo</Text>
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.iconContainer}>
              <Ionicons
                name="notifications-outline"
                size={80}
                color="#E0E0E0"
              />
              <View style={styles.iconBadge} />
            </View>
            <Text style={styles.emptyTitle}>Chưa có thông báo nào</Text>
            <Text style={styles.emptySubtitle}>
              Bạn sẽ nhận được thông báo khi có cập nhật mới từ{"\n"}các lớp học
              của bạn
            </Text>
            <TouchableOpacity style={styles.refreshButton} onPress={() => {}}>
              <Ionicons name="refresh-outline" size={20} color="#CC0000" />
              <Text style={styles.refreshText}>Làm mới</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#CC0000",
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    marginRight: 24,
  },
  backButton: {
    padding: 8,
    ...(Platform.OS === "web" && { cursor: "pointer" }),
  },
  listContainer: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginTop: -40,
  },
  iconContainer: {
    position: "relative",
    width: 120,
    height: 120,
    backgroundColor: "#F5F5F5",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  iconBadge: {
    position: "absolute",
    top: 25,
    right: 25,
    width: 12,
    height: 12,
    backgroundColor: "#CC0000",
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#F5F5F5",
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#666666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEBEE",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#FFCDD2",
  },
  refreshText: {
    color: "#CC0000",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  notificationItem: {
    backgroundColor: "white",
    padding: 16,
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadNotification: {
    backgroundColor: "#FEFEFE",
    borderLeftWidth: 4,
    borderLeftColor: "#CC0000",
  },
  notificationContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  assignmentIcon: {
    backgroundColor: "#E3F2FD",
  },
  announcementIcon: {
    backgroundColor: "#E8F5E9",
  },
  gradeIcon: {
    backgroundColor: "#FFF3E0",
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  timeText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  courseText: {
    fontSize: 13,
    color: "#CC0000",
    fontWeight: "600",
  },
  messageText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
  },
  unreadDot: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#CC0000",
  },
});
