import React from 'react';
import { TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type FloatingActionButtonProps = {
  onPress: () => void; 
  iconName?: keyof typeof Ionicons.glyphMap; 
  text?: string; 
};

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onPress, iconName, text }) => {
  return (
    <TouchableOpacity
      style={[styles.floatingActionButton, text && styles.buttonWithText]}
      onPress={onPress}
    >
      <View style={styles.buttonContent}>
        {iconName && <Ionicons name={iconName} size={24} color="white" />}
        {text && <Text style={styles.buttonText}>{text}</Text>}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  floatingActionButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#CC0000',
    borderRadius: 50,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  buttonWithText: {
    width: 'auto', 
    paddingHorizontal: 16, 
    borderRadius: 10, 
    minWidth: 120, 
    height: 50, 
  },
  buttonContent: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16, 
    fontWeight: 'bold',
  },
});
