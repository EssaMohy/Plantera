import React, { useMemo, useState } from "react";
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
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import LottieView from "lottie-react-native";
import Icon from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import {
  useMyPlants,
  useRemoveFromMyPlants,
  useWaterPlant,
  useFertilizePlant,
  useUpdateMyPlantImage,
} from "../hooks/myPlants";
import { useAuth } from "../hooks/useAuth";

const backgroundImage = require("../assets/images/7.png");
const CARD_WIDTH = (Dimensions.get("window").width - 16 * 2 - 12) / 2;
const DAY_MS = 1000 * 60 * 60 * 24;

/** Days remaining until `isoDate`; negative means overdue. Null when no schedule is set. */
const daysUntil = (isoDate) => {
  if (!isoDate) return null;
  return Math.ceil((new Date(isoDate).getTime() - Date.now()) / DAY_MS);
};

const formatDays = (days) => {
  if (days === null) return "No schedule";
  if (days <= 0) return days === 0 ? "Due today" : `${Math.abs(days)}d overdue`;
  return `in ${days}d`;
};

const MyPlantsScreen = () => {
  const navigation = useNavigation();
  const { userToken } = useAuth();
  const { data: myPlants, isLoading, isError, error } = useMyPlants();
  const removeMutation = useRemoveFromMyPlants();
  const waterMutation = useWaterPlant();
  const fertilizeMutation = useFertilizePlant();
  const updateImageMutation = useUpdateMyPlantImage();

  // Per-plant action state: { [myPlantId]: 'water' | 'fertilize' | 'image' | null }
  const [actionLoading, setActionLoading] = useState({});
  const [removingPlantId, setRemovingPlantId] = useState(null);

  const setLoading = (id, action) =>
    setActionLoading((prev) => ({ ...prev, [id]: action }));

  const handleAddPlantsPress = () => navigation.navigate("AllPlants");
  const handleLoginPress = () => navigation.navigate("Login");
  const handleCalendarPress = () => navigation.navigate("Calendar");
  const handleDiagnosePress = () => navigation.navigate("Diagnose");
  const handlePlantPress = (myPlant) =>
    navigation.navigate("SinglePlant", { plant: myPlant.plant });

  const handleWater = (myPlant) => {
    setLoading(myPlant.id, "water");
    waterMutation.mutate(myPlant.id, {
      onSettled: () => setLoading(myPlant.id, null),
      onError: (err) =>
        Alert.alert("Error", err.message || "Could not water that plant."),
    });
  };

  const handleFertilize = (myPlant) => {
    setLoading(myPlant.id, "fertilize");
    fertilizeMutation.mutate(myPlant.id, {
      onSettled: () => setLoading(myPlant.id, null),
      onError: (err) =>
        Alert.alert("Error", err.message || "Could not fertilize that plant."),
    });
  };

  const handleUpdateImage = async (myPlant) => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      Alert.alert("Permission Required", "Media library access is required.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;

    setLoading(myPlant.id, "image");
    updateImageMutation.mutate(
      { myPlantId: myPlant.id, imageUri: result.assets[0].uri },
      {
        onSettled: () => setLoading(myPlant.id, null),
        onError: (err) =>
          Alert.alert("Error", err.message || "Could not update the photo."),
      },
    );
  };

  const handleRemovePlant = (myPlant) => {
    Alert.alert(
      "Remove Plant",
      `Are you sure you want to remove ${myPlant.plant.commonName} from your plants?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setRemovingPlantId(myPlant.id);
            removeMutation.mutate(myPlant.id, {
              onSettled: () => setRemovingPlantId(null),
              onError: (err) =>
                Alert.alert("Error", err.message || "Failed to remove plant"),
            });
          },
        },
      ],
    );
  };

  // Dashboard stats, mirroring the web dashboard
  const stats = useMemo(() => {
    const list = myPlants || [];
    const wateringDays = list.map((p) => daysUntil(p.nextWatering));
    const fertilizingDays = list.map((p) => daysUntil(p.nextFertilizing));

    return {
      total: list.length,
      overdueWater: wateringDays.filter((d) => d !== null && d <= 0).length,
      needFertilizer: fertilizingDays.filter((d) => d !== null && d <= 0)
        .length,
      dueToday:
        wateringDays.filter((d) => d === 0).length +
        fertilizingDays.filter((d) => d === 0).length,
    };
  }, [myPlants]);

  const renderStats = () => (
    <View style={styles.statsRow}>
      <View style={[styles.statCard, { backgroundColor: "#E8F5E9" }]}>
        <Icon name="leaf" size={20} color="#2E7D32" />
        <Text style={styles.statNumber}>{stats.total}</Text>
        <Text style={styles.statLabel}>Total Plants</Text>
      </View>
      <View style={[styles.statCard, { backgroundColor: "#FFEBEE" }]}>
        <Icon name="alert-circle" size={20} color="#D32F2F" />
        <Text style={styles.statNumber}>{stats.overdueWater}</Text>
        <Text style={styles.statLabel}>Needs Water</Text>
      </View>
      <View style={[styles.statCard, { backgroundColor: "#FFF3E0" }]}>
        <Icon name="nutrition" size={20} color="#FF9800" />
        <Text style={styles.statNumber}>{stats.needFertilizer}</Text>
        <Text style={styles.statLabel}>Needs Fertilizing</Text>
      </View>
      <View style={[styles.statCard, { backgroundColor: "#E3F2FD" }]}>
        <Icon name="calendar" size={20} color="#1976D2" />
        <Text style={styles.statNumber}>{stats.dueToday}</Text>
        <Text style={styles.statLabel}>Due Today</Text>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <View style={styles.headerTopRow}>
        <View>
          <Text style={styles.headerTitle}>My Plants</Text>
          <Text style={styles.headerSubtitle}>
            Track and care for your green friends
          </Text>
        </View>
      </View>

      <View style={styles.headerActionsRow}>
        <TouchableOpacity
          style={styles.headerActionButton}
          onPress={handleCalendarPress}
        >
          <Icon name="calendar-outline" size={18} color="#2E7D32" />
          <Text style={styles.headerActionText}>Calendar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerActionButton}
          onPress={handleDiagnosePress}
        >
          <Icon name="camera-outline" size={18} color="#2E7D32" />
          <Text style={styles.headerActionText}>Diagnose</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerAddButton}
          onPress={handleAddPlantsPress}
        >
          <Icon name="add" size={18} color="#FFFFFF" />
          <Text style={styles.headerAddButtonText}>Add Plant</Text>
        </TouchableOpacity>
      </View>

      {renderStats()}
    </View>
  );

  const renderPlantCard = ({ item: myPlant }) => {
    const waterIn = daysUntil(myPlant.nextWatering);
    const fertilizeIn = daysUntil(myPlant.nextFertilizing);
    const displayImage = myPlant.imageUrl || myPlant.plant?.imageUrl;
    const loading = actionLoading[myPlant.id];

    return (
      <View style={[styles.card, { width: CARD_WIDTH }]}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => handlePlantPress(myPlant)}
        >
          <View style={styles.cardImageWrapper}>
            {displayImage ? (
              <Image source={{ uri: displayImage }} style={styles.cardImage} />
            ) : (
              <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
                <Icon name="leaf-outline" size={32} color="#A5D6A7" />
              </View>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.imageEditButton}
          onPress={() => handleUpdateImage(myPlant)}
          disabled={loading === "image"}
        >
          {loading === "image" ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Icon name="camera" size={14} color="#FFFFFF" />
          )}
        </TouchableOpacity>

        <View style={styles.cardBody}>
          <TouchableOpacity onPress={() => handlePlantPress(myPlant)}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {myPlant.plant?.commonName || "Unknown Plant"}
            </Text>
            <Text style={styles.cardSubtitle} numberOfLines={1}>
              {myPlant.plant?.scientificName || ""}
            </Text>
          </TouchableOpacity>

          <View style={styles.scheduleInfo}>
            <Text
              style={[
                styles.scheduleText,
                waterIn !== null && waterIn <= 0 && styles.scheduleOverdue,
              ]}
              numberOfLines={1}
            >
              💧 {formatDays(waterIn)}
            </Text>
            <Text
              style={[
                styles.scheduleText,
                fertilizeIn !== null && fertilizeIn <= 0 && styles.scheduleWarn,
              ]}
              numberOfLines={1}
            >
              🌱 {formatDays(fertilizeIn)}
            </Text>
          </View>

          <View style={styles.cardActionsRow}>
            <TouchableOpacity
              style={[styles.cardActionButton, styles.waterButton]}
              onPress={() => handleWater(myPlant)}
              disabled={loading === "water"}
            >
              {loading === "water" ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Icon name="water" size={16} color="#FFFFFF" />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.cardActionButton, styles.fertilizeButton]}
              onPress={() => handleFertilize(myPlant)}
              disabled={loading === "fertilize"}
            >
              {loading === "fertilize" ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Icon name="nutrition" size={16} color="#FFFFFF" />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.cardActionButton, styles.removeButton]}
              onPress={() => handleRemovePlant(myPlant)}
              disabled={removingPlantId === myPlant.id}
            >
              {removingPlantId === myPlant.id ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Icon name="trash-outline" size={16} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="leaf-outline" size={72} color="#C8E6C9" />
      <Text style={styles.title}>No plants yet</Text>
      <Text style={styles.subtitle}>Start building your plant collection</Text>
      <TouchableOpacity style={styles.button} onPress={handleAddPlantsPress}>
        <Text style={styles.buttonText}>+ Add Your First Plant</Text>
      </TouchableOpacity>
    </View>
  );

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
      <View style={styles.centerContainer}>
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
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={myPlants || []}
        renderItem={renderPlantCard}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
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
    backgroundColor: "#F5F7F5",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    paddingTop: 60,
  },
  animation: {
    width: 260,
    height: 260,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    padding: 8,
    textAlign: "center",
    color: "#333",
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
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
    paddingBottom: 40,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },

  // Dashboard header
  headerSection: {
    marginBottom: 16,
  },
  headerTopRow: {
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1B5E20",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  headerActionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  headerActionButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#2E7D32",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  headerActionText: {
    color: "#2E7D32",
    fontWeight: "600",
    fontSize: 13,
    marginLeft: 6,
  },
  headerAddButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2E7D32",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  headerAddButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 13,
    marginLeft: 6,
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: "48.5%",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
    marginTop: 6,
  },
  statLabel: {
    fontSize: 12,
    color: "#555",
    marginTop: 2,
  },

  // Plant card (grid)
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 14,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  cardImageWrapper: {
    width: "100%",
    height: CARD_WIDTH,
    backgroundColor: "#E8F5E9",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardImagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  imageEditButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardBody: {
    padding: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#222",
  },
  cardSubtitle: {
    fontSize: 12,
    fontStyle: "italic",
    color: "#777",
    marginBottom: 6,
  },
  scheduleInfo: {
    marginBottom: 8,
  },
  scheduleText: {
    fontSize: 12,
    color: "#555",
    marginTop: 2,
  },
  scheduleOverdue: {
    color: "#D32F2F",
    fontWeight: "600",
  },
  scheduleWarn: {
    color: "#FF9800",
    fontWeight: "600",
  },
  cardActionsRow: {
    flexDirection: "row",
    gap: 6,
  },
  cardActionButton: {
    flex: 1,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  waterButton: {
    backgroundColor: "#2196F3",
  },
  fertilizeButton: {
    backgroundColor: "#FF9800",
  },
  removeButton: {
    backgroundColor: "#D32F2F",
  },
});

export default MyPlantsScreen;
