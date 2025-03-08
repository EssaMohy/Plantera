import { FlatList, StyleSheet, Text, View } from "react-native";
import React from "react";
import SearchBar from "../components/SearchBar";
import PlantCard from "../components/PlantCard";
import { PLANTS } from "../data/dummy";

const HomeScreen = () => {
  // Render the header section
  const renderHeader = () => (
    <View>
      <View style={styles.bar}>
        <SearchBar name="Search Plant" />
      </View>
      <Text style={styles.title}>Popular Plants</Text>
    </View>
  );

  // Render the categories section
  const renderCategories = () => (
    <View>
      <Text style={styles.title}>Categories</Text>
      {/* Add your categories content here */}
    </View>
  );

  // Render each plant item
  const renderPlant = (itemData) => (
    <PlantCard
      image={itemData.item.image}
      title={itemData.item.title}
      subtitle={itemData.item.subtitle}
    />
  );

  return (
    <FlatList
      data={PLANTS} // Use the PLANTS data for the list
      keyExtractor={(item) => item.id}
      renderItem={renderPlant}
      numColumns={2}
      ListHeaderComponent={renderHeader} // Add the header at the top
      ListFooterComponent={renderCategories} // Add the categories at the bottom
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
  bar: {
    padding: 8,
  },
  title: {
    padding: 8,
    fontSize: 24,
    fontWeight: "bold",
  },
});
