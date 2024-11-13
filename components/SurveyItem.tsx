import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface SurveyItemProps {
  surveyName: string;
  className: string;
  deadline: string; //"YYYY-MM-DDTHH:MM:SS"
}

const SurveyItem: React.FC<SurveyItemProps> = ({ surveyName, className, deadline }) => {
  const formatDeadline = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>{surveyName[0].toUpperCase()}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.surveyName}>{surveyName}</Text>
        <Text style={styles.className}>Lớp: {className}</Text>
        <Text style={styles.deadline}>Hạn: {formatDeadline(deadline)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#CC0000",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  avatarText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  textContainer: {
    flex: 1,
  },
  surveyName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  className: {
    fontSize: 14,
    color: "#666",
  },
  deadline: {
    fontSize: 14,
    color: "#999",
  },
});

export default SurveyItem;
