import { Tabs } from "expo-router";
import React from "react";
import { Platform, View, StyleSheet, TouchableOpacity } from "react-native";
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: "#14AE5C",
        tabBarInactiveTintColor: "#525252",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E0E0E0",
          height: Platform.OS === "ios" ? 90 : 70,
          paddingBottom: Platform.OS === "ios" ? 20 : 10,
          position: "relative",
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "bold",
        },
        headerRight: () => (
          <TouchableOpacity
            style={{ marginRight: 15 }}
            onPress={() => {
              // Handle notification icon press
              console.log("Notifications icon pressed");
            }}
          >
            <Ionicons name="notifications-outline" size={24} color="white" />
          </TouchableOpacity>
        ),
        headerStyle: {
          backgroundColor: "#129C52",
        },
        headerTintColor: "white",
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="Daignose"
        options={{
          title: "Daignose",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="shield-plus-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="Scan"
        options={{
          title: "Scan",
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
      />
      <Tabs.Screen
        name="MyPlants"
        options={{
          title: "My Plants",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="leaf" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  scanIconContainer: {
    top: -10,
    justifyContent: "center",
    alignItems: "center",
  },
  scanIconBackground: {
    backgroundColor: "#14AE5C",
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
});
