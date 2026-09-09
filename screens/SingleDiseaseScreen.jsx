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
import { useDiseaseById } from "../hooks/diseases";

const { width } = Dimensions.get("screen");

const SingleDiseaseScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { disease: initialDisease } = route.params;

  const { data: fullDisease, isLoading } = useDiseaseById(initialDisease?.id || initialDisease?._id);
  const disease = fullDisease || initialDisease;

  if (isLoading && !fullDisease) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  const displayImage = disease.imageUrl || disease.image;
  const treatmentSteps = disease.treatment?.steps || [];
  const otherNamesText = disease.otherNames?.join(", ");

  return (
    <View style={styles.container}>
      {/* Disease Image */}
      {displayImage ? (
        <Image source={{ uri: displayImage }} style={styles.diseaseImage} />
      ) : (
        <View style={[styles.diseaseImage, { backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center' }]}>
          <Icon name="bug" size={80} color="#81C784" />
        </View>
      )}
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
          {otherNamesText ? (
            <Text style={styles.subtitle}>
              Also known as: {otherNamesText}
            </Text>
          ) : null}

          <View style={styles.divider} />

          {disease.description && (
            <>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.text}>{disease.description}</Text>
              <View style={styles.divider} />
            </>
          )}

          {disease.type && (
            <>
              <Text style={styles.sectionTitle}>Type</Text>
              <View style={styles.tagsContainer}>
                {Array.isArray(disease.type) ? disease.type.map((type, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{type}</Text>
                  </View>
                )) : (
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>{disease.type}</Text>
                  </View>
                )}
              </View>
              <View style={styles.divider} />
            </>
          )}

          {disease.causes && (
            <>
              <Text style={styles.sectionTitle}>Causes</Text>
              {Array.isArray(disease.causes) ? disease.causes.map((cause, index) => (
                <Text key={index} style={styles.listItem}>
                  • {cause}
                </Text>
              )) : (
                <Text style={styles.text}>{disease.causes}</Text>
              )}
              <View style={styles.divider} />
            </>
          )}

          {disease.symptoms && (
            <>
              <Text style={styles.sectionTitle}>Symptoms</Text>
              {Array.isArray(disease.symptoms) ? disease.symptoms.map((symptom, index) => (
                <Text key={index} style={styles.listItem}>
                  • {symptom}
                </Text>
              )) : (
                <Text style={styles.text}>{disease.symptoms}</Text>
              )}
              <View style={styles.divider} />
            </>
          )}

          {disease.treatment && (
            <>
              <Text style={styles.sectionTitle}>Treatment</Text>
              
              {treatmentSteps.length > 0 ? (
                treatmentSteps.map((step, index) => (
                  <Text key={index} style={styles.listItem}>
                    {index + 1}. {step}
                  </Text>
                ))
              ) : (
                <>
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
  center: {
    justifyContent: "center",
    alignItems: "center",
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
