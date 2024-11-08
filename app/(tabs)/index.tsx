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
import { router } from "expo-router";
import { useUser } from "../contexts/UserContext";
import { Ionicons } from "@expo/vector-icons";
import { useState, useRef, useEffect } from "react";
import { Modal, Animated, Dimensions } from "react-native";

export default function HomeScreen() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const slideAnim = useRef(
    new Animated.Value(Dimensions.get("window").width)
  ).current;
  const { userInfo, logout } = useUser();

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
            <Text style={styles.userName}>
              {userInfo?.ho + " " + userInfo?.ten || "Chưa đăng nhập"}
            </Text>
            <Text style={styles.userEmail}>
              {userInfo?.email?.toLowerCase() || ""}
            </Text>
            <Text style={styles.userDepartment}>Khoa Công nghệ thông tin</Text>
          </View>
        </View>

        <View style={styles.menuGrid}>
          {userInfo &&
            menuItems
              .filter((item) => item.roles.includes(userInfo.role as never))
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
});
