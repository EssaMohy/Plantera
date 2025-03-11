import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Pressable,
} from "react-native";

const PlantCard = ({ commonName, scientificName }) => {
  return (
    <View style={styles.card}>
      <Pressable android_ripple={{ color: "#ccc" }}>
        <View style={styles.imageContainer}>
          <Image
            // source={{ uri: image }}
            style={styles.image}
            resizeMode="cover"
            onError={(e) =>
              console.log("Failed to load image:", e.nativeEvent.error)
            }
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
            {commonName}
          </Text>
          <Text style={styles.subtitle} numberOfLines={2} ellipsizeMode="tail">
            {scientificName}
          </Text>
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: Dimensions.get("window").width / 2 - 20, // Responsive width
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    overflow: "hidden",
    margin: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
  },
  imageContainer: {
    width: "100%",
    height: 120,
    backgroundColor: "#E0E0E0", // Fallback background color
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  textContainer: {
    padding: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#666666",
  },
});

export default PlantCard;
