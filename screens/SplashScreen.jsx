import React, { useRef } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import LottieView from "lottie-react-native";

const SplashScreen = () => {
  const animationRef = useRef(null);

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
    position: "absolute",
    top: height / 2 - 125,
    left: width / 2 - 125,
  },
});

export default SplashScreen;
