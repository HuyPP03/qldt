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
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ActivityIndicator } from "react-native-paper";
import { Notification, useNotifications } from "./contexts/NotificationContext";
import { carbon } from "@/utility/carbon";
export default function NotificationsScreen() {
  const router = useRouter();
  const { notifications, markNotificationAsRead, loading } = useNotifications();

  const renderNotificationIcon = (type: string) => {
    const iconProps = {
      size: 24,
      color: "#757575",
    };

    switch (type) {
      case "ABSENCE":
        return <Ionicons name="person-remove" {...iconProps} color="#FF0000" />;
      case "ACCEPT_ABSENCE_REQUEST":
        return (
          <Ionicons name="checkmark-circle" {...iconProps} color="#4CAF50" />
        );
      case "REJECT_ABSENCE_REQUEST":
        return <Ionicons name="close-circle" {...iconProps} color="#FF9800" />;
      case "ASSIGNMENT_GRADE":
        return <Ionicons name="school" {...iconProps} color="#2196F3" />;
      default:
        return <Ionicons name="notifications" {...iconProps} />;
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          item.status === "UNREAD" && styles.unreadNotification,
        ]}
        onPress={() => markNotificationAsRead(item.id)}
      >
        <View style={styles.notificationContent}>
          <View style={styles.iconContainer}>
            {renderNotificationIcon(item.type)}
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.notificationTitle}>
              {item.title_push_notification}
            </Text>
            <Text style={styles.messageText} numberOfLines={2}>
              {item.message}
            </Text>
            <Text style={styles.timeText}>
              {carbon.formatDate(item.sent_time, "HH:mm DD/MM/YYYY")}
            </Text>
          </View>
        </View>
        {item.status === "UNREAD" && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

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

      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#ff0000" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id.toString()}
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
                Bạn sẽ nhận được thông báo khi có cập nhật mới từ{"\n"}các lớp
                học của bạn
              </Text>
              <TouchableOpacity style={styles.refreshButton} onPress={() => {}}>
                <Ionicons name="refresh-outline" size={20} color="#CC0000" />
                <Text style={styles.refreshText}>Làm mới</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
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
    width: 80,
    height: 80,
    backgroundColor: "#F5F5F5",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    marginRight: 20,
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
    padding: 8,
    marginHorizontal: 10,
    marginVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  unreadNotification: {
    backgroundColor: "#F9F9F9",
    borderLeftWidth: 4,
    borderLeftColor: "#CC0000",
  },
  notificationContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
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
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  timeText: {
    fontSize: 10,
    color: "#999",
  },
  courseText: {
    fontSize: 13,
    color: "#CC0000",
    fontWeight: "600",
  },
  messageText: {
    fontSize: 12,
    color: "#444",
    lineHeight: 16,
    marginBottom: 2,
  },
  unreadDot: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#CC0000",
  },
});
