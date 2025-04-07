import {
  FlatList,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";
import PlantCard from "../components/PlantCard";
import { usePlants } from "../hooks/plants";
import LottieView from "lottie-react-native";

const HomeScreen = () => {
  const { data: plants, isLoading, isError, error } = usePlants();
  const navigation = useNavigation();

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Popular Plants</Text>
      <TouchableOpacity onPress={() => navigation.navigate("All Plants")}>
        <Text style={styles.seeAll}>See All</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCategories = () => (
    <View style={styles.categorySection}>
      <Text style={styles.title}>Categories</Text>
      <View style={styles.categoryContainer}>
        <TouchableOpacity
          style={styles.categoryCard}
          onPress={() =>
            navigation.navigate("Category", { type: "Indoor Plants" })
          }
        >
          <Image
            source={require("../assets/images/indoor.jpg")}
            style={styles.categoryImage}
          />
          <Text style={styles.categoryText}>Indoor Plants</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.categoryCard}
          onPress={() =>
            navigation.navigate("Category", { type: "Outdoor Plants" })
          }
        >
          <Image
            source={require("../assets/images/outdoor.jpg")}
            style={styles.categoryImage}
          />
          <Text style={styles.categoryText}>Outdoor Plants</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPlant = (itemData) => (
    <PlantCard
      image={itemData.item.image}
      commonName={itemData.item.commonName}
      scientificName={itemData.item.scientificName}
      onPress={() =>
        navigation.navigate("Single Plant", { plant: itemData.item })
      }
    />
  );

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
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    marginTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E7D32",
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
  animation: {
    width: 300,
    height: 300,
  },
  categorySection: {
    marginTop: 20,
    paddingHorizontal: 12,
  },
  categoryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  categoryCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
  },
  categoryImage: {
    width: "100%",
    height: 120,
    resizeMode: "cover",
  },
  categoryText: {
    textAlign: "center",
    paddingVertical: 8,
    fontWeight: "600",
    fontSize: 16,
    color: "#333",
  },
});
