import {
  View,
  Text,
  StyleSheet,
  Platform,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Animated,
  Modal,
  Image,
  ScrollView,
} from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import { useUser } from "../contexts/UserContext";
import { Ionicons } from "@expo/vector-icons";
import request from "../../utility/request";
import { SERVER_URL } from "@env";
import * as ImagePicker from "expo-image-picker";

type ToastProps = {
  message: string;
  type?: "success" | "error" | "info";
};

const Toast: React.FC<ToastProps> = ({ message, type = "error" }) => {
  const translateY = new Animated.Value(-100);

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

// Thêm interface cho kiểu dữ liệu file
interface ImageFile {
  uri: string;
  type: string;
  name: string;
}

export default function ProfileScreen() {
  const { userInfo, token, setUserInfo } = useUser();
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
  });
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(0));
  const [isEditing, setIsEditing] = useState(false);
  const [infoForm, setInfoForm] = useState({
    name: userInfo?.name || "",
  });
  const [avatarFile, setAvatarFile] = useState<ImageFile | null>(null);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  useEffect(() => {
    if (modalVisible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }).start();
    } else {
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [modalVisible]);

  const handleUpdatePassword = useCallback(async () => {
    try {
      const response: any = await request(
        `${SERVER_URL}/it4788/change_password`,
        {
          method: "POST",
          body: {
            old_password: passwordForm.oldPassword,
            new_password: passwordForm.newPassword,
            token,
          },
        }
      );

      if (response.code !== 1000) {
        setToast({ message: response.message, type: "error" });
      } else {
        setModalVisible(false);
        setToast({ message: "Cập nhật mật khẩu thành công", type: "success" });
        setPasswordForm({ oldPassword: "", newPassword: "" });
      }
    } catch (error: any) {
      setModalVisible(false);
      setToast({
        message: error.message,
        type: "error",
      });
      setPasswordForm({ oldPassword: "", newPassword: "" });
    } finally {
      setTimeout(() => setToast(null), 3000);
    }
  }, [passwordForm, token]);

  const handleUpdateInfo = useCallback(async () => {
    try {
      const formData = new FormData();
      formData.append("token", token as string);
      formData.append("name", infoForm.name);

      if (avatarFile) {
        formData.append("file", {
          uri: avatarFile.uri,
          type: avatarFile.type,
          name: avatarFile.name,
        } as any);
      }

      const response: any = await request(
        `${SERVER_URL}/it4788/change_info_after_signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "multipart/form-data",
          },
          body: formData,
        }
      );

      if (response.code !== 1000) {
        setIsEditing(false);
        setToast({ message: response.message, type: "error" });
      } else {
        setIsEditing(false);
        setToast({ message: "Cập nhật thông tin thành công", type: "success" });
        if (response.data) {
          setUserInfo(response.data);
        }
      }
    } catch (error: any) {
      setIsEditing(false);
      setToast({
        message: error.message,
        type: "error",
      });
    } finally {
      setTimeout(() => setToast(null), 3000);
    }
  }, [infoForm, avatarFile, token]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const file: ImageFile = {
          uri: result.assets[0].uri,
          type: "image/jpeg",
          name: "avatar.jpg",
        };
        setAvatarFile(file);
        setPreviewUri(file.uri);
      }
    } catch (error) {
      setToast({
        message: "Không thể chọn ảnh. Vui lòng thử lại",
        type: "error",
      });
    }
  };

  // Thêm hàm xử lý hủy bỏ
  const handleCancelEdit = () => {
    setIsEditing(false);
    setInfoForm({ name: userInfo?.name || "" });
    setAvatarFile(null);
    setPreviewUri(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Thông tin chi tiết</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.profileCard}>
          <View style={styles.coverPhoto}>
            <View style={styles.avatarWrapper}>
              {isEditing ? (
                <TouchableOpacity
                  style={styles.editableAvatar}
                  onPress={pickImage}
                  activeOpacity={0.7}
                >
                  {previewUri ? (
                    <Image source={{ uri: previewUri }} style={styles.avatar} />
                  ) : userInfo?.avatar ? (
                    <Image
                      source={{ uri: userInfo.avatar }}
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={styles.avatarContainer}>
                      <Text style={styles.avatarText}>
                        {userInfo?.ten?.[0] || "U"}
                      </Text>
                    </View>
                  )}
                  <View style={styles.editAvatarOverlay}>
                    <Ionicons name="camera" size={24} color="white" />
                    <Text style={styles.editAvatarText}>Thay đổi</Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <>
                  {previewUri ? (
                    <Image source={{ uri: previewUri }} style={styles.avatar} />
                  ) : userInfo?.avatar ? (
                    <Image
                      source={{ uri: userInfo.avatar }}
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={styles.avatarContainer}>
                      <Text style={styles.avatarText}>
                        {userInfo?.ten?.[0] || "U"}
                      </Text>
                    </View>
                  )}
                </>
              )}
            </View>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.userName}>
              {userInfo?.ho} {userInfo?.ten}
            </Text>
            <Text style={styles.userRole}>
              {userInfo?.role === "STUDENT" ? "Sinh viên" : "Giảng viên"}
            </Text>
            <Text style={styles.userEmail}>{userInfo?.email}</Text>
            <View style={styles.departmentBadge}>
              <Text style={styles.departmentText}>
                Khoa Công nghệ thông tin
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionTitle}>
          <Ionicons
            name="information-circle-outline"
            size={24}
            color="#CC0000"
          />
          <Text style={styles.sectionTitleText}>Thông tin chi tiết</Text>
          <View style={styles.editButtonsContainer}>
            {isEditing ? (
              <>
                <TouchableOpacity
                  style={styles.editActionButton}
                  onPress={handleCancelEdit}
                >
                  <Ionicons name="close-outline" size={24} color="#CC0000" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.editActionButton}
                  onPress={handleUpdateInfo}
                >
                  <Ionicons
                    name="checkmark-outline"
                    size={24}
                    color="#CC0000"
                  />
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.editActionButton}
                onPress={() => setIsEditing(true)}
              >
                <Ionicons name="create-outline" size={24} color="#CC0000" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.userInfoContainer}>
          <View style={styles.infoRow}>
            <View style={styles.labelContainer}>
              <Ionicons name="person-outline" size={20} color="#666" />
              <Text style={styles.label}>Username</Text>
            </View>
            {isEditing ? (
              <TextInput
                style={styles.inputInfo}
                value={infoForm.name}
                onChangeText={(text) =>
                  setInfoForm((prev) => ({ ...prev, name: text }))
                }
              />
            ) : (
              <Text style={styles.value}>{userInfo?.name}</Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <View style={styles.labelContainer}>
              <Ionicons name="mail-outline" size={20} color="#666" />
              <Text style={styles.label}>Email</Text>
            </View>
            <Text style={styles.value}>{userInfo?.email}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.labelContainer}>
              <Ionicons name="school-outline" size={20} color="#666" />
              <Text style={styles.label}>Vai trò</Text>
            </View>
            <Text style={styles.value}>
              {userInfo?.role === "STUDENT" ? "Sinh viên" : "Giảng viên"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.labelContainer}>
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="#666"
              />
              <Text style={styles.label}>Trạng thái</Text>
            </View>
            <Text style={[styles.value, styles.statusValue]}>
              {userInfo?.status}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.changePasswordButton}
            onPress={() => setModalVisible(true)}
          >
            <View style={styles.changePasswordContent}>
              <Ionicons name="lock-closed-outline" size={20} color="#CC0000" />
              <Text style={styles.changePasswordText}>Đổi mật khẩu</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [{ scale: scaleAnim }],
                opacity: scaleAnim,
              },
            ]}
            onStartShouldSetResponder={(evt) => {
              evt.stopPropagation();
              return true;
            }}
          >
            <Text style={styles.modalTitle}>Đổi mật khẩu</Text>

            <TextInput
              style={styles.input}
              value={passwordForm.oldPassword}
              onChangeText={(text) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  oldPassword: text,
                }))
              }
              placeholder="Mật khẩu hiện tại"
              placeholderTextColor="white"
              secureTextEntry
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              value={passwordForm.newPassword}
              onChangeText={(text) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  newPassword: text,
                }))
              }
              placeholder="Mật khẩu mới"
              placeholderTextColor="white"
              secureTextEntry
              autoCapitalize="none"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setPasswordForm({ oldPassword: "", newPassword: "" });
                }}
              >
                <Text style={styles.buttonTextSecondary}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleUpdatePassword}
              >
                <Text style={styles.buttonText}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
      {toast && <Toast message={toast.message} type={toast.type} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#CC0000",
    padding: 15,
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    alignItems: "center",
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
  },
  editButton: {
    position: "absolute",
    right: 15,
    top: Platform.OS === "ios" ? 50 : 30,
    backgroundColor: "#CC0000",
    padding: 8,
    borderRadius: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "#CC0000",
    borderRadius: 10,
    padding: 20,
    width: "80%",
    alignItems: "center",
    zIndex: 1001,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "white",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 0,
    paddingHorizontal: 12,
    backgroundColor: "transparent",
    color: "white",
    marginBottom: 20,
    width: "100%",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 10,
  },
  modalButton: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmButton: {
    backgroundColor: "white",
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "white",
  },
  buttonText: {
    color: "#CC0000",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonTextSecondary: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  toastContainer: {
    position: "absolute",
    top: Platform.OS === "ios" ? 180 : 160,
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
    zIndex: 2000,
  },
  toastText: {
    color: "#CC0000",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingBottom: 160,
  },
  profileCard: {
    backgroundColor: "white",
    borderRadius: 15,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: "hidden",
  },
  coverPhoto: {
    height: 120,
    backgroundColor: "#CC0000",
    opacity: 0.9,
  },
  avatarWrapper: {
    position: "absolute",
    left: "50%",
    transform: [{ translateX: -50 }],
    bottom: -50,
    padding: 5,
    backgroundColor: "white",
    borderRadius: 75,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "white",
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#CC0000",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "white",
  },
  avatarText: {
    color: "white",
    fontSize: 36,
    fontWeight: "bold",
  },
  profileInfo: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    color: "#666",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#888",
    marginBottom: 12,
  },
  departmentBadge: {
    backgroundColor: "#ffebee",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  departmentText: {
    color: "#CC0000",
    fontSize: 14,
    fontWeight: "500",
  },
  sectionTitle: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 8,
  },
  sectionTitleText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  userInfoContainer: {
    backgroundColor: "white",
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 120,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    color: "#666",
    marginLeft: 8,
  },
  value: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  statusValue: {
    color: "#4CAF50",
    fontWeight: "600",
  },
  editInfoButton: {
    position: "absolute",
    right: 0,
    padding: 8,
  },
  inputInfo: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginLeft: 10,
    color: "#333",
  },
  uploadButton: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginLeft: 10,
    color: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "500",
  },
  editButtonsContainer: {
    flexDirection: "row",
    position: "absolute",
    right: 0,
    gap: 8,
  },
  editActionButton: {
    padding: 8,
  },
  editableAvatar: {
    position: "relative",
  },
  editAvatarOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  editAvatarText: {
    color: "white",
    fontSize: 12,
    marginTop: 4,
  },
  changePasswordButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  changePasswordContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  changePasswordText: {
    fontSize: 16,
    color: "#CC0000",
    fontWeight: "500",
    marginLeft: 8,
  },
});
