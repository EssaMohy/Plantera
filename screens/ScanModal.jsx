import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Modalize } from "react-native-modalize";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const ScanModal = React.forwardRef(({ onClose }, ref) => {
  // Create a button press handler that won't create an infinite loop
  const handleButtonPress = (action) => {
    console.log(`${action} Button Pressed`);
    // Close the modal directly without calling the onClose prop
    if (ref && ref.current) {
      ref.current.close();
    }
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
        <Text style={styles.modalText}>Scan</Text>

        <View style={styles.buttonContainer}>
          <View style={styles.buttonWrapper}>
            <TouchableOpacity
              style={[styles.circleButton, { backgroundColor: "#14AE5C" }]}
              onPress={() => handleButtonPress("Identification")}
            >
              <MaterialCommunityIcons
                name="leaf-maple"
                size={52}
                color="white"
              />
            </TouchableOpacity>
            <Text style={styles.buttonLabel}>Identification</Text>
          </View>

          <View style={styles.buttonWrapper}>
            <TouchableOpacity
              style={[styles.circleButton, { backgroundColor: "#FF6B6B" }]}
              onPress={() => handleButtonPress("Detect a Disease")}
            >
              <MaterialCommunityIcons name="virus" size={52} color="white" />
            </TouchableOpacity>
            <Text style={styles.buttonLabel}>Detect a Disease</Text>
          </View>
        </View>
      </View>
    </Modalize>
  );
});

const styles = StyleSheet.create({
  modal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: "white",
  },
  modalContent: {
    padding: 22,
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
  },
  modalText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 20,
  },
  buttonWrapper: {
    alignItems: "center",
  },
  circleButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonLabel: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "bold",
    color: "#525252",
  },
});

export default ScanModal;
