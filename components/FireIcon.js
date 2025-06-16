import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import LottieView from 'lottie-react-native';

export default function FireIcon({ streak, isBroken }) {
  if (isBroken) {
    return (
      <Text style={[styles.fireEmoji, { color: 'gray' }]}>
        🔥
      </Text>
    );
  }

  return (
    <View style={styles.lottieContainer}>
      <LottieView
        source={require('../assets/fire.json')}
        autoPlay
        loop
        style={styles.lottie}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  lottieContainer: {
    width: 100,
    height: 100,
    marginBottom: 20
  },
  lottie: {
    width: '100%',
    height: '100%'
  },
  fireEmoji: {
    fontSize: 80,
    marginBottom: 20
  }
});
