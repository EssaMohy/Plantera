import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Modalize } from "react-native-modalize";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";

const ScanModal = React.forwardRef(({ onClose }, ref) => {
  const navigation = useNavigation();

  const handleCameraCapture = async (action) => {
    if (ref?.current) ref.current.close();

    setTimeout(async () => {
      const { granted } = await ImagePicker.requestCameraPermissionsAsync();
      if (!granted) {
        Alert.alert("Permission Required", "Camera access is required.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const imageUri = result.assets[0].uri;
        console.log(`Captured via Camera (${action}):`, imageUri);
        navigation.navigate("ImagePreview", {
          imageUri,
          action,
          source: "camera",
        });
      }
    }, 300);
  };

  const handleGalleryPick = async (action) => {
    if (ref?.current) ref.current.close();

    setTimeout(async () => {
      const { granted } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) {
        Alert.alert("Permission Required", "Media library access is required.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const imageUri = result.assets[0].uri;
        console.log(`Picked from Gallery (${action}):`, imageUri);
        navigation.navigate("ImagePreview", {
          imageUri,
          action,
          source: "gallery",
        });
      }
    }, 300);
  };

  return (
    <Modalize
      ref={ref}
      onClose={onClose}
      modalStyle={styles.modal}
      handlePosition="inside"
      handleStyle={styles.handle}
      adjustToContentHeight={true}
      childrenStyle={styles.modalContent}
      withOverlay={true}
    >
      <View style={styles.content}>
        <Text style={styles.modalTitle}>Scan a Plant</Text>
        <Text style={styles.modalSubtitle}>
          Choose how you’d like to scan your plant
        </Text>

        {/* Identification */}
        <View style={styles.optionBlock}>
          <Text style={styles.optionLabel}>🌿 Identification</Text>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#2E7D32" }]}
            onPress={() => handleCameraCapture("Identification")}
          >
            <MaterialCommunityIcons name="camera" size={24} color="#fff" />
            <Text style={styles.actionText}>Take a Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.galleryButton]}
            onPress={() => handleGalleryPick("Identification")}
          >
            <MaterialIcons name="photo-library" size={22} color="#2E7D32" />
            <Text style={[styles.actionText, { color: "#2E7D32" }]}>
              Pick from Gallery
            </Text>
          </TouchableOpacity>
        </View>

        {/* Detect a Disease */}
        <View style={styles.optionBlock}>
          <Text style={styles.optionLabel}>🦠 Detect a Disease</Text>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#FF6B6B" }]}
            onPress={() => handleCameraCapture("Detect a Disease")}
          >
            <MaterialCommunityIcons name="camera" size={24} color="#fff" />
            <Text style={styles.actionText}>Take a Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.galleryButton]}
            onPress={() => handleGalleryPick("Detect a Disease")}
          >
            <MaterialIcons name="photo-library" size={22} color="#FF6B6B" />
            <Text style={[styles.actionText, { color: "#FF6B6B" }]}>
              Pick from Gallery
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modalize>
  );
});

const styles = StyleSheet.create({
  modal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: "#fff",
  },
  modalContent: {
    padding: 24,
  },
  content: {
    alignItems: "center",
  },
  handle: {
    backgroundColor: "#E0E0E0",
    width: 40,
    height: 5,
    borderRadius: 5,
    marginTop: 10,
    alignSelf: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e1e1e",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#7a7a7a",
    marginBottom: 24,
    textAlign: "center",
  },
  optionBlock: {
    width: "100%",
    marginBottom: 28,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  actionText: {
    marginLeft: 10,
    fontSize: 15,
    fontWeight: "500",
    color: "#fff",
  },
  galleryButton: {
    backgroundColor: "#F4F4F4",
    elevation: 0,
    shadowOpacity: 0,
  },
});

export default ScanModal;
