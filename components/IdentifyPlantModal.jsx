import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Icon from "react-native-vector-icons/Ionicons";
import { useIdentifyPlant } from "../hooks/identify";

/**
 * Note: the backend's `IdentifySuggestion` response includes a
 * `predictionIndex` per suggestion (needed to confirm a specific one) —
 * DEPI-Front's own TS interface for that type is actually missing this
 * field even though its component code reads it, so this is ported from
 * the component's real runtime usage rather than the (incomplete) type.
 */
const IdentifyPlantModal = ({
  visible,
  onClose,
  onIdentified,
  onSwitchToCatalog,
}) => {
  const [imagePreview, setImagePreview] = useState(null);
  const {
    step,
    result,
    error,
    confirming,
    confirmedId,
    identify,
    confirm,
    reset: resetIdentify,
  } = useIdentifyPlant();

  const handleReset = () => {
    setImagePreview(null);
    resetIdentify();
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const pickImage = () => {
    Alert.alert("Add a photo", "", [
      { text: "Take Photo", onPress: () => launchPicker("camera") },
      { text: "Choose from Library", onPress: () => launchPicker("library") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const launchPicker = async (source) => {
    const permission =
      source === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission Required", "We need access to continue.");
      return;
    }

    const pickerResult =
      source === "camera"
        ? await ImagePicker.launchCameraAsync({ quality: 0.8 })
        : await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });

    if (pickerResult.canceled) return;

    setImagePreview(pickerResult.assets[0].uri);
  };

  const handleConfirm = async (predictionIndex) => {
    const myPlant = await confirm(predictionIndex);
    if (myPlant) onIdentified?.(myPlant.id);
  };

  const renderUploadStep = () => (
    <View style={styles.centerBlock}>
      {imagePreview ? (
        <View style={{ width: "100%" }}>
          <Image
            source={{ uri: imagePreview }}
            style={styles.previewImage}
            resizeMode="contain"
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.primaryButton, styles.flexButton]}
              onPress={() => identify(imagePreview)}
            >
              <Text style={styles.primaryButtonText}>Identify This Plant</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secondaryButton, styles.flexButton]}
              onPress={handleReset}
            >
              <Text style={styles.secondaryButtonText}>Choose Different</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          <View style={styles.emptyIconCircle}>
            <Icon name="camera" size={32} color="#2E7D32" />
          </View>
          <Text style={styles.emptyTitle}>Take or Upload a Photo</Text>
          <Text style={styles.emptySubtitle}>
            Snap a clear photo of the plant's leaves and flowers for best
            results
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={pickImage}>
            <Icon name="cloud-upload-outline" size={18} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Choose Photo</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  const renderProcessingStep = () => (
    <View style={styles.centerBlock}>
      <ActivityIndicator size="large" color="#2E7D32" />
      <Text style={styles.centerTitle}>Identifying...</Text>
      <Text style={styles.centerSubtitle}>Analyzing the photo with our AI</Text>
    </View>
  );

  const renderResultsStep = () => {
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
            onPress={handleClose}
          >
            <Text style={styles.primaryButtonText}>Done</Text>
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
          {onSwitchToCatalog && (
            <TouchableOpacity
              style={[styles.primaryButton, { marginTop: 16 }]}
              onPress={onSwitchToCatalog}
            >
              <Text style={styles.primaryButtonText}>Browse Plant Catalog</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.textButton} onPress={handleReset}>
            <Text style={styles.textButtonText}>Try Another Photo</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View>
        <Image
          source={{ uri: result.imageUrl }}
          style={styles.resultImage}
          resizeMode="cover"
        />

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
                onPress={() => handleConfirm(top.predictionIndex)}
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
                  onPress={() => handleConfirm(s.predictionIndex)}
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

        {onSwitchToCatalog && (
          <TouchableOpacity
            style={styles.catalogLinkButton}
            onPress={onSwitchToCatalog}
          >
            <Text style={styles.catalogLinkText}>
              Not seeing your plant? Browse the catalog →
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Identify Plant</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Icon name="close" size={22} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            {error && (
              <View style={styles.errorBanner}>
                <Icon name="warning-outline" size={16} color="#D32F2F" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {step === "upload" && renderUploadStep()}
            {step === "processing" && renderProcessingStep()}
            {step === "results" && renderResultsStep()}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFEBEE",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 13,
    flex: 1,
  },
  centerBlock: {
    alignItems: "center",
    paddingVertical: 24,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#222",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  centerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#222",
    marginTop: 12,
    marginBottom: 4,
  },
  centerSubtitle: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 12,
  },
  previewImage: {
    width: "100%",
    height: 220,
    borderRadius: 14,
    backgroundColor: "#F0F0F0",
    marginBottom: 16,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2E7D32",
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: 25,
    gap: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  secondaryButton: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#CCC",
  },
  secondaryButtonText: {
    color: "#444",
    fontWeight: "600",
    fontSize: 14,
  },
  flexButton: {
    flex: 1,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
  },
  textButton: {
    marginTop: 12,
    paddingVertical: 8,
  },
  textButtonText: {
    color: "#666",
    fontWeight: "600",
    fontSize: 13,
  },
  resultImage: {
    width: "100%",
    height: 180,
    borderRadius: 14,
    backgroundColor: "#F0F0F0",
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
  bestMatchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  bestMatchImage: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: "#DDD",
  },
  bestMatchImagePlaceholder: {
    backgroundColor: "#E0E0E0",
  },
  bestMatchName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#222",
  },
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
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
  },
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
  otherMatchName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#222",
  },
  otherMatchConfidence: {
    fontSize: 11,
    color: "#888",
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    backgroundColor: "#F0F0F0",
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  chipText: {
    fontSize: 11,
    color: "#777",
  },
  catalogLinkButton: {
    marginTop: 18,
    borderWidth: 1.5,
    borderColor: "#CCC",
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  catalogLinkText: {
    color: "#666",
    fontSize: 13,
    fontWeight: "600",
  },
});

export default IdentifyPlantModal;
