import React from "react";
import { View, Text, StyleSheet } from "react-native";

/**
 * Absolutely-positioned boxes over a preview image, scaled the same way
 * DEPI-Front's web BboxOverlay computes the letterboxed image rect for
 * an image shown with `resizeMode="contain"`.
 */
const BboxOverlay = ({
  instances,
  condition,
  naturalWidth,
  naturalHeight,
  previewWidth,
  previewHeight,
}) => {
  const filtered = (instances || []).filter((i) => i.confidence > 30);
  if (filtered.length === 0 || !naturalWidth || !naturalHeight) return null;

  const scale = Math.min(
    previewWidth / naturalWidth,
    previewHeight / naturalHeight,
  );
  const renderedWidth = naturalWidth * scale;
  const renderedHeight = naturalHeight * scale;
  const offsetX = (previewWidth - renderedWidth) / 2;
  const offsetY = (previewHeight - renderedHeight) / 2;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {filtered.map((instance, idx) => {
        const [x1, y1, x2, y2] = instance.bbox;
        const left = offsetX + x1 * renderedWidth;
        const top = offsetY + y1 * renderedHeight;
        const width = (x2 - x1) * renderedWidth;
        const height = (y2 - y1) * renderedHeight;

        return (
          <View
            key={idx}
            style={[styles.bboxBox, { left, top, width, height }]}
          >
            <View style={styles.bboxLabel}>
              <Text style={styles.bboxLabelText}>
                {condition} — {Math.round(instance.confidence)}%
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bboxBox: {
    position: "absolute",
    borderWidth: 2,
    borderColor: "#EF4444",
  },
  bboxLabel: {
    position: "absolute",
    top: -18,
    left: -2,
    backgroundColor: "#EF4444",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  bboxLabelText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "700",
  },
});

export default BboxOverlay;
