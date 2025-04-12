import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import * as Sensors from "expo-sensors";

const LightSensorComponent = () => {
  const [light, setLight] = useState(null);
  const [error, setError] = useState(null);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    let subscription;

    const checkSensor = async () => {
      try {
        // Check if sensor is available
        const isAvailable = await Sensors.LightSensor.isAvailableAsync();
        setIsAvailable(isAvailable);

        if (!isAvailable) {
          setError("Light sensor not available on this device");
          return;
        }

        // Set update interval (in milliseconds)
        await Sensors.LightSensor.setUpdateInterval(1000);

        subscription = Sensors.LightSensor.addListener(({ illuminance }) => {
          // Some devices return negative values when sensor is not properly calibrated
          const adjustedValue = illuminance >= 0 ? illuminance : 0;
          setLight(adjustedValue);
        });
      } catch (err) {
        setError(err.message);
      }
    };

    checkSensor();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  // Get recommended brightness level based on lux
  const getBrightnessRecommendation = (lux) => {
    if (lux === null || lux === undefined) return "";
    if (lux < 10) return " (Very dark)";
    if (lux < 50) return " (Dark)";
    if (lux < 100) return " (Dim)";
    if (lux < 1000) return " (Normal indoor)";
    if (lux < 10000) return " (Bright indoor)";
    return " (Direct sunlight)";
  };

  return (
    <View style={styles.container}>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : !isAvailable ? (
        <Text style={styles.text}>Light sensor not available</Text>
      ) : (
        <>
          <Text style={styles.text}>
            Light Intensity:{" "}
            {light !== null ? `${light.toFixed(2)} lux` : "Measuring..."}
          </Text>
          <Text style={styles.recommendation}>
            {light !== null && getBrightnessRecommendation(light)}
          </Text>
          {Platform.OS === "android" && (
            <Text style={styles.note}>
              Note: On some Android devices, light sensor readings may be
              inaccurate.
            </Text>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
   // backgroundColor: "white",
    padding: 20,
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  recommendation: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
  error: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
  },
  note: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginTop: 20,
    fontStyle: "italic",
  },
});

export default LightSensorComponent;
