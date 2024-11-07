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

// Data fake cho form chỉnh sửa
const fakeClassData = {
  classCode: "INT1234",
  subClassCode: "INT1234.1",
  className: "Lập trình Web",
  teacher: "Nguyễn Văn A",
  classType: "LT",
  startTime: "07:00",
  endTime: "09:00",
  dayOfWeek: "Thứ 2",
  room: "305-A2",
  maxStudents: "60",
  note: "Lớp học phần lý thuyết",
};

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
    paddingBottom: 40,
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
  inputText: {
    color: "#CC0000",
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
    color: "#CC0000",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 10,
  },
  timeLabel: {
    color: "#CC0000",
    marginRight: 8,
    fontSize: 16,
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
  // Style mới cho container chứa 2 button
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
    marginBottom: 30,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: "#CC0000",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmButton: {
    flex: 1,
    backgroundColor: "#CC0000",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default function EditClass() {
  // Khởi tạo state với data fake
  const [classCode, setClassCode] = useState(fakeClassData.classCode);
  const [subClassCode, setSubClassCode] = useState(fakeClassData.subClassCode);
  const [className, setClassName] = useState(fakeClassData.className);
  const [teacher, setTeacher] = useState(fakeClassData.teacher);
  const [classType, setClassType] = useState(fakeClassData.classType);
  const [startTime, setStartTime] = useState(fakeClassData.startTime);
  const [endTime, setEndTime] = useState(fakeClassData.endTime);
  const [dayOfWeek, setDayOfWeek] = useState(fakeClassData.dayOfWeek);
  const [room, setRoom] = useState(fakeClassData.room);
  const [maxStudents, setMaxStudents] = useState(fakeClassData.maxStudents);
  const [note, setNote] = useState(fakeClassData.note);

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
  ];

  const daysOfWeek = [
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
    "Chủ nhật",
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
        <Text style={styles.headerText}>Chỉnh sửa lớp học</Text>
      </View>

      <ScrollView
        style={styles.formContainer}
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        <TextInput
          style={[styles.input, styles.inputText]}
          placeholder="Mã lớp *"
          placeholderTextColor="#CC0000"
          value={classCode}
          onChangeText={setClassCode}
        />

        <TextInput
          style={[styles.input, styles.inputText]}
          placeholder="Mã lớp kèm *"
          placeholderTextColor="#CC0000"
          value={subClassCode}
          onChangeText={setSubClassCode}
        />

        <TextInput
          style={[styles.input, styles.inputText]}
          placeholder="Tên lớp *"
          placeholderTextColor="#CC0000"
          value={className}
          onChangeText={setClassName}
        />

        <TextInput
          style={[styles.input, styles.inputText]}
          placeholder="Giảng viên *"
          placeholderTextColor="#CC0000"
          value={teacher}
          onChangeText={setTeacher}
        />

        <View style={styles.pickerContainer}>
          <Picker
            style={styles.picker}
            selectedValue={classType}
            onValueChange={setClassType}
          >
            <Picker.Item label="Lý thuyết" value="LT" />
            <Picker.Item label="Thực hành" value="TH" />
          </Picker>
        </View>

        <View style={styles.pickerContainer}>
          <Picker
            style={styles.picker}
            selectedValue={dayOfWeek}
            onValueChange={setDayOfWeek}
          >
            {daysOfWeek.map((day) => (
              <Picker.Item key={day} label={day} value={day} />
            ))}
          </Picker>
        </View>

        <View style={styles.timeContainer}>
          <View style={{ flex: 1 }}>
            <Text style={styles.timeLabel}>Giờ bắt đầu</Text>
            <View style={styles.pickerContainer}>
              <Picker
                style={styles.picker}
                selectedValue={startTime}
                onValueChange={setStartTime}
              >
                {timeSlots.map((time) => (
                  <Picker.Item key={time} label={time} value={time} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.timeLabel}>Giờ kết thúc</Text>
            <View style={styles.pickerContainer}>
              <Picker
                style={styles.picker}
                selectedValue={endTime}
                onValueChange={setEndTime}
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
          placeholder="Phòng học *"
          placeholderTextColor="#CC0000"
          value={room}
          onChangeText={setRoom}
        />

        <TextInput
          style={[styles.input, styles.inputText]}
          placeholder="Số lượng sinh viên tối đa *"
          placeholderTextColor="#CC0000"
          value={maxStudents}
          onChangeText={setMaxStudents}
          keyboardType="numeric"
        />

        <TextInput
          style={[styles.input, styles.inputText]}
          placeholder="Ghi chú"
          placeholderTextColor="#CC0000"
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={3}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.deleteButton}>
            <Text style={styles.buttonText}>Xóa lớp</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.confirmButton}>
            <Text style={styles.buttonText}>Xác nhận</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
