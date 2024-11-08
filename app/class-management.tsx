import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  TextInput,
  ScrollView,
  Linking,
  Animated,
} from "react-native";
import { Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import request from "../utility/request";
import { useUser } from "./contexts/UserContext";
import { SERVER_URL } from "@env";

const Toast = ({ message }: { message: string }) => {
  const translateY = new Animated.Value(100);

  useEffect(() => {
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
        {
          transform: [{ translateY }],
        },
      ]}
    >
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
};

export default function ClassManagement() {
  const { userInfo } = useUser();
  const navigation = useNavigation();
  const [classes, setClasses] = useState<any[]>([]);
  const [classId, setClassId] = useState("");
  const [selectedClassIndex, setSelectedClassIndex] = useState<number | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState("");

  const searchClass = async () => {
    try {
      const token = "";
      const response: any = await request(
        `${SERVER_URL}/it5023e/get_basic_class_info`,
        {
          body: {
            token: token,
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
    } catch (error) {
      setErrorMessage("Tìm kiếm lớp không thành công. Vui lòng thử lại sau.");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Quản lý lớp học</Text>
      </View>

      <View style={styles.searchSection}>
        <TextInput
          style={styles.input}
          placeholder="Mã lớp"
          placeholderTextColor="#666"
          value={classId}
          onChangeText={setClassId}
        />
        <TouchableOpacity style={styles.searchButton} onPress={searchClass}>
          <Text style={styles.buttonText}>Tìm kiếm</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.selectedClasses}>
        <View style={styles.tableContainer}>
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
            </View>
          </View>
          <ScrollView style={styles.tableBody}>
            {classes.map((classItem, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.tableRow,
                  selectedClassIndex === index && styles.selectedRow,
                ]}
                onPress={() => {
                  if (selectedClassIndex === index) {
                    setSelectedClassIndex(null);
                  } else {
                    setSelectedClassIndex(index);
                  }
                }}
              >
                <Text
                  style={[
                    styles.tableCell,
                    selectedClassIndex === index && styles.selectedCell,
                  ]}
                >
                  {classItem.class_id}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    selectedClassIndex === index && styles.selectedCell,
                  ]}
                >
                  {classItem.class_id}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    selectedClassIndex === index && styles.selectedCell,
                  ]}
                >
                  {classItem.class_name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={() => router.push("/create-class")}
          >
            <Text style={styles.buttonText}>Tạo lớp học</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.deleteButton,
              selectedClassIndex === null && styles.disabledButton,
            ]}
            disabled={selectedClassIndex === null || !userInfo}
            onPress={() =>
              router.push({
                pathname: "/edit-class",
                params: {
                  classId:
                    selectedClassIndex !== null
                      ? classes[selectedClassIndex].class_id
                      : "",
                },
              })
            }
          >
            <Text style={styles.buttonText}>Chỉnh sửa</Text>
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
      {errorMessage ? <Toast message={errorMessage} /> : null}
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
    paddingHorizontal: 20,
    height: 50,
    justifyContent: "center",
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
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
    height: 60,
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
    height: 60,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 16,
    marginBottom: 24,
    gap: 10,
  },
  submitButton: {
    backgroundColor: "#CC0000",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
  },
  deleteButton: {
    backgroundColor: "#CC0000",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
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
    backgroundColor: "#ffebee",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CC0000",
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
  toastText: {
    color: "#CC0000",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
  },
});
