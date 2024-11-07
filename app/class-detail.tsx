import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import FileItem from "../components/FileItem";

export default function ClassDetail() {
  const route = useRoute();
  const router = useRouter();
  const { id } = route.params as { id: string };

  const [activeTab, setActiveTab] = useState("Bài kiểm tra");

  const renderContent = () => {
    switch (activeTab) {
      case "Bài kiểm tra":
        return <Text>Nội dung Bài kiểm tra</Text>;
      case "Tệp":
        return (
          <View>
            <View style={styles.addButtonContainer}>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  /* Logic thêm file */
                }}
              >
                <Ionicons name="add" size={24} color="black" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {[
                {
                  fileName: "File 1.pdf",
                  fileSize: "2MB",
                  uploadTime: "1 ngày trước",
                  fileType: "pdf",
                },
                {
                  fileName: "File 2.jpg",
                  fileSize: "3MB",
                  uploadTime: "2 ngày trước",
                  fileType: "image",
                },
                {
                  fileName: "File 3.mp4",
                  fileSize: "5MB",
                  uploadTime: "3 ngày trước",
                  fileType: "video",
                },
                {
                  fileName: "File 4.mp3",
                  fileSize: "4MB",
                  uploadTime: "4 ngày trước",
                  fileType: "audio",
                },
                {
                  fileName: "File 5.docx",
                  fileSize: "1MB",
                  uploadTime: "5 ngày trước",
                  fileType: "word",
                },
                {
                  fileName: "File 6.xlsx",
                  fileSize: "6MB",
                  uploadTime: "6 ngày trước",
                  fileType: "excel",
                },
                {
                  fileName: "File 7.pptx",
                  fileSize: "7MB",
                  uploadTime: "7 ngày trước",
                  fileType: "powerpoint",
                },
                {
                  fileName: "File 8.zip",
                  fileSize: "8MB",
                  uploadTime: "8 ngày trước",
                  fileType: "zip",
                },
                {
                  fileName: "File 9.txt",
                  fileSize: "9MB",
                  uploadTime: "9 ngày trước",
                  fileType: "text",
                },
              ].map((file, index) => (
                <FileItem
                  key={index}
                  fileName={file.fileName}
                  fileSize={file.fileSize}
                  uploadTime={file.uploadTime}
                  fileType={file.fileType}
                />
              ))}
            </ScrollView>
          </View>
        );
      case "Ứng dụng":
        return <Text>Nội dung Ứng dụng</Text>;
      default:
        return null;
    }
  };

  return (
    <View>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/classes")}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Lớp 1</Text>
      </View>
      <View style={styles.tabContainer}>
        {["Bài kiểm tra", "Tệp", "Ứng dụng"].map((tab) => (
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
  },
  addButtonContainer: {
    alignItems: "flex-end",
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  addButton: {
    marginRight: 10,
  },
});
