import {
  View,
  StyleSheet,
  Platform,
  SafeAreaView,
  ScrollView,
  Image,
} from "react-native";
import { Text } from "react-native";
import MenuItem from "../../components/MenuItem";
import { router } from "expo-router";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header - Fixed at top */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Quản lý đào tạo</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        {/* User Profile Section */}
        <View style={styles.profileSection}>
          <Image
            source={require("../../assets/images/react-logo.png")}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Nguyễn Văn A</Text>
            <Text style={styles.userRole}>Giảng viên</Text>
            <Text style={styles.userDepartment}>Khoa Công nghệ thông tin</Text>
          </View>
        </View>

        <View style={styles.menuGrid}>
          <MenuItem
            title="Thời khóa biểu"
            icon="calendar-outline"
            onPress={() => router.push("/sign-in")}
          />
          <MenuItem
            title="Kết quả học tập"
            icon="school-outline"
            onPress={() => router.push("/sign-up")}
          />
          <MenuItem
            title="Quản lý lớp học"
            icon="people-outline"
            onPress={() => router.push("/class-management")}
          />
          <MenuItem
            title="Điểm danh"
            icon="checkmark-circle-outline"
            onPress={() => {}}
          />
          <MenuItem title="Lịch thi" icon="time-outline" onPress={() => {}} />
          <MenuItem
            title="Đăng ký học phần"
            icon="book-outline"
            onPress={() => router.push("/register-for-class")}
          />
          <MenuItem
            title="Danh sách lớp học"
            icon="list-outline"
            onPress={() => router.push("/classes")}
          />
          <MenuItem title="Học phí" icon="cash-outline" onPress={() => {}} />
          <MenuItem
            title="Thông báo"
            icon="notifications-outline"
            onPress={() => {}}
          />
          <MenuItem
            title="Tài liệu"
            icon="document-text-outline"
            onPress={() => {}}
          />
          <MenuItem
            title="Lịch công tác"
            icon="briefcase-outline"
            onPress={() => {}}
          />
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 100,
  },
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 8,
    marginBottom: 30,
  },
  profileSection: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    color: "#666",
    marginBottom: 2,
  },
  userDepartment: {
    fontSize: 14,
    color: "#888",
  },
});
