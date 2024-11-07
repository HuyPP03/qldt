import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface FileItemProps {
  fileName: string;
  fileSize: string;
  uploadTime: string;
  fileType: string;
}

const FileItem: React.FC<FileItemProps> = ({
  fileName,
  fileSize,
  uploadTime,
  fileType,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(300)).current; // Sử dụng useRef để giữ giá trị

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return { iconName: "document-text-outline", color: "red" };
      case "image":
        return { iconName: "image-outline", color: "blue" };
      case "video":
        return { iconName: "videocam-outline", color: "purple" };
      case "audio":
        return { iconName: "musical-notes-outline", color: "orange" };
      case "word":
        return { iconName: "document-outline", color: "blue" };
      case "excel":
        return { iconName: "grid-outline", color: "green" };
      case "powerpoint":
        return { iconName: "easel-outline", color: "orange" };
      case "zip":
        return { iconName: "archive-outline", color: "brown" };
      case "text":
        return { iconName: "document-text-outline", color: "gray" };
      default:
        return { iconName: "document-outline", color: "black" };
    }
  };

  const { iconName, color } = getFileIcon(fileType);

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
        <Text style={styles.fileDetails}>
          {fileSize} - {uploadTime}
        </Text>
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
                <TouchableOpacity style={styles.optionButton}>
                  <Ionicons name="open-outline" size={24} color="black" />
                  <Text style={styles.optionText}>Mở</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.optionButton}>
                  <Ionicons name="create-outline" size={24} color="black" />
                  <Text style={styles.optionText}>Đổi tên</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.optionButton}>
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
});

export default FileItem;
