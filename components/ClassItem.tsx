import { useRouter } from "expo-router";
import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";

interface ClassItemProps {
  id: string;
  name: string;
  status: string;
}

const ClassItem: React.FC<ClassItemProps> = ({
  id,
  name,
  status,
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
  })()
  
  return (
    <TouchableOpacity onPress={handlePress} style={styles.classItem}>
      <Image source={require("../assets/images/graduation-caps.svg")} style={styles.avatar} />
      <Text style={styles.className}>{name}</Text>
      <Text style={styles.classStatus}>{statusText}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  classItem: {
    width: "100%",
    aspectRatio: 1,
    padding: 8,
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
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
  },
  className: {
    fontSize: 16,
    textAlign: "center",
    color: "#333",
    fontWeight: "600",
  },
  classStatus: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
});

export default ClassItem;
