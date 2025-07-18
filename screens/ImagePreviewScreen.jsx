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
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImageManipulator from "expo-image-manipulator";
import * as MediaLibrary from "expo-media-library";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { ProgressBar } from "react-native-paper";

const screen = Dimensions.get("window");

const ImagePreviewScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { imageUri, action, source } = route.params;

  const [isProcessing, setIsProcessing] = useState(true);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [hasSavePermission, setHasSavePermission] = useState(false);
  const [result, setResult] = useState(null);

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
    const sendToServer = async () => {
      const formData = new FormData();
      formData.append("image", {
        uri: imageUri,
        type: "image/jpeg",
        name: "plant.jpg",
      });

      try {
        const endpoint =
          action === "Identification"
            ? "https://plant-api-service-ckf2f2fzabatezcu.uaenorth-01.azurewebsites.net/identify"
            : "https://plant-api-service-ckf2f2fzabatezcu.uaenorth-01.azurewebsites.net/predictimage2";

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "multipart/form-data",
          },
          body: formData,
        });

        const data = await response.json();
        console.log("API Response:", data);
        setResult(data);
      } catch (error) {
        console.error("API Error:", error);
        Alert.alert("Error", "Failed to get prediction from the server.");
      } finally {
        setIsProcessing(false);
      }
    };

    sendToServer();
  }, []);

  const handleSaveImage = async () => {
    try {
      if (!hasSavePermission) {
        Alert.alert("Permission Required", "Enable media access in settings.");
        return;
      }

      const asset = await MediaLibrary.createAssetAsync(imageUri);
      await MediaLibrary.createAlbumAsync("PlantApp", asset, false);
      Alert.alert("Success", "Image saved to your gallery.");
    } catch (error) {
      console.error("Save Error:", error);
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

  const translateDisease = (label) => {
    const dictionary = {
      "Powdery Mildew": "Powdery Mildew",
      "Leaf Spot": "Leaf Spot",
      Rust: "Rust",
      Blight: "Blight",
      Healthy: "Healthy",
      bercak_daun: "Leaf Spot",
      defisiensi_kalsium: "Calcium Deficiency",
      hangus_daun: "Scorched Leaves",
      hawar_daun: "Leaf Blight",
      mosaik_vena_kuning: "Yellow Vein Mosaic",
      virus_kuning_keriting: "Curly Yellow Virus",
    };
    return dictionary[label] || label;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#F5F5F5", "#E8F5E9"]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.patternBackground} />

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

            {action === "Identification" ? (
              result && result.length > 0 ? (
                <View style={styles.resultItem}>
                  <Text style={styles.resultItemText}>
                    {result[0].class_name}
                  </Text>
                  <ProgressBar
                    progress={result[0].confidence}
                    color="#2E7D32"
                    style={{ height: 8, borderRadius: 4, marginTop: 6 }}
                  />
                  <Text style={styles.confidenceText}>
                    {(result[0].confidence * 100).toFixed(1)}%
                  </Text>
                </View>
              ) : (
                <Text style={styles.resultText}>No prediction returned.</Text>
              )
            ) : result && Array.isArray(result) && result.length > 0 ? (
              result.map((item, index) => (
                <View key={index} style={styles.resultItem}>
                  <Text style={styles.resultItemText}>
                    🦠 {translateDisease(item.class)}
                  </Text>
                  <ProgressBar
                    progress={item.confidence}
                    color="#FF6B6B"
                    style={{ height: 8, borderRadius: 4, marginTop: 6 }}
                  />
                  <Text style={styles.confidenceText}>
                    {(item.confidence * 100).toFixed(1)}%
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.resultText}>No disease detected.</Text>
            )}
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
  container: { flex: 1, backgroundColor: "#FFF", position: "relative" },
  patternBackground: {
    position: "absolute",
    width: screen.width,
    height: screen.height,
    opacity: 0.05,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    marginBottom: 10,
  },
  title: { fontSize: 20, fontWeight: "bold", color: "#2E7D32" },
  card: {
    margin: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: { width: "100%", borderRadius: 12 },
  sourceText: { marginTop: 8, fontSize: 12, color: "#777" },
  processingContainer: { marginTop: 24, alignItems: "center" },
  processingText: { marginTop: 12, color: "#444" },
  resultTitle: {
    marginTop: 20,
    fontSize: 14,
    fontWeight: "bold",
    color: "#2E7D32",
    letterSpacing: 1,
    alignSelf: "flex-start",
  },
  resultText: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 4,
    color: "#333",
  },
  resultItem: {
    backgroundColor: "#E8F5E9",
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  resultItemText: {
    fontSize: 14,
    color: "#2E7D32",
    fontWeight: "500",
    textAlign: "left",
  },
  confidenceText: {
    marginTop: 4,
    fontSize: 13,
    color: "#555",
    alignSelf: "flex-end",
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
