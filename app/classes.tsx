import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  TextInput,
  Modal,
  Pressable,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ClassItem from "../components/ClassItem";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import request from "../utility/request";
import { SERVER_URL } from "@/utility/env";
import { useUser } from "./contexts/UserContext";
import { Toast } from "@/components/Toast";
import { globalStyles } from "@/styles/globalStyles";

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

interface Response {
  data: {
    page_content: ClassData[];
    page_info: PageInfo;
  };
  meta: {
    code: string;
    message: string;
  };
}

export default function ClassesScreen() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0); 

  const slideAnim = useRef(new Animated.Value(300)).current;
  const [searchText, setSearchText] = useState<string>(""); 
  const [sortModalVisible, setSortModalVisible] = useState<boolean>(false);
  const [filteredClasses, setFilteredClasses] = useState<ClassData[]>([]); 

  const [activeClasses, setActiveClasses] = useState<ClassData[]>([]);
  const [upcomingClasses, setUpcomingClasses] = useState<ClassData[]>([]);
  const [completedClasses, setCompletedClasses] = useState<ClassData[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>("active");

  const [pageSize] = useState<number>(1000); 

  const { userInfo } = useUser();
  const role = userInfo?.role;
  const account_id = userInfo?.id;
  console.log(account_id);

  const loadClasses = async (page: number) => {
    setLoading(true);
    setError(null); 
    try {
      const token = await AsyncStorage.getItem("userToken");
      console.log(token)
      if (!token) {
        setError("Token is missing");
        return;
      }
  
      const data = await request<Response>(
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

        const active: ClassData[] = [];
        const upcoming: ClassData[] = [];
        const completed: ClassData[] = [];
        


        data.data.page_content.forEach((item) => {
          switch (item.status) {
            case "ACTIVE":
              active.push(item);
              break;
            case "UPCOMING":
              upcoming.push(item);
              break;
            case "COMPLETED":
              completed.push(item);
              break;
            default:
              break;
          }
        });
        
        setActiveClasses(active);
        setUpcomingClasses(upcoming);
        setCompletedClasses(completed);
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

  const openModal = () => {
    setSortModalVisible(true);
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
    }).start(() => setSortModalVisible(false));
  };

  useEffect(() => {
    loadClasses(currentPage);
  }, [currentPage]);

  useEffect(() => {
    const selectedClasses = getClassesForSelectedTab();
  
    if (selectedClasses) {
      setFilteredClasses(selectedClasses);
    }
  }, [classes, selectedTab]);

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

  useEffect(() => {
    const selectedClasses = getClassesForSelectedTab();
  
    if (searchText.length >= 3) {
      setFilteredClasses(
        selectedClasses.filter((c) =>
          c.class_name.toLowerCase().includes(searchText.toLowerCase())
        )
      );
    } else {
      setFilteredClasses(selectedClasses); 
    }
  }, [searchText, selectedTab]);

  const handleSort = (option: string) => {
    let sortedClasses = [...filteredClasses];
    switch (option) {
      case "name_asc":
        sortedClasses.sort((a, b) => a.class_name.localeCompare(b.class_name));
        break;
      case "name_desc":
        sortedClasses.sort((a, b) => b.class_name.localeCompare(a.class_name));
        break;
      case "newest":
        sortedClasses.sort(
          (a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
        );
        break;
      case "oldest":
        sortedClasses.sort(
          (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
        );
        break;
    }
    setFilteredClasses(sortedClasses);
    setSortModalVisible(false); 
  };

  const getClassesForSelectedTab = () => {
    switch (selectedTab) {
      case "active":
        return activeClasses;
      case "upcoming":
        return upcomingClasses;
      case "completed":
        return completedClasses;
      default:
        return [];
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

        <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, selectedTab === "active" && styles.selectedTab]}
          onPress={() => setSelectedTab("active")}
        >
          <Text style={styles.tabText}>Đang diễn ra</Text>
        </TouchableOpacity>
        <TouchableOpacity 
        style={[styles.tabButton, selectedTab === "upcoming" && styles.selectedTab]}
        onPress={() => setSelectedTab("upcoming")}
        >
          <Text style={styles.tabText}>Sắp diễn ra</Text>
        </TouchableOpacity>
        <TouchableOpacity 
        style={[styles.tabButton, selectedTab === "completed" && styles.selectedTab]}
        onPress={() => setSelectedTab("completed")}
        >
          <Text style={styles.tabText}>Đã kết thúc</Text>
        </TouchableOpacity>
      </View>

      {!loading && (
      <View>
          <View style={styles.searchSortContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm lớp học..."
              value={searchText}
              onChangeText={setSearchText} 
              />

            <TouchableOpacity onPress={openModal}>
              <Ionicons name="filter" size={24} color="black" />
            </TouchableOpacity>
          </View>
          <Modal
            visible={sortModalVisible}
            transparent={true}
            animationType="none"
            onRequestClose={closeModal}
          >
            <View style={styles.modalOverlay}>
              <Animated.View style={[
                styles.modalContainer,
                { transform: [{ translateY: slideAnim }] },
              ]}>
                <Text style={styles.modalTitle}>Sắp xếp</Text>
                <Pressable onPress={() => handleSort("name_asc")} style={styles.modalOption}>
                  <Text>Tên (A-Z)</Text>
                </Pressable>
                <Pressable onPress={() => handleSort("name_desc")} style={styles.modalOption}>
                  <Text>Tên (Z-A)</Text>
                </Pressable>
                <Pressable onPress={() => handleSort("newest")} style={styles.modalOption}>
                  <Text>Mới nhất</Text>
                </Pressable>
                <Pressable onPress={() => handleSort("oldest")} style={styles.modalOption}>
                  <Text>Cũ nhất</Text>
                </Pressable>
                <TouchableOpacity onPress={closeModal}>
                  <Text style={styles.closeButton}>Đóng</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </Modal>
        </View>
      )}
      {loading ? (
        <View style={globalStyles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#CC0000"
            style={{ marginTop: 20 }}
          />
        </View>  
      ) : classes.length === 0 ? (
        <View style={styles.noClassesContainer}>
          <Text style={styles.noClassesText}>Không có lớp học nào</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContainer}>
        <View style={styles.gridContainer}>
          {filteredClasses.map((item) => (
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
          
          {/*<View style={styles.paginationContainer}>
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
          </View>*/}
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
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  tabContainer: {
    flexDirection: "row",
    marginTop: 10,
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  tabButton: {
    padding: 10,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  selectedTab: {
    borderBottomColor: "#CC0000", 
  },
  tabText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
});
