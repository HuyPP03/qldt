import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
  ActivityIndicator, 
} from "react-native";
import { useEffect } from "react";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { router, useRouter } from "expo-router";
import { useUser } from "./contexts/UserContext";

interface SurveyData{
    id: string;
    title: string;
    description: string;
    deadline: string; 
    file_url: string;
    class_id: string;
}

export default function SurveyDetail() {
  const { userInfo } = useUser();

  const route = useRoute();
  const {
    id,
    surveyName,
    className,
    deadline,
    description,
    fileUrl,
  } = route.params as {
    id: string;
    surveyName: string;
    className: string;
    deadline: string; 
    description: string;
    fileUrl: string;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}> Nội dung bài tập </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    justifyContent: "space-between", 
  },
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
});

