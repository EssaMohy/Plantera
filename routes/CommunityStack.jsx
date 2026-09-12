import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import CommunityScreen from "../screens/CommunityScreen";
import PostDetailScreen from "../screens/PostDetailScreen";

const Stack = createStackNavigator();

const CommunityStack = () => {
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

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="CommunityFeed"
        component={CommunityScreen}
        options={{
          title: "Community",
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
          headerLeft: () => (
            <View style={{ marginLeft: 4 }}>
              <DrawerButton />
            </View>
          ),
        }}
      />
      {/* PostDetailScreen renders its own header (back button + title),
          matching how SinglePlantScreen/ImagePreviewScreen do it elsewhere
          in this app. */}
      <Stack.Screen
        name="PostDetail"
        component={PostDetailScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  drawerButton: {
    padding: 10,
  },
});

export default CommunityStack;
