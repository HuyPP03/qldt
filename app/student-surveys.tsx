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
import { useUser } from "./contexts/UserContext";
interface SurveyData {
  id: string;
  title: string;
  description: string;
  deadline: string;
  file_url: string;
  class_id: string;
  is_submitted: boolean;
}

interface Response {
  data: string;
  meta: {
    code: string;
    message: string;
  };
}

export default function StudentSurveys() {
  const route = useRoute();
  const router = useRouter();
  const { id, name } = route.params as { id: string; name: string };
  const [surveys, setSurveys] = useState<SurveyData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filteredSurveys, setFilteredSurveys] = useState<SurveyData[]>([]);
  const [searchText, setSearchText] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"COMPLETED" | "PASS_DUE" | "UPCOMING">("UPCOMING");
  
  const { userInfo, token } = useUser();

  const fetchSurveys = async (type: string | null) => {
    if (!token) {
      setError("Token is missing");
      return;
    }

    try {
      const data = await request<any>(`${SERVER_URL}/it5023e/get_student_assignments`, {
        method: "POST",
        body: {
          token: token,
          type: type || null,
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
    fetchSurveys(activeTab);
  };

  useEffect(() => {
    fetchSurveys(activeTab);
  }, [activeTab, id]);

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
        <View style={styles.noSurveysContainer}>
        <Text style={styles.noSurveysText}>Không có bài kiểm tra nào</Text>
        </View>
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
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "UPCOMING" && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab("UPCOMING")}
        >
          <Text style={styles.tabText}>Sắp tới</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "COMPLETED" && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab("COMPLETED")}
        >
          <Text style={styles.tabText}>Hoàn thành</Text>
        </TouchableOpacity>        
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "PASS_DUE" && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab("PASS_DUE")}
        >
          <Text style={styles.tabText}>Quá hạn</Text>
        </TouchableOpacity>
      </View>
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
                  pathname: "/student-survey-detail",
                  params: {
                    id,
                    surveyId: survey.id,
                    surveyName: survey.title,
                    deadline: survey.deadline,
                    description: survey.description,
                    fileUrl: survey.file_url,
                    isSubmitted: (survey.is_submitted).toString(),
                  },
                });
              }}
            />
          </View>
        ))}
      </ScrollView>
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
    marginBottom: 10,
  },
  tabButton: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 40,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  activeTabButton: {
    backgroundColor: "#FFEEEE",
    borderColor: "#CC0000",
  },
  tabText: {
    fontSize: 12,
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
    paddingTop: 0,
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
