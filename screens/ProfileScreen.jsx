import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../hooks/useAuth";

const ProfileScreen = ({ navigation }) => {
  const { userInfo, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
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
    <ScrollView style={styles.container}>
      <ImageBackground
        source={require("../assets/images/6.png")}
        style={styles.header}
        resizeMode="cover"
      >
        <View style={[styles.overlay, { backgroundColor: "white" }]}></View>

        <View style={styles.profileImageContainer}>
          <View style={styles.profileImage}>
            <Text style={styles.profileInitials}>
              {userInfo?.firstName?.charAt(0) || ""}
              {userInfo?.lastName?.charAt(0) || ""}
            </Text>
          </View>
        </View>

        <Text style={styles.name}>
          {userInfo?.firstName} {userInfo?.lastName}
        </Text>
        <Text style={styles.email}>{userInfo?.email}</Text>
      </ImageBackground>

      {/* Account Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Settings</Text>

        <TouchableOpacity
          style={styles.option}
          onPress={() => navigation.navigate("EditProfile")}
          testID="edit-profile-button"
        >
          <Ionicons
            name="person-outline"
            size={24}
            color="#2E7D32"
            style={styles.optionIcon}
          />
          <Text style={styles.optionText}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={24} color="#CCCCCC" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.option}
          onPress={() => navigation.navigate("ChangePassword")}
          testID="change-password-button"
        >
          <Ionicons
            name="lock-closed-outline"
            size={24}
            color="#2E7D32"
            style={styles.optionIcon}
          />
          <Text style={styles.optionText}>Change Password</Text>
          <Ionicons name="chevron-forward" size={24} color="#CCCCCC" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.option}
          onPress={() => navigation.navigate("NotificationsSettings")}
        >
          <Ionicons
            name="notifications-outline"
            size={24}
            color="#2E7D32"
            style={styles.optionIcon}
          />
          <Text style={styles.optionText}>Notification Settings</Text>
          <Ionicons name="chevron-forward" size={24} color="#CCCCCC" />
        </TouchableOpacity>
      </View>

      {/* App Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>

        <TouchableOpacity
          style={styles.option}
          onPress={() => {
            Alert.alert(
              "Coming Soon",
              "Language settings will be available in a future update."
            );
          }}
        >
          <Ionicons
            name="globe-outline"
            size={24}
            color="#2E7D32"
            style={styles.optionIcon}
          />
          <Text style={styles.optionText}>Language</Text>
          <View style={styles.optionRight}>
            <Text style={styles.optionValue}>English</Text>
            <Ionicons name="chevron-forward" size={24} color="#CCCCCC" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.option}
          onPress={() => {
            Alert.alert(
              "Coming Soon",
              "Dark mode will be available in a future update."
            );
          }}
        >
          <Ionicons
            name="moon-outline"
            size={24}
            color="#2E7D32"
            style={styles.optionIcon}
          />
          <Text style={styles.optionText}>Dark Mode</Text>
          <View style={styles.optionRight}>
            <Text style={styles.optionValue}>Off</Text>
            <Ionicons name="chevron-forward" size={24} color="#CCCCCC" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Help & Support */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Help & Support</Text>

        <TouchableOpacity
          style={styles.option}
          onPress={() => {
            Alert.alert(
              "About Plantarea",
              "Plantarea v1.0.0 - A plant care and identification application."
            );
          }}
        >
          <Ionicons
            name="information-circle-outline"
            size={24}
            color="#2E7D32"
            style={styles.optionIcon}
          />
          <Text style={styles.optionText}>About Plantarea</Text>
          <Ionicons name="chevron-forward" size={24} color="#CCCCCC" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.option}
          onPress={() => {
            Alert.alert(
              "Coming Soon",
              "FAQ section will be available in a future update."
            );
          }}
        >
          <Ionicons
            name="help-circle-outline"
            size={24}
            color="#2E7D32"
            style={styles.optionIcon}
          />
          <Text style={styles.optionText}>FAQ</Text>
          <Ionicons name="chevron-forward" size={24} color="#CCCCCC" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.option}
          onPress={() => {
            Alert.alert(
              "Contact Support",
              "For any issues or questions, please email us at support@plantarea.com"
            );
          }}
        >
          <Ionicons
            name="mail-outline"
            size={24}
            color="#2E7D32"
            style={styles.optionIcon}
          />
          <Text style={styles.optionText}>Contact Support</Text>
          <Ionicons name="chevron-forward" size={24} color="#CCCCCC" />
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons
          name="log-out-outline"
          size={24}
          color="#FF5252"
          style={styles.logoutIcon}
        />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <View style={styles.version}>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  header: {
    width: "100%",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5,
  },

  profileImageContainer: {
    position: "relative",
    marginBottom: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#2E7D32",
    justifyContent: "center",
    alignItems: "center",
  },
  profileInitials: {
    color: "white",
    fontSize: 36,
    fontWeight: "bold",
  },
  editButton: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: "#4CAF50",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333333",
    //backgroundColor:"beige",

    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: "#666666",
    //backgroundColor:"beige"
  },
  section: {
    backgroundColor: "#FFFFFF",
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#EEEEEE",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 15,
    marginTop: 5,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  optionIcon: {
    marginRight: 15,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: "#333333",
  },
  optionRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionValue: {
    fontSize: 16,
    color: "#999999",
    marginRight: 5,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    marginTop: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#EEEEEE",
  },
  logoutIcon: {
    marginRight: 10,
  },
  logoutText: {
    fontSize: 16,
    color: "#FF5252",
    fontWeight: "500",
  },
  version: {
    alignItems: "center",
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 14,
    color: "#999999",
  },
});

export default ProfileScreen;
