import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ClassItem from "../components/ClassItem";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import request from "../utility/request";
import { SERVER_URL } from "@env";
import { useUser } from "./contexts/UserContext";
import Toast from "@/components/Toast";

interface ClassData {
  class_id: string;
  class_name: string;
  attached_code: string | null;
  class_type: string;
  lecturer_name: string;
  student_count: number;
  start_date: string;
  end_date: string;
  status: string;
}

interface PageInfo {
  total_records: string;
  total_page: string;
  page_size: string;
  page: string;
  next_page: string | null;
  previous_page: string | null;
}

export default function ClassesScreen() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0); 
  const [pageSize] = useState<number>(5); 

  const { userInfo } = useUser();

  const role = userInfo?.role;
  const account_id = userInfo?.id;

  const loadClasses = async (page: number) => {
    setLoading(true);
    setError(null); 
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        setError("Token is missing");
        return;
      }
  
      const data = await request<any>(
        `${SERVER_URL}/it5023e/get_class_list`,
        {
          method: "POST",
          body: {
            token,
            role,
            account_id,
            pageable_request: {
              page: page.toString(),
              page_size: pageSize.toString(),
            },
          },
        }
      );

      if (data.meta.code === "1000") {
        setClasses(data.data.page_content);
        setPageInfo(data.data.page_info);
  
        setError(null);
      } else {
        setError("Error fetching class list");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses(currentPage);
  }, [currentPage]);

  const handleNextPage = () => {
    if (pageInfo && pageInfo.next_page) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (pageInfo && pageInfo.previous_page) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/")}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Danh sách lớp học</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#CC0000" style={{ marginTop: 20 }} />
      ) : classes.length === 0 ? (
        <View style={styles.noClassesContainer}>
          <Text style={styles.noClassesText}>Không có lớp học nào</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContainer}>
          <Text style={styles.sectionTitle}>Danh sách lớp học</Text>
          <View style={styles.gridContainer}>
            {classes.map((item) => (
              <View key={item.class_id} style={styles.classItemContainer}>
                <ClassItem
                  id={item.class_id}
                  name={item.class_name}
                  status={item.status}
                  lecturerName={item.lecturer_name}
                />
              </View>
            ))}
          </View>
          <View style={styles.paginationContainer}>
            {pageInfo && (
              <View style={styles.pagination}>
                <TouchableOpacity
                  disabled={!pageInfo.previous_page}
                  onPress={handlePreviousPage}
                  style={[
                    styles.pageButton,
                    !pageInfo.previous_page && styles.disabledButton,
                  ]}
                >
                  <Text style={styles.pageButtonText}>Trước</Text>
                </TouchableOpacity>
                <Text style={styles.pageInfo}>
                  Trang {Number(pageInfo.page) + 1} 
                </Text>
                <TouchableOpacity
                  disabled={!pageInfo.next_page}
                  onPress={handleNextPage}
                  style={[
                    styles.pageButton,
                    !pageInfo.next_page && styles.disabledButton,
                  ]}
                >
                  <Text style={styles.pageButtonText}>Sau</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>  
        </ScrollView>
      )}


      {error ? <Toast message={error} onDismiss={() => setError(null)} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    justifyContent: "space-between", 
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
    width: "100%",
    marginBottom: 0,
    alignItems: "center",
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  paginationContainer: {
    paddingVertical: 16, 
    backgroundColor: "#eee", 
  },
  pageButton: {
    padding: 10,
    backgroundColor: "#CC0000",
    borderRadius: 5,
    marginHorizontal: 10,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  pageButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  pageInfo: {
    fontSize: 16,
    fontWeight: "bold",
  },
  noClassesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  noClassesText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
});
