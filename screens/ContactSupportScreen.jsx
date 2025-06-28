import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ContactSupportScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="chatbubbles-outline" size={64} color="#2E7D32" />
        <Text style={styles.title}>Contact Support</Text>
        <Text style={styles.subtitle}>
          We’re here to help with any questions or issues you have.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Email us at</Text>
        <TouchableOpacity
          onPress={() => Linking.openURL("mailto:plantarea2@gmail.com")}
        >
          <Text style={styles.email}>plantarea2@gmail.com</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Working Hours</Text>
        <Text style={styles.text}>Sunday - Thursday</Text>
        <Text style={styles.text}>9:00 AM – 5:00 PM (Cairo Time)</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Response Time</Text>
        <Text style={styles.text}>
          We usually respond within 24 hours on working days.
        </Text>
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
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E7D32",
    marginTop: 15,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginTop: 10,
    paddingHorizontal: 10,
    lineHeight: 22,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E7D32",
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: "#2E7D32",
    textDecorationLine: "underline",
    marginTop: 5,
  },
  text: {
    fontSize: 15,
    color: "#333",
    marginTop: 3,
    lineHeight: 20,
  },
});

export default ContactSupportScreen;
