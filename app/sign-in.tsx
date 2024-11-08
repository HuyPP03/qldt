import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import request from "@/utility/request";
import { UserInfo, useUser } from "@/app/contexts/UserContext";
import { useRouter } from "expo-router";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const router = useRouter();

  const { setUserInfo } = useUser();

  const handleSignIn = async () => {
    try {
      const response = await request<any>(
        "http://160.30.168.228:8080/it4788/login",
        {
          method: "POST",
          body: { email, password, deviceId: 1 },
        }
      );

      await AsyncStorage.setItem("userToken", response.token);
      setUserInfo(response);

      router.replace("/");
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.mainTitle}>HUST</Text>
      <Text style={styles.subtitle}>Welcome to Allhust</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="white"
        value={email}
        onChangeText={setEmail}
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Mật khẩu"
          placeholderTextColor="white"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons
            name={showPassword ? "eye-outline" : "eye-off-outline"}
            size={24}
            color="white"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSignIn}>
        <Text style={styles.buttonText}>ĐĂNG NHẬP</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setShowForgotPassword(true)}>
        <Text style={styles.forgotPassword}>Quên mật khẩu?</Text>
      </TouchableOpacity>

      <Modal
        visible={showForgotPassword}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Quên mật khẩu</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nhập email của bạn"
              value={email}
              onChangeText={setEmail}
              placeholderTextColor="#666"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowForgotPassword(false);
                  setEmail("");
                }}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => {
                  console.log("Gửi email khôi phục đến:", email);
                  setShowForgotPassword(false);
                  setEmail("");
                }}
              >
                <Text style={styles.confirmButtonText}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#CC0000",
  },
  mainTitle: {
    fontSize: 50,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "white",
  },
  subtitle: {
    fontSize: 30,
    marginBottom: 30,
    textAlign: "center",
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
  },
  button: {
    backgroundColor: "white",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#CC0000",
    fontSize: 16,
    fontWeight: "bold",
  },
  forgotPassword: {
    color: "white",
    textAlign: "center",
    marginTop: 20,
    fontStyle: "italic",
    textDecorationLine: "underline",
  },
  passwordContainer: {
    position: "relative",
    width: "100%",
    marginBottom: 15,
  },
  passwordInput: {
    height: 50,
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 0,
    paddingHorizontal: 12,
    backgroundColor: "transparent",
    color: "white",
    paddingRight: 50,
    marginBottom: 20,
    lineHeight: 50,
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  modalInput: {
    width: "100%",
    height: 45,
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
    color: "white",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  confirmButton: {
    backgroundColor: "#CC0000",
  },
  cancelButtonText: {
    color: "#333",
    fontWeight: "bold",
  },
  confirmButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
