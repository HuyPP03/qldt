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
  const [modalVisible, setModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(300)).current;
  const router = useRouter();

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

  return (
    <View style={styles.container}>
      <Ionicons
        name={iconName as any}
        size={32}
        color={color}
        style={styles.icon}
      />
      <View style={styles.textContainer}>
        <Text style={styles.fileName}>{fileName}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
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
                  <Text style={styles.optionText}>Đổi tên</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={() => {
                    deleteFile(id);
                    setModalVisible(false);
                  }}
                >
                  <Ionicons name="trash-outline" size={24} color="black" />
                  <Text style={styles.optionText}>Xóa</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.optionButton}>
                  <Ionicons name="share-outline" size={24} color="black" />
                  <Text style={styles.optionText}>Chia sẻ</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.optionButton}>
                  <Ionicons name="link-outline" size={24} color="black" />
                  <Text style={styles.optionText}>Sao chép liên kết</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.optionButton}>
                  <Ionicons name="open-outline" size={24} color="black" />
                  <Text style={styles.optionText}>Mở trong ứng dụng</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={closeModal}>
                  <Text style={styles.closeButton}>Đóng</Text>
                </TouchableOpacity>
              </Animated.View>
            </TouchableWithoutFeedback>
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
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
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
});

export default FileItem;
