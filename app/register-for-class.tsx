import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  TextInput,
  ScrollView,
  Linking,
  Animated,
  ActivityIndicator,
} from "react-native";
import { Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "./contexts/UserContext";
import request from "../utility/request";
import { useState } from "react";
import React from "react";
import { SERVER_URL } from "@env";
import { useRouter } from "expo-router";

const Toast = ({
  message,
  type,
}: {
  message: string;
  type: "error" | "success";
}) => {
  const translateY = new Animated.Value(100);

  React.useEffect(() => {
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      speed: 12,
      bounciness: 8,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(translateY, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, 2700);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        type === "success" ? styles.successToast : styles.errorToast,
        {
          transform: [{ translateY }],
        },
      ]}
    >
      <Text
        style={[
          styles.toastText,
          type === "success" ? styles.successToastText : styles.errorToastText,
        ]}
      >
        {message}
      </Text>
    </Animated.View>
  );
};

const Loading = () => {
  return (
    <View style={styles.loadingContainer}>
      <View style={styles.loadingContent}>
        <ActivityIndicator size="large" color="#CC0000" />
        <Text style={styles.loadingText}>Đang xử lý đăng ký...</Text>
      </View>
    </View>
  );
};

interface Class {
  class_id: string;
  class_name: string;
  class_type: string;
  status: "ACTIVE" | "INACTIVE";
  max_student_amount: number;
  start_date: string;
  end_date: string;
}

