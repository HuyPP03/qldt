import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import FileItem from "../components/FileItem";
import { useUser } from "./contexts/UserContext";
import { Toast } from "@/components/Toast";
import TeacherSurveys from "./teacher-surveys";
import StudentSurveys from "./student-surveys";
import Files from "./files";
import GetStudentAbsentRequests from "./get-student-absent";
import ReviewAbsentRequests from "./review-absent";
import { AbsentStatus } from "./interfaces/absent/absent.interface";
import AbsentTab from "./absent-tab";

export default function ClassDetail() {
  const route = useRoute();
  const router = useRouter();
  const { id, tab } = route.params as { id: string; tab?: string };
  const [activeTab, setActiveTab] = useState(tab || "Bài kiểm tra");
  const [error, setError] = useState<string | null>(null);
  const { userInfo } = useUser();

  const renderContent = () => {
    switch (activeTab) {
      case "Bài kiểm tra":
        return userInfo?.role === "LECTURER" ? (
          <TeacherSurveys />
        ) : (
          <StudentSurveys />
        );
      case "Tệp":
        return <Files />;
      case "Nghỉ học":
        return userInfo?.role === "LECTURER" ? (
          <ReviewAbsentRequests classId={id} />
        ) : (
          <AbsentTab classId={id} />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/classes")}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}> Lớp {id}</Text>
      </View>
      <View style={styles.tabContainer}>
        {["Bài kiểm tra", "Tệp", "Nghỉ học"].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[
              styles.tabButton,
              activeTab === tab && styles.activeTabButton,
            ]}
          >
            <Text style={styles.tabText}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {renderContent()}

      {error ? (
        <Toast message={error} onDismiss={() => setError(null)} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
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
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  tabButton: {
    flex: 1,
    padding: 10,
    alignItems: "center",
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: "red",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
});
