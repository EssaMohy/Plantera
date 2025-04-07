import React from "react";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { Platform, StyleSheet, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import StackNavigator from "./StackNavigator";
import ProfileScreen from "../screens/ProfileScreen";
import NotificationsScreen from "../screens/NotificationsScreen";

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props) => (
  <DrawerContentScrollView
    {...props}
    contentContainerStyle={styles.drawerContainer}
  >
    <View style={styles.drawerHeader}>
      <Ionicons name="leaf" size={32} color="#14AE5C" />
      <Text style={styles.headerText}>Plantarea</Text>
    </View>
    <DrawerItemList
      {...props}
      itemStyle={styles.drawerItem}
      labelStyle={styles.drawerLabel}
    />
  </DrawerContentScrollView>
);

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      initialRouteName="MainStack"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ route }) => ({
        headerStyle: {
          backgroundColor: "#129C52",
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: "white",
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: 20,
        },
        drawerActiveTintColor: "#14AE5C",
        drawerInactiveTintColor: "#525252",
        drawerStyle: {
          width: Platform.OS === "android" ? 240 : 280,
          backgroundColor: "#f9f9f9",
        },
        drawerItemStyle: {
          height: 50,
          borderRadius: 8,
          marginHorizontal: 8,
          marginVertical: 4,
        },
        drawerActiveBackgroundColor: "#e8f5e9",
        drawerIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "MainStack") {
            iconName = focused ? "leaf" : "leaf-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          } else if (route.name === "Notifications") {
            iconName = focused ? "notifications" : "notifications-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Drawer.Screen
        name="MainStack"
        component={StackNavigator}
        options={{
          title: "Home",
          headerShown: false,
        }}
      />

      <Drawer.Screen name="Profile" component={ProfileScreen} />

      <Drawer.Screen name="Notifications" component={NotificationsScreen} />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    paddingTop: 20,
  },
  drawerHeader: {
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    marginBottom: 10,
  },
  headerText: {
    marginLeft: 15,
    fontSize: 22,
    fontWeight: "bold",
    color: "#14AE5C",
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  drawerLabel: {
    marginLeft: -10,
    fontSize: 16,
    fontWeight: "500",
  },
});

export default DrawerNavigator;
