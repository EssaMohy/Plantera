import {
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
} from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";
import PlantCard from "../components/PlantCard";
import { usePlants } from "../hooks/plants";
import LottieView from "lottie-react-native";
import { ARTICLES } from "../data/articleData";
import ArticleCard from "../components/ArticleCard";

const SCREENS = {
  ALL_PLANTS: "AllPlants",
  CATEGORY: "Category",
  SINGLE_PLANT: "SinglePlant",
};

const HomeScreen = () => {
  const { data: plants, isLoading, isError, error } = usePlants();
  const navigation = useNavigation();

  const renderHeader = () => (
    <>
      {/* Articles Section */}
      <View style={styles.articlesSection}>
        <Text style={styles.articlesTitle}>Articles</Text>
        <FlatList
          data={ARTICLES}
          keyExtractor={(item) => item.id}
          renderItem={renderArticle}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.articlesContainer}
        />
      </View>

      {/* Plants Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Popular Plants</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate(SCREENS.ALL_PLANTS)}
        >
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderCategories = () => (
    <View style={styles.categorySection}>
      <Text style={styles.title}>Categories</Text>
      <View style={styles.categoryContainer}>
        <TouchableOpacity
          style={styles.categoryCard}
          onPress={() =>
            navigation.navigate(SCREENS.CATEGORY, { type: "Indoor Plants" })
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
            navigation.navigate(SCREENS.CATEGORY, { type: "Outdoor Plants" })
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
        navigation.navigate(SCREENS.SINGLE_PLANT, { plant: itemData.item })
      }
    />
  );

  const renderArticle = (data) => (
    <ArticleCard
      image={data.item.image}
      title={data.item.title}
      subtitle={data.item.subtitle}
      onPress={() =>
        navigation.navigate("ArticleDetails", { articleId: data.item.id })
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
  },
  articlesSection: {
    marginBottom: 10,
  },
  articlesTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E7D32",

    margin: 10,
    paddingLeft: 2,
  },
  articlesContainer: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E7D32",
    marginLeft: 10,
  },
  seeAll: {
    fontSize: 16,
    color: "#2E7D32",
    fontWeight: "bold",
    marginRight: 10,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  animation: {
    width: 300,
    height: 300,
  },
  categorySection: {
    marginTop: 20,
  },
  categoryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    margin: 12,
    paddingBottom: 20,
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
