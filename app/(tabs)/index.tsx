import {
  View,
  StyleSheet,
  Platform,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { Text } from "react-native";
import MenuItem, { menuItems } from "../../components/MenuItem";
import { useUser } from "../contexts/UserContext";
import { Ionicons } from "@expo/vector-icons";
import { useState, useRef, useEffect } from "react";
import { Modal, Animated, Dimensions } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import moment from "moment";
import "moment/locale/vi";
import CalendarPicker from "react-native-calendar-picker";
import { Badge } from "react-native-paper";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const slideAnim = useRef(
    new Animated.Value(Dimensions.get("window").width)
  ).current;
  const { userInfo, logout, loading } = useUser();
  const [selectedDate, setSelectedDate] = useState(moment());
  const [showCalendar, setShowCalendar] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(5);

  useEffect(() => {
    if (isDrawerOpen) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: Dimensions.get("window").width,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isDrawerOpen]);

  const getWeekDays = () => {
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      weekDays.push(moment().startOf("week").add(i, "days"));
    }
    return weekDays;
  };

  if (loading || !userInfo) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#ff0000" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <View style={styles.header}>
        <Text style={styles.headerText}>Quản lý đào tạo</Text>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setIsDrawerOpen(true)}
        >
          <Ionicons name="menu-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Drawer Menu */}
      <Modal
        visible={isDrawerOpen}
        transparent={true}
        animationType="none"
        onRequestClose={() => setIsDrawerOpen(false)}
        statusBarTranslucent={true}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={() => setIsDrawerOpen(false)}
          >
            <Animated.View
              style={[
                styles.drawer,
                {
                  transform: [{ translateX: slideAnim }],
                },
              ]}
            >
              <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => {
                  logout();
                  setIsDrawerOpen(false);
                }}
              >
                <View style={styles.logoutButton}>
                  <Ionicons name="log-out-outline" size={24} color="#fff" />
                  <Text style={styles.logoutText}>Đăng xuất</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal
        visible={showCalendar}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCalendar(false)}
        statusBarTranslucent={true}
      >
        <View style={styles.calendarModalContainer}>
          <View style={styles.calendarModal}>
            <View style={styles.calendarHeader}>
              <Text style={styles.calendarTitle}>Chọn ngày</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowCalendar(false)}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <CalendarPicker
              onDateChange={(date) => {
                setSelectedDate(moment(date));
                setShowCalendar(false);
              }}
              selectedStartDate={selectedDate.toDate()}
              weekdays={["CN", "T2", "T3", "T4", "T5", "T6", "T7"]}
              months={[
                "Tháng 1",
                "Tháng 2",
                "Tháng 3",
                "Tháng 4",
                "Tháng 5",
                "Tháng 6",
                "Tháng 7",
                "Tháng 8",
                "Tháng 9",
                "Tháng 10",
                "Tháng 11",
                "Tháng 12",
              ]}
              previousTitle="Trước"
              nextTitle="Sau"
              selectedDayColor="#CC0000"
              selectedDayTextColor="#FFFFFF"
              todayBackgroundColor="#f2f2f2"
              todayTextStyle={{ fontWeight: "bold" }}
              textStyle={{
                fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
                fontSize: 16,
              }}
              dayLabelsWrapper={{
                borderTopWidth: 0,
                borderBottomWidth: 0,
                paddingTop: 10,
                paddingBottom: 10,
              }}
              customDatesStyles={[
                {
                  date: moment().toDate(),
                  style: { backgroundColor: "#f0f0f0" },
                  textStyle: { color: "#CC0000", fontWeight: "bold" },
                },
              ]}
              monthTitleStyle={{
                fontSize: 18,
                fontWeight: "bold",
                color: "#333",
                padding: 10,
              }}
              yearTitleStyle={{
                fontSize: 18,
                fontWeight: "bold",
                color: "#333",
                padding: 10,
              }}
              previousTitleStyle={{
                color: "#CC0000",
                fontSize: 16,
                fontWeight: "600",
              }}
              nextTitleStyle={{
                color: "#CC0000",
                fontSize: 16,
                fontWeight: "600",
              }}
              width={320}
              height={350}
            />
          </View>
        </View>
      </Modal>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        {/* User Profile Section */}
        <View style={styles.profileSection}>
          {userInfo?.avatar ? (
            <Image source={{ uri: userInfo?.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{userInfo?.ten?.[0] || "U"}</Text>
            </View>
          )}
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {userInfo?.ho + " " + userInfo?.ten}
            </Text>
            <Text style={styles.userEmail}>
              {userInfo?.email?.toLowerCase() || userInfo?.role?.toLowerCase()}
            </Text>
            <Text style={styles.userDepartment}>Khoa Công nghệ thông tin</Text>
          </View>

          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => router.push("/notifications")}
          >
            <View style={styles.notificationIconContainer}>
              <Ionicons name="notifications-outline" size={24} color="#555" />
              {unreadNotifications > 0 && (
                <Badge style={styles.badge} size={22}>
                  {unreadNotifications}
                </Badge>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Calendar Strip - CSS cải tiến */}
        <TouchableOpacity
          style={styles.calendarStrip}
          onPress={() => setShowCalendar(true)}
          activeOpacity={0.7}
        >
          {getWeekDays().map((day, index) => {
            const isToday = day.isSame(moment(), "day");
            const isSelected = day.isSame(selectedDate, "day");
            return (
              <View
                key={index}
                style={[
                  styles.dayContainer,
                  isToday && styles.todayContainer,
                  isSelected && styles.selectedContainer,
                ]}
              >
                <Text
                  style={[
                    styles.dayName,
                    (isToday || isSelected) && styles.todayText,
                  ]}
                >
                  {day.format("ddd")}
                </Text>
                <Text
                  style={[
                    styles.dayNumber,
                    (isToday || isSelected) && styles.todayText,
                  ]}
                >
                  {day.format("DD")}
                </Text>
              </View>
            );
          })}
        </TouchableOpacity>

        <View style={styles.menuGrid}>
          {userInfo &&
            menuItems
              .filter((item) => item.roles.includes(userInfo?.role as never))
              .map((item, index) => (
                <MenuItem
                  key={index}
                  title={item.title}
                  icon={item.icon}
                  onPress={item.onPress}
                />
              ))}
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
    flexDirection: "row",
    justifyContent: "space-between",
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
  userEmail: {
    fontSize: 16,
    color: "#666",
    marginBottom: 2,
  },
  userDepartment: {
    fontSize: 14,
    color: "#888",
  },
  logoutButton: {
    backgroundColor: "#CC0000",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
  menuButton: {
    padding: 8,
  },
  overlay: {
    flex: 1,
  },
  drawer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "70%",
    backgroundColor: "white",
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    shadowColor: "#000",
    shadowOffset: {
      width: -2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  drawerItem: {
    marginTop: "auto",
    marginBottom: 20,
  },
  drawerItemText: {
    marginLeft: 15,
    fontSize: 16,
    color: "#333",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#CC0000",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  calendarStrip: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  dayContainer: {
    alignItems: "center",
    padding: 8,
    borderRadius: 12,
    width: 45,
    height: 65,
    justifyContent: "center",
  },
  todayContainer: {
    backgroundColor: "#CC0000",
    shadowColor: "#CC0000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  selectedContainer: {
    backgroundColor: "#CC0000",
    transform: [{ scale: 1.05 }],
  },
  dayName: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  todayText: {
    color: "#fff",
    fontWeight: "bold",
  },
  calendarModalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  calendarModal: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 20,
    width: "100%",
    maxWidth: 360,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
    transform: [{ scale: 1 }],
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  calendarTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  closeButton: {
    padding: 8,
    borderRadius: 50,
    backgroundColor: "#f5f5f5",
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  notificationButton: {
    padding: 8,
    position: "relative",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    marginLeft: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  notificationIconContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#CC0000",
    borderWidth: 2,
    borderColor: "#fff",
    fontWeight: "bold",
  },
});
