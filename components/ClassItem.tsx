import { useRouter } from "expo-router";
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

interface ClassItemProps {
  id: string;
  name: string;
  status: string;
  lecturerName: string;
}

const ClassItem: React.FC<ClassItemProps> = ({
  id,
  name,
  status,
  lecturerName,
}) => {
  const router = useRouter();

  const handlePress = () => {
    router.push({
      pathname: "/class-detail",
      params: { id },
    });
  };


  const statusText = (() => {
    switch (status) {
      case "ACTIVE":
        return "Đang diễn ra";
      case "UPCOMING":
        return "Sắp diễn ra";
      case "COMPLETED":
        return "Đã kết thúc";
      default:
        return status;
    }
  })();

  const generateColor = (name: string) => {
    let color = 0;
    for (let i = 0; i < name.length; i++) {
      color += name.charCodeAt(i);
    }
    return `hsl(${color % 360}, 80%, 60%)`;
  };


  return (
    <TouchableOpacity onPress={handlePress} style={styles.classItem}>
      <View style={[styles.iconContainer, { backgroundColor: generateColor(name) }]}>
        <Text style={styles.iconText}>{name.charAt(0)}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.className}>{name}</Text>
        <Text style={styles.lecturerName}>{lecturerName}</Text>
        <Text style={styles.classStatus}>{statusText}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  classItem: {
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
  className: {
    fontSize: 18,
    color: "#333",
    fontWeight: "600",
  },
  lecturerName: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  classStatus: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
});

export default ClassItem;
