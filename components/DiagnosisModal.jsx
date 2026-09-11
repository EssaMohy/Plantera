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
  Dimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Icon from "react-native-vector-icons/Ionicons";
import { useDiagnosis, SEVERITY_STYLES } from "../hooks/diagnostics";
import BboxOverlay from "./BboxOverlay";

const PREVIEW_WIDTH = Dimensions.get("window").width - 64;
const PREVIEW_HEIGHT = 240;

const DiagnosisModal = ({ visible, onClose }) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });
  const {
    analyzing,
    results,
    selectedResult,
    setSelectedResult,
    error,
    analyze,
    reset: resetDiagnosis,
  } = useDiagnosis();

  const reset = () => {
    setImagePreview(null);
    setImageDimensions({ width: 0, height: 0 });
    resetDiagnosis();
  };

  const handleClose = () => {
    reset();
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

    const result =
      source === "camera"
        ? await ImagePicker.launchCameraAsync({ quality: 0.8 })
        : await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });

    if (result.canceled) return;

    const asset = result.assets[0];
    resetDiagnosis();
    setImagePreview(asset.uri);
    setImageDimensions({ width: asset.width, height: asset.height });
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
            <Text style={styles.headerTitle}>AI Plant Diagnosis</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Icon name="close" size={22} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            {!imagePreview ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconCircle}>
                  <Icon name="camera" size={36} color="#2E7D32" />
                </View>
                <Text style={styles.emptyTitle}>Upload Plant Photo</Text>
                <Text style={styles.emptySubtitle}>
                  Take a clear photo of your plant's leaves to get an AI-powered
                  health diagnosis
                </Text>

                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={pickImage}
                >
                  <Icon name="cloud-upload-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.primaryButtonText}>Choose Photo</Text>
                </TouchableOpacity>

                <View style={styles.tipsBox}>
                  <Text style={styles.tipsTitle}>Tips for best results:</Text>
                  <Text style={styles.tipsText}>
                    • Use good lighting — natural light works best
                  </Text>
                  <Text style={styles.tipsText}>
                    • Focus on affected areas (spots, discoloration, etc.)
                  </Text>
                  <Text style={styles.tipsText}>
                    • Take photos from multiple angles if needed
                  </Text>
                  <Text style={styles.tipsText}>
                    • Ensure leaves are in focus and clearly visible
                  </Text>
                </View>
              </View>
            ) : (
              <View>
                <View style={styles.imageWrapper}>
                  <Image
                    source={{ uri: imagePreview }}
                    style={styles.previewImage}
                    resizeMode="contain"
                  />
                  {results.length > 0 && selectedResult && (
                    <BboxOverlay
                      instances={selectedResult.instances}
                      condition={selectedResult.condition}
                      naturalWidth={imageDimensions.width}
                      naturalHeight={imageDimensions.height}
                      previewWidth={PREVIEW_WIDTH}
                      previewHeight={PREVIEW_HEIGHT}
                    />
                  )}
                </View>

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

                {selectedResult === null && !analyzing && !error && (
                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={[styles.primaryButton, styles.flexButton]}
                      onPress={() => analyze(imagePreview)}
                    >
                      <Text style={styles.primaryButtonText}>
                        Analyze Image
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.secondaryButton, styles.flexButton]}
                      onPress={reset}
                    >
                      <Text style={styles.secondaryButtonText}>
                        Choose Different
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {analyzing && (
                  <View style={styles.centerBlock}>
                    <ActivityIndicator size="large" color="#2E7D32" />
                    <Text style={styles.centerTitle}>
                      Analyzing Your Plant...
                    </Text>
                    <Text style={styles.centerSubtitle}>
                      Our AI is examining the image for health indicators
                    </Text>
                  </View>
                )}

                {error && (
                  <View style={styles.centerBlock}>
                    <Icon name="warning" size={36} color="#D32F2F" />
                    <Text style={[styles.centerTitle, { color: "#D32F2F" }]}>
                      Analysis Failed
                    </Text>
                    <Text style={styles.centerSubtitle}>{error}</Text>
                    <View style={styles.buttonRow}>
                      <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => analyze(imagePreview)}
                      >
                        <Text style={styles.primaryButtonText}>Try Again</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={reset}
                      >
                        <Text style={styles.secondaryButtonText}>
                          Choose Different
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {selectedResult && !analyzing && !error && (
                  <View style={styles.resultsBlock}>
                    <View
                      style={[
                        styles.severityCard,
                        {
                          backgroundColor:
                            SEVERITY_STYLES[selectedResult.severity].bg,
                        },
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
                            {
                              color:
                                SEVERITY_STYLES[selectedResult.severity].text,
                            },
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
                      <Text style={styles.treatmentTitle}>
                        Recommended Treatment:
                      </Text>
                      {selectedResult.treatment.map((step, index) => (
                        <View key={index} style={styles.treatmentRow}>
                          <View style={styles.treatmentBadge}>
                            <Text style={styles.treatmentBadgeText}>
                              {index + 1}
                            </Text>
                          </View>
                          <Text style={styles.treatmentStep}>{step}</Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.buttonRow}>
                      <TouchableOpacity
                        style={[styles.primaryButton, styles.flexButton]}
                        onPress={reset}
                      >
                        <Text style={styles.primaryButtonText}>
                          Analyze Another Plant
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.secondaryButton, styles.flexButton]}
                        onPress={handleClose}
                      >
                        <Text style={styles.secondaryButtonText}>Done</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            )}
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
  emptyState: {
    alignItems: "center",
    paddingVertical: 12,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 8,
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
    marginTop: 16,
  },
  tipsBox: {
    backgroundColor: "#E3F2FD",
    borderRadius: 12,
    padding: 14,
    marginTop: 24,
    width: "100%",
  },
  tipsTitle: {
    fontWeight: "700",
    color: "#1565C0",
    marginBottom: 6,
    fontSize: 13,
  },
  tipsText: {
    color: "#1976D2",
    fontSize: 12,
    marginTop: 2,
  },
  imageWrapper: {
    width: PREVIEW_WIDTH,
    height: PREVIEW_HEIGHT,
    backgroundColor: "#F0F0F0",
    borderRadius: 14,
    overflow: "hidden",
    alignSelf: "center",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  tabsRow: {
    marginTop: 12,
  },
  tabChip: {
    backgroundColor: "#F0F0F0",
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 16,
    marginRight: 8,
  },
  tabChipActive: {
    backgroundColor: "#2E7D32",
  },
  tabChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#555",
  },
  tabChipTextActive: {
    color: "#FFFFFF",
  },
  centerBlock: {
    alignItems: "center",
    paddingVertical: 24,
  },
  centerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#222",
    marginTop: 12,
    marginBottom: 6,
  },
  centerSubtitle: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 12,
  },
  resultsBlock: {
    marginTop: 16,
  },
  severityCard: {
    flexDirection: "row",
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  severityTextWrap: {
    flex: 1,
  },
  severityTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 2,
  },
  severityConfidence: {
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
  },
  severityDescription: {
    fontSize: 13,
    color: "#444",
    lineHeight: 18,
  },
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
  treatmentBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  treatmentStep: {
    flex: 1,
    fontSize: 13,
    color: "#444",
    lineHeight: 18,
  },
});

export default DiagnosisModal;
