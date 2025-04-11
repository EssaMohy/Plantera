import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
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
        resizeMode="contain"
      />
    </View>
  );
};

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  animation: {
    width: 251,
    height: 251,
    // Ensure the animation is perfectly centered
    position: "absolute",
    top: height / 2 - 125, // Center vertically (half of screen height - half of animation height)
    left: width / 2 - 125, // Center horizontally (half of screen width - half of animation width)
  },
});

export default SplashScreen;
