import React from "react";
import { Text, Animated, StyleSheet } from "react-native";

export function Toast({
  message,
  onDismiss,
  type = "error", 
}: {
  message: string;
  onDismiss: () => void;
  type?: "success" | "error" | "warning" | "info";
}) {
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
      }).start(() => {
        onDismiss();
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const colors = {
    success: {
      backgroundColor: "#e8f5e9",
      borderColor: "#4caf50",
      textColor: "#2e7d32",
    },
    error: {
      backgroundColor: "#ffebee",
      borderColor: "#d32f2f",
      textColor: "#c62828",
    },
    warning: {
      backgroundColor: "#fffde7",
      borderColor: "#f9a825",
      textColor: "#f57f17",
    },
    info: {
      backgroundColor: "#e3f2fd",
      borderColor: "#0288d1",
      textColor: "#0277bd",
    },
  };

  const { backgroundColor, borderColor, textColor } = colors[type];

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          backgroundColor,
          borderColor,
          transform: [{ translateY }],
        },
      ]}
    >
      <Text style={[styles.toastText, { color: textColor }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    position: "absolute",
    bottom: 50,
    left: 20,
    right: 20,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1001,
  },
  toastText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
  },
});
