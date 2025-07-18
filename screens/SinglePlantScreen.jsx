import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import CareGuideCard from "../components/CareGuideCard";
import { useAddToMyPlants, useMyPlants } from "../hooks/myPlants";
import { useAuth } from "../hooks/useAuth";

const { width } = Dimensions.get("screen");

const SinglePlantScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { plant } = route.params;
  const { userToken } = useAuth();

  // Get user's plants
  const { data: myPlants } = useMyPlants();
  const addToMyPlantsMutation = useAddToMyPlants();

  // Check if plant is already in user's collection
  const isPlantAdded = myPlants?.some(
    (item) => item.plant?._id === plant._id || item._id === plant._id
  );

  const handleAddToMyPlants = () => {
    addToMyPlantsMutation.mutate(plant._id, {
      onSuccess: (data) => {
        Alert.alert("Success", `${plant.commonName} added to your plants!`, [
          {
            text: "OK",
            onPress: () => navigation.navigate("Tabs", { screen: "My Plants" }),
          },
        ]);
      },
      onError: (error) => {
        Alert.alert(
          "Error",
          error.response?.data?.message ||
            "Failed to add plant. Please try again."
        );
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Plant Image */}
      <Image source={{ uri: plant.image }} style={styles.plantImage} />
      {/* Back Button */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Icon name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>
      {/* Plant Details */}
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.title}>{plant.commonName}</Text>
          <Text style={styles.subtitle}>{plant.scientificName}</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Scientific Classification</Text>
          <Text style={styles.detailText}>
            <Text style={styles.boldText}>Family:</Text> {plant.Family}
          </Text>
          <Text style={styles.detailText}>
            <Text style={styles.boldText}>Order:</Text> {plant.Order}
          </Text>
          <Text style={styles.detailText}>
            <Text style={styles.boldText}>Kingdom:</Text> {plant.Kingdom}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.text}>{plant.about}</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>How to Grow</Text>
          <Text style={styles.text}>{plant.HowToGrow}</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Care Guide</Text>
          <CareGuideCard
            iconName="thermometer"
            title="Temperature"
            description={plant.Temperature}
          />
          <CareGuideCard
            iconName="white-balance-sunny"
            title="Light"
            description={plant.Light}
          />
          <CareGuideCard
            iconName="water"
            title="Water"
            description={plant.Water}
          />
          <CareGuideCard
            iconName="skull-outline"
            title="Toxicity"
            description={plant.toxicity}
          />
        </View>
      </ScrollView>
      <View style={{ height: 100 }} />
      <TouchableOpacity
        activeOpacity={0.7}
        style={[
          styles.addButton,
          (isPlantAdded || !userToken) && styles.disabledButton,
        ]}
        onPress={handleAddToMyPlants}
        disabled={isPlantAdded || !userToken || addToMyPlantsMutation.isPending}
      >
        {addToMyPlantsMutation.isPending ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <>
            <Icon
              name={isPlantAdded ? "checkmark" : "add"}
              size={22}
              color="white"
              style={styles.addButtonIcon}
            />
            <Text style={styles.addButtonText}>
              {isPlantAdded
                ? "Already in Your Collection"
                : !userToken
                ? "Login to Add Plant"
                : "Add to My Plants"}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  plantImage: {
    width: width,
    height: 250,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  content: {
    paddingTop: 10,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    marginTop: -30,
    padding: 20,
    elevation: 5,
    borderTopEndRadius: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    color: "#444",
  },
  detailText: {
    fontSize: 16,
    color: "#555",
    marginBottom: 6,
  },
  boldText: {
    fontWeight: "bold",
    color: "#222",
  },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 12,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: "#444",
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#2E7D32",
    borderRadius: 25,
    paddingVertical: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      android: {
        elevation: 3,
      },
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
      },
    }),
  },
  disabledButton: {
    backgroundColor: "#9E9E9E",
  },
  addButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  addButtonIcon: {
    marginTop: 2,
  },
});

export default SinglePlantScreen;
