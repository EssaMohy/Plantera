import React, { useState, useRef } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  Platform,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import HomeScreen from "../screens/HomeScreen";
import DiagnoseScreen from "../screens/DiagnoseScreen";
import MyPlantsScreen from "../screens/MyPlantsScreen";
import ScanModal from "../screens/ScanModal";
import LightScreen from "../screens/LightScreen";

const Tab = createBottomTabNavigator();
const EmptyComponent = () => null;

const TabNavigator = () => {
  const modalizeRef = useRef(null);
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

  // New notification button component
  const NotificationButton = () => {
    return (
      <TouchableOpacity
        style={styles.notificationButton}
        onPress={() => navigation.navigate("Notifications")}
        testID="notification-button"
      >
        <View style={styles.notificationIconContainer}>
          <Ionicons name="notifications" size={24} color="#2E7D32" />
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>3</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // New calendar button component
  const CalendarButton = () => {
    const navigation = useNavigation();
    return (
      <TouchableOpacity
        style={styles.calendarButton}
        onPress={() => navigation.navigate("Calendar")}
        testID="calendar-button"
      >
        <Ionicons name="calendar" size={24} color="#2E7D32" />
      </TouchableOpacity>
    );
  };

  // Handle modal close
  const handleModalClose = () => {
    // This function is just a pass-through now and doesn't do anything that might
    // trigger a loop or recursive call
    console.log("Modal closed");
  };

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
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
          headerRight: () => (
            <View style={styles.headerRightContainer}>
              <CalendarButton />
            </View>
          ),
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Diagnose"
          component={DiagnoseScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="shield-plus-outline"
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Scan"
          component={EmptyComponent}
          options={{
            tabBarIcon: ({ color, size }) => (
              <View style={styles.scanIconContainer}>
                <View style={styles.scanIconBackground}>
                  <MaterialCommunityIcons
                    name="line-scan"
                    size={42}
                    color="#FFFFFF"
                  />
                </View>
              </View>
            ),
            tabBarLabel: () => null,
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              modalizeRef.current?.open();
            },
          }}
        />
        <Tab.Screen
          name="My Plants"
          component={MyPlantsScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="leaf" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Light"
          component={LightScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="bulb" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
      <ScanModal ref={modalizeRef} onClose={handleModalClose} />
    </>
  );
};

const styles = StyleSheet.create({
  scanIconContainer: {
    top: -10,
    justifyContent: "center",
    alignItems: "center",
  },
  scanIconBackground: {
    backgroundColor: "#2E7D32",
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
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
  headerRightContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  calendarButton: {
    padding: 10,
    marginRight: 5,
  },
});

export default TabNavigator;
