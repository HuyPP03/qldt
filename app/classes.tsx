import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ClassItem from "../components/ClassItem";
import { useRouter } from "expo-router";

const classes = [
  {
    id: "1",
    name: "Lớp Toán 101",
    status: "Đang học",
    avatarUrl: "url-to-avatar-1",
  },
  {
    id: "2",
    name: "Lớp Lý 202",
    status: "Đang học",
    avatarUrl: "url-to-avatar-2",
  },
  {
    id: "3",
    name: "Lớp Hóa 303",
    status: "Đã học",
    avatarUrl: "url-to-avatar-3",
  },
  {
    id: "4",
    name: "Lớp Sinh 404",
    status: "Đã học",
    avatarUrl: "url-to-avatar-4",
  },
  {
    id: "5",
    name: "Lớp Văn 505",
    status: "Đang học",
    avatarUrl: "url-to-avatar-5",
  },
  {
    id: "6",
    name: "Lớp Sử 606",
    status: "Đã học",
    avatarUrl: "url-to-avatar-6",
  },
  {
    id: "7",
    name: "Lớp Địa 707",
    status: "Đang học",
    avatarUrl: "url-to-avatar-7",
  },
];

export default function ClassesScreen() {
  const router = useRouter();

  return (
    <View>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/")}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Danh sách lớp học</Text>
      </View>

      <ScrollView contentContainerStyle={styles.listContainer}>
        <Text style={styles.sectionTitle}>Danh sách lớp học</Text>
        <View style={styles.gridContainer}>
          {classes.map((item) => (
            <View key={item.id} style={styles.classItemContainer}>
              <ClassItem
                id={item.id}
                name={item.name}
                status={item.status}
                avatarUrl={item.avatarUrl || "default-avatar-url"}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  classItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  className: {
    fontSize: 18,
  },
  backButton: {
    padding: 8,
    ...(Platform.OS === "web" && { cursor: "pointer" }),
  },
  row: {
    justifyContent: "space-between",
  },
  classItemContainer: {
    width: "48%",
    marginBottom: 12,
    alignItems: "center",
  },
  listContainer: {
    paddingBottom: 100,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
});
