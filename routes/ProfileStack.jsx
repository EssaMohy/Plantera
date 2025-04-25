import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import {
  Platform,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import ProfileScreen from "../screens/ProfileScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import ChangePasswordScreen from "../screens/ChangePasswordScreen";
import NotificationsSettingsScreen from "../screens/NotificatinsSettingsScreen";

const Stack = createStackNavigator();

const ProfileStack = () => {
  const navigation = useNavigation();

  const DrawerButton = () => (
    <TouchableOpacity
      onPress={() => navigation.openDrawer()}
      style={styles.drawerButton}
      testID="drawer-button"
    >
      <Ionicons name="menu" size={28} color="#2E7D32" />
    </TouchableOpacity>
  );

  const CalendarButton = () => {
    return (
      <TouchableOpacity
        style={styles.notificationButton}
        onPress={() => navigation.navigate("Calendar")}
        testID="calendar-button"
      >
        <View style={styles.notificationIconContainer}>
          <Ionicons name="calendar" size={24} color="#2E7D32" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="My Profile"
        component={ProfileScreen}
        options={({ route }) => ({
          tabBarActiveTintColor: "#2E7D32",
          tabBarInactiveTintColor: "#525252",
          tabBarStyle: {
            backgroundColor: "#FFFFFF",
            borderTopWidth: 1,
            borderTopColor: "#E0E0E0",
            height: Platform.OS === "ios" ? 90 : 70,
            paddingBottom: Platform.OS === "ios" ? 20 : 10,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "bold",
          },
          headerStyle: {
            backgroundColor: "white",
            borderBottomWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTitleStyle: {
            fontWeight: "bold",
            fontSize: 20,
            color: "#2E7D32",
          },
          headerTintColor: "#2E7D32",
          headerTitleAlign: "center",
          headerLeft: () => <DrawerButton />,
          headerRight: () => <CalendarButton />,
        })}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          title: "Edit Profile",
          headerTintColor: "#2E7D32",
          headerTitleStyle: {
            fontWeight: "bold",
            color: "#2E7D32",
          },
          headerTitleAlign: "center",
          headerStyle: {
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
        }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{
          title: "Change Password",
          headerTintColor: "#2E7D32",
          headerTitleStyle: {
            fontWeight: "bold",
            color: "#2E7D32",
          },
          headerTitleAlign: "center",
          headerStyle: {
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
        }}
      />

      <Stack.Screen
        name="Notifications Settings"
        component={NotificationsSettingsScreen}
        options={{
          headerTintColor: "#2E7D32",
          headerTitleStyle: {
            fontWeight: "bold",
            color: "#2E7D32",
          },
          headerTitleAlign: "center",
          headerStyle: {
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
        }}
      />
    </Stack.Navigator>
  );
};
const styles = StyleSheet.create({
  drawerButton: {
    padding: 10,
    marginLeft: 10,
  },
  notificationButton: {
    padding: 10,
    marginRight: 10,
  },
  notificationIconContainer: {
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: -5,
    right: -8,
    backgroundColor: "#FF5252",
    borderRadius: 12,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  notificationBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
});

export default ProfileStack;
