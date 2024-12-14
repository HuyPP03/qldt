import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from "react-native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { useWindowDimensions } from "react-native";
import CreateAbsent from "./create-absent";
import GetStudentAbsentRequests from "./get-student-absent";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const CreateAbsentTab = () => <CreateAbsent />;
const GetStudentAbsentRequestsTab = () => <GetStudentAbsentRequests />;

export default function AbsentTab() {
  const router = useRouter();
  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: "createAbsent", title: "Tạo đơn" },
    { key: "getStudentAbsentRequests", title: "Danh sách đơn" },
  ]);

  const renderScene = ({ route }: { route: { key: string } }) => {
    switch (route.key) {
      case "createAbsent":
        return <CreateAbsent />;
      case "getStudentAbsentRequests":
        return <GetStudentAbsentRequests />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Quản lí nghỉ phép</Text>
      </View>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: "#CC0000" }}
            style={{ backgroundColor: "white" }}
            activeColor="#CC0000"
            inactiveColor="#666"
          />
        )}
      />
    </View>
  );
}

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
});
