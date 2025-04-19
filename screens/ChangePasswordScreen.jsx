import React, { useState, useEffect } from "react";
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
import { useAuth } from "../hooks/useAuth";

const ChangePasswordScreen = ({ navigation }) => {
  const { changePassword, logout, isLoading, error, setError } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      setError(null);
    });
    return unsubscribe;
  }, [navigation, setError]);

  const handleSubmit = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }

    if (newPassword.includes(" ")) {
      setError("Password cannot contain spaces");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    const result = await changePassword(currentPassword, newPassword);

    if (result.success) {
      Alert.alert(
        "Password Changed",
        "Your password was changed successfully. Please login again.",
        [{ text: "OK", onPress: logout }]
      );
    } else {
      setError(result.error || "Failed to change password");
    }
  };

  return (
    <ScrollView style={styles.container}>
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={16} color="#D32F2F" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.form}>
        <PasswordField
          label="Current Password"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secure={!showCurrent}
          toggleSecure={() => setShowCurrent(!showCurrent)}
          show={showCurrent}
        />

        <PasswordField
          label="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          secure={!showNew}
          toggleSecure={() => setShowNew(!showNew)}
          show={showNew}
          helper="At least 8 characters. No spaces."
        />

        <PasswordField
          label="Confirm New Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secure={!showConfirm}
          toggleSecure={() => setShowConfirm(!showConfirm)}
          show={showConfirm}
        />
      </View>

      <View style={styles.infoContainer}>
        <Ionicons name="information-circle-outline" size={20} color="#666" />
        <Text style={styles.infoText}>
          For security reasons, you’ll be logged out after changing your
          password.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.changeButton, isLoading && styles.disabledButton]}
        onPress={handleSubmit}
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

const PasswordField = ({
  label,
  value,
  onChangeText,
  secure,
  toggleSecure,
  show,
  helper,
}) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.passwordInputContainer}>
      <TextInput
        style={styles.passwordInput}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secure}
        placeholder={label}
      />
      <TouchableOpacity style={styles.eyeIcon} onPress={toggleSecure}>
        <Ionicons
          name={show ? "eye-off-outline" : "eye-outline"}
          size={24}
          color="#777"
        />
      </TouchableOpacity>
    </View>
    {helper && <Text style={styles.helperText}>{helper}</Text>}
  </View>
);

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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEBEE",
    padding: 15,
    marginVertical: 10,
    marginHorizontal: 20,
    borderRadius: 6,
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 14,
    marginLeft: 8,
  },
  form: {
    backgroundColor: "#FFFFFF",
    marginTop: 10,
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
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 8,
    backgroundColor: "#F9F9F9",
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
    marginLeft: 5,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#E8F5E9",
    padding: 15,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 8,
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
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    opacity: 0.7,
  },
  changeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ChangePasswordScreen;
