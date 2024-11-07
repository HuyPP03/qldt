import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface MenuItemProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

export default function MenuItem({ title, icon, onPress }: MenuItemProps) {
  return (
    <View style={styles.menuItem}>
      <TouchableOpacity style={styles.itemContent} onPress={onPress}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={50} color="#CC0000" />
        </View>
        <Text style={styles.title}>{title}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  menuItem: {
    width: "50%",
    aspectRatio: 1,
    padding: 8,
  },
  itemContent: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
    padding: 15,
  },
  iconContainer: {
    marginBottom: 10,
  },
  title: {
    fontSize: 14,
    textAlign: "center",
    color: "#333",
    fontWeight: "500",
  },
});
