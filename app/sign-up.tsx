import {
  Text,
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useState, useRef, useEffect } from "react";
import { router } from "expo-router";
import { Alert } from "react-native";
import { SERVER_URL } from "@/utility/env";
import request from "@/utility/request";

export default function SignUp() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  // dùng để focus vào input "Họ" khi component được render
  const firstNameRef = useRef<TextInput>(null);
  useEffect(() => {
    setTimeout(() => {
      firstNameRef.current?.focus();
    }, 100);
  }, []);

  const handleSignUp = async () => {
    // Xử lý logic đăng ký ở đây
    try {
      setIsLoading(true);

      if (!firstName || !lastName || !email || !password) {
        Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
        return;
      }

      if (password.length < 6 && password.length > 15) {
        Alert.alert("Lỗi", "Yêu cầu độ dài mật khẩu từ 6-15 ký tự");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        Alert.alert("Lỗi", "Email không hợp lệ");
        return;
      }

      console.log("data send", { email, password, firstName, lastName, role });
      const signUpResponse = await request<any>(`${SERVER_URL}/it4788/signup`, {
        method: "POST",
        body: {
          ho: firstName,
          ten: lastName,
          email,
          password,
          uuid: 11111,
          role,
        },
      });
      if (signUpResponse.data) {
        const verifyCode = signUpResponse.data.verify_code;
      }
      console.log("respon data", signUpResponse);
      setShowModal(true);

      if (signUpResponse.data) {
      }
    } catch (error) {
      Alert.alert("Lỗi", "Đã có lỗi xảy ra khi đăng ký");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
    console.log({ firstName, lastName, email, password, role });
  };

  const handleVerifyEmail = async () => {
    try {
      setIsLoading(true);

      if (!verificationCode) {
        Alert.alert("Lỗi", "Vui lòng nhập mã xác thực");
        return;
      }

      const verifyResponse = await request<any>(
        `${SERVER_URL}/it4788/check_verify_code`,
        {
          method: "POST",
          body: {
            email,
            verify_code: verificationCode,
          },
        }
      );
      Alert.alert("Thành công", "Xác thực email thành công!", [
        {
          text: "OK",
          onPress: () => {
            setShowModal(false);
            router.replace("/sign-in");
          },
        },
      ]);
      console.log("Verificationcode", verificationCode);
      if (verifyResponse.data) {
      }
    } catch (error: any) {
      Alert.alert(
        "Lỗi",
        error.response?.data?.message ||
          "Mã xác thực không đúng. Vui lòng thử lại!"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.mainTitle}>HUST</Text>
      <Text style={styles.subtitle}>Welcome to Allhust</Text>

      <View style={styles.nameContainer}>
        <TextInput
          ref={firstNameRef}
          style={[styles.input, styles.nameInput]}
          placeholder="Họ"
          placeholderTextColor="white"
          value={firstName}
          onChangeText={setFirstName}
          autoFocus={true}
        />

        <TextInput
          style={[styles.input, styles.nameInput]}
          placeholder="Tên"
          placeholderTextColor="white"
          value={lastName}
          onChangeText={setLastName}
        />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="white"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
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

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={role}
          onValueChange={(itemValue: string) => setRole(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Sinh viên" value="STUDENT" color="black" />
          <Picker.Item label="Giảng viên" value="LECTURER" color="black" />
        </Picker>
      </View>
      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleSignUp}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? "ĐANG XỬ LÝ..." : "SIGN UP"}
        </Text>
      </TouchableOpacity>

      <Link href="/sign-in" style={styles.loginText}>
        Hoặc đăng nhập với username/password
      </Link>

      <Modal visible={showModal} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Xác thực email</Text>
            <Text> Đã gửi mã đến email:</Text>
            <Text> {email}</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Nhập mã xác thực"
              value={verificationCode}
              onChangeText={setVerificationCode}
              placeholderTextColor="#666"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowModal(false);
                  setVerificationCode("");
                }}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleVerifyEmail}
              >
                <Text style={styles.confirmButtonText}>
                  {" "}
                  {isLoading ? "Đang xử lý..." : "Xác nhận"}
                </Text>
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 0,
    backgroundColor: "transparent",
    marginBottom: 20,
  },
  picker: {
    height: 50,
    color: "white",
  },
  nameContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  nameInput: {
    flex: 0.48,
    marginBottom: 0,
  },
  passwordContainer: {
    position: "relative",
    marginBottom: 20,
  },
  passwordInput: {
    height: 50,
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 0,
    paddingHorizontal: 12,
    backgroundColor: "transparent",
    color: "white",
    paddingRight: 40,
  },
  lockIcon: {
    position: "absolute",
    right: 10,
    top: 15,
    color: "white",
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
  loginText: {
    color: "white",
    textAlign: "center",
    marginTop: 20,
    fontStyle: "italic",
    textDecorationLine: "underline",
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
    color: "black",
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
  toastContainer: {
    position: "absolute",
    top: 50,
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
    zIndex: 1000,
  },
  toastText: {
    color: "#CC0000",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
