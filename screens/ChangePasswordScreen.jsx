import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const API_URL =
  "https://labour-jewell-plant-area-6cb70f30.koyeb.app/plantarea/api";

const ChangePasswordScreen = ({ navigation }) => {
  const { userToken } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChangePassword = async () => {
    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords don't match");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Make API request to change password
      await axios.post(
        `${API_URL}/auth/changePassword`,
        {
          currentPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      setIsLoading(false);
      Alert.alert("Success", "Your password has been changed successfully", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      setIsLoading(false);
      const errorMessage =
        error.response?.data?.message || "Something went wrong";
      setError(errorMessage);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Current Password</Text>
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={styles.passwordInput}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Enter your current password"
              secureTextEntry={!showCurrentPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              <Ionicons
                name={showCurrentPassword ? "eye-off-outline" : "eye-outline"}
                size={24}
                color="#777777"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>New Password</Text>
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={styles.passwordInput}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter your new password"
              secureTextEntry={!showNewPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowNewPassword(!showNewPassword)}
            >
              <Ionicons
                name={showNewPassword ? "eye-off-outline" : "eye-outline"}
                size={24}
                color="#777777"
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.helperText}>
            Password must be at least 8 characters
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm New Password</Text>
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={styles.passwordInput}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm your new password"
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons
                name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                size={24}
                color="#777777"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Ionicons name="information-circle-outline" size={20} color="#666666" />
        <Text style={styles.infoText}>
          For security reasons, you'll need to re-login after changing your
          password
        </Text>
      </View>

      <TouchableOpacity
        style={styles.changeButton}
        onPress={handleChangePassword}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.changeButtonText}>Change Password</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
  },
  errorContainer: {
    backgroundColor: "#FFE8E6",
    padding: 15,
    marginVertical: 10,
    marginHorizontal: 20,
    borderRadius: 5,
    borderLeftWidth: 5,
    borderLeftColor: "#FF5252",
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 14,
  },
  form: {
    backgroundColor: "#FFFFFF",
    marginTop: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#EEEEEE",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333333",
    marginBottom: 8,
  },
  passwordInputContainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 5,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
  },
  helperText: {
    fontSize: 12,
    color: "#999999",
    marginTop: 5,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#E8F5E9",
    padding: 15,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 5,
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: "#2E7D32",
  },
  changeButton: {
    backgroundColor: "#2E7D32",
    marginHorizontal: 20,
    marginTop: 30,
    marginBottom: 30,
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  changeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ChangePasswordScreen;
