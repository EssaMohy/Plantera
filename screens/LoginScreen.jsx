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
  ImageBackground,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const { login, error, setError, isLoading } = useAuth();

  // Clear previous errors when focused
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      setError(null);
      setEmailError("");
      setPasswordError("");
    });

    return unsubscribe;
  }, [navigation, setError]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    // Reset previous errors
    setEmailError("");
    setPasswordError("");
    setError(null);

    // Validate input
    let hasError = false;

    if (!email) {
      setEmailError("Email is required");
      hasError = true;
    } else if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      hasError = true;
    }

    if (!password) {
      setPasswordError("Password is required");
      hasError = true;
    }

    if (hasError) {
      return;
    }

    const success = await login(email, password);

    if (!success && error) {
      // Handle specific error messages from backend
      if (error.includes("email") || error.includes("registered")) {
        setEmailError(error);
      } else if (error.includes("password") || error.includes("incorrect")) {
        setPasswordError(error);
      } else {
        Alert.alert("Login Failed", error);
      }
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
     <ImageBackground
      source={require("../assets/images/background.jpg")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
     // style={{ flex: 1 }}
     style={styles.keyboardAvoidingView}
    >
      <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Ionicons name="leaf" size={60} color="#2E7D32" />
          <Text style={styles.logoText}>Plantarea</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.welcomeText}>Welcome Back!</Text>
          <Text style={styles.subtitleText}>
            Login to access your plant care assistant
          </Text>

          <View style={styles.inputGroup}>
            <View
              style={[
                styles.inputContainer,
                emailError ? styles.inputError : null,
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
                  setEmailError("");
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {emailError ? (
              <Text style={styles.errorText}>{emailError}</Text>
            ) : null}

            <View
              style={[
                styles.inputContainer,
                passwordError ? styles.inputError : null,
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#525252"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setPasswordError("");
                }}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={toggleShowPassword}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#525252"
                />
              </TouchableOpacity>
            </View>
            {passwordError ? (
              <Text style={styles.errorText}>{passwordError}</Text>
            ) : null}

            <TouchableOpacity
              onPress={() => navigation.navigate("ForgotPassword")}
              style={styles.forgotPasswordContainer}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? "Logging in..." : "Login"}
            </Text>
          </TouchableOpacity>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
   </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
   // justifyContent: "center",
      flexGrow: 1,
   
  },
  content: {
    flex: 1,
    padding: 20,
    minHeight: '100%',
    justifyContent: 'center',
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
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  subtitleText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
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
  errorText: {
    color: "#FF3B30",
    fontSize: 14,
    marginBottom: 10,
    marginLeft: 5,
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
  eyeIcon: {
    padding: 10,
  },
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginBottom: 20,
    marginTop: 5,
  },
  forgotPasswordText: {
    color: "#2E7D32",
    fontWeight: "600",
  },
  loginButton: {
    backgroundColor: "#2E7D32",
    height: 55,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  signupText: {
    color: "#525252",
    fontSize: 16,
  },
  signupLink: {
    color: "#2E7D32",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default LoginScreen;