import { FlatList, StyleSheet, Text, View } from "react-native";
import React from "react";
import SearchBar from "../components/SearchBar";
import PlantCard from "../components/PlantCard";

const DiagnoseScreen = () => {
  // Render the header section
  const renderHeader = () => (
    <View>
      <View style={styles.bar}>
        <SearchBar name="Search Disease" />
      </View>
      <Text style={styles.title}>Common Diseases</Text>
    </View>
  );

  // Render the categories section
  const renderCategories = () => (
    <View>
      <Text style={styles.title}>Categories</Text>
      {/* Add your categories content here */}
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderCategories()}
    </View>
  );
};

export default DiagnoseScreen;

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
