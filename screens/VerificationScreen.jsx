import React, { useState, useRef } from "react";
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
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";

const API_URL =
  "https://labour-jewell-plant-area-6cb70f30.koyeb.app/plantarea/api";

const screenWidth = Dimensions.get("window").width;
const otpBoxSize = (screenWidth - 60) / 6 - 5; // spacing between inputs

const VerificationScreen = ({ navigation, route }) => {
  const { email } = route.params;
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);

  const inputRefs = useRef([...Array(6)].map(() => React.createRef()));

  const handleChangeText = (text, index) => {
    const newOtp = [...otpDigits];
    newOtp[index] = text;
    setOtpDigits(newOtp);

    if (text && index < 5) {
      inputRefs.current[index + 1].current.focus();
    }

    if (!text && index > 0) {
      inputRefs.current[index - 1].current.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1].current.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otp = otpDigits.join("");
    if (otp.length < 6) {
      Alert.alert("Error", "Please enter the full 6-digit verification code");
      return;
    }

    setIsLoading(true);
    try {
      // In real app, send OTP to backend for verification
      setIsLoading(false);
      navigation.navigate("ResetPassword", { email, otp });
    } catch (error) {
      setIsLoading(false);
      Alert.alert("Error", "Failed to verify code. Please try again.");
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);

    try {
      await axios.post(`${API_URL}/auth/forgotPassword`, { email });
      setIsLoading(false);
      Alert.alert(
        "Success",
        "A new verification code has been sent to your email"
      );
    } catch (error) {
      setIsLoading(false);
      Alert.alert(
        "Success",
        "If the email exists, a new verification code has been sent"
      );
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
          <Ionicons name="shield-checkmark-outline" size={60} color="#2E7D32" />
          <Text style={styles.logoText}>Verify Code</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.instructionText}>
            Enter the verification code we sent to {email}
          </Text>

          <View style={styles.otpContainer}>
            {otpDigits.map((digit, index) => (
              <TextInput
                key={index}
                ref={inputRefs.current[index]}
                style={[styles.otpInputBox, { width: otpBoxSize }]}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(text) => handleChangeText(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
              />
            ))}
          </View>

          <TouchableOpacity
            style={styles.verifyButton}
            onPress={handleVerifyOTP}
            disabled={isLoading}
          >
            <Text style={styles.verifyButtonText}>
              {isLoading ? "Verifying..." : "Verify"}
            </Text>
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive the code? </Text>
            <TouchableOpacity onPress={handleResendCode} disabled={isLoading}>
              <Text style={styles.resendLink}>Resend</Text>
            </TouchableOpacity>
          </View>
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
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    paddingHorizontal: 5,
  },
  otpInputBox: {
    height: 55,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#F9F9F9",
    textAlign: "center",
    fontSize: 24,
  },
  verifyButton: {
    backgroundColor: "#2E7D32",
    height: 55,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  verifyButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  resendText: {
    color: "#525252",
    fontSize: 16,
  },
  resendLink: {
    color: "#2E7D32",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default VerificationScreen;
