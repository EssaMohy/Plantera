import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import PlantCard from "../components/PlantCard";
import SearchBar from "../components/SearchBar";
import { usePlants } from "../hooks/plants";

const AllPlants = ({ navigation }) => {
  const { data: plants, isLoading, isError, error } = usePlants();
  const [searchTerm, setSearchTerm] = useState("");

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Error state
  if (isError) {
    return (
      <View style={styles.center}>
        <Text>Error fetching plants: {error.message}</Text>
      </View>
    );
  }

  // Filter plants based on search term
  const filteredPlants = plants.filter(
    (plant) =>
      plant.commonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plant.scientificName.toLowerCase().includes(searchTerm.toLowerCase())
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

  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        <SearchBar
          name="Search Plants"
          value={searchTerm}
          onChange={setSearchTerm}
        />
      </View>

      {/* Plant List */}
      <FlatList
        data={filteredPlants}
        keyExtractor={(plant) => plant._id} // Use _id as the key
        renderItem={renderPlant} // Use PlantCard to render each item
        numColumns={2}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  bar: {
    padding: 8,
  },
  listContainer: {
    paddingBottom: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AllPlants;