export default function RegisterForClass() {
  const { token } = useUser();
  const router = useRouter();
  const [classes, setClasses] = useState<Class[]>([]);
  const [classId, setClassId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedClasses, setSelectedClasses] = useState<number[]>([]);

  const searchClass = async () => {
    try {
      const response: any = await request(
        "http://160.30.168.228:8080/it5023e/get_basic_class_info",
        {
          body: {
            token,
            class_id: classId,
          },
        }
      );

      if (response) {
        setClassId("");
        const isClassExist = classes.some(
          (existingClass) => existingClass.class_id === response.data.class_id
        );

        if (!isClassExist) {
          setClasses([...classes, response.data]);
        } else {
          setErrorMessage("Lớp học này đã tồn tại trong danh sách.");
          setTimeout(() => setErrorMessage(""), 3000);
        }
      }
    } catch (error: any) {
      setErrorMessage(error.data);
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const handleRegisterClasses = async () => {
    try {
      setIsLoading(true);

      const response = await request(`${SERVER_URL}/it5023e/register_class`, {
        body: {
          token,
          class_ids: classes.map((c) => c.class_id),
        },
      });

      if (response) {
        setIsLoading(false);
        setSuccessMessage("Đăng ký lớp thành công!");
        setClasses([]);
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (error) {
      setIsLoading(false);
      setErrorMessage("Đăng ký lớp không thành công. Vui lòng thử lại sau.");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const handleDeleteClass = () => {
    if (selectedClasses.length > 0) {
      const newClasses = classes.filter(
        (_, index) => !selectedClasses.includes(index)
      );
      setClasses(newClasses);
      setSelectedClasses([]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Đăng ký lớp học</Text>
      </View>

      <View style={styles.searchSection}>
        <TextInput
          style={styles.input}
          placeholder="Mã lớp"
          placeholderTextColor="#666"
          value={classId}
          onChangeText={(text) => setClassId(text)}
        />
        <TouchableOpacity style={styles.searchButton} onPress={searchClass}>
          <Text style={styles.buttonText}>Đăng ký</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.selectedClasses}>
        <View style={styles.tableContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              <View style={styles.tableHeader}>
                <View style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.tableHeaderCell]}>
                    <Text style={styles.headerText}>Mã lớp</Text>
                  </Text>
                  <Text style={[styles.tableCell, styles.tableHeaderCell]}>
                    <Text style={styles.headerText}>Mã lớp kèm</Text>
                  </Text>
                  <Text style={[styles.tableCell, styles.tableHeaderCell]}>
                    <Text style={styles.headerText}>Tên lớp</Text>
                  </Text>
                  <Text style={[styles.tableCell, styles.tableHeaderCell]}>
                    <Text style={styles.headerText}>Loại lớp</Text>
                  </Text>
                  <Text style={[styles.tableCell, styles.tableHeaderCell]}>
                    <Text style={styles.headerText}>Trạng thái</Text>
                  </Text>
                  <Text style={[styles.tableCell, styles.tableHeaderCell]}>
                    <Text style={styles.headerText}>Số lượng tối đa</Text>
                  </Text>
                  <Text style={[styles.tableCell, styles.tableHeaderCell]}>
                    <Text style={styles.headerText}>Ngày bắt đầu</Text>
                  </Text>
                  <Text style={[styles.tableCell, styles.tableHeaderCell]}>
                    <Text style={styles.headerText}>Ngày kết thúc</Text>
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.tableCell,
                      styles.tableHeaderCell,
                      styles.checkboxCell,
                    ]}
                    onPress={() => {
                      if (selectedClasses.length === classes.length) {
                        setSelectedClasses([]);
                      } else {
                        setSelectedClasses(classes.map((_, index) => index));
                      }
                    }}
                  >
                    <View style={[styles.checkbox, { borderColor: "white" }]}>
                      {selectedClasses.length === classes.length && (
                        <View
                          style={[
                            styles.checkboxInner,
                            { backgroundColor: "white" },
                          ]}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              <ScrollView style={styles.tableBody}>
                {classes.map((classItem, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.tableRow,
                      selectedClasses.includes(index) && styles.selectedRow,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tableCell,
                        selectedClasses.includes(index) && styles.selectedCell,
                      ]}
                    >
                      {classItem.class_id}
                    </Text>
                    <Text
                      style={[
                        styles.tableCell,
                        selectedClasses.includes(index) && styles.selectedCell,
                      ]}
                    >
                      {classItem.class_id}
                    </Text>
                    <Text
                      style={[
                        styles.tableCell,
                        selectedClasses.includes(index) && styles.selectedCell,
                      ]}
                    >
                      {classItem.class_name}
                    </Text>
                    <Text
                      style={[
                        styles.tableCell,
                        selectedClasses.includes(index) && styles.selectedCell,
                      ]}
                    >
                      {classItem.class_type}
                    </Text>
                    <Text
                      style={[
                        styles.tableCell,
                        selectedClasses.includes(index) && styles.selectedCell,
                      ]}
                    >
                      {classItem.status}
                    </Text>
                    <Text
                      style={[
                        styles.tableCell,
                        selectedClasses.includes(index) && styles.selectedCell,
                      ]}
                    >
                      {classItem.max_student_amount}
                    </Text>
                    <Text
                      style={[
                        styles.tableCell,
                        selectedClasses.includes(index) && styles.selectedCell,
                      ]}
                    >
                      {classItem.start_date}
                    </Text>
                    <Text
                      style={[
                        styles.tableCell,
                        selectedClasses.includes(index) && styles.selectedCell,
                      ]}
                    >
                      {classItem.end_date}
                    </Text>
                    <TouchableOpacity
                      style={[styles.tableCell, styles.checkboxCell]}
                      onPress={() => {
                        if (selectedClasses.includes(index)) {
                          setSelectedClasses(
                            selectedClasses.filter((i) => i !== index)
                          );
                        } else {
                          setSelectedClasses([...selectedClasses, index]);
                        }
                      }}
                    >
                      <View style={styles.checkbox}>
                        {selectedClasses.includes(index) && (
                          <View style={styles.checkboxInner} />
                        )}
                      </View>
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </ScrollView>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              classes.length === 0 && styles.disabledButton,
            ]}
            onPress={handleRegisterClasses}
            disabled={classes.length === 0}
          >
            <Text style={styles.buttonText}>Gửi đăng ký</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.deleteButton,
              selectedClasses.length === 0 && styles.disabledButton,
            ]}
            onPress={handleDeleteClass}
            disabled={selectedClasses.length === 0}
          >
            <Text style={styles.buttonText}>Xóa lớp đã chọn</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.linkContainer}>
          <Text
            style={styles.link}
            onPress={() => Linking.openURL("https://example.com")}
          >
            Thông tin danh sách các lớp mở
          </Text>
        </View>
      </View>

      {isLoading && <Loading />}
      {successMessage && <Toast message={successMessage} type="success" />}
      {errorMessage && <Toast message={errorMessage} type="error" />}
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
    marginRight: 24, // Cân đối với backButton
  },
  backButton: {
    padding: 8,
    ...(Platform.OS === "web" && {
      cursor: "pointer",
    }),
  },
  searchSection: {
    flexDirection: "row",
    padding: 16,
    gap: 10,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#CC0000",
    borderRadius: 0,
    paddingHorizontal: 12,
    backgroundColor: "white",
    color: "#CC0000",
    width: 200,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#CC0000",
    borderRadius: 0,
    backgroundColor: "white",
  },
  picker: {
    height: 50,
    color: "#CC0000",
  },
  searchButton: {
    backgroundColor: "#CC0000",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  selectedClasses: {
    padding: 16,
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: "#CC0000",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  tableBody: {
    height: 300,
  },
  tableRow: {
    flexDirection: "row",
    minWidth: "100%",
  },
  tableCell: {
    padding: 12,
    width: 120,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "white",
  },
  tableHeaderCell: {
    backgroundColor: "#CC0000",
    fontWeight: "bold",
    padding: 12,
    width: 120,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 16,
    marginBottom: 24,
    gap: 10,
  },
  submitButton: {
    backgroundColor: "#CC0000",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
  },
  deleteButton: {
    backgroundColor: "#CC0000",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 8,
  },
  linkContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  link: {
    color: "#CC0000",
    fontStyle: "italic",
    textDecorationLine: "underline",
    fontSize: 16,
    fontWeight: "bold",
  },
  tableHeader: {
    backgroundColor: "#CC0000",
  },
  selectedRow: {
    backgroundColor: "#FFE5E5",
  },
  selectedCell: {
    backgroundColor: "#FFE5E5",
  },
  disabledButton: {
    backgroundColor: "#CCCCCC",
  },
  toastContainer: {
    position: "absolute",
    bottom: 50,
    left: 20,
    right: 20,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  errorToast: {
    backgroundColor: "#ffebee",
    borderColor: "#CC0000",
  },
  successToast: {
    backgroundColor: "#E8F5E9",
    borderColor: "#2E7D32",
  },
  toastText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
  },
  errorToastText: {
    color: "#CC0000",
  },
  successToastText: {
    color: "#2E7D32",
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  loadingContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingText: {
    color: "#CC0000",
    marginTop: 10,
    fontSize: 16,
    fontWeight: "500",
  },
  checkboxCell: {
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    padding: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#CC0000",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  checkboxInner: {
    width: 14,
    height: 14,
    backgroundColor: "#CC0000",
    borderRadius: 2,
  },
});
