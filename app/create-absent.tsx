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
import { useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import request from "../utility/request";
import React from "react";
import { SERVER_URL } from "@env";
import {
  CreateAbsentRequest,
  CreateAbsentResponse,
} from "./interfaces/absent/absent.interface";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import { useUser } from "./contexts/UserContext";

const Toast = ({ message }: { message: string }) => {
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
        {
          transform: [{ translateY }],
        },
      ]}
    >
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
};

export default function CreateAbsent({
  onRequestCreated,
  onCreateRequest,
  classId,
}: {
  onRequestCreated: () => void;
  onCreateRequest: (date: string) => boolean;
  classId: string;
}) {
  const [startDate, setStartDate] = useState(new Date());
  const [errorMessage, setErrorMessage] = useState("");

  const { token } = useUser();

  const [title, setTitle] = useState("");
  const [reason, setReason] = useState("");
  const [evidence, setEvidence] = useState<any>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [classDetail, setClassDetail] = useState<any>(null);

  const fetchClassDetail = async () => {
    try {
      const response: any = await request(
        `${SERVER_URL}/it5023e/get_class_info`,
        {
          method: "POST",
          body: {
            token,
            class_id: classId,
          },
        }
      );

      if (response) {
        setClassDetail(response.data);
      } else {
        throw new Error("Failed to fetch class detail");
      }
    } catch (error) {
      console.error(error);
    }
  };

  React.useEffect(() => {
    fetchClassDetail();
  }, []);

  console.log(classDetail);

  const handleCreateAbsent = async () => {
    const existedDate = onCreateRequest(startDate.toISOString().split("T")[0]);
    if (existedDate) {
      setErrorMessage("Đơn nghỉ phép cho ngày này đã tồn tại!");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    try {
      const data: CreateAbsentRequest = {
        token: token as string,
        classId,
        date: startDate.toISOString().split("T")[0],
        reason,
        title,
        file: evidence
          ? {
              uri: evidence.uri,
              name: evidence.name,
              type: evidence.mimeType || "application/octet-stream",
            }
          : null,
      };

      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value) {
          if (key === "file") {
            formData.append(key, value as any);
          } else {
            formData.append(key, value as string);
          }
        }
      });

      const response: CreateAbsentResponse = await request(
        `${SERVER_URL}/it5023e/request_absence`,
        {
          body: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const formDataSendMail = new FormData();

      formDataSendMail.append("message", title);
      formDataSendMail.append("token", token as string);
      formDataSendMail.append("toUser", classDetail?.lecturer_account_id);
      formDataSendMail.append("type", "ABSENCE");

      await request(`${SERVER_URL}/it5023e/send_notification`, {
        method: "POST",
        body: formDataSendMail,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.meta.code === "1004") {
        throw new Error(response.meta.message);
      }

      onRequestCreated();
    } catch (error: any) {
      setErrorMessage(
        error.message ?? "Có lỗi xảy ra khi tạo đơn nghỉ phép, vui lòng thử lại"
      );
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const dateInputSection = (
    <View style={styles.timeContainer}>
      <View style={styles.timePickerContainer}>
        <Text style={styles.label}>Ngày nghỉ phép:</Text>
        <TouchableOpacity
          style={styles.timeInput}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.inputText}>
            {startDate.toISOString().split("T")[0]}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <View style={styles.datePickerWrapper}>
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) setStartDate(date);
              }}
              themeVariant="light"
              accentColor="#CC0000"
            />
          </View>
        )}
      </View>
    </View>
  );

  const handleDocumentPicker = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: "*/*",
      });
      if (!res.canceled) {
        setEvidence(res.assets[0]);
      }
    } catch (err) {
      console.log("Unknown error: ", err);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.formContainer}>
        <TextInput
          style={[styles.input, styles.inputText]}
          placeholder="Tiêu đề"
          placeholderTextColor="#CC0000"
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          style={[styles.input, styles.reasonText, styles.reasonContainer]}
          editable
          multiline
          numberOfLines={100}
          placeholder="Lý do"
          placeholderTextColor="#CC0000"
          value={reason}
          onChangeText={setReason}
        />

        <TouchableOpacity
          style={styles.uploadButton}
          onPress={handleDocumentPicker}
        >
          <Text style={styles.buttonText}>Upload File</Text>
        </TouchableOpacity>
        {evidence && <Text style={styles.fileName}>{evidence.name}</Text>}

        {dateInputSection}

        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateAbsent}
        >
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
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
  formContainer: {
    padding: 16,
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
  reasonContainer: {
    height: 200,
    paddingVertical: 10,
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
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 10,
  },
  timePickerContainer: {
    flex: 1,
    position: "relative",
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
  createButton: {
    backgroundColor: "#CC0000",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  inputText: {
    color: "#CC0000",
    textAlignVertical: "center",
    lineHeight: 20,
  },
  reasonText: {
    color: "#CC0000",
    textAlignVertical: "top",
    textAlign: "left",
    lineHeight: 20,
  },
  pickerText: {
    color: "#CC0000",
  },
  fileName: {
    marginBottom: 10,
    fontSize: 16,
  },
  uploadButton: {
    backgroundColor: "#CC0000",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  datePickerWrapper: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "white",
    zIndex: 1000,
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
