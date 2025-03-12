import {
  FlatList,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native"; // Import useNavigation
import PlantCard from "../components/PlantCard";
import { usePlants } from "../hooks/plants";

const HomeScreen = () => {
  const { data: plants, isLoading, isError, error } = usePlants();
  const navigation = useNavigation(); // Initialize navigation

  // Render the header section with "See All" link
  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Popular Plants</Text>
      <TouchableOpacity onPress={() => navigation.navigate("All Plants")}>
        <Text style={styles.seeAll}>See All</Text>
      </TouchableOpacity>
    </View>
  );

  // Render the categories section
  const renderCategories = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Categories</Text>
      {/* Add your categories here */}
    </View>
  );

  // Render each plant item
  const renderPlant = (itemData) => (
    <PlantCard
      commonName={itemData.item.commonName}
      scientificName={itemData.item.scientificName}
      onPress={() =>
        navigation.navigate("Single Plant", { plant: itemData.item })
      }
    />
  );

  // Show a loading indicator while fetching data
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Show an error message if the fetch fails
  if (isError) {
    return (
      <View style={styles.center}>
        <Text>Error fetching plants: {error.message}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={plants.slice(0, 6)}
      keyExtractor={(item) => item._id}
      renderItem={renderPlant}
      numColumns={2}
      ListHeaderComponent={renderHeader}
      ListFooterComponent={renderCategories}
      contentContainerStyle={styles.container}
    />
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    paddingBottom: 16, // Add padding at the bottom
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  seeAll: {
    fontSize: 16,
    color: "#14AE5C",
    fontWeight: "bold",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
