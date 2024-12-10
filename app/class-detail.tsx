import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Animated,
  Modal,
  Pressable, 
} from "react-native";
import { useEffect } from "react";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import FileItem from "../components/FileItem";
import SurveyItem from "../components/SurveyItem"; 
import request from "../utility/request";
import { SERVER_URL } from "@/utility/env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "./contexts/UserContext";
import { globalStyles } from "@/styles/globalStyles";
import { Toast } from "@/components/Toast";
interface SurveyData{
    id: string;
    title: string;
    description: string;
    deadline: string; 
    file_url: string;
    class_id: string;
}

interface Response{
  data: string;
  meta: {
    code: string
    message: string
  }
}

export default function ClassDetail() {
  const route = useRoute();
  const router = useRouter();
  const { id, name } = route.params as { id: string; name: string };
  const slideAnim = useRef(new Animated.Value(300)).current;
  const [activeTab, setActiveTab] = useState("Bài kiểm tra");
  const [surveys, setSurveys] = useState<SurveyData[]>([]); 
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null); 
  const [selectedSurvey, setSelectedSurvey] = useState<SurveyData>();
  const [filteredSurveys, setFilteredSurveys] = useState<SurveyData[]>([]);
  const [searchText, setSearchText] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const { userInfo } = useUser();

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [confirmationModalVisible, setConfirmationModalVisible] = useState<boolean>(false);

  const openModal = () => {
    setModalVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setModalVisible(false));
  };

  const openConfirmationModal = () => {
    setConfirmationModalVisible(true);
  };

  const closeConfirmationModal = () => {
    setConfirmationModalVisible(false);
  };

  console.log(selectedSurvey?.id)

  const deleteSurvey = async () => {
    const token = await AsyncStorage.getItem("userToken");
  
      if (!token) {
        setError("Token is missing");
        return;
      }

    try {
      if(!selectedSurvey){
        setError("No survey selected to delete")
        return;
      }

      const response = await request<Response>(`${SERVER_URL}/it5023e/delete_survey`, {
        method: "POST",
        body: {
          token: token,
          survey_id: selectedSurvey.id,
        },
      });

      if (response.meta.code === "1000") {
        setSurveys((prevSurveys) => prevSurveys.filter((survey) => survey.id !== selectedSurvey.id));
        setFilteredSurveys((prevSurveys) => prevSurveys.filter((survey) => survey.id !== selectedSurvey.id));
      } else {
        setError(response.meta.message || "Failed to delete survey.");
      }
    } catch (error) {
      setError("Something went wrong");
    } finally {
      setConfirmationModalVisible(false);
    }
  };

  useEffect(() => {
    const fetchSurveys = async () => {
      const token = await AsyncStorage.getItem("userToken");
  
      if (!token) {
        setError("Token is missing");
        return;
      }

      try {
        const data = await request<any>(`${SERVER_URL}/it5023e/get_all_surveys`, {
          method: "POST",
          body: {
            token: token,
            class_id: id,
          },
        });
  
        if (data.meta.code === "1000") {
          setSurveys(data.data); 
          setFilteredSurveys(data.data);
        } else {
          console.error("Failed to fetch surveys:", data.meta.message);
          setError(data.meta.message);
        }
      } catch (error) {
        console.error("Error fetching surveys:", error);
        setError("Unable to fetch surveys");
      } finally {
        setLoading(false);
      }
    };
  
    fetchSurveys();
  }, [id]);
  
  useEffect(() => {
    const filtered = surveys.filter((survey) =>
      survey.title.toLowerCase().includes(searchText.toLowerCase())
    );
  
    const sorted = sortOrder === "asc"
      ? filtered.sort((a, b) => a.title.localeCompare(b.title))
      : filtered.sort((a, b) => b.title.localeCompare(a.title));
  
    setFilteredSurveys(sorted);
  }, [searchText, sortOrder, surveys]);
  
  const renderContent = () => {
    if (loading) {
      return (
        <View style={globalStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#CC0000" />
        </View>
      );
    }

    switch (activeTab) {
      case "Bài kiểm tra":
        return userInfo?.role === "LECTURER" ? (
          <View style={styles.container}>
            <View style={styles.searchSortContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm kiếm bài kiểm tra..."
                value={searchText}
                onChangeText={setSearchText}
              />
              <TouchableOpacity
                onPress={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              >
                <Ionicons
                  name={sortOrder === "asc" ? "arrow-down" : "arrow-up"}
                  size={24}
                  color="black"
                />
              </TouchableOpacity>
            </View>
            <Modal
              visible={modalVisible}
              transparent={true}
              animationType="none"
              onRequestClose={closeModal}
            >
              <View style={styles.modalOverlay}>
                <Animated.View style={[
                  styles.modalContainer,
                  { transform: [{ translateY: slideAnim }] },
                ]}>
                  <Text style={styles.modalTitle}>Bài kiểm tra</Text>
                  <Pressable onPress={() => {
                    openConfirmationModal()
                    closeModal()  
                  }} style={styles.modalOption}>
                    <Text>Xóa bài kiểm tra</Text>
                  </Pressable>
                  <Pressable onPress={() => {}} style={styles.modalOption}>
                    <Text>Chỉnh sửa bài kiểm tra</Text>
                  </Pressable>
                  <TouchableOpacity onPress={closeModal}>
                    <Text style={styles.closeButton}>Đóng</Text>
                  </TouchableOpacity>
                </Animated.View>
              </View>
            </Modal>
            <ScrollView contentContainerStyle={styles.listContainer}>
              {filteredSurveys.map((survey) => (
                <View key={survey.id} style={styles.surveyItemContainer}>
                  <SurveyItem
                    key={survey.id}
                    id={survey.id}
                    surveyName={survey.title}
                    className={survey.class_id}
                    deadline={survey.deadline}
                    description={survey.description}
                    fileUrl={survey.file_url}
                    onMenuPress={() => {
                      setSelectedSurvey(survey)
                      openModal()
                    }}
                  />
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity
            style={styles.floatingActionButton}
            onPress={() => router.push({
              pathname: "/create-survey",
              params: { id },
            })} 
            >
            <Ionicons name="add" size={32} color="white" />
          </TouchableOpacity>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.listContainer}>
            {surveys.map((survey) => (
              <View>
                <Text>Student Survey List</Text>
              </View>
            ))}
          </ScrollView>
        );
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
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/classes")}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}> Lớp {id}</Text>
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
      
      {loading ? (
        <View style={globalStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#CC0000" />
        </View>
      ) : renderContent()}

      <Modal
        visible={confirmationModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeConfirmationModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { zIndex: 9999 }]}>
            <Text style={styles.modalTitle}>Xác nhận xóa bài kiểm tra</Text>
            <View style={styles.modalButtonsContainer}>
              <Pressable onPress={deleteSurvey} style={styles.modalConfirmButton}>
                <Text style={styles.modalConfirmButtonText}>Xác nhận</Text>
              </Pressable>
              <Pressable onPress={closeConfirmationModal} style={styles.modalCancelButton}>
                <Text style={styles.modalCancelButtonText}>Hủy</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {error ? <Toast message={error} onDismiss={() => setError(null)} /> : null}
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
  addButtonContainer: {
    alignItems: "flex-end",
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  addButton: {
    marginRight: 10,
  },
  surveyItemContainer: {
    width: "100%",
    marginBottom: 0,
    alignItems: "center",
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },

  sortContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  sortLabel: {
    fontSize: 16,
    marginRight: 10,
  },
  searchSortContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#f5f5f5",
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    color: "#666",
  },
  floatingActionButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "#CC0000",
    borderRadius: 50,
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    height: "100%",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    width: "100%",
    position: "absolute",
    bottom: 0,
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: "center",
    fontWeight: "bold",
  },
  modalOption: {
    padding: 10,
    width: "100%",
    alignItems: "center",
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
  },
  closeButton: {
    color: "blue",
    textAlign: "right",
  },
  modalButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: "#CC0000", 
    paddingVertical: 10,
    borderRadius: 5,
    marginRight: 10,
    alignItems: "center",
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: "#D3D3D3", 
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  modalConfirmButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  modalCancelButtonText: {
    color: "black",
  },
});
