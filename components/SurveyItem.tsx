import { formatDate } from "@/utility/format-date";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

interface SurveyItemProps {
  id: string;
  surveyName: string;
  className: string;
  deadline: string; 
  description: string;
  fileUrl: string;
  onPress: () => void;
  onMenuPress?: () => void;
}

const SurveyItem: React.FC<SurveyItemProps> = ({
  id,
  surveyName,
  className,
  deadline,
  description,
  fileUrl,
  onPress,
  onMenuPress,
}) => {
  const router = useRouter();

  const generateColor = (name: string) => {
    let color = 0;
    for (let i = 0; i < name.length; i++) {
      color += name.charCodeAt(i);
    }
    return `hsl(${color % 360}, 80%, 60%)`;
  };

  return (
    <TouchableOpacity onPress={onPress} style={styles.surveyItem}>
      <View style={[styles.iconContainer, { backgroundColor: generateColor(surveyName) }]}>
        <Text style={styles.iconText}>{surveyName.charAt(0)}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.surveyName}>{surveyName}</Text>
        <Text style={styles.className}>Lớp: {className}</Text>
        <Text style={styles.deadline}>Hạn: {formatDate(deadline)}</Text>
      </View>
      <TouchableOpacity onPress={onMenuPress} style={[styles.menuIcon, { padding: 10, paddingRight:0 }]}>
        <Ionicons name="ellipsis-vertical" size={24} color="#666" /> 
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  surveyItem: {
    width: "100%",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
    marginBottom: 16,
  },
  iconContainer: {
    width: 65,
    height: 65,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  iconText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  textContainer: {
    flex: 1,
  },
  surveyName: {
    fontSize: 18,
    color: "#333",
    fontWeight: "600",
  },
  className: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  deadline: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  description: {
    fontSize: 14,
    color: "#444",
    marginTop: 4,
  },
  fileLink: {
    fontSize: 14,
    color: "#1E90FF",
    marginTop: 4,
  },
  menuIcon: {
    position: "absolute",
    top: 10,
    right: 10,
  },
});

export default SurveyItem;
