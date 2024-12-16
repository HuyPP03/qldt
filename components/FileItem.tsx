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
  Alert,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface FileItemProps {
  id: string;
  classId: string;
  link: string;
  fileName: string;
  fileType: string;
  deleteFile: (id: string) => void;
  description?: string;
}

const FileItem: React.FC<FileItemProps> = ({
  id,
  classId,
  link,
  fileName,
  fileType,
  description,
  deleteFile,
}) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const slideAnim = useRef(new Animated.Value(300)).current;
  const [confirmationModalVisible, setConfirmationModalVisible] = 
  useState<boolean>(false);
  const router = useRouter();

  console.log(id)

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return { iconName: "document-text-outline", color: "red" };
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return { iconName: "image-outline", color: "blue" };
      case "mp4":
      case "avi":
        return { iconName: "videocam-outline", color: "purple" };
      case "mp3":
      case "wav":
        return { iconName: "musical-notes-outline", color: "orange" };
      case "doc":
      case "docx":
        return { iconName: "document-outline", color: "blue" };
      case "xls":
      case "xlsx":
        return { iconName: "grid-outline", color: "green" };
      case "ppt":
      case "pptx":
        return { iconName: "easel-outline", color: "orange" };
      case "zip":
        return { iconName: "archive-outline", color: "brown" };
      case "txt":
        return { iconName: "document-text-outline", color: "gray" };
      default:
        return { iconName: "document-outline", color: "black" };
    }
  };

  const { iconName, color } = getFileIcon(fileType.toLowerCase());

  const openModal = () => {
    setModalVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const openFileLink = () => {
    Linking.openURL(link).catch((err) =>
      console.error("Failed to open link:", err)
    );
  };

  const closeModal = () => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setModalVisible(false));
  };

  const openConfirmationModal = () => {
    setConfirmationModalVisible(true);
  };

  const closeConfirmationModal = () => {
    setConfirmationModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.fileItemContainer} onPress={openFileLink}>
        <Ionicons
          name={iconName as any}
          size={32}
          color={color}
          style={styles.icon}
        />
        <View style={styles.textContainer}>
          <Text style={styles.fileName}>{fileName}</Text>
          {description && <Text style={styles.description}>{description}</Text>}
          {fileType && <Text style={styles.description}>{fileType}</Text>}
        </View>
        <TouchableOpacity style={styles.moreButton} onPress={openModal}>
          <Ionicons name="ellipsis-horizontal" size={24} color="black" />
        </TouchableOpacity>
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
                style={[
                  styles.modalContent,
                  { transform: [{ translateY: slideAnim }] },
                ]}
              >
                <Text style={styles.modalText}>{fileName}</Text>
                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={openFileLink}
                >
                  <Ionicons name="open-outline" size={24} color="black" />
                  <Text style={styles.optionText}>Mở</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={() => {
                    setModalVisible(false);
                    router.push({
                      pathname: "/edit-file",
                      params: {
                        id,
                        classId,
                      },
                    });
                  }}
                >
                  <Ionicons name="create-outline" size={24} color="black" />
                  <Text style={styles.optionText}>Chỉnh sửa tệp tin</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={() => {
                    openConfirmationModal();
                    setModalVisible(false);
                  }}
                >
                  <Ionicons name="trash-outline" size={24} color="black" />
                  <Text style={styles.optionText}>Xóa</Text>
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
              visible={confirmationModalVisible}
              transparent={true}
              animationType="fade"
              onRequestClose={closeConfirmationModal}
            >
              <TouchableWithoutFeedback onPress={closeConfirmationModal}>
                <View style={styles.modalOverlay}>
                  <View style={[styles.modalContainer, { zIndex: 9999 }]}>
                    <Text style={styles.modalTitle}>Xác nhận xóa tệp tin</Text>
                    <View style={styles.modalButtonsContainer}>
                      <Pressable onPress={() => {deleteFile(id); closeConfirmationModal();}}style={styles.modalConfirmButton}>
                        <Text style={styles.modalConfirmButtonText}>Xác nhận</Text>
                      </Pressable>
                      <Pressable onPress={closeConfirmationModal} style={styles.modalCancelButton}>
                        <Text style={styles.modalCancelButtonText}>Hủy</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  fileItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  icon: {
    marginRight: 20,
  },
  textContainer: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  fileDetails: {
    fontSize: 14,
    color: "#666",
  },
  moreButton: {
    padding: 5,
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
  modalText: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: "center",
    fontWeight: "bold",
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
  description: {
    fontSize: 12,
    color: "#999",
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
  modalButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: "#CC0000", 
    paddingVertical: 10,
    borderRadius: 5,
    marginRight: 10,
    alignItems: "center",
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: "#D3D3D3", 
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  modalConfirmButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  modalCancelButtonText: {
    color: "black",
  },
});

export default FileItem;
