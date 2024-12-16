import React, { useRef } from "react";
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

interface AbsentTabProps {
  classId: string;
}

export default function AbsentTab({ classId }: AbsentTabProps) {
  const router = useRouter();
  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: "createAbsent", title: "Tạo đơn" },
    { key: "getStudentAbsentRequests", title: "Danh sách đơn" },
  ]);

  const getStudentAbsentRequestsRef = useRef<any>(null);

  const handleRequestCreated = () => {
    setIndex(1);
    if (getStudentAbsentRequestsRef.current) {
      getStudentAbsentRequestsRef.current.refreshRequests();
    }
  };

  const onRequestCreated = (date: string) => {
    if (getStudentAbsentRequestsRef.current) {
      const isExisted = getStudentAbsentRequestsRef.current.createRequest(date);
      return isExisted;
    }
  };

  const renderScene = ({ route }: { route: { key: string } }) => {
    switch (route.key) {
      case "createAbsent":
        return (
          <CreateAbsent
            onRequestCreated={handleRequestCreated}
            onCreateRequest={onRequestCreated}
            classId={classId}
          />
        );
      case "getStudentAbsentRequests":
        return (
          <GetStudentAbsentRequests
            ref={getStudentAbsentRequestsRef}
            props={{ classId }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
      renderTabBar={(props) => (
        <View style={styles.tabContainer}>
          {props.navigationState.routes.map((route, i) => (
            <TouchableOpacity
              key={route.key}
              style={[
                styles.tabButton,
                index === i ? styles.activeTabButton : null, 
              ]}
              onPress={() => setIndex(i)}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: index === i ? "#CC0000" : "#333" }, 
                ]}
              >
                {route.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      style={styles.tabView}
    />



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
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  
  tabButton: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 40,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  
  activeTabButton: {
    backgroundColor: "#FFEEEE", 
    borderColor: "#CC0000", 
  },
  
  tabText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333", 
  },
  tabView: {
    backgroundColor: "white",
  },
});
