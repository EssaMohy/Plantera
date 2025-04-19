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
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import StackNavigator from "./StackNavigator";
import ProfileScreen from "../screens/ProfileScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import { useAuth } from "../hooks/useAuth";
import ProfileStack from "./ProfileStack";

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props) => {
  const { userInfo, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert("Error", "Failed to logout. Please try again.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.drawerScroll}
      >
        {/* Header */}
        <View style={styles.drawerHeader}>
          <Ionicons name="leaf" size={32} color="#2E7D32" />
          <Text style={styles.headerText}>Plantarea</Text>
        </View>

        {/* User Info */}
        {userInfo && (
          <View style={styles.userInfoContainer}>
            <View style={styles.userAvatar}>
              <Text style={styles.userInitials}>
                {userInfo?.firstName?.charAt(0) || ""}
                {userInfo?.lastName?.charAt(0) || ""}
              </Text>
            </View>
            <Text style={styles.userName}>
              {userInfo?.firstName} {userInfo?.lastName}
            </Text>
            <Text style={styles.userEmail}>{userInfo?.email}</Text>
          </View>
        )}

        {/* Drawer Items */}
        <DrawerItemList
          {...props}
          itemStyle={styles.drawerItem}
          labelStyle={styles.drawerLabel}
        />
      </DrawerContentScrollView>

      {/* Logout at Bottom */}
      <TouchableOpacity
        style={styles.logoutDrawerButton}
        onPress={handleLogout}
      >
        <Ionicons
          name="log-out-outline"
          size={22}
          color="#FF5252"
          style={styles.logoutDrawerIcon}
        />
        <Text style={styles.logoutDrawerText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const CustomDrawerButton = ({ navigation }) => (
  <TouchableOpacity
    onPress={() => navigation.toggleDrawer()}
    style={styles.drawerButton}
    testID="drawer-button"
  >
    <Ionicons name="menu" size={28} color="#2E7D32" />
  </TouchableOpacity>
);

const NotificationButton = ({ navigation }) => (
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
        },
        headerTintColor: "#2E7D32",
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: 20,
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

          switch (route.name) {
            case "MainStack":
              iconName = focused ? "home" : "home-outline";
              break;
            case "Profile":
              iconName = focused ? "person" : "person-outline";
              break;
            case "Notifications":
              iconName = focused ? "notifications" : "notifications-outline";
              break;
            default:
              iconName = focused ? "help" : "help-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Drawer.Screen
        name="MainStack"
        component={StackNavigator}
        options={{ title: "Home", headerShown: false }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileStack}
        options={{ headerShown: false }}
      />
      <Drawer.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: "Notifications" }}
      />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  drawerScroll: {
    paddingTop: 20,
  },
  drawerHeader: {
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerText: {
    marginLeft: 15,
    fontSize: 22,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  userInfoContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    marginBottom: 10,
    alignItems: "center",
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#2E7D32",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  userInitials: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  userEmail: {
    fontSize: 14,
    color: "#666666",
  },
  drawerItem: {
    paddingVertical: 8,
  },
  drawerLabel: {
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
  logoutDrawerButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  logoutDrawerIcon: {
    marginRight: 10,
  },
  logoutDrawerText: {
    fontSize: 16,
    color: "#FF5252",
    fontWeight: "500",
  },
});

export default DrawerNavigator;
