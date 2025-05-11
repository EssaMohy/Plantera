import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import PlantCard from "../components/PlantCard";
import SearchBar from "../components/SearchBar";
import { usePlants } from "../hooks/plants";
import LottieView from "lottie-react-native";

const AllPlants = ({ navigation }) => {
  const { data: plants, isLoading, isError, error } = usePlants();
  const [searchTerm, setSearchTerm] = useState("");

  // Track location filter
  const [locationFilter, setLocationFilter] = useState("All");

  // Track additional active filters
  const [activeFilters, setActiveFilters] = useState([]);

  // Define filter categories
  const locationCategories = ["All", "Indoor Plants", "Outdoor Plants"];

  const additionalFilters = [
    "Tropical and Decorative Plants",
    "Low-Maintenance Plants",
    "Flowering Plants",
    "Air-Purifying Plants",
    "Herbs",
    "VegetablesAndFruits",
  ];

  // Toggle a filter on/off
  const toggleFilter = (filter) => {
    if (activeFilters.includes(filter)) {
      setActiveFilters(activeFilters.filter((item) => item !== filter));
    } else {
      setActiveFilters([...activeFilters, filter]);
    }
  };

  // Filter plants based on all active filters
  const getFilteredPlants = () => {
    if (!plants) return [];

    let filtered = plants;

    // Apply location filter
    if (locationFilter !== "All") {
      filtered = filtered.filter((plant) =>
        plant.category?.some(
          (cat) => cat.toLowerCase() === locationFilter.toLowerCase()
        )
      );
    }

    // Apply additional filters
    if (activeFilters.length > 0) {
      filtered = filtered.filter((plant) =>
        activeFilters.every((filter) =>
          plant.category?.some(
            (cat) => cat.toLowerCase() === filter.toLowerCase()
          )
        )
      );
    }

    // Apply search term
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

  // Get active filter display text
  const getActiveFiltersText = () => {
    if (activeFilters.length === 0) return "";
    return activeFilters.join(" & ");
  };

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

  // Error state
  if (isError) {
    return (
      <View style={styles.center}>
        <Text>Error fetching plants: {error.message}</Text>
      </View>
    );
  }

  const renderPlant = (itemData) => (
    <PlantCard
      image={itemData.item.image}
      commonName={itemData.item.commonName}
      scientificName={itemData.item.scientificName}
      onPress={() =>
        navigation.navigate("SinglePlant", { plant: itemData.item })
      }
    />
  );

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
              onPress={() => setLocationFilter(category)}
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

      {/* Additional Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView
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

      {/* Plant List */}
      {filteredPlants.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.noPlants}>No matching plants found.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredPlants}
          keyExtractor={(plant) => plant._id}
          renderItem={renderPlant}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
};

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
  listContainer: {
    paddingBottom: 16,
    paddingHorizontal: 8,
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
  noPlants: {
    fontSize: 18,
    color: "#666",
  },
});

export default AllPlants;
