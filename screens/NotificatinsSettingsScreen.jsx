import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../context/AuthContext";

const NotificationsSettingsScreen = () => {
  const {
    userInfo,
    updateNotificationPreferences,
    isLoading: authLoading,
  } = useAuth();
  const [notificationSettings, setNotificationSettings] = useState({
    pushEnabled: false,
    wateringReminders: false,
    fertilizingReminders: false,
    emailNotifications: false,
  });
  const [loadingPreferences, setLoadingPreferences] = useState({});
  const [error, setError] = useState(null);

  // Initialize with user's preferences
  useEffect(() => {
    if (userInfo?.notificationPreferences) {
      setNotificationSettings({
        pushEnabled: userInfo.notificationPreferences.pushEnabled || false,
        wateringReminders:
          userInfo.notificationPreferences.wateringReminders || false,
        fertilizingReminders:
          userInfo.notificationPreferences.fertilizingReminders || false,
        emailNotifications:
          userInfo.notificationPreferences.emailNotifications || false,
      });
    }
  }, [userInfo]);

  const handleTogglePreference = async (preference) => {
    try {
      // Set the specific preference to loading state
      setLoadingPreferences((prev) => ({ ...prev, [preference]: true }));
      setError(null);

      // Create updated settings
      let updatedSettings = {
        ...notificationSettings,
        [preference]: !notificationSettings[preference],
      };

      // Special handling for interdependent settings
      if (preference === "pushEnabled" && notificationSettings.pushEnabled) {
        // If disabling push, disable dependent notifications
        updatedSettings = {
          ...updatedSettings,
          wateringReminders: false,
          fertilizingReminders: false,
        };
      } else if (
        (preference === "wateringReminders" ||
          preference === "fertilizingReminders") &&
        !notificationSettings.pushEnabled &&
        !notificationSettings[preference]
      ) {
        // If enabling a dependent setting while push is disabled, enable push as well
        updatedSettings.pushEnabled = true;

        // Optimistically update UI immediately for better user experience
        setNotificationSettings({
          ...notificationSettings,
          pushEnabled: true,
          [preference]: true,
        });

        // Set the push notification toggle to loading state as well
        setLoadingPreferences((prev) => ({ ...prev, pushEnabled: true }));
      }

      // Update backend using AuthContext function
      const result = await updateNotificationPreferences(updatedSettings);

      if (result.success) {
        // Update local state only after successful API call
        // Don't update if we already did the optimistic update
        if (
          !(
            preference === "wateringReminders" ||
            preference === "fertilizingReminders"
          ) ||
          notificationSettings.pushEnabled ||
          !updatedSettings[preference]
        ) {
          setNotificationSettings(updatedSettings);
        }
      } else {
        throw new Error(result.error || "Failed to update preferences");
      }
    } catch (error) {
      const errorMessage =
        error.message || "Failed to update preferences. Please try again.";
      setError(errorMessage);
      Alert.alert("Update Failed", errorMessage);

      // Revert optimistic updates on error
      if (
        (preference === "wateringReminders" ||
          preference === "fertilizingReminders") &&
        !notificationSettings.pushEnabled
      ) {
        setNotificationSettings({
          ...notificationSettings,
        });
      }
    } finally {
      // Clear all loading states
      setLoadingPreferences((prev) => {
        const updated = { ...prev };
        delete updated[preference];
        if (
          preference === "wateringReminders" ||
          preference === "fertilizingReminders"
        ) {
          delete updated.pushEnabled;
        }
        return updated;
      });
    }
  };

  const isToggleLoading = (preference) => {
    return loadingPreferences[preference] || authLoading;
  };

  return (
    <View style={styles.settingsCard}>
      <Text style={styles.sectionTitle}>Notification Settings</Text>
      <Text style={styles.sectionSubtitle}>
        Customize your plant care reminders
      </Text>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.settingRow}>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>Push Notifications</Text>
          <Text style={styles.settingDescription}>
            Enable or disable all push notifications
          </Text>
        </View>
        {isToggleLoading("pushEnabled") ? (
          <ActivityIndicator size="small" color="#2E7D32" />
        ) : (
          <Switch
            value={notificationSettings.pushEnabled}
            onValueChange={() => handleTogglePreference("pushEnabled")}
            trackColor={{ false: "#767577", true: "#81c784" }}
            thumbColor={
              notificationSettings.pushEnabled ? "#2E7D32" : "#f4f3f4"
            }
            disabled={authLoading || Object.keys(loadingPreferences).length > 0}
          />
        )}
      </View>

      <View style={styles.settingRow}>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>Watering Reminders</Text>
          <Text style={styles.settingDescription}>
            Get notified when your plants need water
            {!notificationSettings.pushEnabled && (
              <Text style={styles.warningText}>
                {" "}
                (Will enable push notifications)
              </Text>
            )}
          </Text>
        </View>
        {isToggleLoading("wateringReminders") ? (
          <ActivityIndicator size="small" color="#2E7D32" />
        ) : (
          <Switch
            value={notificationSettings.wateringReminders}
            onValueChange={() => handleTogglePreference("wateringReminders")}
            trackColor={{ false: "#767577", true: "#81c784" }}
            thumbColor={
              notificationSettings.wateringReminders ? "#2E7D32" : "#f4f3f4"
            }
            disabled={authLoading || Object.keys(loadingPreferences).length > 0}
          />
        )}
      </View>

      <View style={styles.settingRow}>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>Fertilizing Reminders</Text>
          <Text style={styles.settingDescription}>
            Get notified when your plants need nutrients
            {!notificationSettings.pushEnabled && (
              <Text style={styles.warningText}>
                {" "}
                (Will enable push notifications)
              </Text>
            )}
          </Text>
        </View>
        {isToggleLoading("fertilizingReminders") ? (
          <ActivityIndicator size="small" color="#2E7D32" />
        ) : (
          <Switch
            value={notificationSettings.fertilizingReminders}
            onValueChange={() => handleTogglePreference("fertilizingReminders")}
            trackColor={{ false: "#767577", true: "#81c784" }}
            thumbColor={
              notificationSettings.fertilizingReminders ? "#2E7D32" : "#f4f3f4"
            }
            disabled={authLoading || Object.keys(loadingPreferences).length > 0}
          />
        )}
      </View>

      <View style={styles.settingRow}>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>Email Notifications</Text>
          <Text style={styles.settingDescription}>
            Receive notifications via email
          </Text>
        </View>
        {isToggleLoading("emailNotifications") ? (
          <ActivityIndicator size="small" color="#2E7D32" />
        ) : (
          <Switch
            value={notificationSettings.emailNotifications}
            onValueChange={() => handleTogglePreference("emailNotifications")}
            trackColor={{ false: "#767577", true: "#81c784" }}
            thumbColor={
              notificationSettings.emailNotifications ? "#2E7D32" : "#f4f3f4"
            }
            disabled={authLoading || Object.keys(loadingPreferences).length > 0}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  settingsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    margin: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  settingTextContainer: {
    flex: 1,
    paddingRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  settingDescription: {
    fontSize: 14,
    color: "#666666",
    marginTop: 4,
  },
  warningText: {
    color: "#FF5722",
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 16,
  },
  errorContainer: {
    backgroundColor: "#FFEBEE",
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 14,
  },
});

export default NotificationsSettingsScreen;
