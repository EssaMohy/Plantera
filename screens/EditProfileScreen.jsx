import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../context/AuthContext";

const EditProfileScreen = ({ navigation }) => {
  const { userInfo, updateProfile } = useAuth();
  const [firstName, setFirstName] = useState(userInfo?.firstName || "");
  const [lastName, setLastName] = useState(userInfo?.lastName || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    if (!firstName.trim() && !lastName.trim()) {
      Alert.alert("Error", "Please enter at least one field to update");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Prepare data object with only the fields that have values
      const updateData = {};
      if (firstName.trim()) updateData.firstName = firstName;
      if (lastName.trim()) updateData.lastName = lastName;

      // Use the updateProfile function from AuthContext
      const result = await updateProfile(updateData);

      if (result.success) {
        setIsLoading(false);
        Alert.alert("Success", "Your profile has been updated successfully", [
          {
            text: "OK",
            onPress: () => {
              // Navigate back to the Profile screen
              navigation.navigate("Profile");
            },
          },
        ]);
      } else {
        setIsLoading(false);
        setError(result.error);
        Alert.alert("Error", result.error);
      }
    } catch (error) {
      setIsLoading(false);
      const errorMessage = "Something went wrong";
      setError(errorMessage);
      Alert.alert("Error", errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter your first name"
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Enter your last name"
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={userInfo?.email}
            editable={false}
          />
          <Text style={styles.helperText}>Email cannot be changed</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.saveButtonText}>Save Changes</Text>
        )}
      </TouchableOpacity>
    </View>
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
  input: {
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 5,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
  },
  disabledInput: {
    backgroundColor: "#F5F5F5",
    color: "#999999",
  },
  helperText: {
    fontSize: 12,
    color: "#999999",
    marginTop: 5,
  },
  saveButton: {
    backgroundColor: "#2E7D32",
    marginHorizontal: 20,
    marginTop: 30,
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default EditProfileScreen;
