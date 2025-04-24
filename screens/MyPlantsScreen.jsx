import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
  ImageBackground,
  Modal,
  TextInput,
  Switch,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import LottieView from "lottie-react-native";
import Icon from "react-native-vector-icons/Ionicons";
import {
  useMyPlants,
  useRemoveFromMyPlants,
  useSchedulePlantCare,
} from "../hooks/myPlants";
import { useAuth } from "../hooks/useAuth";
import { scheduleNotification } from "../utils/notifcation";

const backgroundImage = require("../assets/images/7.png");

const MyPlantsScreen = () => {
  const navigation = useNavigation();
  const { userInfo, userToken } = useAuth();
  const { data: myPlants, isLoading, isError, error } = useMyPlants();
  const removeFromMyPlantsMutation = useRemoveFromMyPlants();
  const schedulePlantCareMutation = useSchedulePlantCare();
  const [removingPlantId, setRemovingPlantId] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [wateringDays, setWateringDays] = useState("7");
  const [fertilizingDays, setFertilizingDays] = useState("30");
  const [enableWatering, setEnableWatering] = useState(true);
  const [enableFertilizing, setEnableFertilizing] = useState(true);

  const handleAddPlantsPress = () => {
    navigation.navigate("AllPlants");
  };

  const handleLoginPress = () => {
    navigation.navigate("Login");
  };

  const handlePlantPress = (plant) => {
    navigation.navigate("SinglePlant", { plant });
  };

  const handleRemovePlant = (plant) => {
    Alert.alert(
      "Remove Plant",
      `Are you sure you want to remove ${plant.commonName} from your plants?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setRemovingPlantId(plant._id);
            removeFromMyPlantsMutation.mutate(plant._id, {
              onSuccess: () => {
                setRemovingPlantId(null);
              },
              onError: (error) => {
                setRemovingPlantId(null);
                Alert.alert("Error", error.message || "Failed to remove plant");
              },
            });
          },
        },
      ]
    );
  };

  const handleScheduleCare = (plant) => {
    setSelectedPlant(plant);
    setWateringDays(plant.wateringFrequency?.toString() || "7");
    setFertilizingDays(plant.fertilizingFrequency?.toString() || "30");
    setEnableWatering(!!plant.wateringFrequency);
    setEnableFertilizing(!!plant.fertilizingFrequency);
    setShowScheduleModal(true);
  };

  const confirmScheduleCare = () => {
    if (!enableWatering && !enableFertilizing) {
      Alert.alert("Error", "Please select at least one care type");
      return;
    }

    schedulePlantCareMutation.mutate(
      {
        plantId: selectedPlant._id,
        wateringFrequency: enableWatering ? parseInt(wateringDays) : null,
        fertilizingFrequency: enableFertilizing
          ? parseInt(fertilizingDays)
          : null,
      },
      {
        onSuccess: async (data) => {
          setShowScheduleModal(false);
          console.log(data);

          const careData = data?.data;

          if (
            enableWatering &&
            wateringDays &&
            careData?.watering?.nextWatering
          ) {
            await scheduleNotification({
              title: "Watering Reminder",
              body: `Time to water your ${selectedPlant.commonName}`,
              ...careData.watering.nextWatering,
            });
          }

          if (
            enableFertilizing &&
            fertilizingDays &&
            careData?.fertilizing?.nextFertilizing
          ) {
            await scheduleNotification({
              title: "Fertilizing Reminder",
              body: `Time to fertilize your ${selectedPlant.commonName}`,
              ...careData.fertilizing.nextFertilizing,
            });
          }

          Alert.alert(
            "Success",
            `Care schedule set for ${selectedPlant.commonName}`
          );
        },
        onError: (error) => {
          Alert.alert("Error", error.message || "Failed to schedule care");
        },
      }
    );
  };

  const renderScheduleModal = () => (
    <Modal
      visible={showScheduleModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowScheduleModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            Set Care Schedule for {selectedPlant?.commonName}
          </Text>

          <View style={styles.toggleContainer}>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Watering</Text>
              <Switch
                value={enableWatering}
                onValueChange={setEnableWatering}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={enableWatering ? "#2E7D32" : "#f4f3f4"}
              />
            </View>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Fertilizing</Text>
              <Switch
                value={enableFertilizing}
                onValueChange={setEnableFertilizing}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={enableFertilizing ? "#FF9800" : "#f4f3f4"}
              />
            </View>
          </View>

          {enableWatering && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Water every (days):</Text>
              <View style={styles.inputRow}>
                <TouchableOpacity
                  style={styles.numberButton}
                  onPress={() =>
                    setWateringDays((prev) =>
                      Math.max(1, parseInt(prev || 0) - 1).toString()
                    )
                  }
                >
                  <Text style={styles.numberButtonText}>-</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.numberInput}
                  keyboardType="numeric"
                  value={wateringDays}
                  onChangeText={setWateringDays}
                  placeholder="7"
                />
                <TouchableOpacity
                  style={styles.numberButton}
                  onPress={() =>
                    setWateringDays((prev) =>
                      (parseInt(prev || 0) + 1).toString()
                    )
                  }
                >
                  <Text style={styles.numberButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {enableFertilizing && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Fertilize every (days):</Text>
              <View style={styles.inputRow}>
                <TouchableOpacity
                  style={styles.numberButton}
                  onPress={() =>
                    setFertilizingDays((prev) =>
                      Math.max(7, parseInt(prev || 0) - 7).toString()
                    )
                  }
                >
                  <Text style={styles.numberButtonText}>-</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.numberInput}
                  keyboardType="numeric"
                  value={fertilizingDays}
                  onChangeText={setFertilizingDays}
                  placeholder="30"
                />
                <TouchableOpacity
                  style={styles.numberButton}
                  onPress={() =>
                    setFertilizingDays((prev) =>
                      (parseInt(prev || 0) + 7).toString()
                    )
                  }
                >
                  <Text style={styles.numberButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowScheduleModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={confirmScheduleCare}
            >
              <Text style={styles.confirmButtonText}>Set Schedule</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderEmptyState = () => (
    <ImageBackground source={backgroundImage} style={styles.background}>
      <View style={styles.emptyContainer}>
        <LottieView
          source={require("../assets/plant.json")}
          autoPlay
          loop={false}
          style={styles.animation}
        />
        <Text style={styles.title}>Let's get started</Text>
        <Text style={styles.subtitle}>
          Get professional plant care guidance to keep your plant alive!
        </Text>
        <TouchableOpacity style={styles.button} onPress={handleAddPlantsPress}>
          <Text style={styles.buttonText}>+ Add plants</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );

  const renderPlantItem = ({ item }) => {
    const plant = item.plant || item;
    if (!plant || !plant._id) {
      return null;
    }

    const hasSchedule = item.nextWatering || item.nextFertilizing;

    return (
      <View style={styles.plantCard}>
        <TouchableOpacity
          style={styles.plantContent}
          onPress={() => handlePlantPress(plant)}
        >
          <Image source={{ uri: plant.image }} style={styles.plantImage} />
          <View style={styles.plantInfo}>
            <Text style={styles.plantName}>
              {plant.commonName || "Unknown Plant"}
            </Text>
            <Text style={styles.plantScientific}>
              {plant.scientificName || ""}
            </Text>
            {hasSchedule && (
              <View style={styles.scheduleInfo}>
                {item.nextWatering && (
                  <View style={styles.scheduleItem}>
                    <Icon name="water-outline" size={16} color="#2E7D32" />
                    <Text style={styles.scheduleText}>
                      Water in{" "}
                      {Math.ceil(
                        (new Date(item.nextWatering) - new Date()) /
                          (1000 * 60 * 60 * 24)
                      )}{" "}
                      days
                    </Text>
                  </View>
                )}
                {item.nextFertilizing && (
                  <View style={styles.scheduleItem}>
                    <Icon name="nutrition-outline" size={16} color="#FF9800" />
                    <Text style={styles.scheduleText}>
                      Fertilize in{" "}
                      {Math.ceil(
                        (new Date(item.nextFertilizing) - new Date()) /
                          (1000 * 60 * 60 * 24)
                      )}{" "}
                      days
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.plantActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.scheduleButton]}
            onPress={() => handleScheduleCare(plant)}
          >
            <Icon name="alarm-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.removeButton]}
            onPress={() => handleRemovePlant(plant)}
            disabled={removingPlantId === plant._id}
          >
            {removingPlantId === plant._id ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Icon name="trash-outline" size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (!userToken) {
    return (
      <ImageBackground source={backgroundImage} style={styles.background}>
        <View style={styles.emptyContainer}>
          <LottieView
            source={require("../assets/plant.json")}
            autoPlay
            loop={false}
            style={styles.animation}
          />
          <Text style={styles.title}>Welcome to Plant Area</Text>
          <Text style={styles.subtitle}>
            Log in to save your favorite plants and get personalized care
            reminders!
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleLoginPress}>
            <Text style={styles.buttonText}>Login / Sign Up</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryButton, { marginTop: 16 }]}
            onPress={handleAddPlantsPress}
          >
            <Text style={styles.secondaryButtonText}>Browse Plants</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
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
      <ImageBackground source={backgroundImage} style={styles.background}>
        <View style={styles.container}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Unable to load your plants:{" "}
              {error?.message || "Please try again later"}
            </Text>
            <TouchableOpacity
              style={[styles.button, { marginTop: 20 }]}
              onPress={handleAddPlantsPress}
            >
              <Text style={styles.buttonText}>Browse Plants</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    );
  }

  if (!myPlants || myPlants.length === 0) {
    return renderEmptyState();
  }

  return (
    <ImageBackground source={backgroundImage} style={styles.background}>
      <View style={styles.container}>
        <FlatList
          data={myPlants}
          renderItem={renderPlantItem}
          keyExtractor={(item) => {
            const id = item?.plant?._id || item?._id;
            return id ? id.toString() : Math.random().toString();
          }}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />

        <TouchableOpacity
          style={styles.floatingButton}
          onPress={handleAddPlantsPress}
        >
          <Text style={styles.buttonText}>+ Add More Plants</Text>
        </TouchableOpacity>
      </View>
      {renderScheduleModal()}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    backgroundColor: "#FFFFFFAA",
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFFAA",
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFFAA",
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  animation: {
    width: 300,
    height: 300,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    padding: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#525252",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#D32F2F",
    textAlign: "center",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#2E7D32",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#2E7D32",
  },
  secondaryButtonText: {
    color: "#2E7D32",
    fontSize: 16,
    fontWeight: "bold",
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  plantCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    alignItems: "center",
  },
  plantContent: {
    flex: 1,
    flexDirection: "row",
  },
  plantImage: {
    width: 100,
    height: 100,
  },
  plantInfo: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  plantName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  plantScientific: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#666",
  },
  plantActions: {
    flexDirection: "row",
    paddingRight: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  scheduleButton: {
    backgroundColor: "#2196F3",
  },
  removeButton: {
    backgroundColor: "#D32F2F",
  },
  scheduleInfo: {
    marginTop: 8,
  },
  scheduleItem: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  scheduleText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 6,
  },
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#2E7D32",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  toggleContainer: {
    marginBottom: 20,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  toggleLabel: {
    fontSize: 16,
    color: "#333",
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  numberInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 12,
    textAlign: "center",
    marginHorizontal: 10,
    fontSize: 16,
  },
  numberButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2E7D32",
    justifyContent: "center",
    alignItems: "center",
  },
  numberButtonText: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#E0E0E0",
  },
  confirmButton: {
    backgroundColor: "#2E7D32",
  },
  cancelButtonText: {
    color: "#333",
    fontWeight: "bold",
  },
  confirmButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});

export default MyPlantsScreen;
