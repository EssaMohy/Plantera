import { Image, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React from "react";

const ReminderScreen = () => {
  return (
    <View style={styles.container}>
      <Image source={require("../assets/images/add-plant.png")} />
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

export default ReminderScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
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
