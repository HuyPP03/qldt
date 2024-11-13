import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  Animated
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ClassItem from "../components/ClassItem";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import request from "../utility/request"; 
import { SERVER_URL } from "@env";
import { useUser } from "./contexts/UserContext";

interface ClassData {
  class_id: string;
  class_name: string;
  attached_code: string | null;
  class_type: string;
  lecturer_name: string;
  student_count: number;
  start_date: string;
  end_date: string;
  status: string;
}

const Toast = ({ message }: { message: string }) => {
  const translateY = new Animated.Value(100);

  React.useEffect(() => {
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      speed: 12,
      bounciness: 8,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(translateY, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, 2700);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          transform: [{ translateY }],
        },
      ]}
    >
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
};

export default function ClassesScreen() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassData[] | null>(null); 
  const [loading, setLoading] = useState<boolean>(true); 
  const [error, setError] = useState<string | null>(null); 

  const { userInfo } = useUser();

  const role = userInfo?.role;
  const account_id = userInfo?.id;

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken")

        if (!token) {
          setError("Token is missing");
          return;
        }

        const data = await request<any>(
          `${SERVER_URL}/it5023e/get_class_list`,
          {
            method: "POST",
            body: {
              token,
              role,
              account_id,
            },
          }
        );

        if (data.meta.code === 1000) {
          setClasses(data.data);
        } else {
          setError("Error fetching class list");
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    loadClasses();
  }, []);

  return (
    <View>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/")}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Danh sách lớp học</Text>
      </View>

      <ScrollView contentContainerStyle={styles.listContainer}>
        <Text style={styles.sectionTitle}>Danh sách lớp học</Text>
        <View style={styles.gridContainer}>
          {classes?.map((item) => (
            <View key={item.class_id} style={styles.classItemContainer}>
              <ClassItem
                id={item.class_id}
                name={item.class_name}
                status={item.status}
              />
            </View>
          ))}
        </View>
      </ScrollView>
      {error ? <Toast message={error} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#CC0000",
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  classItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  className: {
    fontSize: 18,
  },
  backButton: {
    padding: 8,
    ...(Platform.OS === "web" && { cursor: "pointer" }),
  },
  row: {
    justifyContent: "space-between",
  },
  classItemContainer: {
    width: "48%",
    marginBottom: 12,
    alignItems: "center",
  },
  listContainer: {
    paddingBottom: 100,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  toastContainer: {
    position: "absolute",
    bottom: 50,
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
});
