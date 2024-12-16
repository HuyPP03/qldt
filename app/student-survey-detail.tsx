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
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { convertToVietnameseTime } from "@/utility/format-date";

interface SubmissionResponse {
  data: SubmissionData;
  meta: MetaData;
}

interface SubmissionData {
  id: number;                
  assignment_id: number;     
  submission_time: string;  
  grade: number | null;      
  file_url: string;  
  text_response: string;    
  student_account: StudentAccount;  
}

interface StudentAccount {
  account_id: string;        
  last_name: string;        
  first_name: string;       
  email: string;             
  student_id: string;       
}

interface MetaData {
  code: string;              
  message: string;          
}

export default function StudentSurveysDetail() {
  const { token } = useUser();
  const [activeTab, setActiveTab] = useState("Mô tả");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submission, setSubmission] = useState<SubmissionData | null>();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [success, setSuccess] = useState<string | null>(null);

  const route = useRoute();
  const { id, surveyId, surveyName, deadline, description, fileUrl, isSubmitted } =
    route.params as {
      id: string;
      surveyId: string;
      surveyName: string;
      deadline: string;
      description: string;
      fileUrl: string;
      isSubmitted: string;
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

  console.log(surveyId);

  const renderContent = () => {
    switch (activeTab) {
      case "Mô tả":
        return (
          <View style={styles.container}>
            {!submission && (<View style={styles.warningContainer}>
                <Ionicons name="alert-circle-outline" size={24} color="#FF9800" />
                <Text style={styles.warningText}>Chưa nộp bài</Text>
            </View>)}
            <ScrollView style={styles.content}>
              <View style={styles.nameDeadlineContainer}>
                <Text style={styles.title}>{surveyName}</Text>
                {isSubmitted === "true" ? (
                  <>
                  <Text style={styles.deadline}>
                    Đã nộp: {convertToVietnameseTime(submission!.submission_time)}
                  </Text>
                  {submission!.grade && (
                    <Text style={styles.deadline}>
                      Điểm: {submission!.grade}
                    </Text>
                  )}
                  </>
                  ) : (
                    <Text style={styles.deadline}>
                      Hạn nộp: {formattedDeadline}
                    </Text>
                  )
                  
                }
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
            {!submission ? (<FloatingActionButton
              onPress={() =>
                router.replace({
                  pathname: "/submit-survey",
                  params: {
                    assignmentId: surveyId,
                    classId: id,
                  },
                })
              }
              text="Nộp bài"
            />) : (<FloatingActionButton
              onPress={() =>
                {setActiveTab("Bài nộp của tôi")}
              }
              text="Xem bài nộp"
            />)}
          </View>
        );
      case "Bài nộp của tôi":
        return (
          <View style={styles.container}>
          { submission ?
          (<ScrollView
            contentContainerStyle={styles.content}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
          >
            <View style={styles.container}>
                            <Text style={styles.modalText}>
                              Bài nộp của {submission.student_account.first_name}{" "}
                              {submission.student_account.last_name}
                            </Text>
            
                            <View style={styles.sectionHeader}>
                              <Text style={styles.sectionHeaderText}>
                                Nội dung phản hồi:
                              </Text>
                            </View>
                            <ScrollView style={styles.textResponseContainer}>
                              <Text style={styles.responseText}>
                                {submission.text_response}
                              </Text>
                            </ScrollView>
            
                            {submission.file_url && (
                              <TouchableOpacity
                                style={styles.fileLinkButton}
                                onPress={() => Linking.openURL(submission.file_url)}
                              >
                                <Text style={styles.fileLinkText}>
                                  Tải về bài nộp của tôi
                                </Text>
                              </TouchableOpacity>
                            )}
                          </View>
          </ScrollView>) :
          (<View style={styles.warningContainer}>
            <Ionicons name="alert-circle-outline" size={24} color="#FF9800" />
            <Text style={styles.warningText}>Chưa nộp bài</Text>
        </View>)}
          </View>
        );
      default:
        return null;
    }
  };

  const fetchSubmissions = async () => {
    if (!token) {
      setError("Token is missing");
      return;
    }

    try {
      const data = await request<SubmissionResponse>(
        `${SERVER_URL}/it5023e/get_submission`,
        {
          method: "POST",
          body: {
            token: token,
            assignment_id: surveyId,
          },
        }
      );

      if (data.meta.code === "1000") {
        setSubmission(data.data);
      } 
    } catch (error) {
      setError("Unable to fetch submission response");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  console.log(submission)

  useEffect(() => {
    fetchSubmissions();
    }, [surveyId]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSubmissions();
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
        {["Mô tả", "Bài nộp của tôi"].map((tab) => (
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
  warningContainer: {
    backgroundColor: "#FFF9C4", 
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginTop: 0,
    flexDirection: "row", 
    alignItems: "center",
  },
  
  warningText: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "bold",
    marginLeft: 10, 
  },
  fileLinkButton: {
    backgroundColor: "#CC0000",
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: "center",
  },
  fileLinkText: {
    color: "#ffffff",
    fontSize: 16,
    textAlign: "center",
    textDecorationLine: "none",
  },
  fileLink: {
    marginTop: 10,
  },
  sectionHeader: {
    marginTop: 10,
    marginBottom: 5,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  textResponseContainer: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    maxHeight: 600,
    height: 500,
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    width: "100%",
    position: "absolute",
    bottom: 0,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: "center",
    fontWeight: "bold",
  },
  responseText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 10,
  },
});
