import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ConfettiCannon from 'react-native-confetti-cannon';
import Toast from 'react-native-toast-message';
import Svg, { Circle } from 'react-native-svg';

// Custom FireIcon component (assuming it's already a modern design)
// If not, consider using a high-quality SVG or an icon library like FontAwesome.
import FireIcon from './components/FireIcon';

export default function App() {
  const [streak, setStreak] = useState(0);
  const [lastDate, setLastDate] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  const fadeAnim = useRef(new Animated.Value(0)).current; // For streak text animation
  const scaleAnim = useRef(new Animated.Value(1)).current; // For button press animation

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedStreak = await AsyncStorage.getItem('streak');
        const savedDate = await AsyncStorage.getItem('lastDate');

        if (savedStreak) {
          setStreak(parseInt(savedStreak, 10));
        }
        if (savedDate) {
          setLastDate(savedDate);
          const yesterday = new Date(Date.now() - 86400000)
            .toISOString()
            .split('T')[0];
          if (savedDate !== today && savedDate !== yesterday) {
            setStreak(0); // Reset streak if not today or yesterday
            Toast.show({
              type: 'info',
              text1: 'Streak Reset!',
              text2: 'You missed a day. Starting fresh!',
              position: 'bottom',
              visibilityTime: 4000,
            });
          }
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        Toast.show({
          type: 'error',
          text1: 'Error loading data',
          text2: 'Please try restarting the app.',
        });
      }
    };
    loadData();
  }, []);

  // Animation for streak text when it changes
  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [streak]);

  const handleTap = async () => {
    if (today === lastDate) {
      Toast.show({
        type: 'info',
        text1: 'Already Recorded!',
        text2: 'You can only record once per day.',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }

    // Button press animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease),
      }),
    ]).start();

    try {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setLastDate(today);
      await AsyncStorage.setItem('streak', newStreak.toString());
      await AsyncStorage.setItem('lastDate', today);

      const milestoneMessages = {
        3: "🔥 Day 3! You're on fire!",
        7: "💪 Day 7! Strong streak!",
        10: "🥇 10 days! You legend!",
        30: "🚀 30-day beast mode!",
        60: "💎 60 days! Unstoppable!",
        100: "💯 Century Streak! Amazing!",
      };

      if (milestoneMessages[newStreak]) {
        Toast.show({
          type: 'success',
          text1: '🎉 Milestone Reached!',
          text2: milestoneMessages[newStreak],
          position: 'top',
          visibilityTime: 4000,
        });

        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3500); // Confetti for a bit longer
      } else {
        Toast.show({
          type: 'success',
          text1: `Day ${newStreak} Recorded!`,
          text2: 'Keep up the great work!',
          position: 'top',
          visibilityTime: 2000,
        });
      }
    } catch (error) {
      console.error('Failed to record streak:', error);
      Toast.show({
        type: 'error',
        text1: 'Error recording streak',
        text2: 'Please try again.',
      });
    }
  };

  const handleReset = async () => {
    try {
      await AsyncStorage.removeItem('streak');
      await AsyncStorage.removeItem('lastDate');
      setStreak(0);
      setLastDate('');
      Toast.show({
        type: 'info',
        text1: 'Streak Reset',
        text2: 'Your streak has been reset.',
        position: 'bottom',
        visibilityTime: 3000,
      });
    } catch (error) {
      console.error('Failed to reset streak:', error);
      Toast.show({
        type: 'error',
        text1: 'Error resetting streak',
        text2: 'Please try again.',
      });
    }
  };

  // Progress ring variables
  const radius = 80;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  // For a daily tracker, progress would be 100% when tapped.
  // Here, we can make it a simple visual for the streak count itself,
  // or show 100% when `lastDate === today`.
  const progress = lastDate === today ? 100 : 0; // 0% if not recorded today, 100% if recorded
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {showConfetti && (
        <ConfettiCannon
          count={200}
          origin={{ x: -10, y: 0 }}
          fadeOut
          fallSpeed={3000}
          explosionSpeed={500}
          colors={['#FFD700', '#FF4500', '#ADFF2F', '#1E90FF']}
        />
      )}

      <View style={styles.contentWrapper}>
        <View style={styles.fireIconContainer}>
          <FireIcon streak={streak} isBroken={lastDate !== today} />
        </View>

        <View style={styles.progressRingContainer}>
          <Svg height={radius * 2} width={radius * 2} viewBox={`0 0 ${radius * 2} ${radius * 2}`}>
            <Circle
              stroke="#2C2C2C"
              fill="none"
              cx={radius}
              cy={radius}
              r={radius - strokeWidth / 2}
              strokeWidth={strokeWidth}
            />
            <Circle
              stroke="#FF5722" // Vibrant accent color
              fill="none"
              cx={radius}
              cy={radius}
              r={radius - strokeWidth / 2}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              rotation="-90"
              origin={`${radius}, ${radius}`}
            />
          </Svg>
          <Animated.Text style={[styles.streakText, { opacity: fadeAnim }]}>
            {streak}
          </Animated.Text>
          <Text style={styles.streakLabel}>Day Streak</Text>
        </View>

        <TouchableOpacity
          style={[styles.button, { transform: [{ scale: scaleAnim }] }]}
          onPress={handleTap}>
          <Text style={styles.buttonText}>
            {lastDate === today ? 'Recorded Today!' : 'Record Day'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.resetButton]}
          onPress={handleReset}>
          <Text style={styles.buttonText}>Reset Streak</Text>
        </TouchableOpacity>
      </View>
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Pitch black for deep contrast
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  contentWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  fireIconContainer: {
    marginBottom: 30,
  },
  progressRingContainer: {
    position: 'relative',
    width: 160, // 2 * radius
    height: 160, // 2 * radius
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
  },
  streakText: {
    position: 'absolute',
    fontSize: 60, // Larger font size for impact
    fontWeight: 'bold',
    color: '#FFFFFF', // Pure white
    fontVariant: ['tabular-nums'], // Helps with number alignment
  },
  streakLabel: {
    position: 'absolute',
    marginTop: 70, // Adjust to position below the number
    fontSize: 18,
    color: '#BBBBBB', // Lighter grey for secondary text
  },
  button: {
    backgroundColor: '#FF5722', // Orange-red accent
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30, // More rounded, pill-shaped
    marginVertical: 10,
    width: '80%', // Make buttons wider
    alignItems: 'center',
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8, // Android shadow
  },
  resetButton: {
    backgroundColor: '#424242', // Darker grey for reset
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600', // Semibold
    letterSpacing: 0.5,
  },
});

// Assuming your Toast configuration is set up globally or imported.
Toast.set ;
// Ensure your App.js or root component uses <Toast config={toastConfig} /> if you define custom types

const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#69B05A' }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 15,
        fontWeight: 'bold'
      }}
      text2Style={{
        fontSize: 13,
        color: '#333'
      }}
    />
  ),
  info: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#1E90FF' }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 15,
        fontWeight: 'bold'
      }}
      text2Style={{
        fontSize: 13,
        color: '#333'
      }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      text1Style={{
        fontSize: 15
      }}
      text2Style={{
        fontSize: 13
      }}
    />
  )
};
