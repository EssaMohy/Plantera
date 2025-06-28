import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const AboutScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="leaf-outline" size={64} color="#2E7D32" />
        <Text style={styles.title}>About Plantera</Text>
        <Text style={styles.subtitle}>
          Your smart plant companion – built to help you care for your plants
          with ease.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>What is Plantera?</Text>
        <Text style={styles.cardText}>
          Plantera is your intelligent gardening assistant 🌿. It helps you:
        </Text>
        <Text style={styles.listItem}>
          • Identify plant species from images
        </Text>
        <Text style={styles.listItem}>• Detect diseases using AI</Text>
        <Text style={styles.listItem}>
          • Schedule watering & fertilizing reminders
        </Text>
        <Text style={styles.listItem}>• Get notified to take action</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Technologies Used</Text>
        <Text style={styles.cardText}>
          💻 React Native (Mobile App){"\n"}
          🔗 Node.js + MongoDB (Backend){"\n"}
          🤖 Machine Learning (Plant & Disease Detection){"\n"}
          🔔 Expo Notifications
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Version</Text>
        <Text style={styles.cardText}>1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F7F7F7",
    padding: 20,
    flexGrow: 1,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 25,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2E7D32",
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2E7D32",
    marginBottom: 10,
  },
  cardText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
  },
  listItem: {
    fontSize: 15,
    color: "#444",
    marginTop: 5,
    paddingLeft: 10,
  },
});

export default AboutScreen;
