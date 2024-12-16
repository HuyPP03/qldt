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

export default function UploadFile() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const { token, userInfo } = useUser();

  const route = useRoute();

  const { classId } = route.params as { classId: string };

  useEffect(() => {
    if (userInfo?.role !== "LECTURER") {
      router.replace("/");
    }
  }, [userInfo]);

  const fileUpload = async () => {
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

  const handleUploadFile = async () => {
    if (!title || !description || !file) {
      setError("Hãy điền đầy đủ thông tin");
      setTimeout(() => setError(""), 3000);
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();

      if (file) {
        formData.append("file", file);

        const materialType = file.name.split(".").pop()?.toUpperCase();
        formData.append("materialType", materialType!);
      } else {
        throw new Error("Invalid file type.");
      }

      formData.append("token", token!);
      formData.append("classId", classId);
      formData.append("title", title);
      formData.append("description", description);

      const response = await request(`${SERVER_URL}/it5023e/upload_material`, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      router.push({
        pathname: "/class-detail",
        params: { id: classId, tab: "Tệp" },
      });
    } catch (error) {
      setError("Không tạo được bài kiểm tra");
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
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Upload file</Text>
      </View>
      {loading ? (
        <LoadingIndicator loadingText="Đang upload file" />
      ) : (
        <ScrollView style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nhập tên file *"
            placeholderTextColor="#CC0000"
            value={title}
            onChangeText={setTitle}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Mô tả *"
            placeholderTextColor="#CC0000"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />

          <TouchableOpacity style={styles.uploadButton} onPress={fileUpload}>
            <Text style={styles.uploadButtonText}>
              {file ? file.name : "Tải lên tệp *"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.createButton}
            onPress={handleUploadFile}
          >
            <Text style={styles.buttonText}>Upload</Text>
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
