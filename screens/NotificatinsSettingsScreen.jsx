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
        pushEnabled: preferences?.pushEnabled ?? false,
        wateringReminders: preferences?.wateringReminders ?? false,
        fertilizingReminders: preferences?.fertilizingReminders ?? false,
        emailNotifications: preferences?.emailNotifications ?? false,
      });
    }
  }, [preferences]);

  const handleTogglePreference = async (key) => {
    try {
      const currentValue = notificationSettings[key];
      let updated = { ...notificationSettings, [key]: !currentValue };

      // Push notification logic dependencies
      if (key === "pushEnabled" && !updated.pushEnabled) {
        updated.wateringReminders = false;
        updated.fertilizingReminders = false;
      } else if (
        (key === "wateringReminders" || key === "fertilizingReminders") &&
        !notificationSettings.pushEnabled
      ) {
        updated.pushEnabled = true;
      }

      setNotificationSettings(updated); // Optimistic update

      const result = await updatePreferences(updated);
      if (!result.success) {
        throw new Error(result.error || "Failed to update preferences");
      }
    } catch (err) {
      Alert.alert("Error", err.message);
      if (preferences) {
        setNotificationSettings({
          pushEnabled: preferences?.pushEnabled ?? false,
          wateringReminders: preferences?.wateringReminders ?? false,
          fertilizingReminders: preferences?.fertilizingReminders ?? false,
          emailNotifications: preferences?.emailNotifications ?? false,
        });
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

        {/* Settings Switches */}
        {[
          {
            key: "pushEnabled",
            title: "Push Notifications",
            description: "Enable or disable all push notifications",
            disabled: false,
          },
          {
            key: "wateringReminders",
            title: "Watering Reminders",
            description: "Get notified when your plants need water",
            disabled: !notificationSettings.pushEnabled || isLoading,
            warning: !notificationSettings.pushEnabled,
          },
          {
            key: "fertilizingReminders",
            title: "Fertilizing Reminders",
            description: "Get notified when your plants need nutrients",
            disabled: !notificationSettings.pushEnabled || isLoading,
            warning: !notificationSettings.pushEnabled,
          },
          {
            key: "emailNotifications",
            title: "Email Notifications",
            description: "Receive notifications via email",
            disabled: false,
          },
        ].map((setting) => (
          <View style={styles.settingRow} key={setting.key}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>{setting.title}</Text>
              <Text style={styles.settingDescription}>
                {setting.description}
                {setting.warning && (
                  <Text style={styles.warningText}>
                    {" "}
                    (Requires push notifications)
                  </Text>
                )}
              </Text>
            </View>
            <Switch
              value={notificationSettings[setting.key]}
              onValueChange={() => handleTogglePreference(setting.key)}
              trackColor={{
                false: "#767577",
                true: setting.disabled ? "#cccccc" : "#81c784",
              }}
              thumbColor={
                notificationSettings[setting.key] && !setting.disabled
                  ? "#2E7D32"
                  : "#f4f3f4"
              }
              disabled={setting.disabled}
            />
          </View>
        ))}
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
