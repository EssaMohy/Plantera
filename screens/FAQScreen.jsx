import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Enable layout animation on Android
if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQ_DATA = [
  {
    question: "How do I add a plant?",
    answer:
      "Go to the 'My Plants' section and click the + icon to add a new plant.",
  },
  {
    question: "How do I set watering reminders?",
    answer:
      "Open a plant from 'My Plants', then tap 'Schedule Care' to set watering/fertilizing reminders.",
  },
  {
    question: "Is Plantera free?",
    answer: "Yes! Plantera is completely free to use.",
  },
];

const FAQScreen = () => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleAnswer = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {FAQ_DATA.map((item, index) => (
        <View key={index} style={styles.item}>
          <TouchableOpacity
            style={styles.questionRow}
            onPress={() => toggleAnswer(index)}
          >
            <Text style={styles.questionText}>{item.question}</Text>
            <Ionicons
              name={
                expandedIndex === index
                  ? "chevron-up-outline"
                  : "chevron-down-outline"
              }
              size={22}
              color="#2E7D32"
            />
          </TouchableOpacity>
          {expandedIndex === index && (
            <Text style={styles.answerText}>{item.answer}</Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F7F7F7",
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 20,
  },
  item: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  questionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  questionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    paddingRight: 10,
  },
  answerText: {
    marginTop: 10,
    fontSize: 15,
    color: "#555",
    lineHeight: 20,
  },
});

export default FAQScreen;
