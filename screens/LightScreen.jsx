import { StyleSheet, Text, View, ImageBackground } from "react-native";
import React from "react";

import LightSensorComponent from "../components/LightSensorComponent";

const SettingsScreen = () => {
  return (
    <ImageBackground
      source={require("../assets/images/7.png")}      
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <LightSensorComponent />
      </View>
    </ImageBackground>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    backgroundColor:"white"
    
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
