import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import TabNavigator from "./TabNavigator";
import SplashScreen from "../screens/SplashScreen";
import AllPlants from "../screens/AllPlants";
import SinglePlantScreen from "../screens/SinglePlantScreen";
import CategoryScreen from "../screens/CategoryScreen";
import HomeScreen from "../screens/HomeScreen";
import ArticleDetailsScreen from "../screens/ArticleDetailsScreen";
const Stack = createStackNavigator();

const StackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Splash">
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
        options={{ title: "All Plants" }}
      />
      <Stack.Screen
        name="SinglePlant"
        component={SinglePlantScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Category"
        component={CategoryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="ArticleDetails" component={ArticleDetailsScreen} />
    </Stack.Navigator>
  );
};

export default StackNavigator;
