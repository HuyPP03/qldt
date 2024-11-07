import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Text,
  TextInput,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";

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
    flex: 1,
    textAlign: "center",
    marginRight: 24,
  },
  backButton: {
    padding: 8,
    ...(Platform.OS === "web" && {
      cursor: "pointer",
    }),
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
  pickerContainer: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#CC0000",
    borderRadius: 0,
    marginBottom: 16,
    backgroundColor: "white",
  },
  picker: {
    height: 50,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 10,
  },
  timePickerContainer: {
    flex: 1,
  },
  label: {
    marginBottom: 4,
    color: "#CC0000",
  },
  timeInput: {
    height: 50,
    width: "100%",
    borderWidth: 1,
    borderColor: "#CC0000",
    borderRadius: 0,
    paddingHorizontal: 12,
    backgroundColor: "white",
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
  inputText: {
    color: "#CC0000",
  },
  pickerText: {
    color: "#CC0000",
  },
});

export default function CreateClass() {
  const [classType, setClassType] = useState("LT");
  const [startTime, setStartTime] = useState("07:00");
  const [endTime, setEndTime] = useState("09:00");

  const timeSlots = [
    "07:00",
    "07:30",
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Tạo lớp học</Text>
      </View>

      <ScrollView style={styles.formContainer}>
        <TextInput
          style={[styles.input, styles.inputText]}
          placeholder="Mã lớp *"
          placeholderTextColor="#CC0000"
        />

        <TextInput
          style={[styles.input, styles.inputText]}
          placeholder="Mã lớp kèm *"
          placeholderTextColor="#CC0000"
        />

        <TextInput
          style={[styles.input, styles.inputText]}
          placeholder="Tên lớp *"
          placeholderTextColor="#CC0000"
        />

        <TextInput
          style={[styles.input, styles.inputText]}
          placeholder="Mã học phần *"
          placeholderTextColor="#CC0000"
        />

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={classType}
            style={[styles.picker, styles.pickerText]}
            onValueChange={(itemValue) => setClassType(itemValue)}
          >
            <Picker.Item label="Lý thuyết (LT)" value="LT" color="#CC0000" />
            <Picker.Item label="Bài tập (BT)" value="BT" color="#CC0000" />
            <Picker.Item
              label="Lý thuyết + Bài tập (LT+BT)"
              value="LT+BT"
              color="#CC0000"
            />
            <Picker.Item label="Thực nghiệm (TN)" value="TN" color="#CC0000" />
          </Picker>
        </View>

        <View style={styles.timeContainer}>
          <View style={styles.timePickerContainer}>
            <Text style={styles.label}>Bắt đầu:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={startTime}
                style={styles.picker}
                onValueChange={(itemValue) => setStartTime(itemValue)}
              >
                {timeSlots.map((time) => (
                  <Picker.Item key={time} label={time} value={time} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.timePickerContainer}>
            <Text style={styles.label}>Kết thúc:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={endTime}
                style={styles.picker}
                onValueChange={(itemValue) => setEndTime(itemValue)}
              >
                {timeSlots.map((time) => (
                  <Picker.Item key={time} label={time} value={time} />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        <TextInput
          style={[styles.input, styles.inputText]}
          placeholder="Số lượng sinh viên tối đa *"
          placeholderTextColor="#CC0000"
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.createButton}>
          <Text style={styles.buttonText}>Tạo lớp học</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
