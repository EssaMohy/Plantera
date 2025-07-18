import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../hooks/useAuth";

const ForgotPasswordScreen = ({ navigation }) => {
  const { forgotPassword, isLoading, error, setError } = useAuth();

  const [email, setEmail] = useState("");
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      setError(null);
      setLocalError("");
    });
    return unsubscribe;
  }, [navigation, setError]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleResetPassword = async () => {
    setLocalError("");
    setError(null);

    if (!email) {
      setLocalError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setLocalError("Please enter a valid email address");
      return;
    }

    const result = await forgotPassword(email);

    console.log("Forgot password result:", result); // for debugging

    if (result?.success) {
      navigation.navigate("Verification", { email });
    } else {
      setError(result?.error || "Failed to send reset email");
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
            Enter your email address and we'll send you a verification code to
            reset your password.
          </Text>

          <View
            style={[
              styles.inputContainer,
              (localError || error) && styles.inputError,
            ]}
          >
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
              onChangeText={(text) => {
                setEmail(text);
                setLocalError("");
                setError(null);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {(localError || error) && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={16} color="#D32F2F" />
              <Text style={styles.errorText}>{localError || error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.resetButton, isLoading && styles.disabledButton]}
            onPress={handleResetPassword}
            disabled={isLoading}
          >
            <Text style={styles.resetButtonText}>
              {isLoading ? "Sending..." : "Send Verification Code"}
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
    marginBottom: 10,
    paddingHorizontal: 10,
    height: 55,
    backgroundColor: "#F9F9F9",
  },
  inputError: {
    borderColor: "#FF3B30",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEBEE",
    padding: 12,
    borderRadius: 6,
    marginBottom: 15,
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 14,
    marginLeft: 8,
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
    marginTop: 15,
  },
  disabledButton: {
    opacity: 0.7,
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
