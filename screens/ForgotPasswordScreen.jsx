import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";

const API_URL =
  "https://labour-jewell-plant-area-6cb70f30.koyeb.app/plantarea/api";

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    setIsLoading(true);

    try {
      await axios.post(`${API_URL}/auth/forgotPassword`, { email });

      // Show success message
      Alert.alert(
        "Success",
        "If an account exists with this email, a password reset link will be sent.",
        [{ text: "OK", onPress: () => navigation.navigate("Login") }]
      );
    } catch (error) {
      // Still show success even if error, for security
      Alert.alert(
        "Success",
        "If an account exists with this email, a password reset link will be sent.",
        [{ text: "OK", onPress: () => navigation.navigate("Login") }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#2E7D32" />
        </TouchableOpacity>

        <View style={styles.logoContainer}>
          <Ionicons name="lock-open-outline" size={60} color="#2E7D32" />
          <Text style={styles.logoText}>Reset Password</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.instructionText}>
            Enter your email address and we'll send you a link to reset your
            password.
          </Text>

          <View style={styles.inputContainer}>
            <Ionicons
              name="mail-outline"
              size={20}
              color="#525252"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetPassword}
            disabled={isLoading}
          >
            <Text style={styles.resetButtonText}>
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.cancelButtonText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  backButton: {
    marginTop: 20,
    marginBottom: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2E7D32",
    marginTop: 10,
  },
  formContainer: {
    width: "100%",
  },
  instructionText: {
    fontSize: 16,
    color: "#525252",
    marginBottom: 30,
    textAlign: "center",
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    marginBottom: 25,
    paddingHorizontal: 10,
    height: 55,
    backgroundColor: "#F9F9F9",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: "#333",
  },
  resetButton: {
    backgroundColor: "#2E7D32",
    height: 55,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  resetButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  cancelButton: {
    height: 55,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2E7D32",
  },
  cancelButtonText: {
    color: "#2E7D32",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default ForgotPasswordScreen;
