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

interface SubmissionResponse {
  data: SubmissionData;
  meta: MetaData;
}

interface SubmissionData {
  id: number;                
  assignment_id: number;     
  submission_time: string;  
  grade: number | null;      
  file_url: string;  
  text_response: string;    
  student_account: StudentAccount;  
}

interface StudentAccount {
  account_id: string;        
  last_name: string;        
  first_name: string;       
  email: string;             
  student_id: string;       
}

interface MetaData {
  code: string;              
  message: string;          
}

export default function SubmitSurvey() {
  const route = useRoute();
  const { assignmentId, classId, surveyName } = route.params as { assignmentId: string, classId: string, surveyName: string };
  
  const [textResponse, setTextResponse] = useState("");
  const [file, setFile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const { token, userInfo } = useUser();

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

  const handleSubmitSurvey = async () => {
    if(!textResponse || !file){
      setError("Hãy nhập trường còn thiếu")
      return
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("textResponse", textResponse);
      formData.append("token", token!);
      formData.append("assignmentId", assignmentId);

      const response = await request<SubmissionResponse>(`${SERVER_URL}/it5023e/submit_survey`, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      console.log(response);

      if(response.meta.code === "1000"){
        router.push({
          pathname: "/class-detail",
          params: { id: classId },
        });
      } else {
        setError(`Không nộp được bài kiểm tra ${response.data}`)
        console.log(`submit-survey ${response.data}`)
      }  
    } catch (error) {
      setError(`Không nộp được bài kiểm tra ${error}`);
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
        <Text style={styles.headerText}>Nộp bài kiểm tra</Text>
      </View>
      {loading ? <LoadingIndicator loadingText="Đang nộp bài kiểm tra"/> : (
      <ScrollView style={styles.formContainer}>
        <View>
          <Text style={styles.title}>
            Sinh viên: {userInfo?.name}
          </Text>
          <Text style={styles.title}>
            Lớp: {classId}
          </Text>
        </View>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Nhập vào lời giải *"
          placeholderTextColor="#CC0000"
          value={textResponse}
          onChangeText={setTextResponse}
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

        <TouchableOpacity
          style={styles.createButton}
          onPress={handleSubmitSurvey}
        >
          <Text style={styles.buttonText}>Nộp bài</Text>
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
    height: 300,
    maxHeight: 500,
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
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 5,
  },
});
