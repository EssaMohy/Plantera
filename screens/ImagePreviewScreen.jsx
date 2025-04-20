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
  Linking,
  Dimensions,
  Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as ImageManipulator from "expo-image-manipulator";
import * as MediaLibrary from "expo-media-library";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

const screen = Dimensions.get("window");

const ImagePreviewScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { imageUri, action, source } = route.params;

  const [isProcessing, setIsProcessing] = useState(true);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [hasSavePermission, setHasSavePermission] = useState(false);

  useEffect(() => {
    Image.getSize(imageUri, (width, height) => {
      setImageSize({ width, height });
    });
  }, [imageUri]);

  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setHasSavePermission(status === "granted");
    })();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsProcessing(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleSaveImage = async () => {
    try {
      if (!hasSavePermission) {
        Alert.alert(
          "Permission Required",
          "Need media library permissions to save photos",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }

      const asset = await MediaLibrary.createAssetAsync(imageUri);
      await MediaLibrary.createAlbumAsync("PlantApp", asset, false);
      Alert.alert("Success", "Image saved to your photos!");
    } catch (error) {
      console.error("Save Error:", error);
      Alert.alert("Error", "Failed to save image. Please try again.");
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
        title:
          action === "Identification" ? "Plant Identification" : "Disease Scan",
        message:
          action === "Identification"
            ? "Check out this plant I identified!"
            : "Scanned my plant for disease!",
      });
    } catch (error) {
      console.error("Share Error:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background with gradient that matches the HomeScreen design */}
      <LinearGradient
        colors={["#F5F5F5", "#E8F5E9"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Optional: Small plant pattern background */}
      <View style={styles.patternBackground} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {action === "Identification" ? "Plant Scan" : "Disease Scan"}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <Animated.View style={styles.card} entering={FadeIn} exiting={FadeOut}>
        <Image
          source={{ uri: imageUri }}
          style={[
            styles.image,
            {
              aspectRatio:
                imageSize.width > 0
                  ? imageSize.width / imageSize.height
                  : 4 / 3,
            },
          ]}
          resizeMode="contain"
        />
        <Text style={styles.sourceText}>
          {source === "camera"
            ? "Captured with camera"
            : "Selected from gallery"}
        </Text>

        {isProcessing ? (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color="#2E7D32" />
            <Text style={styles.processingText}>
              {action === "Identification"
                ? "Identifying plant..."
                : "Scanning for disease..."}
            </Text>
          </View>
        ) : (
          <Animated.View entering={FadeIn}>
            <Text style={styles.resultTitle}>
              {action === "Identification" ? "IDENTIFIED" : "DIAGNOSIS"}
            </Text>
            <Text style={styles.resultText}>
              {action === "Identification"
                ? "Monstera Deliciosa (Swiss Cheese Plant)"
                : "Possible Powdery Mildew (70% confidence)"}
            </Text>
          </Animated.View>
        )}
      </Animated.View>

      {!isProcessing && (
        <Animated.View style={styles.floatingButtons} entering={FadeIn}>
          <TouchableOpacity
            style={[styles.fab, { backgroundColor: "#2E7D32" }]}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="camera" size={22} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.fab, { backgroundColor: "#3F51B5" }]}
            onPress={handleSaveImage}
          >
            <MaterialIcons name="save" size={22} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.fab, { backgroundColor: "#FF6B6B" }]}
            onPress={handleShareImage}
          >
            <MaterialIcons name="share" size={22} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    position: "relative",
  },
  patternBackground: {
    position: "absolute",
    width: screen.width,
    height: screen.height,
    opacity: 0.05,
    // You could add a pattern image here if you have one
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    marginBottom: 10,
  },
  backButton: {
    padding: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  card: {
    margin: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: "100%",
    borderRadius: 12,
  },
  sourceText: {
    marginTop: 8,
    fontSize: 12,
    color: "#777",
  },
  processingContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  processingText: {
    marginTop: 12,
    color: "#444",
  },
  resultTitle: {
    marginTop: 20,
    fontSize: 14,
    fontWeight: "bold",
    color: "#2E7D32",
    letterSpacing: 1,
  },
  resultText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 4,
    color: "#333",
  },
  floatingButtons: {
    position: "absolute",
    bottom: 32,
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
