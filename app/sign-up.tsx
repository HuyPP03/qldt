import {
  Text,
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";

export default function SignUp() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");

  const handleSignUp = () => {
    // Xử lý logic đăng ký ở đây
    console.log({ firstName, lastName, email, password, role });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.mainTitle}>HUST</Text>
      <Text style={styles.subtitle}>Welcome to Allhust</Text>

      <View style={styles.nameContainer}>
        <TextInput
          style={[styles.input, styles.nameInput]}
          placeholder="Họ"
          placeholderTextColor="white"
          value={firstName}
          onChangeText={setFirstName}
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
          style={[styles.input, styles.passwordInput]}
          placeholder="Mật khẩu"
          placeholderTextColor="white"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Ionicons
          name="lock-closed"
          size={20}
          color="#666"
          style={styles.lockIcon}
        />
      </View>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={role}
          onValueChange={(itemValue: string) => setRole(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Sinh viên" value="student" color="black" />
          <Picker.Item label="Giảng viên" value="lecturer" color="black" />
        </Picker>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>SIGN UP</Text>
      </TouchableOpacity>

      <Link href="/sign-in" style={styles.loginText}>
        Hoặc đăng nhập với username/password
      </Link>
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
});
