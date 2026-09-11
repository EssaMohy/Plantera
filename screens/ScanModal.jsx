import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

import { Modalize } from "react-native-modalize";
import { Ionicons } from "@expo/vector-icons";

import DiagnosisModal from "../components/DiagnosisModal";
import IdentifyPlantModal from "../components/IdentifyPlantModal";

const ScanModal = React.forwardRef(({ onClose }, ref) => {
  const [showDiagnosis, setShowDiagnosis] = useState(false);
  const [showIdentify, setShowIdentify] = useState(false);

  // ==========================================
  // Open Identify Plant Modal
  // ==========================================

  const handleIdentifyPress = () => {
    // Close ScanModal first
    ref?.current?.close();

    // Wait until Modalize closes completely
    setTimeout(() => {
      setShowIdentify(true);
    }, 350);
  };

  // ==========================================
  // Open Diagnose Disease Modal
  // ==========================================

  const handleDiagnosePress = () => {
    // Close ScanModal first
    ref?.current?.close();

    // Wait until Modalize closes completely
    setTimeout(() => {
      setShowDiagnosis(true);
    }, 350);
  };

  // ==========================================
  // Close Identify Modal
  // ==========================================

  const handleIdentifyClose = () => {
    setShowIdentify(false);
  };

  // ==========================================
  // Close Diagnosis Modal
  // ==========================================

  const handleDiagnosisClose = () => {
    setShowDiagnosis(false);
  };

  return (
    <>
      {/* ==========================================
          Scan Modal
      ========================================== */}

      <Modalize
        ref={ref}
        onClose={onClose}
        modalStyle={styles.modal}
        handlePosition="inside"
        handleStyle={styles.handle}
        adjustToContentHeight={true}
        childrenStyle={styles.modalContent}
        withOverlay={true}
        overlayStyle={styles.overlay}
      >
        <View style={styles.content}>
          {/* ==========================================
              Header
          ========================================== */}

          <View style={styles.header}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>Scan Your Plant</Text>

              <Text style={styles.subtitle}>What would you like to do?</Text>
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => ref?.current?.close()}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={22} color="#555" />
            </TouchableOpacity>
          </View>

          {/* ==========================================
              Options
          ========================================== */}

          <View style={styles.optionsContainer}>
            {/* ========================================
                Identify Plant
            ======================================== */}

            <TouchableOpacity
              style={styles.optionCard}
              activeOpacity={0.85}
              onPress={handleIdentifyPress}
            >
              <View
                style={[styles.iconContainer, styles.identifyIconContainer]}
              >
                <Ionicons name="leaf" size={30} color="#2E7D32" />
              </View>

              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Identify Plant</Text>

                <Text style={styles.optionDescription}>
                  Take a photo to identify your plant and learn more about it.
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={22} color="#A0A0A0" />
            </TouchableOpacity>

            {/* ========================================
                Diagnose Disease
            ======================================== */}

            <TouchableOpacity
              style={styles.optionCard}
              activeOpacity={0.85}
              onPress={handleDiagnosePress}
            >
              <View
                style={[styles.iconContainer, styles.diagnosisIconContainer]}
              >
                <Ionicons name="medkit" size={30} color="#D96C3F" />
              </View>

              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Diagnose Disease</Text>

                <Text style={styles.optionDescription}>
                  Check your plant for diseases and get treatment
                  recommendations.
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={22} color="#A0A0A0" />
            </TouchableOpacity>
          </View>

          {/* ==========================================
              Footer
          ========================================== */}

          <View style={styles.footer}>
            <Ionicons name="sparkles-outline" size={17} color="#777" />

            <Text style={styles.footerText}>Powered by Plantera AI</Text>
          </View>
        </View>
      </Modalize>

      {/* ==========================================
          Identify Plant Modal
      ========================================== */}

      <IdentifyPlantModal
        visible={showIdentify}
        onClose={handleIdentifyClose}
      />

      {/* ==========================================
          Diagnosis Modal
      ========================================== */}

      <DiagnosisModal visible={showDiagnosis} onClose={handleDiagnosisClose} />
    </>
  );
});

const styles = StyleSheet.create({
  // ==========================================
  // Modal
  // ==========================================

  modal: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },

  modalContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
  },

  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },

  handle: {
    backgroundColor: "#D5D5D5",
    width: 42,
    height: 5,
    borderRadius: 10,
    marginTop: 4,
    alignSelf: "center",
  },

  // ==========================================
  // Content
  // ==========================================

  content: {
    width: "100%",
  },

  // ==========================================
  // Header
  // ==========================================

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },

  headerTextContainer: {
    flex: 1,
  },

  title: {
    paddingTop: 10,
    fontSize: 24,
    fontWeight: "700",
    color: "#1F1F1F",
    marginBottom: 5,
  },

  subtitle: {
    fontSize: 14,
    color: "#777",
  },

  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },

  // ==========================================
  // Options
  // ==========================================

  optionsContainer: {
    gap: 16,
  },

  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAF9",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ECEFEC",
  },

  iconContainer: {
    width: 58,
    height: 58,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  identifyIconContainer: {
    backgroundColor: "#E8F5E9",
  },

  diagnosisIconContainer: {
    backgroundColor: "#FFF0EA",
  },

  optionContent: {
    flex: 1,
    paddingRight: 8,
  },

  optionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#242424",
    marginBottom: 5,
  },

  optionDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: "#777",
  },

  // ==========================================
  // Footer
  // ==========================================

  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
    gap: 6,
  },

  footerText: {
    fontSize: 12,
    color: "#888",
  },
});

export default ScanModal;
