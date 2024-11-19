import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

interface MenuItemProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

export default function MenuItem({ title, icon, onPress }: MenuItemProps) {
  return (
    <View style={styles.menuItem}>
      <TouchableOpacity style={styles.itemContent} onPress={onPress}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={50} color="#CC0000" />
        </View>
        <Text style={styles.title}>{title}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  menuItem: {
    width: "50%",
    aspectRatio: 1,
    padding: 8,
    marginBottom: 16,
  },
  itemContent: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
    padding: 15,
  },
  iconContainer: {
    marginBottom: 10,
  },
  title: {
    fontSize: 14,
    textAlign: "center",
    color: "#333",
    fontWeight: "500",
  },
});

export const menuItems = [
  {
    title: "Thời khóa biểu",
    icon: "calendar-outline" as const,
    onPress: () => router.push("/"),
    roles: ["STUDENT", "LECTURER"] as const,
  },
  {
    title: "Tài liệu",
    icon: "document-text-outline" as const,
    onPress: () => {},
    roles: ["STUDENT", "LECTURER"] as const,
  },
  {
    title: "Lớp học",
    icon: "library-outline" as const,
    onPress: () => router.push("/classes"),
    roles: ["STUDENT", "LECTURER"] as const,
  },
  // Menu items chỉ dành cho Student
  {
    title: "Kết quả học tập",
    icon: "school-outline" as const,
    onPress: () => router.push("/"),
    roles: ["STUDENT"] as const,
  },
  {
    title: "Đăng ký học phần",
    icon: "book-outline" as const,
    onPress: () => router.push("/register-for-class"),
    roles: ["STUDENT"] as const,
  },
  {
    title: "Học phí",
    icon: "cash-outline" as const,
    onPress: () => {},
    roles: ["STUDENT"] as const,
  },
  // Menu items chỉ dành cho Lecturer
  {
    title: "Quản lý lớp học",
    icon: "people-outline" as const,
    onPress: () => router.push("/class-management"),
    roles: ["LECTURER"] as const,
  },
  {
    title: "Điểm danh",
    icon: "checkmark-circle-outline" as const,
    onPress: () => {},
    roles: ["LECTURER"] as const,
  },
  {
    title: "Nhập điểm",
    icon: "create-outline" as const,
    onPress: () => {},
    roles: ["LECTURER"] as const,
  },
  {
    title: "Lịch công tác",
    icon: "briefcase-outline" as const,
    onPress: () => {},
    roles: ["LECTURER"] as const,
  },
] as const;
