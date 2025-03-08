import React, { useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";

const SplashScreen = ({ navigation }) => {
  const animationRef = useRef(null);

  useEffect(() => {
    animationRef.current?.play();

    const timer = setTimeout(() => {
      navigation.replace("Tabs");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <LottieView
        ref={animationRef}
        source={require("../assets/animation.json")}
        autoPlay
        loop={true}
        style={styles.animation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff", // Set your desired background color
  },
  animation: {
    width: 300,
    height: 300,
  },
});

export default SplashScreen;
