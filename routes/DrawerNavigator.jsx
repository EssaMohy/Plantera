import React from "react";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import {
  Platform,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
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
      <Ionicons name="leaf" size={32} color="#2E7D32" />
      <Text style={styles.headerText}>Plantarea</Text>
    </View>
    <DrawerItemList
      {...props}
      itemStyle={styles.drawerItem}
      labelStyle={styles.drawerLabel}
    />
  </DrawerContentScrollView>
);

// Custom drawer button component with specific color
const CustomDrawerButton = ({ navigation }) => (
  <TouchableOpacity
    onPress={() => navigation.toggleDrawer()}
    style={styles.drawerButton}
    testID="drawer-button"
  >
    <Ionicons name="menu" size={28} color="#2E7D32" />
  </TouchableOpacity>
);

// New notification button component
const NotificationButton = ({ navigation }) => {
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

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      initialRouteName="MainStack"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ route, navigation }) => ({
        headerStyle: {
          backgroundColor: "white",
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTintColor: "white", // Leave this as is
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: 20,
          color: "#2E7D32",
        },
        headerTitleAlign: "center",
        headerLeft: () => <CustomDrawerButton navigation={navigation} />,
        headerRight: () => <NotificationButton navigation={navigation} />,
        drawerActiveTintColor: "#2E7D32",
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
            iconName = focused ? "home" : "home-outline";
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
    color: "#2E7D32",
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

export default DrawerNavigator;
