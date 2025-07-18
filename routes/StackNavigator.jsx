import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import TabNavigator from "./TabNavigator";
import SplashScreen from "../screens/SplashScreen";
import AllPlants from "../screens/AllPlants";
import SinglePlantScreen from "../screens/SinglePlantScreen";
import SingleDiseaseScreen from "../screens/SingleDiseaseScreen";
import CategoryScreen from "../screens/CategoryScreen";
import HomeScreen from "../screens/HomeScreen";
import ArticleDetailsScreen from "../screens/ArticleDetailsScreen";
import MyPlantsScreen from "../screens/MyPlantsScreen";
import ImagePreviewScreen from "../screens/ImagePreviewScreen";
import CalendarScreen from "../screens/CalendarScreen";

const Stack = createStackNavigator();

const StackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Tabs">
      <Stack.Screen
        name="Splash"
        component={SplashScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Tabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AllPlants"
        component={AllPlants}
        options={{
          title: "All Plants",
          headerTintColor: "#2E7D32", // Changes the back button and header text color
          headerTitleStyle: {
            fontWeight: "bold",
            color: "#2E7D32", // Title text color
          },
          headerTitleAlign: "center", // Centers the title
          headerStyle: {
            elevation: 0, // Removes shadow on Android
            shadowOpacity: 0, // Removes shadow on iOS
            borderBottomWidth: 0, // Removes the bottom border
          },
        }}
      />
      <Stack.Screen
        name="SinglePlant"
        component={SinglePlantScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SingleDisease"
        component={SingleDiseaseScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Category"
        component={CategoryScreen}
        options={({ route }) => ({
          title: route.params.type || "Category",
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
          // Remove content padding/spacing below header
          contentStyle: {
            paddingTop: 0,
          },
        })}
      />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen
        name="ArticleDetails"
        component={ArticleDetailsScreen}
        options={{
          title: "Article Details",
          headerTintColor: "#2E7D32", // Changes the back button and header text color
          headerTitleStyle: {
            fontWeight: "bold",
            color: "#2E7D32", // Title text color
          },
          headerTitleAlign: "center", // Centers the title
          headerStyle: {
            elevation: 0, // Removes shadow on Android
            shadowOpacity: 0, // Removes shadow on iOS
            borderBottomWidth: 0, // Removes the bottom border
          },
        }}
      />
      <Stack.Screen
        name="MyPlants"
        component={MyPlantsScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="ImagePreview"
        component={ImagePreviewScreen}
        options={({ route }) => ({
          title:
            route.params.action === "Identification"
              ? "Plant Identification"
              : "Disease Detection",
          headerTintColor: "#2E7D32", // Changes the back button and header text color
          headerTitleStyle: {
            fontWeight: "bold",
            color: "#2E7D32", // Title text color
          },
          headerTitleAlign: "center", // Centers the title
          headerStyle: {
            elevation: 0, // Removes shadow on Android
            shadowOpacity: 0, // Removes shadow on iOS
            borderBottomWidth: 0, // Removes the bottom border
          },
        })}
      />
      <Stack.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          title: "Plant Care Calendar",
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

export default StackNavigator;
