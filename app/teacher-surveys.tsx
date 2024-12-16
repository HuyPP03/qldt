import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
  TextInput,
  Animated,
  Modal,
  Pressable,
  TouchableWithoutFeedback,
  RefreshControl,
} from "react-native";
import { useEffect } from "react";
import { useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import SurveyItem from "../components/SurveyItem";
import request from "../utility/request";
import { SERVER_URL } from "@/utility/env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import LoadingIndicator from "@/components/LoadingIndicator";
import { Toast } from "@/components/Toast";
interface SurveyData {
  id: string;
  title: string;
  description: string;
  deadline: string;
  file_url: string;
  class_id: string;
}

interface Response {
  data: string;
  meta: {
    code: string;
    message: string;
  };
}

export default function TeacherSurvey() {
  const route = useRoute();
  const router = useRouter();
  const { id, name } = route.params as { id: string; name: string };
  const slideAnim = useRef(new Animated.Value(300)).current;
  const [surveys, setSurveys] = useState<SurveyData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedSurvey, setSelectedSurvey] = useState<SurveyData>();
  const [filteredSurveys, setFilteredSurveys] = useState<SurveyData[]>([]);
  const [searchText, setSearchText] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [refreshing, setRefreshing] = useState<boolean>(false);

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [confirmationModalVisible, setConfirmationModalVisible] =
    useState<boolean>(false);

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

  const deleteSurvey = async () => {
    const token = await AsyncStorage.getItem("userToken");

    if (!token) {
      setError("Token is missing");
      return;
    }

    try {
      if (!selectedSurvey) {
        setError("No survey selected to delete");
        return;
      }

      const response = await request<Response>(
        `${SERVER_URL}/it5023e/delete_survey`,
        {
          method: "POST",
          body: {
            token: token,
            survey_id: selectedSurvey.id,
          },
        }
      );

      if (response.meta.code === "1000") {
        setSurveys((prevSurveys) =>
          prevSurveys.filter((survey) => survey.id !== selectedSurvey.id)
        );
        setFilteredSurveys((prevSurveys) =>
          prevSurveys.filter((survey) => survey.id !== selectedSurvey.id)
        );
      } else {
        setError(response.meta.message || "Failed to delete survey.");
      }
    } catch (error) {
      setError("Something went wrong");
    } finally {
      setConfirmationModalVisible(false);
      setSuccess("Xóa bài kiểm tra thành công");
    }
  };

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
      } else {
        console.log("Failed to fetch surveys:", data.meta.message);
        setError(data.meta.message);
      }
    } catch (error) {
      console.log("Error fetching surveys:", error);
      setError("Unable to fetch surveys");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSurveys();
  };

  useEffect(() => {
    fetchSurveys();
  }, [id]);

  useEffect(() => {
    const filtered = surveys.filter((survey) =>
      survey.title.toLowerCase().includes(searchText.toLowerCase())
    );

    const sorted =
      sortOrder === "asc"
        ? filtered.sort((a, b) => a.title.localeCompare(b.title))
        : filtered.sort((a, b) => b.title.localeCompare(a.title));

    setFilteredSurveys(sorted);
  }, [searchText, sortOrder, surveys]);

  return loading ? (
    <LoadingIndicator />
  ) : filteredSurveys.length === 0 ? (
    <View style={styles.noSurveysContainer}>
      <Text style={styles.noSurveysText}>Không có bài kiểm tra nào</Text>
      <FloatingActionButton
        onPress={() =>
          router.push({
            pathname: "/create-survey",
            params: { id },
          })
        }
        iconName="add"
      />
    </View>
  ) : (
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
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalOverlay}>
            <Animated.View
              style={[
                styles.modalContainer,
                { transform: [{ translateY: slideAnim }] },
              ]}
            >
              <Text style={styles.modalTitle}>Bài kiểm tra</Text>
              <TouchableOpacity
                onPress={() => {
                  openConfirmationModal();
                  closeModal();
                }}
                style={styles.modalOption}
              >
                <Ionicons name="trash-outline" size={24} color="red" />
                <Text style={styles.optionText}>Xóa bài kiểm tra</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  router.replace({
                    pathname: "/edit-survey",
                    params: {
                      assignmentId: selectedSurvey?.id,
                      originalDeadline: selectedSurvey?.deadline,
                      originalDescription: selectedSurvey?.description,
                      classId: id,
                    },
                  })
                }
                style={styles.modalOption}
              >
                <Ionicons name="create-outline" size={24} color="black" />
                <Text style={styles.optionText}>Chỉnh sửa bài kiểm tra</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={closeModal}>
                <Text style={styles.closeButton}>Đóng</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <Modal
        visible={confirmationModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeConfirmationModal}
      >
        <TouchableWithoutFeedback onPress={closeConfirmationModal}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { zIndex: 9999 }]}>
              <Text style={styles.modalTitle}>Xác nhận xóa bài kiểm tra</Text>
              <View style={styles.modalButtonsContainer}>
                <Pressable
                  onPress={deleteSurvey}
                  style={styles.modalConfirmButton}
                >
                  <Text style={styles.modalConfirmButtonText}>Xác nhận</Text>
                </Pressable>
                <Pressable
                  onPress={closeConfirmationModal}
                  style={styles.modalCancelButton}
                >
                  <Text style={styles.modalCancelButtonText}>Hủy</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <ScrollView
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
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
              onPress={() => {
                router.push({
                  pathname: "/teacher-survey-detail",
                  params: {
                    id,
                    surveyId: survey.id,
                    surveyName: survey.title,
                    deadline: survey.deadline,
                    description: survey.description,
                    fileUrl: survey.file_url,
                  },
                });
              }}
              onMenuPress={() => {
                setSelectedSurvey(survey);
                openModal();
              }}
            />
          </View>
        ))}
      </ScrollView>
      <FloatingActionButton
        onPress={() =>
          router.push({
            pathname: "/create-survey",
            params: { id },
          })
        }
        iconName="add"
      />
      {error ? (
        <Toast message={error} onDismiss={() => setError(null)} />
      ) : null}
      {success ? (
        <Toast
          type="success"
          message={success}
          onDismiss={() => setSuccess(null)}
        />
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
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
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
  optionText: {
    fontSize: 16,
    marginLeft: 10,
  },
  noSurveysContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  noSurveysText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
});
