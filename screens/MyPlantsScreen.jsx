import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import LottieView from "lottie-react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useMyPlants, useRemoveFromMyPlants } from "../hooks/myPlants";
import { useAuth } from "../context/AuthContext";

const MyPlantsScreen = () => {
  const navigation = useNavigation();
  const { userInfo, userToken } = useAuth();
  const { data: myPlants, isLoading, isError, error } = useMyPlants();
  const removeFromMyPlantsMutation = useRemoveFromMyPlants();
  const [removingPlantId, setRemovingPlantId] = useState(null);

  // Handle navigation to the all plants screen
  const handleAddPlantsPress = () => {
    navigation.navigate("AllPlants");
  };

  // Handle login navigation
  const handleLoginPress = () => {
    navigation.navigate("Login");
  };

  // Navigate to plant details screen
  const handlePlantPress = (plant) => {
    navigation.navigate("SinglePlant", { plant });
  };

  // Handle removing a plant
  const handleRemovePlant = (plant) => {
    Alert.alert(
      "Remove Plant",
      `Are you sure you want to remove ${plant.commonName} from your plants?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setRemovingPlantId(plant._id);
            removeFromMyPlantsMutation.mutate(plant._id, {
              onSuccess: () => {
                setRemovingPlantId(null);
              },
              onError: (error) => {
                setRemovingPlantId(null);
                Alert.alert(
                  "Error",
                  error.response?.data?.message || "Failed to remove plant"
                );
              },
            });
          },
        },
      ]
    );
  };

  // Not logged in state
  if (!userToken) {
    return (
      <View style={styles.emptyContainer}>
        <LottieView
          source={require("../assets/plant.json")}
          autoPlay
          loop={false}
          style={styles.animation}
        />
        <Text style={styles.title}>Welcome to Plant Area</Text>
        <Text style={styles.subtitle}>
          Log in to save your favorite plants and get personalized care
          reminders!
        </Text>
        <TouchableOpacity style={styles.button} onPress={handleLoginPress}>
          <Text style={styles.buttonText}>Login / Sign Up</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.secondaryButton, { marginTop: 16 }]}
          onPress={handleAddPlantsPress}
        >
          <Text style={styles.secondaryButtonText}>Browse Plants</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Empty state - when user has no plants
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <LottieView
        source={require("../assets/plant.json")}
        autoPlay
        loop={false}
        style={styles.animation}
      />
      <Text style={styles.title}>Let's get started</Text>
      <Text style={styles.subtitle}>
        Get professional plant care guidance to keep your plant alive!
      </Text>
      <TouchableOpacity style={styles.button} onPress={handleAddPlantsPress}>
        <Text style={styles.buttonText}>+ Add plants</Text>
      </TouchableOpacity>
    </View>
  );

  // Plant card component with remove button
  const renderPlantItem = ({ item }) => (
    <View style={styles.plantCard}>
      <TouchableOpacity
        style={styles.plantContent}
        onPress={() => handlePlantPress(item)}
      >
        <Image source={{ uri: item.image }} style={styles.plantImage} />
        <View style={styles.plantInfo}>
          <Text style={styles.plantName}>{item.commonName}</Text>
          <Text style={styles.plantScientific}>{item.scientificName}</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemovePlant(item)}
        disabled={removingPlantId === item._id}
      >
        {removingPlantId === item._id ? (
          <ActivityIndicator size="small" color="#D32F2F" />
        ) : (
          <Icon name="trash-outline" size={22} color="#D32F2F" />
        )}
      </TouchableOpacity>
    </View>
  );

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  // Error state - But keep UI usable
  if (isError) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Plants</Text>
          <Text style={styles.welcomeText}>
            Welcome, {userInfo?.firstName || "Plant Lover"}!
          </Text>
        </View>

        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Unable to load your plants:{" "}
            {error?.response?.data?.message ||
              error?.message ||
              "Please try again later"}
          </Text>
          <TouchableOpacity
            style={[styles.button, { marginTop: 20 }]}
            onPress={handleAddPlantsPress}
          >
            <Text style={styles.buttonText}>Browse Plants</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Show empty state if no plants
  if (!myPlants || myPlants.length === 0) {
    return renderEmptyState();
  }

  // Show list of plants
  return (
    <View style={styles.container}>
      <FlatList
        data={myPlants}
        renderItem={renderPlantItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={handleAddPlantsPress}
      >
        <Text style={styles.buttonText}>+ Add More Plants</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MyPlantsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  animation: {
    width: 300,
    height: 300,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    padding: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#525252",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#D32F2F",
    textAlign: "center",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#2E7D32",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#2E7D32",
  },
  secondaryButtonText: {
    color: "#2E7D32",
    fontSize: 16,
    fontWeight: "bold",
  },
  header: {
    backgroundColor: "#2E7D32",
    padding: 20,
    paddingTop: 60,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  welcomeText: {
    fontSize: 16,
    color: "#FFFFFF",
    opacity: 0.8,
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  plantCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    alignItems: "center",
  },
  plantContent: {
    flex: 1,
    flexDirection: "row",
  },
  plantImage: {
    width: 100,
    height: 100,
  },
  plantInfo: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  plantName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  plantScientific: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#666",
  },
  removeButton: {
    padding: 12,
    marginRight: 8,
    height: 46,
    width: 46,
    borderRadius: 23,
    backgroundColor: "#FFF0F0",
    justifyContent: "center",
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#2E7D32",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
