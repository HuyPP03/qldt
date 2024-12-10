import React, { useEffect, useRef } from 'react';
import { Animated, ActivityIndicator, StyleSheet } from 'react-native';

const LoadingIndicator = () => {
  const opacityAnim = useRef(new Animated.Value(0)).current; 

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 1, 
          duration: 1000, 
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0, 
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [opacityAnim]);

  return (
    <Animated.View style={[styles.loadingContainer, { opacity: opacityAnim }]}>
      <ActivityIndicator size="large" color="#CC0000" />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent', 
  },
});

export default LoadingIndicator;
