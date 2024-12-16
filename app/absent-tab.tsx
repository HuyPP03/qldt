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
    <View style={styles.container}>
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
