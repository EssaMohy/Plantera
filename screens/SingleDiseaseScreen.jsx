import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";

const { width } = Dimensions.get("screen");

const SingleDiseaseScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { disease } = route.params; // Get disease data from navigation params

  return (
    <View style={styles.container}>
      {/* Disease Image */}
      <Image source={{ uri: disease.image }} style={styles.diseaseImage} />
      {/* Back Button */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Icon name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>
      {/* Disease Details */}
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.title}>{disease.name}</Text>
          {disease.otherNames && disease.otherNames.length > 0 && (
            <Text style={styles.subtitle}>
              Also known as: {disease.otherNames.join(", ")}
            </Text>
          )}

          <View style={styles.divider} />

          {disease.description && (
            <>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.text}>{disease.description}</Text>
              <View style={styles.divider} />
            </>
          )}

          {disease.type && disease.type.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Type</Text>
              <View style={styles.tagsContainer}>
                {disease.type.map((type, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{type}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.divider} />
            </>
          )}

          {disease.causes && disease.causes.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Causes</Text>
              {disease.causes.map((cause, index) => (
                <Text key={index} style={styles.listItem}>
                  • {cause}
                </Text>
              ))}
              <View style={styles.divider} />
            </>
          )}

          {disease.symptoms && disease.symptoms.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Symptoms</Text>
              {disease.symptoms.map((symptom, index) => (
                <Text key={index} style={styles.listItem}>
                  • {symptom}
                </Text>
              ))}
              <View style={styles.divider} />
            </>
          )}

          {disease.treatment && (
            <>
              <Text style={styles.sectionTitle}>Treatment</Text>

              {disease.treatment.cultural_control &&
                disease.treatment.cultural_control.length > 0 && (
                  <>
                    <Text style={styles.subsectionTitle}>Cultural Control</Text>
                    {disease.treatment.cultural_control.map((method, index) => (
                      <Text key={index} style={styles.listItem}>
                        • {method}
                      </Text>
                    ))}
                  </>
                )}

              {disease.treatment.chemical_control &&
                disease.treatment.chemical_control.length > 0 && (
                  <>
                    <Text style={styles.subsectionTitle}>Chemical Control</Text>
                    {disease.treatment.chemical_control.map((method, index) => (
                      <Text key={index} style={styles.listItem}>
                        • {method}
                      </Text>
                    ))}
                  </>
                )}

              {disease.treatment.organic_biological_control &&
                disease.treatment.organic_biological_control.length > 0 && (
                  <>
                    <Text style={styles.subsectionTitle}>
                      Organic/Biological Control
                    </Text>
                    {disease.treatment.organic_biological_control.map(
                      (method, index) => (
                        <Text key={index} style={styles.listItem}>
                          • {method}
                        </Text>
                      )
                    )}
                  </>
                )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  diseaseImage: {
    width: width,
    height: 250,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  content: {
    paddingTop: 10,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    marginTop: -30,
    padding: 20,
    elevation: 5,
    borderTopEndRadius: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    color: "#444",
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 6,
    color: "#444",
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: "#444",
  },
  listItem: {
    fontSize: 16,
    lineHeight: 24,
    color: "#444",
    marginLeft: 8,
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 12,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  tag: {
    backgroundColor: "#E0F2F1",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: "#00796B",
  },
});

export default SingleDiseaseScreen;
