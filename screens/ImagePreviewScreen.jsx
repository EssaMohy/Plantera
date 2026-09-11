import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Share,
  ScrollView,
  Dimensions,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import Icon from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as MediaLibrary from "expo-media-library";
import { LinearGradient } from "expo-linear-gradient";
import { useDiagnosis, SEVERITY_STYLES } from "../hooks/diagnostics";
import { useIdentifyPlant } from "../hooks/identify";
import BboxOverlay from "../components/BboxOverlay";

const screen = Dimensions.get("window");
const PREVIEW_WIDTH = screen.width - 32;
const PREVIEW_HEIGHT = 260;

const ImagePreviewScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const queryClient = useQueryClient();
  const { action, source: initialSource } = route.params;
  const isIdentify = action === "Identification";

  const [imageUri, setImageUri] = useState(route.params.imageUri);
  const [source, setSource] = useState(initialSource);
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [hasSavePermission, setHasSavePermission] = useState(false);

  const diagnosis = useDiagnosis();
  const identifyPlant = useIdentifyPlant();

  useEffect(() => {
    Image.getSize(imageUri, (width, height) => {
      setImageDimensions({ width, height });
    });
  }, [imageUri]);

  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setHasSavePermission(status === "granted");
    })();
  }, []);

  // Kick off the real analysis automatically, same as the original
  // screen did — the person already chose "Identify" or "Detect a
  // Disease" back in the Scan sheet, so there's no need for a second
  // confirmation tap here.
  useEffect(() => {
    if (isIdentify) {
      identifyPlant.identify(imageUri);
    } else {
      diagnosis.analyze(imageUri);
    }
    // Only re-run when the image itself changes (e.g. "Try Another Photo").
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUri]);

  const isProcessing = isIdentify
    ? identifyPlant.step === "processing"
    : diagnosis.analyzing;

  const retryPick = () => {
    Alert.alert("Add a photo", "", [
      { text: "Take Photo", onPress: () => launchPicker("camera") },
      { text: "Choose from Library", onPress: () => launchPicker("library") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const launchPicker = async (pickSource) => {
    const permission =
      pickSource === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission Required", "We need access to continue.");
      return;
    }

    const result =
      pickSource === "camera"
        ? await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
          })
        : await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
          });

    if (result.canceled) return;

    diagnosis.reset();
    identifyPlant.reset();
    setSource(pickSource === "camera" ? "camera" : "gallery");
    setImageUri(result.assets[0].uri);
  };

  const handleIdentifyConfirm = async (predictionIndex) => {
    const myPlant = await identifyPlant.confirm(predictionIndex);
    if (myPlant) {
      queryClient.invalidateQueries(["myPlants"]);
    }
  };

  const handleSaveImage = async () => {
    try {
      if (!hasSavePermission) {
        Alert.alert("Permission Required", "Enable media access in settings.");
        return;
      }
      const asset = await MediaLibrary.createAssetAsync(imageUri);
      await MediaLibrary.createAlbumAsync("PlantApp", asset, false);
      Alert.alert("Success", "Image saved to your gallery.");
    } catch (err) {
      Alert.alert("Error", "Failed to save image.");
    }
  };

  const handleShareImage = async () => {
    try {
      const image = await ImageManipulator.manipulateAsync(imageUri, [], {
        compress: 0.8,
        format: ImageManipulator.SaveFormat.JPEG,
      });
      await Share.share({
        url: image.uri,
        title: isIdentify ? "Plant Identification" : "Disease Scan",
        message: isIdentify
          ? "Check out this plant I identified!"
          : "Scanned my plant for disease!",
      });
    } catch (err) {
      console.error("Share Error:", err);
    }
  };

  const renderDiagnosisResults = () => {
    const { results, selectedResult, setSelectedResult, error } = diagnosis;

    if (error) {
      return (
        <View style={styles.centerBlock}>
          <Icon name="warning" size={36} color="#D32F2F" />
          <Text style={[styles.centerTitle, { color: "#D32F2F" }]}>
            Analysis Failed
          </Text>
          <Text style={styles.centerSubtitle}>{error}</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => diagnosis.analyze(imageUri)}
            >
              <Text style={styles.primaryButtonText}>Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={retryPick}
            >
              <Text style={styles.secondaryButtonText}>Choose Different</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (!selectedResult) return null;

    return (
      <View>
        {results.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabsRow}
          >
            {results.map((r, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.tabChip,
                  selectedResult === r && styles.tabChipActive,
                ]}
                onPress={() => setSelectedResult(r)}
              >
                <Text
                  style={[
                    styles.tabChipText,
                    selectedResult === r && styles.tabChipTextActive,
                  ]}
                >
                  {r.condition} ({r.confidence}%)
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View
          style={[
            styles.severityCard,
            { backgroundColor: SEVERITY_STYLES[selectedResult.severity].bg },
          ]}
        >
          <Icon
            name={SEVERITY_STYLES[selectedResult.severity].icon}
            size={26}
            color={SEVERITY_STYLES[selectedResult.severity].text}
          />
          <View style={styles.severityTextWrap}>
            <Text
              style={[
                styles.severityTitle,
                { color: SEVERITY_STYLES[selectedResult.severity].text },
              ]}
            >
              {selectedResult.condition}
            </Text>
            <Text style={styles.severityConfidence}>
              Confidence: {selectedResult.confidence}%
            </Text>
            <Text style={styles.severityDescription}>
              {selectedResult.description}
            </Text>
          </View>
        </View>

        <View style={styles.treatmentBox}>
          <Text style={styles.treatmentTitle}>Recommended Treatment:</Text>
          {selectedResult.treatment.map((step, index) => (
            <View key={index} style={styles.treatmentRow}>
              <View style={styles.treatmentBadge}>
                <Text style={styles.treatmentBadgeText}>{index + 1}</Text>
              </View>
              <Text style={styles.treatmentStep}>{step}</Text>
            </View>
          ))}
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.primaryButton, styles.flexButton]}
            onPress={retryPick}
          >
            <Text style={styles.primaryButtonText}>Analyze Another Plant</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryButton, styles.flexButton]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.secondaryButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderIdentifyResults = () => {
    const { result, error, confirming, confirmedId } = identifyPlant;

    if (error) {
      return (
        <View style={styles.centerBlock}>
          <Icon name="warning" size={36} color="#D32F2F" />
          <Text style={[styles.centerTitle, { color: "#D32F2F" }]}>
            Identification Failed
          </Text>
          <Text style={styles.centerSubtitle}>{error}</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => identifyPlant.identify(imageUri)}
            >
              <Text style={styles.primaryButtonText}>Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={retryPick}
            >
              <Text style={styles.secondaryButtonText}>Choose Different</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (!result) return null;

    if (confirmedId !== null) {
      return (
        <View style={styles.centerBlock}>
          <View style={styles.emptyIconCircle}>
            <Icon name="checkmark" size={28} color="#2E7D32" />
          </View>
          <Text style={styles.centerTitle}>Plant Added!</Text>
          <Text style={styles.centerSubtitle}>
            The plant has been added to your collection.
          </Text>
          <TouchableOpacity
            style={[styles.primaryButton, { marginTop: 16 }]}
            onPress={() => navigation.navigate("Tabs", { screen: "My Plants" })}
          >
            <Text style={styles.primaryButtonText}>View My Plants</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const items = (result.suggestions || [])
      .filter((s) => s.confidence > 0.01)
      .sort((a, b) => b.confidence - a.confidence);
    const catalogMatch = items.filter((s) => s.plantId != null);
    const noMatch = items.filter((s) => s.plantId == null);
    const top = catalogMatch[0];

    if (items.length === 0) {
      return (
        <View style={styles.centerBlock}>
          <Icon name="search" size={36} color="#999" />
          <Text style={styles.centerTitle}>Could Not Identify</Text>
          <Text style={styles.centerSubtitle}>
            Our AI couldn't confidently identify this plant.
          </Text>
          <TouchableOpacity
            style={[styles.primaryButton, { marginTop: 16 }]}
            onPress={() => navigation.navigate("AllPlants")}
          >
            <Text style={styles.primaryButtonText}>Browse Plant Catalog</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.textButton} onPress={retryPick}>
            <Text style={styles.textButtonText}>Try Another Photo</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View>
        {top && (
          <View style={styles.bestMatchCard}>
            <Text style={styles.bestMatchLabel}>BEST MATCH</Text>
            <View style={styles.bestMatchRow}>
              {top.imageUrl ? (
                <Image
                  source={{ uri: top.imageUrl }}
                  style={styles.bestMatchImage}
                />
              ) : (
                <View
                  style={[
                    styles.bestMatchImage,
                    styles.bestMatchImagePlaceholder,
                  ]}
                />
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.bestMatchName} numberOfLines={1}>
                  {top.plantName}
                </Text>
                <View style={styles.confidenceBarTrack}>
                  <View
                    style={[
                      styles.confidenceBarFill,
                      { width: `${Math.round(top.confidence * 100)}%` },
                    ]}
                  />
                </View>
                <Text style={styles.confidenceLabel}>
                  {Math.round(top.confidence * 100)}% confidence
                </Text>
              </View>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => handleIdentifyConfirm(top.predictionIndex)}
                disabled={confirming !== null}
              >
                {confirming === top.predictionIndex ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.addButtonText}>Add</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {catalogMatch.length > 1 && (
          <View style={{ marginTop: 16 }}>
            <Text style={styles.sectionLabel}>OTHER MATCHES</Text>
            {catalogMatch.slice(1).map((s) => (
              <View key={s.predictionIndex} style={styles.otherMatchRow}>
                {s.imageUrl ? (
                  <Image
                    source={{ uri: s.imageUrl }}
                    style={styles.otherMatchImage}
                  />
                ) : (
                  <View
                    style={[
                      styles.otherMatchImage,
                      styles.bestMatchImagePlaceholder,
                    ]}
                  />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.otherMatchName} numberOfLines={1}>
                    {s.plantName}
                  </Text>
                  <Text style={styles.otherMatchConfidence}>
                    {Math.round(s.confidence * 100)}% confidence
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.addButtonSmall}
                  onPress={() => handleIdentifyConfirm(s.predictionIndex)}
                  disabled={confirming !== null}
                >
                  {confirming === s.predictionIndex ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.addButtonText}>Add</Text>
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {noMatch.length > 0 && (
          <View style={{ marginTop: 16 }}>
            <Text style={styles.sectionLabel}>
              NOT IN CATALOG ({noMatch.length})
            </Text>
            <View style={styles.chipsWrap}>
              {noMatch.map((s) => (
                <View key={s.predictionIndex} style={styles.chip}>
                  <Text style={styles.chipText}>
                    {s.plantName} · {Math.round(s.confidence * 100)}%
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.catalogLinkButton}
          onPress={() => navigation.navigate("AllPlants")}
        >
          <Text style={styles.catalogLinkText}>
            Not seeing your plant? Browse the catalog →
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const selectedDiagnosisResult = diagnosis.selectedResult;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#F5F5F5", "#E8F5E9"]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="chevron-back" size={24} color="#2E7D32" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {isIdentify ? "Plant Scan" : "Disease Scan"}
        </Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: imageUri }}
              style={styles.previewImage}
              resizeMode="contain"
            />
            {!isIdentify && selectedDiagnosisResult && (
              <BboxOverlay
                instances={selectedDiagnosisResult.instances}
                condition={selectedDiagnosisResult.condition}
                naturalWidth={imageDimensions.width}
                naturalHeight={imageDimensions.height}
                previewWidth={PREVIEW_WIDTH}
                previewHeight={PREVIEW_HEIGHT}
              />
            )}
          </View>
          <Text style={styles.sourceText}>
            {source === "camera"
              ? "Captured with camera"
              : "Selected from gallery"}
          </Text>

          {isProcessing ? (
            <View style={styles.centerBlock}>
              <ActivityIndicator size="large" color="#2E7D32" />
              <Text style={styles.centerTitle}>
                {isIdentify
                  ? "Identifying plant..."
                  : "Scanning for disease..."}
              </Text>
            </View>
          ) : isIdentify ? (
            renderIdentifyResults()
          ) : (
            renderDiagnosisResults()
          )}
        </View>
      </ScrollView>

      {!isProcessing && (
        <View style={styles.floatingButtons}>
          <TouchableOpacity
            style={[styles.fab, { backgroundColor: "#2E7D32" }]}
            onPress={retryPick}
          >
            <Icon name="camera" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.fab, { backgroundColor: "#3F51B5" }]}
            onPress={handleSaveImage}
          >
            <Icon name="download" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.fab, { backgroundColor: "#FF6B6B" }]}
            onPress={handleShareImage}
          >
            <Icon name="share-social" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: 50,
    paddingBottom: 10,
  },
  backButton: { padding: 6 },
  title: { fontSize: 18, fontWeight: "bold", color: "#2E7D32" },
  scrollContent: { padding: 16, paddingBottom: 100 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageWrapper: {
    width: PREVIEW_WIDTH,
    height: PREVIEW_HEIGHT,
    backgroundColor: "#F0F0F0",
    borderRadius: 12,
    overflow: "hidden",
    alignSelf: "center",
  },
  previewImage: { width: "100%", height: "100%" },
  sourceText: {
    marginTop: 8,
    fontSize: 12,
    color: "#777",
    textAlign: "center",
  },
  centerBlock: { alignItems: "center", paddingVertical: 24 },
  centerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
    marginTop: 12,
    marginBottom: 4,
    textAlign: "center",
  },
  centerSubtitle: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 12,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2E7D32",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    gap: 8,
  },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 13 },
  secondaryButton: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#CCC",
  },
  secondaryButtonText: { color: "#444", fontWeight: "600", fontSize: 13 },
  flexButton: { flex: 1 },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
    justifyContent: "center",
  },
  textButton: { marginTop: 12, paddingVertical: 8 },
  textButtonText: { color: "#666", fontWeight: "600", fontSize: 13 },
  tabsRow: { marginTop: 4, marginBottom: 8 },
  tabChip: {
    backgroundColor: "#F0F0F0",
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 16,
    marginRight: 8,
  },
  tabChipActive: { backgroundColor: "#2E7D32" },
  tabChipText: { fontSize: 12, fontWeight: "600", color: "#555" },
  tabChipTextActive: { color: "#FFFFFF" },
  severityCard: {
    flexDirection: "row",
    borderRadius: 14,
    padding: 16,
    gap: 12,
    marginTop: 16,
  },
  severityTextWrap: { flex: 1 },
  severityTitle: { fontSize: 16, fontWeight: "700", marginBottom: 2 },
  severityConfidence: { fontSize: 12, color: "#666", marginBottom: 6 },
  severityDescription: { fontSize: 13, color: "#444", lineHeight: 18 },
  treatmentBox: {
    backgroundColor: "#F7F7F7",
    borderRadius: 14,
    padding: 16,
    marginTop: 14,
  },
  treatmentTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#222",
    marginBottom: 10,
  },
  treatmentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
    gap: 10,
  },
  treatmentBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#2E7D32",
    justifyContent: "center",
    alignItems: "center",
  },
  treatmentBadgeText: { color: "#FFFFFF", fontSize: 11, fontWeight: "700" },
  treatmentStep: { flex: 1, fontSize: 13, color: "#444", lineHeight: 18 },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  bestMatchCard: {
    marginTop: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#A5D6A7",
    backgroundColor: "#F1F8E9",
    padding: 14,
  },
  bestMatchLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2E7D32",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  bestMatchRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  bestMatchImage: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: "#DDD",
  },
  bestMatchImagePlaceholder: { backgroundColor: "#E0E0E0" },
  bestMatchName: { fontSize: 15, fontWeight: "700", color: "#222" },
  confidenceBarTrack: {
    height: 6,
    backgroundColor: "#DCEDC8",
    borderRadius: 3,
    marginTop: 6,
    overflow: "hidden",
  },
  confidenceBarFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 3,
  },
  confidenceLabel: {
    fontSize: 11,
    color: "#2E7D32",
    marginTop: 4,
    fontWeight: "600",
  },
  addButton: {
    backgroundColor: "#2E7D32",
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 10,
    minWidth: 52,
    alignItems: "center",
  },
  addButtonSmall: {
    backgroundColor: "#2E7D32",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 46,
    alignItems: "center",
  },
  addButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 12 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#888",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  otherMatchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderColor: "#EEE",
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
  },
  otherMatchImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#DDD",
  },
  otherMatchName: { fontSize: 13, fontWeight: "700", color: "#222" },
  otherMatchConfidence: { fontSize: 11, color: "#888" },
  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    backgroundColor: "#F0F0F0",
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  chipText: { fontSize: 11, color: "#777" },
  catalogLinkButton: {
    marginTop: 18,
    borderWidth: 1.5,
    borderColor: "#CCC",
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  catalogLinkText: { color: "#666", fontSize: 13, fontWeight: "600" },
  floatingButtons: {
    position: "absolute",
    bottom: 28,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
  },
  fab: {
    padding: 14,
    borderRadius: 100,
    marginHorizontal: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
});

export default ImagePreviewScreen;
