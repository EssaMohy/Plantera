import { useState } from "react";
import axiosInstance from "../api/axiosInstance";

/**
 * All the state + the real `/my-plants/identify` and
 * `/my-plants/identify/confirm` calls behind AI plant identification.
 * Shared by IdentifyPlantModal (My Plants dashboard) and
 * ImagePreviewScreen (the Scan tab's "Identification" flow).
 */
export const useIdentifyPlant = () => {
  const [step, setStep] = useState("upload"); // 'upload' | 'processing' | 'results'
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [confirming, setConfirming] = useState(null);
  const [confirmedId, setConfirmedId] = useState(null);

  const identify = async (imageUri) => {
    if (!imageUri) return;

    setStep("processing");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", {
        uri: imageUri,
        type: "image/jpeg",
        name: "plant.jpg",
      });

      const { data } = await axiosInstance.post(
        "/my-plants/identify",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      setResult(data.data);
      setStep("results");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Could not identify the plant. Please try again.",
      );
      setStep("upload");
    }
  };

  const confirm = async (predictionIndex) => {
    if (!result) return null;

    setConfirming(predictionIndex);
    setError(null);

    try {
      const { data } = await axiosInstance.post("/my-plants/identify/confirm", {
        recordId: result.recordId,
        predictionIndex,
      });
      const myPlant = data.data.myPlant;
      setConfirmedId(myPlant.id);
      return myPlant;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Could not add this plant.",
      );
      return null;
    } finally {
      setConfirming(null);
    }
  };

  const reset = () => {
    setStep("upload");
    setResult(null);
    setError(null);
    setConfirming(null);
    setConfirmedId(null);
  };

  return {
    step,
    result,
    error,
    confirming,
    confirmedId,
    identify,
    confirm,
    reset,
  };
};
