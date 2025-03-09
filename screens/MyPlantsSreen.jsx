import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import LottieView from "lottie-react-native";

const MyPlantsScreen = () => {
  return (
    <View style={styles.container}>
      {/* Replace the Image component with LottieView */}
      <LottieView
        source={require("../assets/plant.json")} // Path to your Lottie JSON file
        autoPlay
        loop
        style={styles.animation}
      />
      <Text style={styles.title}>Let's get started</Text>
      <Text style={styles.subtitle}>
        Get professional plant care guidance to keep your plant alive!
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          // Handle button press
          console.log("Add plants button pressed");
        }}
      >
        <Text style={styles.buttonText}>+ Add plants</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MyPlantsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  animation: {
    width: 300, // Adjust the width and height as needed
    height: 300,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    padding: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#525252",
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#14AE5C",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
