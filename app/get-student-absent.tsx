import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import request from "../utility/request";
import { SERVER_URL } from "@env";
import {
  AbsentRequest,
  GetStudentAbsentRequest,
  GetStudentAbsentResponse,
  TranslatedAbsentStatus,
} from "./interfaces/absent/absent.interface";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WebView } from "react-native-webview";

export default function GetStudentAbsentRequests() {
  const router = useRouter();
  const [absentRequests, setAbsentRequests] = useState<AbsentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<AbsentRequest | null>(
    null
  );
  const pageSize = "5";

  useEffect(() => {
    fetchAbsentRequests();
  }, [page]);

  const fetchAbsentRequests = async () => {
    const token = await AsyncStorage.getItem("userToken");

    try {
      const req: GetStudentAbsentRequest = {
        token: token as string,
        class_id: "838688",
        pageable_request: {
          page: page.toString(),
          page_size: pageSize,
        },
      };

      const response: GetStudentAbsentResponse = await request(
        `${SERVER_URL}/it5023e/get_student_absence_requests`,
        {
          body: req,
        }
      );

      if (response.meta.code === "1000") {
        setAbsentRequests(response.data.page_content);
        setTotalPages(parseInt(response.data.page_info.total_page, 10));
      } else {
        console.error(
          "Failed to fetch absent requests:",
          response.data,
          "-",
          response.meta.message
        );
      }
    } catch (error) {
      console.error("Error fetching absent requests:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setPage(0);
    setRefreshing(false);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return styles.acceptedStatus;
      case "REJECTED":
        return styles.rejectedStatus;
      default:
        return styles.pendingStatus;
    }
  };
  const renderAbsentRequest = ({ item }: { item: AbsentRequest }) => {
    return (
      <TouchableOpacity onPress={() => setSelectedRequest(item)}>
        <View style={styles.requestContainer}>
          <Text style={styles.requestTitle}>{item.title}</Text>
          <Text style={styles.requestDate}>{item.absence_date}</Text>
          <Text style={styles.requestReason}>{item.reason}</Text>
          <Text style={[styles.requestStatus, getStatusStyle(item.status)]}>
            {TranslatedAbsentStatus[item.status]}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderPagination = () => {
    const pages = [];
    const maxPagesToShow = 3;
    const startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (startPage > 1) {
      pages.push(
        <TouchableOpacity
          key="prev"
          style={styles.pageButton}
          onPress={() => setPage(page - 1)}
        >
          <Ionicons name="chevron-back" size={8} color="#333" />
        </TouchableOpacity>
      );
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <TouchableOpacity
          key={i - 1}
          style={[styles.pageButton, page === i - 1 && styles.activePageButton]}
          onPress={() => setPage(i - 1)}
        >
          <Text style={styles.pageButtonText}>{i}</Text>
        </TouchableOpacity>
      );
    }

    if (endPage < totalPages) {
      pages.push(
        <TouchableOpacity
          key="next"
          style={styles.pageButton}
          onPress={() => setPage(page + 1)}
        >
          <Ionicons name="chevron-forward" size={8} color="#333" />
        </TouchableOpacity>
      );
    }

    return <View style={styles.paginationContainer}>{pages}</View>;
  };

  return (
    <View style={styles.container}>
      {/* <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Đơn xin nghỉ</Text>
      </View> */}
      {loading && page === 1 ? (
        <ActivityIndicator size="large" color="#CC0000" />
      ) : (
        <FlatList
          data={absentRequests}
          renderItem={renderAbsentRequest}
          keyExtractor={(item) => item.id}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListFooterComponent={renderPagination}
        />
      )}
      {selectedRequest && (
        <Modal
          visible={true}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setSelectedRequest(null)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <ScrollView contentContainerStyle={styles.modalScrollContent}>
                <Text style={styles.modalTitle}>
                  Tiêu đề: {selectedRequest.title}
                </Text>
                <Text style={styles.modalDate}>
                  Ngày xin nghỉ: {selectedRequest.absence_date}
                </Text>
                <Text style={styles.modalReason}>
                  Lí do: {selectedRequest.reason}
                </Text>
                <Text
                  style={[
                    styles.modalStatus,
                    getStatusStyle(selectedRequest.status),
                  ]}
                >
                  {TranslatedAbsentStatus[selectedRequest.status]}
                </Text>
                {selectedRequest.file_url && (
                  <View style={styles.filePreviewContainer}>
                    <Text style={styles.modalFileUrl}>Minh chứng:</Text>
                    <WebView
                      source={{
                        uri: selectedRequest.file_url,
                      }}
                      style={styles.filePreview}
                    />
                  </View>
                )}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setSelectedRequest(null)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
    ...(Platform.OS === "web" && {
      cursor: "pointer",
    }),
  },
  requestContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  requestDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  requestReason: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
  },
  requestStatus: {
    fontSize: 14,
    fontWeight: "bold",
  },
  acceptedStatus: {
    color: "#4CAF50",
  },
  rejectedStatus: {
    color: "#F44336",
  },
  pendingStatus: {
    color: "#FF9800",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginVertical: 20,
  },
  pageButton: {
    padding: 10,
    marginHorizontal: 5,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
  },
  activePageButton: {
    backgroundColor: "#CC0000",
  },
  pageButtonText: {
    color: "#333",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    maxHeight: "80%",
  },
  modalScrollContent: {
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  modalReason: {
    fontSize: 14,
    color: "#333",
    marginBottom: 10,
  },
  modalStatus: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 20,
  },
  modalStudentInfo: {
    fontSize: 14,
    color: "#333",
    marginBottom: 10,
  },
  modalFileUrl: {
    fontSize: 14,
    color: "#333",
    marginBottom: 10,
  },
  filePreviewContainer: {
    width: "100%",
    height: 400,
    marginBottom: 20,
  },
  filePreview: {
    width: "100%",
    height: "100%",
  },
  closeButton: {
    backgroundColor: "#CC0000",
    padding: 10,
    borderRadius: 5,
    alignSelf: "center",
  },
  closeButtonText: {
    color: "white",
    fontSize: 14,
  },
});
