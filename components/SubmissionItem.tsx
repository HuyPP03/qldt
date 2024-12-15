import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  TouchableWithoutFeedback,
  Linking,
  ScrollView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatDate } from "@/utility/format-date";
import { Toast } from "./Toast";

interface SubmissionItemProps {
    submission: SubmissionData;
    onGrade: (submissionId: number, grade: string | null) => void;
}

interface SubmissionData {
  id: number;
  assignment_id: number;
  submission_time: string;
  grade: string | null;
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

export const SubmissionItem = ({submission, onGrade}: SubmissionItemProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false); 
  const [gradeModalVisible, setGradeModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(300)).current; 
  const [grade, setGrade] = useState<string | null>(submission.grade || "");
  const [error, setError] = useState<string | null>(null);

  const openModal = () => {
    setModalVisible(true);
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
    }).start(() => setModalVisible(false));
  };

  const openViewModal = () => {
    setViewModalVisible(true);
    setModalVisible(false)
  };

  const closeViewModal = () => {
    setModalVisible(true);
    setViewModalVisible(false);
  };

  const closeViewModalWhenTouchOutside = () => {
    setModalVisible(false)
    setViewModalVisible(false);
  }

  const openGradeModal = () => {
    setGradeModalVisible(true);
    setModalVisible(false); 
  };

  const closeGradeModal = () => {
    setGradeModalVisible(false);
    setModalVisible(true); 
  };

  const closeGradeModalWhenTouchOutside = () => {
    setModalVisible(false)
    setGradeModalVisible(false);
  }

  const handleGradeChange = (text: string) => {
    setGrade(text);
  };

  const handleSubmitGrade = () => {
    if (grade && (parseFloat(grade) < 0 || parseFloat(grade) > 10)) {
      setError("Điểm phải nằm trong khoảng từ 0 đến 10.");
    } else {
      setError(null);
      onGrade(submission.id, grade);
      closeGradeModal();
      closeModal();
    }
  };

  return (
    <View style={styles.submissionItem}>
      <Text style={styles.submissionTitle}>
        {submission.student_account.first_name}{" "}
        {submission.student_account.last_name}
      </Text>
      <Text style={styles.submissionText}>
        Mã sinh viên: {submission.student_account.student_id}
      </Text>
      <Text style={styles.submissionText}>Ngày nộp: {formatDate(submission.submission_time)}</Text>
      <Text style={styles.submissionText}>
        Điểm: {submission.grade || "Chưa chấm"}
      </Text>

      <TouchableOpacity style={styles.moreButton} onPress={openModal}>
        <Ionicons name="ellipsis-horizontal" size={24} color="black" />
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="none"
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <Animated.View
                style={[styles.modalContent, { transform: [{ translateY: slideAnim }] }]}
              >
                <Text style={styles.modalText}>
                  {submission.student_account.first_name}{" "}
                  {submission.student_account.last_name}
                </Text>
                <TouchableOpacity style={styles.optionButton} onPress={openViewModal}>
                  <Ionicons name="eye-outline" size={24} color="black" />
                  <Text style={styles.optionText}>Xem bài nộp của sinh viên</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.optionButton} onPress={openGradeModal}>
                  <Ionicons name="star-outline" size={24} color="black" />
                  <Text style={styles.optionText}>Chấm điểm cho sinh viên</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={closeModal}>
                  <Text style={styles.closeButton}>Đóng</Text>
                </TouchableOpacity>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        transparent={true}
        visible={viewModalVisible}
        animationType="slide"
        onRequestClose={closeViewModal}
        >
        <TouchableWithoutFeedback onPress={closeViewModalWhenTouchOutside}>
            <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
                <View style={styles.viewModalContent}>
                <Text style={styles.modalText}>
                    Bài nộp của {submission.student_account.first_name} {submission.student_account.last_name}
                </Text>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionHeaderText}>Nội dung phản hồi:</Text>
                </View>
                <ScrollView style={styles.textResponseContainer}>
                  <Text style={styles.responseText}>{submission.text_response}</Text>
                </ScrollView>

                {submission.file_url && (
                    <TouchableOpacity
                    style={styles.fileLinkButton}
                    onPress={() => Linking.openURL(submission.file_url)}
                    >
                    <Text style={styles.fileLinkText}>Tải về bài nộp của sinh viên</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity onPress={closeViewModal}>
                    <Text style={styles.closeButton}>Đóng</Text>
                </TouchableOpacity>
                </View>
            </TouchableWithoutFeedback>
            </View>
        </TouchableWithoutFeedback>
        </Modal>
        
        <Modal
            transparent={true}
            visible={gradeModalVisible}
            animationType="slide"
            onRequestClose={closeGradeModal}
        >
            {error ? <Toast message={error} onDismiss={() => setError(null)} /> : null}
            <TouchableWithoutFeedback onPress={closeGradeModal}>
            <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback>
                <View style={styles.viewModalContent}>
                    <Text style={styles.modalText}>Chấm điểm cho sinh viên</Text>
                    <Text style={styles.submissionTitle}>Nhập điểm: </Text>
                    <TextInput
                    style={styles.gradeInput}
                    value={grade || ""}
                    onChangeText={handleGradeChange}
                    placeholder="Nhập điểm"
                    keyboardType="numeric"
                    />
                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmitGrade}>
                    <Text style={styles.submitButtonText}>Chấm điểm</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={closeGradeModalWhenTouchOutside}>
                    <Text style={styles.closeButton}>Đóng</Text>
                    </TouchableOpacity>
                </View>
                </TouchableWithoutFeedback>
            </View>
            </TouchableWithoutFeedback>
            
        </Modal>
        
    </View>
  );
};

const styles = StyleSheet.create({
  submissionItem: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 15,
    marginVertical: 10,
  },
  submissionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  submissionText: {
    fontSize: 14,
    color: "#666",
    marginVertical: 5,
  },
  moreButton: {
    padding: 5,
    position: "absolute",
    top: 10,
    right: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    height: "100%",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    width: "100%",
    position: "absolute",
    bottom: 0,
  },
  viewModalContent: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    width: "100%",
    position: "absolute",
    bottom: 0,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: "center",
    fontWeight: "bold",
  },
  responseText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 10,
  },
  closeButton: {
    color: "blue",
    textAlign: "right",
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  optionText: {
    fontSize: 16,
    marginLeft: 10,
  },
  fileLinkButton: {
    backgroundColor: "#CC0000", 
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: "center",
  },
  fileLinkText: {
    color: "#ffffff",
    fontSize: 16,
    textAlign: "center",
    textDecorationLine: "none",
  },
  fileLink: {
    marginTop: 10,
  },
  fileText: {
    color: "#0066CC",
    fontSize: 14,
  },
  sectionHeader: {
    marginTop: 10,
    marginBottom: 5,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  textResponseContainer: {
    backgroundColor: "#f0f0f0", 
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    maxHeight: 400,
    height:200,
  },
  gradeInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    marginTop:10, 
  },
  submitButton: {
    backgroundColor: "#CC0000",
    borderRadius: 5,
    padding: 10,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 50,
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 16,
  },
});
