import React, { useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Platform, View, StyleSheet, TouchableOpacity } from "react-native";
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
  const [isScanModalVisible, setScanModalVisible] = useState(false);
  const navigation = useNavigation();

  const DrawerButton = () => (
    <TouchableOpacity
      onPress={() => navigation.openDrawer()}
      style={styles.drawerButton}
      testID="drawer-button"
    >
      <Ionicons name="menu" size={28} color="white" />
    </TouchableOpacity>
  );

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarActiveTintColor: "#14AE5C",
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
            backgroundColor: "#129C52",
          },
          headerTintColor: "white",
          headerLeft: () => <DrawerButton />,
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
              setScanModalVisible(true);
            },
          }}
        />
        <Tab.Screen
          name="MyPlants"
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
      <ScanModal
        isVisible={isScanModalVisible}
        onClose={() => setScanModalVisible(false)}
      />
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
  drawerButton: {
    padding: 10,
    marginLeft: 10,
  },
});

export default TabNavigator;
