import React, { useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import DiseaseCard from "../components/DiseaseCard";
import SearchBar from "../components/SearchBar";
import { useDiseases } from "../hooks/diseases";
import LottieView from "lottie-react-native";

const DiagnoseScreen = () => {
  const { data: diseases, isLoading, isError, error } = useDiseases();
  const [searchTerm, setSearchTerm] = useState("");

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.center}>
        <LottieView
          source={require("../assets/loading.json")}
          autoPlay
          loop={true}
          style={styles.animation}
        />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text>Error fetching diseases: {error.message}</Text>
      </View>
    );
  }

  const filteredDiseases = diseases.filter((disease) => {
    const nameMatch = disease.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const otherNamesMatch = disease.otherNames.some((otherName) =>
      otherName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return nameMatch || otherNamesMatch;
  });

  const renderDisease = ({ item }) => (
    <DiseaseCard
      image={item.image}
      name={item.name}
      onPress={() => console.log("pressed", item._id)}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        <SearchBar
          name="Search Diseases"
          value={searchTerm}
          onChange={setSearchTerm}
        />
      </View>

      {/* Plant List */}
      <FlatList
        data={filteredDiseases}
        keyExtractor={(disease) => disease._id}
        renderItem={renderDisease}
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
  animation: {
    width: 300,
    height: 300,
  },
});

export default DiagnoseScreen;
