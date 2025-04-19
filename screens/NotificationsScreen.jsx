import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Switch,
  ImageBackground,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../hooks/useAuth";
import LottieView from "lottie-react-native";
import Icon from "react-native-vector-icons/Ionicons";
import axiosInstance from "../api/axiosInstance";
import { useUpcomingTasks } from "../hooks/plantCare";
import { useNotificationPreferences } from "../hooks/useAuth";

const backgroundImage = require("../assets/images/7.png");

const NotificationsScreen = () => {
  const navigation = useNavigation();
  const { userInfo, userToken } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const {
    data: upcomingTasks,
    isLoading: tasksLoading,
    error: tasksError,
    refetch: refetchTasks,
  } = useUpcomingTasks();
  const [notifications, setNotifications] = useState([]);
  const [apiErrors, setApiErrors] = useState({
    notifications: null,
  });

  // Use the notification preferences hook
  const {
    preferences: notificationSettings,
    isLoading: prefsLoading,
    error: prefsError,
    updatePreferences,
  } = useNotificationPreferences();

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Not scheduled";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate days until next task
  const getDaysUntil = (dateString) => {
    if (!dateString) return "Not scheduled";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const taskDate = new Date(dateString);
    taskDate.setHours(0, 0, 0, 0);

    const diffTime = taskDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays < 0) return "Overdue";
    return `In ${diffDays} days`;
  };

  // Fetch user's notifications
  const fetchNotifications = async () => {
    setApiErrors((prev) => ({ ...prev, notifications: null }));
    try {
      const response = await axiosInstance.get("/notifications/list");
      if (response.data?.data?.notifications) {
        setNotifications(response.data.data.notifications);
      }
    } catch (err) {
      setApiErrors((prev) => ({
        ...prev,
        notifications:
          err.response?.data?.message || "Failed to load notifications",
      }));
      console.error("Error fetching notifications:", err);
    }
  };

  // Handle refresh - fetch all data
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchTasks(), fetchNotifications()]);
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Toggle notification settings
  const handleTogglePreference = async (key) => {
    const updatedValue = !notificationSettings[key];
    try {
      await updatePreferences({ [key]: updatedValue });
    } catch (err) {
      console.error("Error updating preferences:", err);
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
    );

    try {
      await axiosInstance.patch(`/notifications/${notificationId}/mark-read`);
    } catch (err) {
      console.error("Error marking as read:", err);
      // Revert on error
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, isRead: false } : n
        )
      );
    }
  };

  // Handle login press
  const handleLoginPress = () => {
    navigation.navigate("Login");
  };

  // Load data on mount and when auth changes
  useEffect(() => {
    if (userToken) {
      fetchNotifications();
    }
  }, [userToken]);

  // Render task item
  const renderTaskItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.taskCard}
        onPress={() =>
          navigation.navigate("SinglePlant", { plantId: item.plant._id })
        }
      >
        <View style={styles.taskHeader}>
          <Text style={styles.plantName}>{item.plant.commonName}</Text>
          <Text style={styles.scientificName}>{item.plant.scientificName}</Text>
        </View>

        {item.nextWatering && (
          <View style={styles.taskRow}>
            <View style={styles.taskIconContainer}>
              <Icon name="water-outline" size={22} color="#1976D2" />
            </View>
            <View style={styles.taskInfo}>
              <Text style={styles.taskType}>Watering</Text>
              <Text style={styles.taskDate}>
                {formatDate(item.nextWatering)}
              </Text>
            </View>
            <View style={styles.taskTimeContainer}>
              <Text
                style={[
                  styles.taskTime,
                  getDaysUntil(item.nextWatering) === "Today"
                    ? styles.taskToday
                    : getDaysUntil(item.nextWatering) === "Overdue"
                    ? styles.taskOverdue
                    : null,
                ]}
              >
                {getDaysUntil(item.nextWatering)}
              </Text>
            </View>
          </View>
        )}

        {item.nextFertilizing && (
          <View style={styles.taskRow}>
            <View style={styles.taskIconContainer}>
              <Icon name="leaf-outline" size={22} color="#43A047" />
            </View>
            <View style={styles.taskInfo}>
              <Text style={styles.taskType}>Fertilizing</Text>
              <Text style={styles.taskDate}>
                {formatDate(item.nextFertilizing)}
              </Text>
            </View>
            <View style={styles.taskTimeContainer}>
              <Text
                style={[
                  styles.taskTime,
                  getDaysUntil(item.nextFertilizing) === "Today"
                    ? styles.taskToday
                    : getDaysUntil(item.nextFertilizing) === "Overdue"
                    ? styles.taskOverdue
                    : null,
                ]}
              >
                {getDaysUntil(item.nextFertilizing)}
              </Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Render notification item
  const renderNotificationItem = ({ item }) => {
    const isWatering = item.type === "watering";
    return (
      <TouchableOpacity
        style={[
          styles.notificationCard,
          item.isRead ? styles.notificationRead : null,
        ]}
        onPress={() => {
          markNotificationAsRead(item._id);
          if (item.plant) {
            navigation.navigate("SinglePlant", { plantId: item.plant._id });
          }
        }}
      >
        <View style={styles.notificationHeader}>
          <View
            style={[
              styles.notificationIcon,
              isWatering ? styles.wateringIcon : styles.fertilizingIcon,
            ]}
          >
            <Icon
              name={isWatering ? "water-outline" : "leaf-outline"}
              size={20}
              color="#fff"
            />
          </View>
          <Text style={styles.notificationTitle}>{item.title}</Text>
        </View>
        <Text style={styles.notificationBody}>{item.body}</Text>
        <Text style={styles.notificationTime}>
          {new Date(item.scheduledTime).toLocaleDateString()}
        </Text>
      </TouchableOpacity>
    );
  };

  // Render empty state when no tasks
  const renderEmptyTasks = () => (
    <View style={styles.emptyContainer}>
      <LottieView
        source={require("../assets/plant.json")}
        autoPlay
        loop={false}
        style={styles.animation}
      />
      <Text style={styles.emptyTitle}>No plants to care for</Text>
      <Text style={styles.emptySubtitle}>
        Add plants to your collection to see care reminders here!
      </Text>
      <TouchableOpacity
        style={[styles.button, { marginTop: 20 }]}
        onPress={() => navigation.navigate("AllPlants")}
      >
        <Text style={styles.buttonText}>Browse Plants</Text>
      </TouchableOpacity>
    </View>
  );

  // Render login state when not logged in
  if (!userToken) {
    return (
      <ImageBackground source={backgroundImage} style={styles.background}>
        <View style={styles.emptyContainer}>
          <LottieView
            source={require("../assets/plant.json")}
            autoPlay
            loop={false}
            style={styles.animation}
          />
          <Text style={styles.title}>Plant Care Reminders</Text>
          <Text style={styles.subtitle}>
            Log in to set up personalized plant care notifications!
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleLoginPress}>
            <Text style={styles.buttonText}>Login / Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    );
  }

  const isLoading = tasksLoading || refreshing || prefsLoading;
  const error = tasksError || apiErrors.notifications || prefsError;

  return (
    <ImageBackground source={backgroundImage} style={styles.background}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Notification Settings Section */}
        <View style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>Notification Settings</Text>
          <Text style={styles.sectionSubtitle}>
            Customize your plant care reminders
          </Text>

          {prefsError && <Text style={styles.errorText}>{prefsError}</Text>}

          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Push Notifications</Text>
              <Text style={styles.settingDescription}>
                Enable or disable all push notifications
              </Text>
            </View>
            <Switch
              value={notificationSettings?.pushEnabled || false}
              onValueChange={() => handleTogglePreference("pushEnabled")}
              trackColor={{ false: "#767577", true: "#81c784" }}
              thumbColor={
                notificationSettings?.pushEnabled ? "#2E7D32" : "#f4f3f4"
              }
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Watering Reminders</Text>
              <Text style={styles.settingDescription}>
                Get notified when your plants need water
              </Text>
            </View>
            <Switch
              value={notificationSettings?.wateringReminders || false}
              onValueChange={() => handleTogglePreference("wateringReminders")}
              trackColor={{ false: "#767577", true: "#81c784" }}
              thumbColor={
                notificationSettings?.wateringReminders ? "#2E7D32" : "#f4f3f4"
              }
              disabled={!notificationSettings?.pushEnabled}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Fertilizing Reminders</Text>
              <Text style={styles.settingDescription}>
                Get notified when your plants need nutrients
              </Text>
            </View>
            <Switch
              value={notificationSettings?.fertilizingReminders || false}
              onValueChange={() =>
                handleTogglePreference("fertilizingReminders")
              }
              trackColor={{ false: "#767577", true: "#81c784" }}
              thumbColor={
                notificationSettings?.fertilizingReminders
                  ? "#2E7D32"
                  : "#f4f3f4"
              }
              disabled={!notificationSettings?.pushEnabled}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Email Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive notifications via email
              </Text>
            </View>
            <Switch
              value={notificationSettings?.emailNotifications || false}
              onValueChange={() => handleTogglePreference("emailNotifications")}
              trackColor={{ false: "#767577", true: "#81c784" }}
              thumbColor={
                notificationSettings?.emailNotifications ? "#2E7D32" : "#f4f3f4"
              }
            />
          </View>
        </View>

        {/* Upcoming Tasks Section */}
        <View style={styles.tasksSection}>
          <Text style={styles.sectionTitle}>Upcoming Plant Care</Text>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2E7D32" />
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                {error?.message || "Failed to load tasks"}
              </Text>
              <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : upcomingTasks?.length > 0 ? (
            <FlatList
              data={upcomingTasks}
              renderItem={renderTaskItem}
              keyExtractor={(item) => item.plant._id}
              scrollEnabled={false}
              nestedScrollEnabled={true}
            />
          ) : (
            renderEmptyTasks()
          )}
        </View>

        {/* Recent Notifications Section */}
        {notifications.length > 0 && (
          <View style={styles.tasksSection}>
            <Text style={styles.sectionTitle}>Recent Notifications</Text>
            {apiErrors.notifications && (
              <Text style={styles.errorText}>{apiErrors.notifications}</Text>
            )}
            <FlatList
              data={notifications.slice(0, 5)}
              renderItem={renderNotificationItem}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
              nestedScrollEnabled={true}
            />
            {notifications.length > 5 && (
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => navigation.navigate("NotificationsList")}
              >
                <Text style={styles.viewAllText}>View All Notifications</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    padding: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#525252",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: "#2E7D32",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    marginTop: 20,
  },
  animation: {
    width: 200,
    height: 200,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#525252",
    textAlign: "center",
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 8,
  },
  tasksSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginTop: 0,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  taskCard: {
    backgroundColor: "#F9FBF7",
    borderRadius: 8,
    marginVertical: 8,
    padding: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  taskHeader: {
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    paddingBottom: 8,
    marginBottom: 8,
  },
  plantName: {
    fontSize: 16,
    fontWeight: "600",
  },
  scientificName: {
    fontSize: 12,
    fontStyle: "italic",
    color: "#666666",
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  taskIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  taskInfo: {
    flex: 1,
  },
  taskType: {
    fontSize: 14,
    fontWeight: "500",
  },
  taskDate: {
    fontSize: 12,
    color: "#666666",
  },
  taskTimeContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#EEEEEE",
    borderRadius: 16,
  },
  taskTime: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666666",
  },
  taskToday: {
    color: "#E53935",
  },
  taskOverdue: {
    color: "#D32F2F",
    fontWeight: "bold",
  },
  loadingContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    padding: 20,
    alignItems: "center",
  },
  errorText: {
    color: "#D32F2F",
    textAlign: "center",
    marginBottom: 10,
  },
  retryButton: {
    marginTop: 10,
    padding: 8,
    backgroundColor: "#2E7D32",
    borderRadius: 5,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  notificationCard: {
    backgroundColor: "#F0F7F0",
    borderRadius: 8,
    marginVertical: 6,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#2E7D32",
  },
  notificationRead: {
    backgroundColor: "#F5F5F5",
    borderLeftColor: "#BBBBBB",
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  notificationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  wateringIcon: {
    backgroundColor: "#1976D2",
  },
  fertilizingIcon: {
    backgroundColor: "#43A047",
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  notificationBody: {
    fontSize: 14,
    color: "#444444",
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: "#888888",
    textAlign: "right",
  },
  viewAllButton: {
    alignItems: "center",
    padding: 12,
    marginTop: 8,
    backgroundColor: "#F0F7F0",
    borderRadius: 8,
  },
  viewAllText: {
    color: "#2E7D32",
    fontWeight: "600",
  },
});

export default NotificationsScreen;
