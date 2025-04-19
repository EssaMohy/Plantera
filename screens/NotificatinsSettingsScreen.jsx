import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Switch,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useNotificationPreferences } from "../hooks/useAuth";

const NotificationsSettingsScreen = () => {
  const { preferences, isLoading, error, updatePreferences } =
    useNotificationPreferences();

  const [notificationSettings, setNotificationSettings] = useState({
    pushEnabled: false,
    wateringReminders: false,
    fertilizingReminders: false,
    emailNotifications: false,
  });

  useEffect(() => {
    if (preferences) {
      setNotificationSettings({
        pushEnabled: preferences.pushEnabled,
        wateringReminders: preferences.wateringReminders,
        fertilizingReminders: preferences.fertilizingReminders,
        emailNotifications: preferences.emailNotifications,
      });
    }
  }, [preferences]);

  const handleTogglePreference = async (preference) => {
    try {
      const newValue = !notificationSettings[preference];
      let updatedSettings = { ...notificationSettings, [preference]: newValue };

      // Handle dependencies
      if (preference === "pushEnabled" && !newValue) {
        updatedSettings = {
          ...updatedSettings,
          wateringReminders: false,
          fertilizingReminders: false,
        };
      } else if (
        (preference === "wateringReminders" ||
          preference === "fertilizingReminders") &&
        newValue &&
        !updatedSettings.pushEnabled
      ) {
        updatedSettings.pushEnabled = true;
      }

      // Optimistic update
      setNotificationSettings(updatedSettings);

      // API call
      const result = await updatePreferences(updatedSettings);
      if (!result.success) {
        throw new Error(result.error || "Failed to update preferences");
      }
    } catch (error) {
      Alert.alert("Error", error.message);
      // Revert to current preferences
      if (preferences) {
        setNotificationSettings(preferences);
      }
    }
  };

  if (isLoading && !preferences) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
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

        {/* Push Notifications */}
        <View style={styles.settingRow}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>Push Notifications</Text>
            <Text style={styles.settingDescription}>
              Enable or disable all push notifications
            </Text>
          </View>
          <Switch
            value={notificationSettings.pushEnabled}
            onValueChange={() => handleTogglePreference("pushEnabled")}
            trackColor={{ false: "#767577", true: "#81c784" }}
            thumbColor={
              notificationSettings.pushEnabled ? "#2E7D32" : "#f4f3f4"
            }
            disabled={isLoading}
          />
        </View>

        {/* Watering Reminders */}
        <View style={styles.settingRow}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>Watering Reminders</Text>
            <Text style={styles.settingDescription}>
              Get notified when your plants need water
              {!notificationSettings.pushEnabled && (
                <Text style={styles.warningText}>
                  {" "}
                  (Requires push notifications)
                </Text>
              )}
            </Text>
          </View>
          <Switch
            value={notificationSettings.wateringReminders}
            onValueChange={() => handleTogglePreference("wateringReminders")}
            trackColor={{
              false: "#767577",
              true: notificationSettings.pushEnabled ? "#81c784" : "#cccccc",
            }}
            thumbColor={
              notificationSettings.wateringReminders &&
              notificationSettings.pushEnabled
                ? "#2E7D32"
                : "#f4f3f4"
            }
            disabled={!notificationSettings.pushEnabled || isLoading}
          />
        </View>

        {/* Fertilizing Reminders */}
        <View style={styles.settingRow}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>Fertilizing Reminders</Text>
            <Text style={styles.settingDescription}>
              Get notified when your plants need nutrients
              {!notificationSettings.pushEnabled && (
                <Text style={styles.warningText}>
                  {" "}
                  (Requires push notifications)
                </Text>
              )}
            </Text>
          </View>
          <Switch
            value={notificationSettings.fertilizingReminders}
            onValueChange={() => handleTogglePreference("fertilizingReminders")}
            trackColor={{
              false: "#767577",
              true: notificationSettings.pushEnabled ? "#81c784" : "#cccccc",
            }}
            thumbColor={
              notificationSettings.fertilizingReminders &&
              notificationSettings.pushEnabled
                ? "#2E7D32"
                : "#f4f3f4"
            }
            disabled={!notificationSettings.pushEnabled || isLoading}
          />
        </View>

        {/* Email Notifications */}
        <View style={styles.settingRow}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>Email Notifications</Text>
            <Text style={styles.settingDescription}>
              Receive notifications via email
            </Text>
          </View>
          <Switch
            value={notificationSettings.emailNotifications}
            onValueChange={() => handleTogglePreference("emailNotifications")}
            trackColor={{ false: "#767577", true: "#81c784" }}
            thumbColor={
              notificationSettings.emailNotifications ? "#2E7D32" : "#f4f3f4"
            }
            disabled={isLoading}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
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
