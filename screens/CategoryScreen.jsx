import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { usePlants } from "../hooks/plants";
import PlantCard from "../components/PlantCard";
import SearchBar from "../components/SearchBar";
import LottieView from "lottie-react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("screen");

const CategoryScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { type } = route.params;
  const [searchTerm, setSearchTerm] = useState("");
  const scrollViewRef = useRef(null);

  const { data: plants, isLoading, isError, error } = usePlants();

  const [locationFilter, setLocationFilter] = useState("All");
  const [activeFilters, setActiveFilters] = useState([]);

  const locationCategories = ["All", "Indoor Plants", "Outdoor Plants"];

  const additionalFilters = [
    "Tropical and Decorative Plants",
    "Low-Maintenance Plants",
    "Flowering Plants",
    "Air-Purifying Plants",
    "Herbs",
    "VegetablesAndFruits",
  ];

  useEffect(() => {
    if (type && type !== locationFilter) {
      setLocationFilter(type);
    }
  }, [type]);

  const toggleFilter = (filter) => {
    if (activeFilters.includes(filter)) {
      setActiveFilters(activeFilters.filter((item) => item !== filter));
    } else {
      setActiveFilters([...activeFilters, filter]);
    }
  };

  const changeLocationFilter = (location) => {
    setLocationFilter(location);
    navigation.setParams({ type: location });
  };

  const getFilteredPlants = () => {
    if (!plants) return [];

    let filtered = plants;

    if (locationFilter !== "All") {
      filtered = filtered.filter((plant) =>
        plant.category?.some(
          (cat) => cat.toLowerCase() === locationFilter.toLowerCase()
        )
      );
    }

    if (activeFilters.length > 0) {
      filtered = filtered.filter((plant) =>
        activeFilters.every((filter) =>
          plant.category?.some(
            (cat) => cat.toLowerCase() === filter.toLowerCase()
          )
        )
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (plant) =>
          plant.commonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          plant.scientificName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredPlants = getFilteredPlants();

  const getActiveFiltersText = () => {
    if (activeFilters.length === 0) return "";
    return activeFilters.join(" & ");
  };

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
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          name="Search Plants"
          value={searchTerm}
          onChange={setSearchTerm}
        />
      </View>

      {/* Location Categories */}
      {type === undefined && (
        <View style={styles.categoriesContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScrollView}
          >
            {locationCategories.map((category, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.categoryButton,
                  locationFilter === category && styles.selectedCategoryButton,
                ]}
                onPress={() => changeLocationFilter(category)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    locationFilter === category && styles.selectedCategoryText,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Additional Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScrollView}
        >
          {additionalFilters.map((filter, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.filterButton,
                activeFilters.includes(filter) && styles.selectedFilterButton,
              ]}
              onPress={() => toggleFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilters.includes(filter) && styles.selectedFilterText,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Active Filters Display */}
      {(locationFilter !== "All" || activeFilters.length > 0) && (
        <View style={styles.activeFiltersContainer}>
          <Text style={styles.activeFiltersText}>
            Filtering:{" "}
            {locationFilter !== "All" ? locationFilter : "All Plants"}
            {activeFilters.length > 0 ? ` & ${getActiveFiltersText()}` : ""}
          </Text>
        </View>
      )}

      {/* Plants List */}
      {filteredPlants.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.noPlants}>No matching plants found.</Text>
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 6,
    paddingTop: 0,
  },
  categoriesContainer: {
    marginBottom: 6,
    marginTop: 0,
  },
  filtersContainer: {
    marginBottom: 6,
  },
  categoriesScrollView: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "#F0F0F0",
  },
  selectedCategoryButton: {
    backgroundColor: "#2E7D32",
  },
  categoryText: {
    fontSize: 14,
    color: "#555",
  },
  selectedCategoryText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: "#E8F5E9",
    borderWidth: 1,
    borderColor: "#81C784",
  },
  selectedFilterButton: {
    backgroundColor: "#81C784",
  },
  filterText: {
    fontSize: 13,
    color: "#2E7D32",
  },
  selectedFilterText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  activeFiltersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
  },
  activeFiltersText: {
    fontSize: 14,
    color: "#2E7D32",
    fontWeight: "500",
  },
  list: {
    paddingBottom: 16,
    paddingHorizontal: 8,
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
