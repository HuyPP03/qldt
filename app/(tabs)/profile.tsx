import {
  View,
  Text,
  StyleSheet,
  Platform,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Image,
  TextInput,
} from "react-native";
import React, { useState } from "react";
import { useUser } from "../contexts/UserContext";
import { Ionicons } from "@expo/vector-icons";
import request from "../../utility/request";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProfileScreen() {
  const { userInfo } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState({
    ho: userInfo?.ho || "",
    ten: userInfo?.ten || "",
    avatar: userInfo?.avatar || "",
  });

  const handleUpdate = async () => {
    const token = await AsyncStorage.getItem("userToken");
    try {
      if (userInfo) {
        const response = await request(
          `${"API_URL"}/api/users/${userInfo.id}`,
          {
            method: "PUT",
            body: {
              ho: editedInfo.ho,
              ten: editedInfo.ten,
              avatar: editedInfo.avatar,
              token,
            },
          }
        );

        Alert.alert("Thành công", "Cập nhật thông tin thành công");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Lỗi", "Không thể cập nhật thông tin. Vui lòng thử lại");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Thông tin chi tiết</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setIsEditing(!isEditing)}
        >
          <Ionicons
            name={isEditing ? "checkmark-outline" : "create-outline"}
            size={24}
            color="white"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.profileHeader}>
          {userInfo?.avatar ? (
            <Image source={{ uri: userInfo.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{userInfo?.ten?.[0] || "U"}</Text>
            </View>
          )}

          {isEditing ? (
            <View style={styles.editForm}>
              <TextInput
                style={styles.input}
                value={editedInfo.avatar}
                onChangeText={(text) =>
                  setEditedInfo((prev) => ({ ...prev, avatar: text }))
                }
                placeholder="Nhập link avatar"
              />
              <View style={styles.nameInputContainer}>
                <TextInput
                  style={[styles.input, styles.nameInput]}
                  value={editedInfo.ho}
                  onChangeText={(text) =>
                    setEditedInfo((prev) => ({ ...prev, ho: text }))
                  }
                  placeholder="Họ"
                />
                <TextInput
                  style={[styles.input, styles.nameInput]}
                  value={editedInfo.ten}
                  onChangeText={(text) =>
                    setEditedInfo((prev) => ({ ...prev, ten: text }))
                  }
                  placeholder="Tên"
                />
              </View>
            </View>
          ) : (
            <>
              <Text
                style={styles.name}
              >{`${userInfo?.ho} ${userInfo?.ten}`}</Text>
              <Text style={styles.email}>{userInfo?.email}</Text>
            </>
          )}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Vai trò:</Text>
            <Text style={styles.infoValue}>
              {userInfo?.role === "STUDENT" ? "Sinh viên" : "Giảng viên"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Trạng thái:</Text>
            <Text style={styles.infoValue}>{userInfo?.status}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ID:</Text>
            <Text style={styles.infoValue}>{userInfo?.id}</Text>
          </View>
        </View>
      </View>
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
  content: {
    padding: 16,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 24,
    marginTop: 20,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#CC0000",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    borderWidth: 3,
    borderColor: "#fff",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    borderWidth: 3,
    borderColor: "#fff",
  },
  avatarText: {
    color: "white",
    fontSize: 40,
    fontWeight: "bold",
    textTransform: "uppercase",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: "#666",
  },
  infoSection: {
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 16,
    color: "#666",
    width: 100,
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  editForm: {
    width: "100%",
    alignItems: "center",
    marginTop: 16,
  },
  input: {
    width: "100%",
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  nameInputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  nameInput: {
    width: "48%",
  },
});
