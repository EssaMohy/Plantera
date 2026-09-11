import { useState } from "react";
import axiosInstance from "../api/axiosInstance";

export const SEVERITY_STYLES = {
  low: { bg: "#E8F5E9", text: "#2E7D32", icon: "checkmark-circle" },
  medium: { bg: "#FFF8E1", text: "#F9A825", icon: "alert-circle" },
  high: { bg: "#FFEBEE", text: "#D32F2F", icon: "alert-circle" },
};

/**
 * Turns a raw `/diagnostics` detection into the shape the UI renders,
 * ported 1:1 from DEPI-Front's DiagnosisModal so severity thresholds and
 * fallback copy stay consistent across web and every mobile entry point
 * (the Diagnose modal and the Scan flow both use this).
 */
export function transformDetection(detection) {
  const firstInstance = detection.instances?.[0];
  const confidence = firstInstance?.confidence ?? 0.85;
  const severity =
    confidence >= 0.8 ? "low" : confidence >= 0.6 ? "medium" : "high";

  const treatmentArray = detection.treatment?.steps ?? [
    "Consult a plant specialist for treatment options",
  ];

  return {
    condition: detection.name,
    severity,
    description: detection.description || `Detected: ${detection.name}`,
    treatment: treatmentArray,
    confidence: Math.round(confidence * 100),
    instances: (detection.instances || []).map((inst) => ({
      bbox: inst.bbox,
      confidence: Math.round((inst.confidence ?? 0) * 100),
    })),
  };
}

/**
 * All the state + the real `/diagnostics` API call behind AI health
 * diagnosis. Shared by DiagnosisModal (My Plants dashboard) and
 * ImagePreviewScreen (the Scan tab's "Detect a Disease" flow) so there's
 * one place that knows how to talk to the backend.
 */
export const useDiagnosis = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [error, setError] = useState(null);

  const analyze = async (imageUri) => {
    if (!imageUri) return;

    setAnalyzing(true);
    setError(null);
    setResults([]);
    setSelectedResult(null);

    try {
      const formData = new FormData();
      formData.append("image", {
        uri: imageUri,
        type: "image/jpeg",
        name: "plant.jpg",
      });

      const { data } = await axiosInstance.post("/diagnostics", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const detections = data.data?.detections || [];
      if (detections.length > 0) {
        const transformed = detections.map(transformDetection);
        setResults(transformed);
        setSelectedResult(transformed[0]);
      } else {
        setError("No diagnosis results found. Please try a different image.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to analyze image. Please try again.",
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setResults([]);
    setSelectedResult(null);
    setError(null);
    setAnalyzing(false);
  };

  return {
    analyzing,
    results,
    selectedResult,
    setSelectedResult,
    error,
    analyze,
    reset,
  };
};
