import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type FloatingActionButtonProps = {
  onPress: () => void; 
  iconName: keyof typeof Ionicons.glyphMap; 
};

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onPress, iconName }) => {
  return (
    <TouchableOpacity style={styles.floatingActionButton} onPress={onPress}>
      <Ionicons name={iconName} size={24} color="white" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
    floatingActionButton: {
        position: "absolute",
        bottom: 16,
        right: 16,
        backgroundColor: "#CC0000",
        borderRadius: 50,
        width: 56,
        height: 56,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
      },
});

