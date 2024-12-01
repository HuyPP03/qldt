import React from "react";
import {
    Text,
    Animated,
    StyleSheet,
  } from "react-native";

const Toast = ({ message, onDismiss }: { message: string; onDismiss: () => void }) => {
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

const styles = StyleSheet.create({
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
        zIndex: 1001,
      },
      toastText: {
        color: "#CC0000",
        textAlign: "center",
        fontSize: 14,
        fontWeight: "500",
      },
});

  export default Toast;