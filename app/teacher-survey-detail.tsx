import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
  Linking,
  RefreshControl,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useUser } from "./contexts/UserContext";
import { Toast } from "@/components/Toast";
import request from "@/utility/request";
import { SERVER_URL } from "@/utility/env";
import { SubmissionItem } from "@/components/SubmissionItem";
import LoadingIndicator from "@/components/LoadingIndicator";

interface StudentAccount {
  account_id: string;
  last_name: string;
  first_name: string;
  email: string;
  student_id: string;
}

interface SubmissionData {
  id: number;
  assignment_id: number;
  submission_time: string;
  grade: string | null;
  file_url: string;
  text_response: string;
  student_account: StudentAccount;
}

interface SubmissionResponse {
  data: SubmissionData[];
  meta: {
    code: string;
    message: string;
  };
}

export default function TeacherSurveyDetail() {
  const { token } = useUser();
  const [activeTab, setActiveTab] = useState("Mô tả");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submissions, setSubmissions] = useState<SubmissionData[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [success, setSuccess] = useState<string | null>(null);

  const route = useRoute();
  const { id, surveyId, surveyName, deadline, description, fileUrl } =
    route.params as {
      id: string;
      surveyId: string;
      surveyName: string;
      deadline: string;
      description: string;
      fileUrl: string;
    };

  const formatDeadline = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

  const formattedDeadline = formatDeadline(deadline);

  console.log(submissions);

  const renderContent = () => {
    switch (activeTab) {
      case "Mô tả":
        return (
          <View style={styles.container}>
            <ScrollView style={styles.content}>
              <View style={styles.nameDeadlineContainer}>
                <Text style={styles.title}>{surveyName}</Text>
                <Text style={styles.deadline}>
                  Hạn nộp: {formattedDeadline}
                </Text>
              </View>

              <Text style={styles.sectionHeading}>Hướng dẫn</Text>
              <ScrollView style={styles.descriptionContainer}>
                <Text style={styles.descriptionText}>{description}</Text>
              </ScrollView>

              <Text style={styles.sectionHeading}>Bài tập của tôi</Text>
              {fileUrl && (
                <TouchableOpacity
                  style={styles.fileBox}
                  onPress={() => Linking.openURL(fileUrl)}
                >
                  <View style={styles.fileContainer}>
                    <Text style={styles.fileText}>Tải tài liệu đính kèm</Text>
                    <Ionicons
                      name="document-text-outline"
                      size={20}
                      color="#0066CC"
                      style={styles.fileIcon}
                    />
                  </View>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        );
      case "Bài nộp và chấm điểm":
        return (
          <ScrollView
            contentContainerStyle={styles.content}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
          >
            <Text style={styles.title}>Lớp {id}</Text>
            {submissions.map((submission) => (
              <SubmissionItem
                key={submission.id}
                submission={submission}
                onGrade={handleGrade}
              />
            ))}
          </ScrollView>
        );
      default:
        return null;
    }
  };

  const fetchSubmissionResponse = async () => {
    if (!token) {
      setError("Token is missing");
      return;
    }

    try {
      const data = await request<SubmissionResponse>(
        `${SERVER_URL}/it5023e/get_survey_response`,
        {
          method: "POST",
          body: {
            token: token,
            survey_id: surveyId,
          },
        }
      );

      if (data.meta.code === "1000") {
        setSubmissions(data.data);
      } else {
        console.log("Failed to fetch submission responses:", data.meta.message);
        setError(data.meta.message);
      }
    } catch (error) {
      console.log("Error fetching submission responses:", error);
      setError("Unable to fetch submission responses");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleGrade = async (
    submissionId: number,
    grade: string | null,
    userId: string
  ) => {
    if (!token) {
      setError("Token is missing");
      return;
    }

    if (grade === null || grade === "") {
      setError("Please enter a grade");
      return;
    }

    const payload = {
      token: token,
      survey_id: surveyId,
      grade: {
        score: grade,
        submission_id: submissionId.toString(),
      },
    };

    try {
      const data = await request<SubmissionResponse>(
        `${SERVER_URL}/it5023e/get_survey_response`,
        {
          method: "POST",
          body: payload,
        }
      );

      const formDataSendMail = new FormData();

      formDataSendMail.append(
        "message",
        JSON.stringify({
          pathname: "student-survey-detail",
          params: {
            surveyId,
            surveyName,
            deadline,
            description,
            fileUrl,
            grade: grade,
            isSubmitted: "true",
          },
        })
      );
      formDataSendMail.append("token", token as string);
      formDataSendMail.append("toUser", userId);
      formDataSendMail.append("type", "ASSIGNMENT_GRADE");

      await request(`${SERVER_URL}/it5023e/send_notification`, {
        method: "POST",
        body: formDataSendMail,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (data.meta.code === "1000") {
        console.log("Grade submitted successfully");
        fetchSubmissionResponse();
      } else {
        console.log("Failed to submit grade:", data.meta.message);
        setError(data.meta.message);
      }
    } catch (error) {
      console.log("Error submitting grade:", error);
      setError("Chấm điểm thất bại");
    } finally {
      setSuccess("Chấm điểm thành công");
    }
  };

  useEffect(() => {
    fetchSubmissionResponse();
  }, [surveyId]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSubmissionResponse();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Nội dung bài kiểm tra</Text>
      </View>
      <View style={styles.tabContainer}>
        {["Mô tả", "Bài nộp và chấm điểm"].map((tab) => (
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

      {loading ? <LoadingIndicator /> : renderContent()}

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
    backgroundColor: "#FFFFFF",
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
  content: {
    padding: 20,
  },
  nameDeadlineContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 5,
  },
  deadline: {
    fontSize: 16,
    color: "#666",
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginTop: 15,
    marginBottom: 5,
  },
  description: {
    fontSize: 16,
    color: "#333333",
    lineHeight: 24,
  },
  fileContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-start",
  },
  fileText: {
    color: "#0066CC",
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  fileIcon: {
    marginLeft: 10,
  },
  fileBox: {
    backgroundColor: "#F0F0F0",
    borderColor: "#CCCCCC",
    borderWidth: 1,
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
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
  descriptionContainer: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    maxHeight: 500,
    height: 300,
  },
  descriptionText: {
    color: "#333",
    marginBottom: 10,
  },
});
