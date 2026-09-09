import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";

const PlantCard = ({
  image,
  imageUrl,
  commonName,
  scientificName,
  onPress,
}) => {
  const displayImage = imageUrl || image;
  const [failed, setFailed] = useState(false);

  return (
    <View style={styles.card}>
      <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
        <View style={styles.imageContainer}>
          {displayImage && !failed ? (
            <Image
              source={{
                uri: displayImage,
                headers: {
                  // Wikimedia blocks requests without a descriptive User-Agent.
                  // Swap in your actual app name/contact per their policy:
                  // https://meta.wikimedia.org/wiki/User-Agent_policy
                  "User-Agent": "PlantApp/1.0 (contact@yourapp.com)",
                },
              }}
              style={styles.image}
              resizeMode="cover"
              onError={(e) => {
                console.log("Failed to load image:", e.nativeEvent.error);
                setFailed(true);
              }}
            />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>🌿</Text>
            </View>
          )}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
            {commonName}
          </Text>
          <Text style={styles.subtitle} numberOfLines={2} ellipsizeMode="tail">
            {scientificName}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: Dimensions.get("window").width / 2 - 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    margin: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  imageContainer: {
    width: "100%",
    height: 120,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
  },
  placeholderText: {
    fontSize: 32,
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
