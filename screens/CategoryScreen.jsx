import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { usePlants } from "../hooks/plants";
import PlantCard from "../components/PlantCard";
import LottieView from "lottie-react-native";
import { Ionicons } from "@expo/vector-icons"; // Or from "react-native-vector-icons/Ionicons"
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("screen");

const CategoryScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { type } = route.params;

  const { data: plants, isLoading, isError, error } = usePlants();

  // Filter plants where the type is included in the category array
  const filteredPlants = plants?.filter((plant) =>
    plant.category?.some((cat) => cat.toLowerCase() === type.toLowerCase())
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <LottieView
          source={require("../assets/loading.json")}
          autoPlay
          loop
          style={{ width: 200, height: 200 }}
        />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Error: {error.message}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {type}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {filteredPlants?.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.noPlants}>No {type} plants found.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredPlants}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <PlantCard
              image={item.image}
              commonName={item.commonName}
              scientificName={item.scientificName}
              onPress={() =>
                navigation.navigate("SinglePlant", { plant: item })
              }
            />
          )}
          numColumns={2}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default CategoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#2E7D32",
    marginHorizontal: 8,
  },
  list: {
    paddingBottom: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noPlants: {
    fontSize: 18,
    color: "#666",
  },
  error: {
    fontSize: 16,
    color: "red",
  },
});
