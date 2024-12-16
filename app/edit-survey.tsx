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
import { useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as DocumentPicker from "expo-document-picker";
import request from "../utility/request";
import { useUser } from "./contexts/UserContext";
import React from "react";
import { SERVER_URL } from "@/utility/env";
import { useEffect } from "react";
import { useRoute } from "@react-navigation/native";
import { Toast } from "@/components/Toast";
import LoadingIndicator from "@/components/LoadingIndicator";

export default function EditSurvey() {
  const route = useRoute();
  const { assignmentId, classId, originalDeadline, originalDescription } = route.params as { assignmentId: string, classId: string, originalDeadline: string, originalDescription: string };
  
  const [description, setDescription] = useState(originalDescription);
  const [file, setFile] = useState<any>(null);
  const [deadline, setDeadline] = useState(new Date(originalDeadline));
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const { token, userInfo } = useUser();

  useEffect(() => {
    if (userInfo?.role !== "LECTURER") {
      router.replace("/");
    }
  }, [userInfo]);

  const handleFileUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
      });

      if (result.canceled) {
        console.log("User canceled the file selection.");
        return;
      }

      if (result.assets?.length > 0) {
        const fileInfo = result.assets[0];
        const { uri, name, mimeType } = fileInfo;

        const validMimeTypes = ["application/pdf", "image/jpeg", "image/png"];
        if (!validMimeTypes.includes(mimeType!)) {
          setError("Vui lòng chọn file hợp lệ (PDF, JPEG, PNG).");
          return;
        }

        if (uri) {
          const selectedFile = {
            uri,
            name,
            type: mimeType || "application/octet-stream",
          };
          setFile(selectedFile);
        }
      }
    } catch (error) {
      console.log("Error selecting the file:", error);
    }
  };

  const handleEditSurvey = async () => {
    const isDescriptionSame = description === originalDescription;
    const isDeadlineSame = deadline.toISOString() === new Date(originalDeadline).toISOString();
    const isFileSame = file === null; 

    if (isDescriptionSame && isDeadlineSame && isFileSame) {
      setError("Không có thay đổi nào để cập nhật");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if(deadline < new Date()){
      setError("Deadline không được là quá khứ")
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      const localDeadline = new Date(deadline.getTime() + 7 * 60 * 60 * 1000);
      const formattedDeadline = localDeadline.toISOString().split(".")[0];

      if (file) {
        formData.append("file", file);
      } 
      if(deadline){
        formData.append("deadline", formattedDeadline);
      }
      if(description){ 
        formData.append("description", description);
      }

      formData.append("token", token!);
      formData.append("assignmentId", assignmentId);

      const response = await request(`${SERVER_URL}/it5023e/edit_survey`, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      router.push({
        pathname: "/class-detail",
        params: { id: classId },
      });
    } catch (error) {
      setError("Không tạo được bài kiểm tra");
      console.log(error)
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            router.push({
              pathname: "/class-detail",
              params: { id: classId },
            })
          }
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Chỉnh Sửa Bài Kiểm Tra</Text>
      </View>
      {loading ? <LoadingIndicator loadingText="Đang sửa bài kiểm tra"/> : (
      <ScrollView style={styles.formContainer}>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Chỉnh sửa mô tả *"
          placeholderTextColor="#CC0000"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity
          style={styles.uploadButton}
          onPress={handleFileUpload}
        >
          <Text style={styles.uploadButtonText}>
            {file ? file.name : "Tải lên tệp *"}
          </Text>
        </TouchableOpacity>

        <View style={styles.timePickerContainer}>
          <Text style={styles.label}>Thay đổi hạn chót:</Text>
          <TouchableOpacity
            style={styles.timeInput}
            onPress={() => setShowDeadlinePicker(true)}
          >
            <Text style={styles.inputText}>{deadline.toLocaleString()}</Text>
          </TouchableOpacity>
          {showDeadlinePicker && (
            <DateTimePicker
              value={deadline}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowDeadlinePicker(false);
                if (date) {
                  setDeadline(
                    new Date(
                      date.setHours(deadline.getHours(), deadline.getMinutes())
                    )
                  );
                  setShowTimePicker(true);
                }
              }}
            />
          )}
          {showTimePicker && (
            <DateTimePicker
              value={deadline}
              mode="time"
              display="default"
              onChange={(event, time) => {
                setShowTimePicker(false);
                if (time) {
                  setDeadline(
                    new Date(
                      deadline.setHours(time.getHours(), time.getMinutes())
                    )
                  );
                }
              }}
            />
          )}
        </View>

        <TouchableOpacity
          style={styles.createButton}
          onPress={handleEditSurvey}
        >
          <Text style={styles.buttonText}>Chỉnh sửa</Text>
        </TouchableOpacity>
      </ScrollView>
      )}
      {error ? (
        <Toast message={error} onDismiss={() => setError(null)} />
      ) : null}
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
  backButton: {
    padding: 8,
    ...(Platform.OS === "web" && { cursor: "pointer" }),
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
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  uploadButton: {
    backgroundColor: "#CC0000",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  uploadButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  timePickerContainer: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 4,
    color: "#CC0000",
  },
  timeInput: {
    height: 50,
    borderWidth: 1,
    borderColor: "#CC0000",
    borderRadius: 0,
    paddingHorizontal: 12,
    justifyContent: "center",
    backgroundColor: "white",
  },
  inputText: {
    color: "#CC0000",
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
  errorText: {
    color: "#CC0000",
    textAlign: "center",
    marginTop: 16,
    fontSize: 14,
  },
});
