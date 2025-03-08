import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Modal from "react-native-modal";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const ScanModal = ({ isVisible, onClose }) => {
  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection="down"
      style={styles.modal}
    >
      <View style={styles.modalContent}>
        <Text style={styles.modalText}>Scan</Text>

        {/* Two Circle Buttons with Labels */}
        <View style={styles.buttonContainer}>
          {/* Identification Button */}
          <View style={styles.buttonWrapper}>
            <TouchableOpacity
              style={[styles.circleButton, { backgroundColor: "#14AE5C" }]}
              onPress={() => console.log("Identification Button Pressed")}
            >
              <MaterialCommunityIcons
                name="leaf-maple"
                size={52}
                color="white"
              />
            </TouchableOpacity>
            <Text style={styles.buttonLabel}>Identification</Text>
          </View>

          {/* Detect a Disease Button */}
          <View style={styles.buttonWrapper}>
            <TouchableOpacity
              style={[styles.circleButton, { backgroundColor: "#FF6B6B" }]}
              onPress={() => console.log("Detect a Disease Button Pressed")}
            >
              <MaterialCommunityIcons name="virus" size={52} color="white" />
            </TouchableOpacity>
            <Text style={styles.buttonLabel}>Detect a Disease</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  modalContent: {
    backgroundColor: "white",
    padding: 22,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "30%", // Increased height to accommodate labels
    alignItems: "center", // Center content horizontally
  },
  modalText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20, // Add some space below the text
  },
  buttonContainer: {
    flexDirection: "row", // Arrange buttons horizontally
    justifyContent: "space-around", // Space buttons evenly
    width: "100%", // Take full width
  },
  buttonWrapper: {
    alignItems: "center", // Center button and label
  },
  circleButton: {
    width: 90,
    height: 90,
    borderRadius: 45, // Make it circular
    justifyContent: "center",
    alignItems: "center",
    elevation: 5, // Add shadow for Android
    shadowColor: "#000", // Add shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonLabel: {
    marginTop: 10, // Space between button and label
    fontSize: 14,
    fontWeight: "bold",
    color: "#525252", // Label text color
  },
});

export default ScanModal;
