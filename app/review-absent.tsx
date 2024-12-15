import React, { useEffect, useState, useCallback } from "react";
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
import { SERVER_URL } from "@env";
import request from "../utility/request";
import { useUser } from "./contexts/UserContext";
import {
  AbsentRequest,
  AbsentStatus,
  GetAbsentRequest,
  GetAbsentResponse,
  ReviewAbsentRequest,
  ReviewAbsentResponse,
  TranslatedAbsentStatus,
} from "./interfaces/absent/absent.interface";
import { useRoute } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { WebView } from "react-native-webview";

interface reviewAbsentParams {
  classId: string;
}

const ReviewAbsentRequests = ({classId}: reviewAbsentParams) => {
  const { token } = useUser();

  console.log( classId )

  const [absentRequests, setAbsentRequests] = useState<AbsentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "pending", title: "Đang chờ" },
    { key: "reviewed", title: "Đã duyệt" },
  ]);
  const [filterDate, setFilterDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null);

  const fetchAbsentRequests = useCallback(async () => {
    try {
      
      
      const req: GetAbsentRequest = {
        token: token as string,
        class_id: classId,
        date: filterDate?.toISOString().split("T")[0],
      };
      console.log(req)
      const response: GetAbsentResponse = await request(
        `${SERVER_URL}/it5023e/get_absence_requests`,
        {
          body: req,
        }
      );

      if (response.meta.code === "1000") {
        setAbsentRequests(response.data.page_content);
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
  }, [classId, token, filterDate]);

  useEffect(() => {
    fetchAbsentRequests();
  }, [fetchAbsentRequests]);

  const handleReview = async (requestId: string, status: AbsentStatus) => {
    try {
      const req: ReviewAbsentRequest = {
        token: token as string,
        request_id: requestId,
        status,
      };
      const response: ReviewAbsentResponse = await request(
        `${SERVER_URL}/it5023e/review_absence_request`,
        {
          body: req,
        }
      );

      if (response.meta.code === "1000") {
        console.log("Reviewed absent request", requestId);
        fetchAbsentRequests(); // Refetch data after review
      } else {
        console.error(
          "Failed to approve absent request",
          response.meta.message
        );
      }
    } catch (error) {
      console.error("Error approving absent request:", error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAbsentRequests().then(() => setRefreshing(false));
  };

  const renderAbsentRequest = ({ item }: { item: AbsentRequest }) => {
    const getStatusStyle = () => {
      switch (item.status) {
        case AbsentStatus.ACCEPTED:
          return styles.acceptedRequest;
        case AbsentStatus.REJECTED:
          return styles.rejectedRequest;
        default:
          return styles.pendingRequest;
      }
    };

    const getStatusTextStyle = () => {
      switch (item.status) {
        case AbsentStatus.ACCEPTED:
          return styles.acceptedStatusText;
        case AbsentStatus.REJECTED:
          return styles.rejectedStatusText;
        default:
          return styles.pendingStatusText;
      }
    };

    return (
      <View style={[styles.requestContainer, getStatusStyle()]}>
        <View style={styles.requestHeader}>
          <Text style={styles.requestTitle}>{item.title}</Text>
          <Text style={styles.requestDate}>{item.absence_date}</Text>
        </View>
        <Text style={styles.requestReason}>{item.reason}</Text>
        {item.file_url && (
          <TouchableOpacity
            style={styles.fileButton}
            onPress={() => setSelectedFileUrl(item.file_url as string)}
          >
            <Text style={styles.fileButtonText}>Xem minh chứng</Text>
          </TouchableOpacity>
        )}
        <View style={styles.statusContainer}>
          <Text style={[styles.statusText]}>
            Trạng thái:{" "}
            <Text style={getStatusTextStyle()}>
              {TranslatedAbsentStatus[item.status]}
            </Text>
          </Text>
          {item.status === AbsentStatus.PENDING && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => handleReview(item.id, AbsentStatus.ACCEPTED)}
              >
                <Ionicons name="checkmark" size={24} color="#4CAF50" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => handleReview(item.id, AbsentStatus.REJECTED)}
              >
                <Ionicons name="close" size={24} color="#F44336" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  const PendingRequests = () => (
    <FlatList
      data={absentRequests.filter(
        (request) => request.status === AbsentStatus.PENDING
      )}
      renderItem={renderAbsentRequest}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );

  const ReviewedRequests = () => (
    <FlatList
      data={absentRequests.filter(
        (request) =>
          request.status === AbsentStatus.ACCEPTED ||
          request.status === AbsentStatus.REJECTED
      )}
      renderItem={renderAbsentRequest}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );

  const renderScene = SceneMap({
    pending: PendingRequests,
    reviewed: ReviewedRequests,
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.timeInput}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.datePickerButtonText}>
          {filterDate?.toISOString().split("T")[0] ?? "Chọn ngày"}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <View style={styles.datePickerWrapper}>
          <DateTimePicker
            value={filterDate ?? new Date()}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (date) setFilterDate(date);
            }}
            themeVariant="light"
            accentColor="#CC0000"
          />
        </View>
      )}
      {loading ? (
        <ActivityIndicator size="large" color="#CC0000" />
      ) : (
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: Platform.OS === "web" ? 800 : 360 }}
          renderTabBar={(props) => (
            <TabBar
              {...props}
              indicatorStyle={{ backgroundColor: "#CC0000" }}
              style={{ backgroundColor: "white" }}
              activeColor="#CC0000"
              inactiveColor="#666"
            />
          )}
        />
      )}
      {selectedFileUrl && (
        <Modal
          visible={true}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setSelectedFileUrl(null)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <WebView
                source={{ uri: selectedFileUrl }}
                style={styles.filePreview}
              />
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedFileUrl(null)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

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
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  datePickerButton: {
    backgroundColor: "#CC0000",
    padding: 10,
    borderRadius: 5,
  },
  datePickerButtonText: {
    color: "#C60000",
    fontSize: 14,
  },
  clearFilterButton: {
    backgroundColor: "#F44336",
    padding: 10,
    borderRadius: 5,
  },
  clearFilterButtonText: {
    color: "white",
    fontSize: 14,
  },
  listContainer: {
    padding: 16,
  },
  requestContainer: {
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  pendingRequest: {
    backgroundColor: "#f9f9f9",
  },
  acceptedRequest: {
    backgroundColor: "#e0f7e9",
  },
  rejectedRequest: {
    backgroundColor: "#fdecea",
  },
  requestDate: {
    fontSize: 14,
    color: "#666",
  },
  requestReason: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
  },
  fileButton: {
    backgroundColor: "#CC0000",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 8,
  },
  fileButtonText: {
    color: "white",
    fontSize: 14,
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusText: {
    fontSize: 14,
    color: "#333",
  },
  actionButtons: {
    flexDirection: "row",
  },
  iconButton: {
    marginLeft: 8,
  },
  pendingStatusText: {
    color: "#000000",
    fontWeight: "bold",
  },
  acceptedStatusText: {
    color: "#4CAF50",
    fontWeight: "bold",
  },
  rejectedStatusText: {
    color: "#F44336",
    fontWeight: "bold",
  },
  datePickerWrapper: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "white",
    zIndex: 1000,
  },
  timeInput: {
    height: 50,
    width: "100%",
    borderWidth: 1,
    borderColor: "#CC0000",
    borderRadius: 0,
    paddingHorizontal: 12,
    backgroundColor: "white",
    justifyContent: "center",
    alignContent: "center",
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
    alignItems: "center",
    maxHeight: "80%",
  },
  filePreview: {
    width: "100%",
    height: 400,
    marginBottom: 20,
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

export default ReviewAbsentRequests;