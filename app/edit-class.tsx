import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Text,
  TextInput,
  ScrollView,
  Animated,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import { useRoute } from "@react-navigation/native";
import request from "../utility/request";
import { useUser } from "./contexts/UserContext";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SERVER_URL } from "@env";

const Toast = ({ message }: { message: string }) => {
  const translateY = new Animated.Value(100);

  React.useEffect(() => {
    // Animation hiện lên
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      speed: 12,
      bounciness: 8,
    }).start();

    // Animation ẩn đi sau 3 giây
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

export default function EditClass() {
  const [classId, setClassId] = useState("");
  const [className, setClassName] = useState("");
  const [classType, setClassType] = useState("LT");
  const [maxStudents, setMaxStudents] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { token } = useUser();
  const route = useRoute();
  const { classId: routeClassId } = route.params as { classId: string };

  useEffect(() => {
    const fetchClassInfo = async () => {
      try {
        const response: any = await request(
          `${SERVER_URL}/it5023e/get_basic_class_info`,
          {
            method: "POST",
            body: {
              token,
              class_id: routeClassId,
            },
          }
        );

        setClassId(response.data.class_id);
        setClassName(response.data.class_name);
        setClassType(response.data.class_type);
        setMaxStudents(response.data.max_student_amount.toString());
        setStartDate(new Date(response.data.start_date));
        setEndDate(new Date(response.data.end_date));
      } catch (error) {
        setErrorMessage("Tìm lớp không thành công. Vui lòng thử lại sau.");
        setTimeout(() => setErrorMessage(""), 3000);
      }
    };

    fetchClassInfo();
  }, [routeClassId, token]);

  const handleUpdateClass = async () => {
    try {
      const data = {
        token,
        class_id: classId,
        class_name: className,
        class_type: classType.replace("+", "_"),
        max_student_amount: parseInt(maxStudents),
        start_date: startDate.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
      };

      await request(`${SERVER_URL}/it5023e/edit_class`, {
        method: "POST",
        body: data,
      });

      router.push("/class-management");
    } catch (error) {
      setErrorMessage("Cập nhật lớp không thành công. Vui lòng thử lại sau.");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const handleDeleteClass = async () => {
    try {
      await request(`${SERVER_URL}/it5023e/delete_class`, {
        method: "POST",
        body: {
          token,
          class_id: classId,
        },
      });

      router.push("/class-management");
    } catch (error) {
      setErrorMessage("Xóa lớp không thành công. Vui lòng thử lại sau.");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const dateInputSection = (
    <View style={styles.timeContainer}>
      <View style={styles.timePickerContainer}>
        <Text style={styles.label}>Ngày bắt đầu:</Text>
        <TouchableOpacity
          style={styles.timeInput}
          onPress={() => setShowStartPicker(true)}
        >
          <Text style={styles.inputText}>
            {startDate.toISOString().split("T")[0]}
          </Text>
        </TouchableOpacity>
        {showStartPicker && (
          <View style={styles.datePickerWrapper}>
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowStartPicker(false);
                if (date) setStartDate(date);
              }}
              themeVariant="light"
              accentColor="#CC0000"
            />
          </View>
        )}
      </View>

      <View style={styles.timePickerContainer}>
        <Text style={styles.label}>Ngày kết thúc:</Text>
        <TouchableOpacity
          style={styles.timeInput}
          onPress={() => setShowEndPicker(true)}
        >
          <Text style={styles.inputText}>
            {endDate.toISOString().split("T")[0]}
          </Text>
        </TouchableOpacity>
        {showEndPicker && (
          <View style={styles.datePickerWrapper}>
            <DateTimePicker
              value={endDate}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowEndPicker(false);
                if (date) setEndDate(date);
              }}
              themeVariant="light"
              accentColor="#CC0000"
            />
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Chỉnh sửa lớp học</Text>
      </View>

      <ScrollView
        style={styles.formContainer}
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        <TextInput
          style={[styles.input, styles.inputText]}
          placeholder="Mã lớp *"
          placeholderTextColor="#CC0000"
          value={classId}
          onChangeText={setClassId}
        />

        <TextInput
          style={[styles.input, styles.inputText]}
          placeholder="Tên lớp *"
          placeholderTextColor="#CC0000"
          value={className}
          onChangeText={setClassName}
        />

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={classType}
            style={[styles.picker, styles.pickerText]}
            onValueChange={setClassType}
          >
            <Picker.Item label="Lý thuyết (LT)" value="LT" color="#CC0000" />
            <Picker.Item label="Bài tập (BT)" value="BT" color="#CC0000" />
            <Picker.Item
              label="Lý thuyết + Bài tập (LT+BT)"
              value="LT+BT"
              color="#CC0000"
            />
          </Picker>
        </View>

        {dateInputSection}

        <TextInput
          style={[styles.input, styles.inputText]}
          placeholder="Số lượng sinh viên tối đa *"
          placeholderTextColor="#CC0000"
          value={maxStudents}
          onChangeText={setMaxStudents}
          keyboardType="numeric"
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteClass}
          >
            <Text style={styles.buttonText}>Xóa lớp</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleUpdateClass}
          >
            <Text style={styles.buttonText}>Xác nhận</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

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
  formContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  input: {
    height: 50,
    width: "100%",
    borderWidth: 1,
    borderColor: "#CC0000",
    borderRadius: 0,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: "white",
  },
  inputText: {
    color: "#CC0000",
  },
  pickerContainer: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#CC0000",
    borderRadius: 0,
    marginBottom: 16,
    backgroundColor: "white",
  },
  picker: {
    height: 50,
    color: "#CC0000",
  },
  pickerText: {
    color: "#CC0000",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 10,
  },
  timePickerContainer: {
    flex: 1,
    position: "relative",
  },
  timeLabel: {
    color: "#CC0000",
    marginRight: 8,
    fontSize: 16,
  },
  label: {
    marginBottom: 4,
    color: "#CC0000",
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
  },
  datePickerWrapper: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "white",
    zIndex: 1000,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
    marginBottom: 30,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: "#CC0000",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmButton: {
    flex: 1,
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
  errorContainer: {
    backgroundColor: "#ffebee",
    padding: 10,
    margin: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#CC0000",
  },
  errorText: {
    color: "#CC0000",
    textAlign: "center",
    fontSize: 14,
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
